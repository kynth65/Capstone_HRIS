import logging
import os
from flask import Flask, request, jsonify, send_from_directory,send_file,url_for
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
import requests
import pymysql
import pdfplumber
import re
from collections import Counter
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
import openai  # For AI question generation
from dotenv import load_dotenv
import os


# Download WordNet data

# Setup Flask app and logging
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:@127.0.0.1:3306/gammacare_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
os.environ["NUMEXPR_NUM_THREADS"] = "2"
load_dotenv('pythonEnvironment/.env')

# Retrieve and set the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_db_connection():
    connection = pymysql.connect(
        host='127.0.0.1',
        user='root',
        password='',
        database='gammacare_db',
        cursorclass=pymysql.cursors.DictCursor
    )
    return connection

@app.route('/')
def home():
    return "Hello, World!"

@app.route('/update-upload-status', methods=['POST'])
def update_upload_status():
    data = request.json
    google_id = data.get('google_id')
    google_name = data.get('google_name')
    google_email = data.get('google_email')
    has_uploaded = data.get('has_uploaded')

    if not google_id or has_uploaded is None:
        return jsonify({"error": "Missing google_id or has_uploaded"}), 400

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT * FROM googles WHERE google_id = %s", (google_id,))
            result = cursor.fetchone()
            
            if result:
                cursor.execute(
                    """
                    UPDATE googles 
                    SET has_uploaded = %s, google_name = %s, google_email = %s 
                    WHERE google_id = %s
                    """,
                    (has_uploaded, google_name, google_email, google_id)
                )
            else:
                cursor.execute(
                    """
                    INSERT INTO googles (google_id, google_name, google_email, has_uploaded) 
                    VALUES (%s, %s, %s, %s)
                    """,
                    (google_id, google_name, google_email, has_uploaded)
                )
            connection.commit()
    finally:
        connection.close()

    return jsonify({"message": "Upload status updated successfully"}), 200

@app.route('/check-upload-status/<string:google_id>', methods=['GET'])
def check_upload_status(google_id):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT has_uploaded FROM googles WHERE google_id = %s", (google_id,))
            result = cursor.fetchone()
            
            if result:
                return jsonify({"has_uploaded": result['has_uploaded']}), 200
            else:
                return jsonify({"error": "User not found"}), 404
    finally:
        connection.close()

# Define the upload directory
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Function to extract text from PDF
def extract_text_from_pdf(file_path):
    with pdfplumber.open(file_path) as pdf:
        text = ''
        for page in pdf.pages:
            text += page.extract_text()
    return text

# Function to extract email from the resume text
def extract_email(text):
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_match = re.search(email_pattern, text)
    if email_match:
        return email_match.group(0)
    return None

# Function to extract a potential name from the resume text
def extract_name(text):
    # A simple heuristic for name: assuming first capitalized words
    name_pattern = r'([A-Z][a-z]+ [A-Z][a-z]+)'  # Simplified pattern for names
    name_match = re.search(name_pattern, text)
    if name_match:
        return name_match.group(0)
    return None

# Function to extract name and email from the resume PDF file
def extract_name_and_email_from_pdf(file_path):
    text = extract_text_from_pdf(file_path)
    name = extract_name(text)
    email = extract_email(text)
    return name, email

# Function to extract synonyms using WordNet


def rank_resumes_with_openai(hr_tags, resumes):
    ranked_resumes = []
    hr_tags_text = ' '.join(hr_tags) if isinstance(hr_tags, list) else hr_tags

    for idx, resume in enumerate(resumes):
        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an assistant that matches resumes with job requirements."},
                {"role": "user", "content": f"Job Requirements: {hr_tags_text}"},
                {"role": "user", "content": f"Resume Content: {resume}. Compare the resume against the job requirements. List the matching keywords in a 'Matching Keywords' section, and provide an 'Explanation' for the match percentage separately."}
            ]
        )

        try:
            # Retrieve the response content
            match_score_text = response['choices'][0]['message']['content']

            # Extract match score with a flexible regex pattern
            match_score_match = re.search(r'Match Score:\s*([0-9]+)%', match_score_text)
            if match_score_match:
                match_score = float(match_score_match.group(1))
            else:
                # Fallback - search for the first numeric percentage
                fallback_match = re.search(r'(\d+)%', match_score_text)
                match_score = float(fallback_match.group(1)) if fallback_match else 0

            # Extract the matching keywords
            keywords_match = re.search(r'Matching Keywords:\s*(.*?)\s*Explanation:', match_score_text, re.DOTALL)
            matched_words = keywords_match.group(1).strip() if keywords_match else "No matched tags found."

            # Extract the explanation as comments
            explanation_match = re.search(r'Explanation:\s*(.*)', match_score_text, re.DOTALL)
            comments = explanation_match.group(1).strip() if explanation_match else "No additional comments."

            # Debug: Print extracted data for verification
            print(f"Match Score: {match_score}%")
            print(f"Matched Words: {matched_words}")
            print(f"Comments: {comments}")
            
        except (KeyError, IndexError, ValueError, AttributeError) as e:
            print(f"Error extracting data: {e}")
            match_score = 0
            matched_words = "No matched tags found."
            comments = "No additional comments."

        ranked_resumes.append((idx, match_score, matched_words, comments))

    # Sort by match score in descending order
    ranked_resumes.sort(key=lambda x: x[1], reverse=True)
    return ranked_resumes

