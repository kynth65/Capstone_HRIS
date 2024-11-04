export const maintenanceQuestions = [
    "Describe your experience with routine building and equipment maintenance tasks.",
    "Are you willing to work on a flexible schedule, including weekends?",
    "How familiar are you with using maintenance management software to track repairs and maintenance tasks?",
    " How would you rate your understanding of safety protocols?",
];
const MaintenanceQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Describe your experience with routine building and equipment
                maintenance tasks.
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive experience with regular maintenance tasks"
                    checked={
                        questions.question1 ===
                        "Extensive experience with regular maintenance tasks"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive experience with regular maintenance tasks
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience with basic tasks"
                    checked={
                        questions.question1 ===
                        "Some experience with basic tasks"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some experience with basic tasks
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
                Are you certified or trained in any specific areas of
                maintenance (e.g., HVAC, electrical, plumbing)?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Yes, certified in one or more areas"
                    checked={
                        questions.question2 ===
                        "Yes, certified in one or more areas"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Yes, certified in one or more areas
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some training, but not certified"
                    checked={
                        questions.question2 ===
                        "Some training, but not certified"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Some training, but not certified
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No certification, but experienced"
                    checked={
                        questions.question2 ===
                        "No certification, but experienced"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                No certification, but experienced
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No certification or training"
                    checked={
                        questions.question2 === "No certification or training"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                No certification or training
            </div>

            <label>
                How familiar are you with using maintenance management software
                to track repairs and maintenance tasks?
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
                How would you rate your understanding of safety protocols?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value=" Extensive Knowledge"
                    checked={questions.question4 === " Extensive Knowledge"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Extensive Knowledge
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Good Knowledge"
                    checked={questions.question4 === "Good Knowledge"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Good Knowledge
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Basic Understanding"
                    checked={questions.question4 === "Basic Understanding"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Basic Understanding
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No Knowledge"
                    checked={questions.question4 === "No Knowledge"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                No Knowledge
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
export default MaintenanceQuestions;
