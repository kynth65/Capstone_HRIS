export const accountingQuestions = [
    "Have you completed the following level of education:Bachelor&apos;s Degree?",
    "Are you willing to undergo a background check, in accordance with local law/regulations?",
    "Are you comfortable commuting to this job&apos;s location?* Are you comfortable commuting to this job&apos;s location?",
    "Willing to work Saturdays?",
    "Bachelor of Science in Accountancy graduate?",
    "What is your level of proficiency in English?",
    "How many years of Accounting/Auditing experience do you currently have?",
    " How many years of work experience do you have with Accounting Software?",
];

const AccountingQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            {/* Accounting-specific questions */}
            <label>
                Have you completed the following level of education:
                Bachelor&apos;s Degree?*
                <div>
                    <label>
                        <input
                            type="radio"
                            name="bachelorDegree"
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
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="bachelorDegree"
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
                    </label>
                </div>
            </label>

            <label>
                Are you willing to undergo a background check, in accordance
                with local law/regulations?*
                <div>
                    <label>
                        <input
                            type="radio"
                            name="backgroundCheck"
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
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="backgroundCheck"
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
                    </label>
                </div>
            </label>

            <label>
                Are you comfortable commuting to this job&apos;s location?* Are
                you comfortable commuting to this job&apos;s location?*
                <div>
                    <label>
                        <input
                            type="radio"
                            name="commute"
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
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="commute"
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
                    </label>
                </div>
            </label>

            <label>
                Willing to work Saturdays?*
                <div>
                    <select
                        value={questions.question4}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question4: e.target.value,
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
                        value={questions.question5}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question5: e.target.value,
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
                        value={questions.question6}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question6: e.target.value,
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
                        value={questions.question7 || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question7: e.target.value,
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
                        value={questions.question8 || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question8: e.target.value,
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
                        value={questions.question9 || ""}
                        onChange={(e) =>
                            setQuestions({
                                ...questions,
                                question9: e.target.value,
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
