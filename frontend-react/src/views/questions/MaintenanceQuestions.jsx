export const maintenanceQuestions = [
    "Are you comfortable performing minor repair work?",
    "Are you willing to work on a flexible schedule, including weekends?",
    "How many years of experience do you have in maintenance work?",
];
const MaintenanceQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Are you comfortable performing minor repair work?*
                <div>
                    <input
                        type="radio"
                        name="repairWork"
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
                        name="repairWork"
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
                Are you willing to work on a flexible schedule, including
                weekends?*
                <div>
                    <input
                        type="radio"
                        name="flexibleSchedule"
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
                        name="flexibleSchedule"
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
                How many years of experience do you have in maintenance work?*
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
export default MaintenanceQuestions;
