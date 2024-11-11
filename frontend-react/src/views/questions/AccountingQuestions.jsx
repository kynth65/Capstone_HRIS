export const accountingQuestions = [
    "How familiar are you with accounting software (e.g., QuickBooks, Xero)?",
    "Describe your experience with financial statement preparation (e.g., balance sheets, income statements).",
    "Have you ever managed or assisted with audits or regulatory compliance processes?",
    "How comfortable are you with analyzing financial data to assist in budgeting and forecasting",
];

const AccountingQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div className="flex flex-col space-y-6">
            {/* Question 1 */}
            <div className="form-group">
                <label className="block font-medium text-gray-700 mb-3">
                    How familiar are you with accounting software (e.g., QuickBooks, Xero)?
                </label>
                <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="software_familiarity"
                            value="Very Familiar"
                            checked={questions.question1 === "Very Familiar"}
                            onChange={(e) => setQuestions({ ...questions, question1: e.target.value })}
                            className="mr-2"
                        />
                        Very Familiar
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="software_familiarity"
                            value="Somewhat Familiar"
                            checked={questions.question1 === "Somewhat Familiar"}
                            onChange={(e) => setQuestions({ ...questions, question1: e.target.value })}
                            className="mr-2"
                        />
                        Somewhat Familiar
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="software_familiarity"
                            value="Minimal Familiarity"
                            checked={questions.question1 === "Minimal Familiarity"}
                            onChange={(e) => setQuestions({ ...questions, question1: e.target.value })}
                            className="mr-2"
                        />
                        Minimal Familiarity
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="software_familiarity"
                            value="No Experience"
                            checked={questions.question1 === "No Experience"}
                            onChange={(e) => setQuestions({ ...questions, question1: e.target.value })}
                            className="mr-2"
                        />
                        No Experience
                    </label>
                </div>
            </div>

            {/* Question 2 */}
            <div className="form-group">
                <label className="block font-medium text-gray-700 mb-3">
                    Describe your experience with financial statement preparation.
                </label>
                <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="statement_experience"
                            value="Extensive experience with regular preparation"
                            checked={questions.question2 === "Extensive experience with regular preparation"}
                            onChange={(e) => setQuestions({ ...questions, question2: e.target.value })}
                            className="mr-2"
                        />
                        Extensive experience with regular preparation
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="statement_experience"
                            value="Some experience, primarily assisting in preparation"
                            checked={questions.question2 === "Some experience, primarily assisting in preparation"}
                            onChange={(e) => setQuestions({ ...questions, question2: e.target.value })}
                            className="mr-2"
                        />
                        Some experience, primarily assisting in preparation
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="statement_experience"
                            value="Minimal experience, but knowledge of basic principles"
                            checked={questions.question2 === "Minimal experience, but knowledge of basic principles"}
                            onChange={(e) => setQuestions({ ...questions, question2: e.target.value })}
                            className="mr-2"
                        />
                        Minimal experience, but knowledge of basic principles
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="statement_experience"
                            value="No Experience"
                            checked={questions.question2 === "No Experience"}
                            onChange={(e) => setQuestions({ ...questions, question2: e.target.value })}
                            className="mr-2"
                        />
                        No Experience
                    </label>
                </div>
            </div>

            {/* Question 3 */}
            <div className="form-group">
                <label className="block font-medium text-gray-700 mb-3">
                    Have you ever managed or assisted with audits or regulatory compliance processes?
                </label>
                <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="audit_experience"
                            value="Yes, I have led audit/compliance processes"
                            checked={questions.question3 === "Yes, I have led audit/compliance processes"}
                            onChange={(e) => setQuestions({ ...questions, question3: e.target.value })}
                            className="mr-2"
                        />
                        Yes, I have led audit/compliance processes
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="audit_experience"
                            value="Yes, I have assisted with audits/compliance"
                            checked={questions.question3 === "Yes, I have assisted with audits/compliance"}
                            onChange={(e) => setQuestions({ ...questions, question3: e.target.value })}
                            className="mr-2"
                        />
                        Yes, I have assisted with audits/compliance
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="audit_experience"
                            value="No, but I understand the basics"
                            checked={questions.question3 === "No, but I understand the basics"}
                            onChange={(e) => setQuestions({ ...questions, question3: e.target.value })}
                            className="mr-2"
                        />
                        No, but I understand the basics
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="audit_experience"
                            value="No Experience"
                            checked={questions.question3 === "No Experience"}
                            onChange={(e) => setQuestions({ ...questions, question3: e.target.value })}
                            className="mr-2"
                        />
                        No Experience
                    </label>
                </div>
            </div>

            {/* Question 4 */}
            <div className="form-group">
                <label className="block font-medium text-gray-700 mb-3">
                    How comfortable are you with analyzing financial data to assist in budgeting and forecasting?
                </label>
                <div className="flex flex-col space-y-2">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="budgeting_experience"
                            value="Extremely Comfortable and Experienced"
                            checked={questions.question4 === "Extremely Comfortable and Experienced"}
                            onChange={(e) => setQuestions({ ...questions, question4: e.target.value })}
                            className="mr-2"
                        />
                        Extremely Comfortable and Experienced
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="budgeting_experience"
                            value="Somewhat Comfortable with Basic Experience"
                            checked={questions.question4 === "Somewhat Comfortable with Basic Experience"}
                            onChange={(e) => setQuestions({ ...questions, question4: e.target.value })}
                            className="mr-2"
                        />
                        Somewhat Comfortable with Basic Experience
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="budgeting_experience"
                            value="Limited Comfort and Experience"
                            checked={questions.question4 === "Limited Comfort and Experience"}
                            onChange={(e) => setQuestions({ ...questions, question4: e.target.value })}
                            className="mr-2"
                        />
                        Limited Comfort and Experience
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name="budgeting_experience"
                            value="No Comfort or Experience"
                            checked={questions.question4 === "No Comfort or Experience"}
                            onChange={(e) => setQuestions({ ...questions, question4: e.target.value })}
                            className="mr-2"
                        />
                        No Comfort or Experience
                    </label>
                </div>
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
};

export default AccountingQuestions;
