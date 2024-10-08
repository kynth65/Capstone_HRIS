import React from "react";

const AccountingQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            {/* Accounting-specific questions */}
            <label>
                Have you completed the following level of education: Bachelor's
                Degree?*
                <div>
                    <input
                        type="radio"
                        name="bachelorDegree"
                        value="Yes"
                        checked={questions.bachelorDegree === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                bachelorDegree: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="bachelorDegree"
                        value="No"
                        checked={questions.bachelorDegree === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                bachelorDegree: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                Are you willing to undergo a background check, in accordance
                with local law/regulations?*
                <div>
                    <input
                        type="radio"
                        name="backgroundCheck"
                        value="Yes"
                        checked={questions.backgroundCheck === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                backgroundCheck: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="backgroundCheck"
                        value="No"
                        checked={questions.backgroundCheck === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                backgroundCheck: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                Are you comfortable commuting to this job's location?*
                <div>
                    <input
                        type="radio"
                        name="commute"
                        value="Yes"
                        checked={questions.commute === "Yes"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                commute: e.target.value,
                            })
                        }
                    />
                    Yes
                    <input
                        type="radio"
                        name="commute"
                        value="No"
                        checked={questions.commute === "No"}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                commute: e.target.value,
                            })
                        }
                    />
                    No
                </div>
            </label>

            <label>
                Willing to work Saturdays?*
                <div>
                    <select
                        value={questions.workSaturdays}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                workSaturdays: e.target.value,
                            })
                        }
                    >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
            </label>

            <label>
                Bachelor of Science in Accountancy graduate?*
                <div>
                    <select
                        value={questions.accountancyGraduate}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                accountancyGraduate: e.target.value,
                            })
                        }
                    >
                        <option value="">Select an option</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
            </label>

            <label>
                What is your level of proficiency in English?*
                <div>
                    <select
                        value={questions.englishProficiency}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                englishProficiency: e.target.value,
                            })
                        }
                    >
                        <option value="">Select an option</option>
                        <option value="None">None</option>
                        <option value="Conversational">Conversational</option>
                        <option value="Professional">Professional</option>
                        <option value="Native or bilingual">
                            Native or bilingual
                        </option>
                    </select>
                </div>
            </label>

            <label>
                How many years of Accounting/Auditing experience do you
                currently have?*
                <div>
                    <input
                        type="number"
                        value={questions.accountingExperience || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                accountingExperience: e.target.value,
                            })
                        }
                        min="0"
                    />
                </div>
            </label>

            <label>
                How many years of work experience do you have with Accounting
                Software?*
                <div>
                    <input
                        type="number"
                        value={questions.softwareExperience || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                softwareExperience: e.target.value,
                            })
                        }
                        min="0"
                    />
                </div>
            </label>

            <label>
                How many years of work experience do you have with Business
                Process?*
                <div>
                    <input
                        type="number"
                        value={questions.businessProcessExperience || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                businessProcessExperience: e.target.value,
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

export default AccountingQuestions;
