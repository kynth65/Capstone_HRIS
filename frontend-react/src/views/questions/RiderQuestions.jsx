export const riderQuestions = [
    "Do you have a valid driver's license for this position?",
    "Are you comfortable driving in various weather conditions?",
    "How many years of experience do you have as a rider?",
];
const RiderQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have a valid driver's license for this position?*
                <div>
                    <input
                        type="radio"
                        name="driversLicense"
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
                        name="driversLicense"
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
                Are you comfortable driving in various weather conditions?*
                <div>
                    <input
                        type="radio"
                        name="weatherDriving"
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
                        name="weatherDriving"
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
                How many years of experience do you have as a rider?*
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
export default RiderQuestions;
