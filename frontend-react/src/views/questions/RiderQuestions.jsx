export const riderQuestions = [
    "What experience do you have with navigation and route planning for deliveries?",
    "How do you ensure the safe handling and delivery of items?",
    "How comfortable are you with using technology for tracking deliveries?",
    "How would you rate your knowledge of local area routes?",
];
const RiderQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                What experience do you have with navigation and route planning
                for deliveries?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive experience and strong navigation skills"
                    checked={
                        questions.question1 ===
                        "Extensive experience and strong navigation skills"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive experience and strong navigation skills
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience with basic route planning"
                    checked={
                        questions.question1 ===
                        "Some experience with basic route planning"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some experience with basic route planning
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited experience but eager to learn"
                    checked={
                        questions.question1 ===
                        "Limited experience but eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Limited experience but eager to learn
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
                How do you ensure the safe handling and delivery of items?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have extensive knowledge of safety protocols"
                    checked={
                        questions.question2 ===
                        "I have extensive knowledge of safety protocols"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have extensive knowledge of safety protocols
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some knowledge and basic practicesd"
                    checked={
                        questions.question2 ===
                        "Some knowledge and basic practices"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Some knowledge and basic practices
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited knowledge but willing to learn"
                    checked={
                        questions.question2 ===
                        "Limited knowledge but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Limited knowledge but willing to learn
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
                How comfortable are you with using technology for tracking
                deliveries?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very comfortable and experienced"
                    checked={
                        questions.question3 ===
                        "Very comfortable and experienced"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Very comfortable and experienced
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Somewhat comfortable with basic tools"
                    checked={
                        questions.question3 ===
                        "Somewhat comfortable with basic tools"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Somewhat comfortable with basic tools
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal comfort but eager to improve"
                    checked={
                        questions.question3 ===
                        "Minimal comfort but eager to improve"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Minimal comfort but eager to improve
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
                How would you rate your knowledge of local area routes?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive Knowledge"
                    checked={questions.question4 === "Extensive Knowledge"}
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
                    value="Basic Knowledge"
                    checked={questions.question4 === "Basic Knowledge"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Basic Knowledge
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
export default RiderQuestions;
