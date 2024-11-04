export const medicalSecretaryQuestions = [
    "How comfortable are you with handling confidential patient information in compliance with privacy laws (e.g., HIPAA)?",
    "Do you have experience scheduling appointments and managing medical records?",
    "How familiar are you with medical billing and coding?",
    "How experienced are you with answering and directing phone calls in a professional setting?",
];

const MedicalSecretaryQuestions = ({ questions, setQuestions, errors }) => (
    <div>
        <label>
            How comfortable are you with handling confidential patient
            information in compliance with privacy laws (e.g., HIPAA)?
        </label>
        <div>
            <input
                type="radio"
                name="relatedDegree"
                value="Very comfortable and experienced"
                checked={
                    questions.question1 === "Very comfortable and experienced"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question1: e.target.value,
                    })
                }
            />
            Very comfortable and experienced
            <input
                type="radio"
                name="relatedDegree"
                value="Somewhat comfortable with basic knowledge"
                checked={
                    questions.question1 ===
                    "Somewhat comfortable with basic knowledge"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question1: e.target.value,
                    })
                }
            />
            Somewhat comfortable with basic knowledge
            <input
                type="radio"
                name="relatedDegree"
                value="Minimal experience, but willing to learn"
                checked={
                    questions.question1 ===
                    "Minimal experience but willing to learn"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question1: e.target.value,
                    })
                }
            />
            Minimal knowledge, willing to learn
            <input
                type="radio"
                name="relatedDegree"
                value="Not familiar with privacy laws"
                checked={
                    questions.question1 === "Not familiar with privacy laws"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question1: e.target.value,
                    })
                }
            />
            Not familiar with privacy laws
        </div>

        <label>
            Do you have experience scheduling appointments and managing medical
            records?
        </label>
        <div>
            <input
                type="radio"
                name="relatedDegree"
                value="Yes, I have extensive experience"
                checked={
                    questions.question2 === "Yes, I have extensive experience"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question2: e.target.value,
                    })
                }
            />
            Yes, I have extensive experience
            <input
                type="radio"
                name="relatedDegree"
                value="Yes, but limited experience"
                checked={questions.question2 === "Yes, but limited experience"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question2: e.target.value,
                    })
                }
            />
            Yes, but limited experience
            <input
                type="radio"
                name="relatedDegree"
                value="No experience"
                checked={questions.question2 === "No experience"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question2: e.target.value,
                    })
                }
            />
            No experience
        </div>

        <label>How familiar are you with medical billing and coding?</label>
        <div>
            <input
                type="radio"
                name="relatedDegree"
                value="Very familiar and experienced"
                checked={
                    questions.question3 === "Very familiar and experienced"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question3: e.target.value,
                    })
                }
            />
            Very familiar and experienced
            <input
                type="radio"
                name="relatedDegree"
                value="Some familiarity with basic knowledge"
                checked={
                    questions.question3 ===
                    "Some familiarity with basic knowledge"
                }
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question3: e.target.value,
                    })
                }
            />
            Some familiarity with basic knowledge
            <input
                type="radio"
                name="relatedDegree"
                value="Minimal familiarity"
                checked={questions.question3 === "Minimal familiarity"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question3: e.target.value,
                    })
                }
            />
            Minimal familiarity
            <input
                type="radio"
                name="relatedDegree"
                value="No experience"
                checked={questions.question3 === "No experience"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question3: e.target.value,
                    })
                }
            />
            No experience
        </div>

        <label>
            How experienced are you with answering and directing phone calls in
            a professional setting?
        </label>
        <div>
            <input
                type="radio"
                name="relatedDegree"
                value="Highly Experienced"
                checked={questions.question4 === "Highly Experienced"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question4: e.target.value,
                    })
                }
            />
            Highly Experienced
            <input
                type="radio"
                name="relatedDegree"
                value="Moderately Experienced"
                checked={questions.question4 === "Moderately Experienced"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question4: e.target.value,
                    })
                }
            />
            Moderately Experienced
            <input
                type="radio"
                name="relatedDegree"
                value="Basic Experience"
                checked={questions.question4 === "Basic Experience"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question4: e.target.value,
                    })
                }
            />
            Basic Experience
            <input
                type="radio"
                name="relatedDegree"
                value="No experience"
                checked={questions.question4 === "No experience"}
                onChange={(e) =>
                    setQuestions({
                        ...questions,
                        question4: e.target.value,
                    })
                }
            />
            No experience
        </div>

        {errors && Object.keys(errors).length > 0 && (
            <div className="text-red-500">
                {Object.values(errors).map((error, index) => (
                    <p key={index}>{error}</p>
                ))}
            </div>
        )}
    </div>
);

export default MedicalSecretaryQuestions;
