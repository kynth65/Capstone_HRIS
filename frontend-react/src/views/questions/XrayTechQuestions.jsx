export const xrayTechQuestions = [
    "How experienced are you with operating different types of X-ray machines?",
    "What protocols do you follow to ensure patient safety during X-ray procedures?",
    "How do you handle challenging situations with anxious or difficult patients?",
    "How would you rate your understanding of radiation safety?",
];
const XRayTechQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                How experienced are you with operating different types of X-ray
                machines?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive experience with various machines"
                    checked={
                        questions.question1 ===
                        "Extensive experience with various machines"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive experience with various machines
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience with specific types"
                    checked={
                        questions.question1 ===
                        "Some experience with specific types"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some experience with specific types
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
                What protocols do you follow to ensure patient safety during
                X-ray procedures?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have comprehensive knowledge of safety protocols"
                    checked={
                        questions.question2 ===
                        "I have comprehensive knowledge of safety protocols"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have comprehensive knowledge of safety protocols
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some knowledge and basic practices"
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
                How do you handle challenging situations with anxious or
                difficult patients?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have extensive experience and effective techniques"
                    checked={
                        questions.question3 ===
                        "I have extensive experience and effective techniques"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                I have extensive experience and effective techniques
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience but can improve"
                    checked={
                        questions.question3 ===
                        "Some experience but can improve"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Some experience but can improve
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited experience but willing to learn"
                    checked={
                        questions.question3 ===
                        "Limited experience but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Limited experience but willing to learn
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
                How do you handle challenging situations with anxious or
                difficult patients?
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
export default XRayTechQuestions;
