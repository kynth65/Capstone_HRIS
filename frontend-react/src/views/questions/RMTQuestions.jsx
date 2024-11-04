export const rmtQuestions = [
    "How familiar are you with various laboratory diagnostic tests (e.g., hematology, microbiology, clinical chemistry)?",
    "Describe your experience in maintaining quality control and calibration of laboratory instruments.",
    "Have you ever been involved in the identification and resolution of laboratory testing errors or issues?",
    "How comfortable are you with interpreting and reporting laboratory results accurately for different patient cases?",
];

const RMTQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            {/* Generic Medical Technologist questions */}
            <label>
                How familiar are you with various laboratory diagnostic tests
                (e.g., hematology, microbiology, clinical chemistry)?
                <div>
                    <label>
                        <input
                            type="radio"
                            name="tests"
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
                            name="tests"
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
                            name="tests"
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
                            name="tests"
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
                Describe your experience in maintaining quality control and
                calibration of laboratory instruments.
                <div>
                    <label>
                        <input
                            type="radio"
                            name="quality"
                            value="Extensive experience with regular calibration and quality control"
                            checked={
                                questions.question2 ===
                                "Extensive experience with regular calibration and quality control"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        Extensive experience with regular calibration and
                        quality control
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="quality"
                            value="Some experience, primarily assisting with calibration and quality control"
                            checked={
                                questions.question2 ===
                                "Some experience, primarily assisting with calibration and quality control"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question2: e.target.value,
                                })
                            }
                        />
                        Some experience, primarily assisting with calibration
                        and quality control
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="quality"
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
                            name="quality"
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
                Have you ever been involved in the identification and resolution
                of laboratory testing errors or issues?
                <div>
                    <label>
                        <input
                            type="radio"
                            name="errors"
                            value="Yes, I have identified and resolved testing errors"
                            checked={
                                questions.question3 ===
                                "Yes, I have identified and resolved testing errors"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        Yes, I have identified and resolved testing errors
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="errors"
                            value="Yes, I have assisted in identifying and resolving errors"
                            checked={
                                questions.question3 ===
                                "Yes, I have assisted in identifying and resolving errors"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        Yes, I have assisted in identifying and resolving errors
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="errors"
                            value="No, but I understand the basics of error identification"
                            checked={
                                questions.question3 ===
                                "No, but I understand the basics of error identification"
                            }
                            onChange={(e) =>
                                setQuestions({
                                    ...questions,
                                    question3: e.target.value,
                                })
                            }
                        />
                        No, but I understand the basics of error identification
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="errors"
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
                How comfortable are you with interpreting and reporting
                laboratory results accurately for different patient cases?
                <div>
                    <label>
                        <input
                            type="radio"
                            name="interpretation"
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
                            name="interpretation"
                            value="Somewhat Comfortable with Basic Experience"
                            checked={
                                questions.question4 ===
                                "Somewhat Comfortable with Basic Experience"
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
                            name="interpretation"
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
                            name="interpretation"
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

export default RMTQuestions;