# Endpoint to upload and extract text from resumes
@app.route('/upload', methods=['POST'])
def upload_files():
    files = request.files.getlist('files')
    resume_texts = []
    filenames = []
    file_urls = []
    extracted_info = []
    
    for file in files:
        if file and file.filename != '':
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(file_path)
            text = extract_text_from_pdf(file_path)
            resume_texts.append(text)
            filenames.append(file.filename)
            file_urls.append(url_for('uploaded_file', filename=file.filename, _external=True))
            
            # Extract name and email from the PDF text
            name, email = extract_name_and_email_from_pdf(file_path)
            extracted_info.append({'filename': file.filename, 'name': name, 'email': email})
    
    return jsonify({
        'resume_texts': resume_texts,
        'filenames': filenames,
        'file_urls': file_urls,
        'extracted_info': extracted_info  # Include extracted names and emails
    })


@app.route('/uploads/<filename>')
@cross_origin()
def uploaded_file(filename):
    uploads_dir = app.config['UPLOAD_FOLDER']
    file_path = os.path.join(uploads_dir, filename)
    
    # Ensure the file exists and serve it with the correct MIME type
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='application/pdf')
    else:
        return "File not found", 404

# Endpoint to rank resumes based on HR tags and store name and email in resume_rankings table
@app.route('/rank', methods=['POST'])
@cross_origin(origin='http://localhost:5173')
def rank():
    data = request.get_json()
    
    resumes = data.get('resumes')
    filenames = data.get('filenames')
    position_id = data.get('position_id')
    mobileNumber = data.get('moobileNumber')
    question_responses = {
    'question1': data.get('question1_response'),
    'question2': data.get('question2_response'), 
    'question3': data.get('question3_response'),
    'question4': data.get('question4_response'),
    'question5': data.get('question5_response'),
    'question6': data.get('question6_response'),
    'question7': data.get('question7_response'),
    'question8': data.get('question8_response'),
    'question9': data.get('question9_response'),
    'question10': data.get('question10_response'),

}  
    if not all([resumes, filenames, position_id]):
        return jsonify({'error': 'Missing required fields'}), 400

    hr_tags = fetch_hr_tags(position_id)
    
    if not hr_tags:
        return jsonify({'error': 'Position not found'}), 404

    ranked_resumes = rank_resumes_with_openai(hr_tags, resumes)

    for idx, (resume_idx, percentage, matched_words, comments) in enumerate(ranked_resumes):
        filename = filenames[resume_idx]
        name, email = extract_name_and_email_from_pdf(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        save_ranking(filename, percentage, position_id, name, email, matched_words, comments, mobileNumber, question_responses)

    return jsonify({'ranked_resumes': [
        {'filename': filenames[i], 'percentage': round(p, 2), 'matched_words': m, 'comments': c} 
        for i, p, m, c in ranked_resumes
    ]})



# Function to fetch HR tags from the database
def fetch_hr_tags(position_id):
    query = text("SELECT hr_tags FROM open_positions WHERE position_id = :position_id")
    result = db.session.execute(query, {'position_id': position_id}).fetchone()
    return result[0] if result else None

def fetch_position_name(position_id):
    query = text("SELECT title FROM open_positions WHERE position_id = :position_id")
    result = db.session.execute(query, {'position_id': position_id}).fetchone()
    return result[0] if result else None

# Function to save the resume ranking along with name, email, and position name to the database
def save_ranking(filename, percentage, position_id, name, email, matched_words, comments, mobileNumber, questions):
    position_name = fetch_position_name(position_id)
    
    try:
        query = text("""
            INSERT INTO resume_rankings 
            (filename, percentage, position_id, position_name, name, email, matched_words, comments, mobileNumber,
            question1_response, question2_response, question3_response, question4_response, question5_response, 
            question6_response, question7_response, question8_response, question9_response, question10_response)
            VALUES 
            (:filename, :percentage, :position_id, :position_name, :name, :email, :matched_words, :comments, :mobileNumber,
            :question1_response, :question2_response, :question3_response, :question4_response, :question5_response, 
            :question6_response, :question7_response, :question8_response, :question9_response, :question10_response)
        """)
        db.session.execute(query, {
            'filename': filename,
            'percentage': percentage,
            'position_id': position_id,
            'position_name': position_name,
            'name': name,
            'email': email,
            'matched_words': matched_words,
            'comments': comments,
            'mobileNumber': mobileNumber,
            'question1_response': questions.get('question1'),
            'question2_response': questions.get('question2'),
            'question3_response': questions.get('question3'),
            'question4_response': questions.get('question4'),
            'question5_response': questions.get('question5'),
            'question6_response': questions.get('question6'),
            'question7_response': questions.get('question7'),
            'question8_response': questions.get('question8'),
            'question9_response': questions.get('question9'),
            'question10_response': questions.get('question10')
        })
        db.session.commit()
        print("Data successfully saved.")
    except Exception as e:
        print(f"An error occurred: {e}")
        db.session.rollback()


    

if __name__ == '__main__':
    app.run()
