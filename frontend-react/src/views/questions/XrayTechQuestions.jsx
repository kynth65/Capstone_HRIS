export const xrayTechQuestions = [
    "Do you have a certification as an X-Ray Technician?",
    " Are you comfortable working with radiation?",
    "Are you certified in CPR?",
    " How many years of experience do you have as an X-Ray Technician?",
];
const XRayTechQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have a certification as an X-Ray Technician?*
                <div>
                    <input
                        type="radio"
                        name="certified"
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
                        name="certified"
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
                Are you comfortable working with radiation?*
                <div>
                    <input
                        type="radio"
                        name="radiationComfort"
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
                        name="radiationComfort"
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
                Are you certified in CPR?*
                <div>
                    <input
                        type="radio"
                        name="cprCertified"
                        value="Yes"
                        checked={questions.question3 === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question3: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="cprCertified"
                        value="No"
                        checked={questions.question3 === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question3: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                How many years of experience do you have as an X-Ray
                Technician?*
                <div>
                    <input
                        type="number"
                        value={questions.question4 || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question4: e.target.value,
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
export default XRayTechQuestions;
