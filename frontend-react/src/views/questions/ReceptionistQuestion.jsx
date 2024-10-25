export const receptionistQuestions = [
    "Do you have experience managing a front desk or reception area?",
    "Are you proficient in using office management software?",
    "How many years of experience do you have as a receptionist?",
];

const ReceptionistQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have experience managing a front desk or reception area?*
                <div>
                    <input
                        type="radio"
                        name="frontDeskExperience"
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
                        name="frontDeskExperience"
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
                Are you proficient in using office management software?*
                <div>
                    <input
                        type="radio"
                        name="officeSoftware"
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
                        name="officeSoftware"
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
                How many years of experience do you have as a receptionist?*
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

export default ReceptionistQuestions;
