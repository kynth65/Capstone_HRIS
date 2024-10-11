import React from "react";

const AnatomicalQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have a degree in a related field, such as Anatomy,
                Physiology, or Biomedical Science?*
                <div>
                    <input
                        type="radio"
                        name="relatedDegree"
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
                        name="relatedDegree"
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
                Are you familiar with anatomical dissection techniques?*
                <div>
                    <input
                        type="radio"
                        name="dissectionTechniques"
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
                        name="dissectionTechniques"
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
                Do you have experience working with human cadaver specimens?*
                <div>
                    <input
                        type="radio"
                        name="cadaverExperience"
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
                        name="cadaverExperience"
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
                How many years of experience do you have in an anatomical or
                biological laboratory setting?*
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

            <label>
                How would you rate your proficiency in identifying and labeling
                anatomical structures?*
                <div>
                    <select
                        value={questions.question5}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question5: e.target.value,
                            })
                        }
                    >
                        <option value="">Select an option</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
                </div>
            </label>

            <label>
                Are you comfortable using anatomical software or virtual
                dissection tools?*
                <div>
                    <input
                        type="radio"
                        name="anatomicalSoftware"
                        value="Yes"
                        checked={questions.question6 === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question6: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="anatomicalSoftware"
                        value="No"
                        checked={questions.question6 === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question6: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                Do you have experience teaching or presenting anatomical
                concepts to others?*
                <div>
                    <input
                        type="radio"
                        name="teachingExperience"
                        value="Yes"
                        checked={questions.question7 === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question7: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="teachingExperience"
                        value="No"
                        checked={questions.question7 === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question7: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                What is your level of proficiency in medical terminology?*
                <div>
                    <select
                        value={questions.question8}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question8: e.target.value,
                            })
                        }
                    >
                        <option value="">Select an option</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                    </select>
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

export default AnatomicalQuestions;
