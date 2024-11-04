export const ultrasoundQuestions = [
    "What types of ultrasound procedures are you most experienced in performing?",
    "How do you ensure patient comfort and understanding during ultrasound examinations?",
    "What is your familiarity with ultrasound equipment and technology?",
    "How familiar are you with interpreting and recording ultrasound images?",
];
const UltrasoundTechQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                What types of ultrasound procedures are you most experienced in
                performing?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I am experienced in multiple types of procedures"
                    checked={
                        questions.question1 ===
                        "I am experienced in multiple types of procedures"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                I am experienced in multiple types of procedures
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have experience in a few specific procedures"
                    checked={
                        questions.question1 ===
                        "I have experience in a few specific procedures"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                I have experience in a few specific procedures
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
                How do you ensure patient comfort and understanding during
                ultrasound examinations?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have established techniques for comfort and communication"
                    checked={
                        questions.question2 ===
                        "I have established techniques for comfort and communication"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have established techniques for comfort and communication
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some techniques but limited experience"
                    checked={
                        questions.question2 ===
                        "Some techniques but limited experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Some techniques but limited experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal experience but willing to learn"
                    checked={
                        questions.question2 ===
                        "Minimal experience but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Minimal experience but willing to learn
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
                What is your familiarity with ultrasound equipment and
                technology?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very familiar with advanced technology"
                    checked={
                        questions.question3 ===
                        "Very familiar with advanced technology"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Very familiar with advanced technology
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some familiarity with basic equipment"
                    checked={
                        questions.question3 ===
                        "Some familiarity with basic equipment"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Some familiarity with basic equipment
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal familiarity but eager to learn"
                    checked={
                        questions.question3 ===
                        "Minimal familiarity but eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Minimal familiarity but eager to learn
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
                How familiar are you with interpreting and recording ultrasound
                images?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value=" Very Familiar"
                    checked={questions.question4 === " Very Familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Very Familiar
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
                    value="Somewhat Familiar"
                    checked={questions.question4 === "Somewhat Familiar"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            4: e.target.value,
                        })
                    }
                />
                Somewhat Familiar
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Not Familiar"
                    checked={questions.question4 === "Not Familiar"}
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
export default UltrasoundTechQuestions;
