export const securityQuestions = [
    " What experience do you have with surveillance systems and monitoring security footage?",
    "How do you handle emergency situations or security breaches?",
    "What techniques do you use to effectively communicate with staff and visitors regarding security protocols?",
    "How familiar are you with emergency response procedures?",
];
const SecurityQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                What experience do you have with surveillance systems and
                monitoring security footage?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive experience with various systems"
                    checked={
                        questions.question1 ===
                        "Extensive experience with various systems"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive experience with various systems
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience but limited knowledge"
                    checked={
                        questions.question1 ===
                        "Some experience but limited knowledge"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some experience but limited knowledge
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal experience but eager to learn"
                    checked={
                        questions.question1 ===
                        "Minimal experience but eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Minimal experience but eager to learn
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
                How do you handle emergency situations or security breaches?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have extensive training and experience in crisis management"
                    checked={
                        questions.question2 ===
                        "I have extensive training and experience in crisis management"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have extensive training and experience in crisis management
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have some experience and basic procedures"
                    checked={
                        questions.question2 ===
                        "I have some experience and basic procedures"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have some experience and basic procedures
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited experience but willing to learn"
                    checked={
                        questions.question2 ===
                        "Limited experience but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Limited experience but willing to learn
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No experience"
                    checked={questions.question2 === "No experience "}
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
                What techniques do you use to effectively communicate with staff
                and visitors regarding security protocols?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have strong communication skills and experience"
                    checked={
                        questions.question3 ===
                        "I have strong communication skills and experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                I have strong communication skills and experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience with basic communication techniques"
                    checked={
                        questions.question3 ===
                        "Some experience with basic communication techniques"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Some experience with basic communication techniques
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited experience but eager to improve"
                    checked={
                        questions.question3 ===
                        "Limited experience but eager to improve"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Limited experience but eager to improve
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
                How familiar are you with emergency response procedures?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value=" Extremely Familiar"
                    checked={questions.question4 === " Extremely Familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Extremely Familiar
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Somewhat Familiar"
                    checked={questions.question4 === "Somewhat Familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Somewhat Familiar
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal Familiarity"
                    checked={questions.question4 === "Minimal Familiarity"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            4: e.target.value,
                        })
                    }
                />
                Minimal Familiarity
                <input
                    type="radio"
                    name="relatedDegree"
                    value=" Not Familiar"
                    checked={questions.question4 === " Not Familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Not Familiar
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
export default SecurityQuestions;
