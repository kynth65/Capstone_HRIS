export const ultrasoundQuestions = [
    " Do you have a certification in Diagnostic Medical Sonography?",
    "Are you comfortable working with patients in a medical setting?",
    "How many years of experience do you have in conducting ultrasounds?",
];
const UltrasoundTechQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have a certification in Diagnostic Medical Sonography?*
                <div>
                    <input
                        type="radio"
                        name="sonographyCertified"
                        value="Yes"
                        checked={questions.question1 === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question1: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="sonographyCertified"
                        value="No"
                        checked={questions.question1 === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question1: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                Are you comfortable working with patients in a medical setting?*
                <div>
                    <input
                        type="radio"
                        name="patientComfort"
                        value="Yes"
                        checked={questions.question2 === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question2: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="patientComfort"
                        value="No"
                        checked={questions.question2 === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question2: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                How many years of experience do you have in conducting
                ultrasounds?*
                <div>
                    <input
                        type="number"
                        value={questions.question3 || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question3: e.target.value,
                            })
                        }
                        min="0"
                    />
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
export default UltrasoundTechQuestions;
