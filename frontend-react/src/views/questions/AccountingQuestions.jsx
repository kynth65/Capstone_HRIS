export const accountingQuestions = [
    "How familiar are you with accounting software (e.g., QuickBooks, Xero)?",
    "Describe your experience with financial statement preparation (e.g., balance sheets, income statements).",
    "Have you ever managed or assisted with audits or regulatory compliance processes?",
    "How comfortable are you with analyzing financial data to assist in budgeting and forecasting",
];

const AccountingQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            {/* Generic accounting questions */}
            <label>
                How familiar are you with accounting software (e.g., QuickBooks,
                Xero)?
                <div>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Very Familiar"
                            checked={questions.question1 === "Very Familiar"}
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question1: e.target.value,
                                })
                            }
                        />
                        Very Familiar
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Somewhat Familiar"
                            checked={
                                questions.question1 === "Somewhat Familiar"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question1: e.target.value,
                                })
                            }
                        />
                        Somewhat Familiar
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Minimal Familiarity"
                            checked={
                                questions.question1 === "Minimal Familiarity"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question1: e.target.value,
                                })
                            }
                        />
                        Minimal Familiarity
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="No Experience"
                            checked={questions.question1 === "No Experience"}
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question1: e.target.value,
                                })
                            }
                        />
                        No Experience
                    </label>
                </div>
            </label>

            <label>
                Describe your experience with financial statement preparation
                (e.g., balance sheets, income statements).
                <div>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Extensive experience with regular preparation"
                            checked={
                                questions.question2 ===
                                "Extensive experience with regular preparation"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        Extensive experience with regular preparation
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Some experience, primarily assisting in preparation"
                            checked={
                                questions.question2 ===
                                "Some experience, primarily assisting in preparation"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        Some experience, primarily assisting in preparation
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Minimal experience, but knowledge of basic principles"
                            checked={
                                questions.question2 ===
                                "Minimal experience, but knowledge of basic principles"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        Minimal experience, but knowledge of basic principles
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="No Experience"
                            checked={questions.question2 === "No Experience"}
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        No Experience
                    </label>
                </div>
            </label>

            <label>
                Have you ever managed or assisted with audits or regulatory
                compliance processes?
                <div>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Yes, I have led audit/compliance processes"
                            checked={
                                questions.question3 ===
                                "Yes, I have led audit/compliance processes"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        Yes, I have led audit/compliance processes
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="Yes, I have assisted with audits/compliance"
                            checked={
                                questions.question3 ===
                                "Yes, I have assisted with audits/compliance"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        Yes, I have assisted with audits/compliance
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="No, but I understand the basics"
                            checked={
                                questions.question3 ===
                                "No, but I understand the basics"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        No, but I understand the basics
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="degree"
                            value="No Experience"
                            checked={questions.question3 === "No Experience"}
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        No Experience
                    </label>
                </div>
            </label>
            <label>
                How comfortable are you with analyzing financial data to assist
                in budgeting and forecasting
                <div>
                    <label>
                        <input
                            type="radio"
                            name="budgeting"
                            value="Extremely Comfortable and Experienced"
                            checked={
                                questions.question4 ===
                                "Extremely Comfortable and Experienced"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question4: e.target.value,
                                })
                            }
                        />
                        Extremely Comfortable and Experienced
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="budgeting"
                            value=" Somewhat Comfortable with Basic Experience"
                            checked={
                                questions.question4 ===
                                " Somewhat Comfortable with Basic Experience"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question4: e.target.value,
                                })
                            }
                        />
                        Somewhat Comfortable with Basic Experience
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="budgeting"
                            value="Limited Comfort and Experience"
                            checked={
                                questions.question4 ===
                                "Limited Comfort and Experience"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question4: e.target.value,
                                })
                            }
                        />
                        Limited Comfort and Experience
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="budgeting"
                            value="No Comfort or Experience"
                            checked={
                                questions.question4 ===
                                "No Comfort or Experience"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question4: e.target.value,
                                })
                            }
                        />
                        No Comfort or Experience
                    </label>
                </div>
            </label>

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
