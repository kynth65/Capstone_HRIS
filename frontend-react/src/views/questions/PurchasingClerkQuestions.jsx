export const purchasingClerkQuestions = [
    "What experience do you have with managing inventory and placing orders for supplies?",
    "How comfortable are you with negotiating prices and managing supplier relationships?",
    "Are you familiar with procurement or inventory management software?",
    "How skilled are you in using inventory or purchasing software?",
];

const PurchasingClerkQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                What experience do you have with managing inventory and placing
                orders for supplies?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive experience"
                    checked={questions.question1 === "Extensive experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience"
                    checked={questions.question1 === "Some experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal experience but willing to learn"
                    checked={
                        questions.question1 ===
                        "Minimal experience but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Minimal knowledge, willing to learn
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No experience"
                    checked={questions.question1 === "No experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                No experience
            </div>

            <label>
                How comfortable are you with negotiating prices and managing
                supplier relationships?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very comfortable and experienced"
                    checked={
                        questions.question2 ===
                        "Very comfortable and experienced"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Very comfortable and experienced
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Somewhat comfortable"
                    checked={questions.question2 === "Somewhat comfortable"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Somewhat comfortable
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal experience"
                    checked={questions.question2 === "Minimal experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Minimal experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No experience"
                    checked={questions.question2 === "No experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                No experience
            </div>

            <label>
                Are you familiar with procurement or inventory management
                software?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very familiar"
                    checked={questions.question3 === "Very familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Very familiar
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Somewhat familiar"
                    checked={questions.question3 === "Somewhat familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Somewhat familiar
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal familiarity"
                    checked={questions.question3 === "Minimal familiarity"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Minimal familiarity
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No experience"
                    checked={questions.question3 === "No experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                No experience
            </div>

            <label>
                Are you familiar with procurement or inventory management
                software?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very Skilled"
                    checked={questions.question4 === "Very Skilled"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Very Skilled
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Moderately Skilled"
                    checked={questions.question4 === "Moderately Skilled"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Moderately Skilled
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Basic Skill"
                    checked={questions.question4 === "Basic Skill"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Basic Skill
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No Skill"
                    checked={questions.question4 === "No Skill"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                No Skill
            </div>

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

export default PurchasingClerkQuestions;
