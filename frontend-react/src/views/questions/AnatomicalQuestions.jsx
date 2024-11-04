export const anatomicalQuestions = [
    "What is your experience with anatomical terminology and body systems?",
    "Are you familiar with handling and preparing anatomical specimens for analysis?",
    "Do you have experience assisting with dissections or specimen preparations in an anatomical lab setting?",
    "How comfortable are you with identifying and labeling anatomical structures?",
];

const AnatomicalQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                What is your experience with anatomical terminology and body
                systems?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extensive knowledge and practical experience"
                    checked={
                        questions.question1 ===
                        "Extensive knowledge and practical experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Extensive knowledge and practical experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Basic knowledge from coursework"
                    checked={
                        questions.question1 ===
                        "Basic knowledge from coursework"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Basic knowledge from coursework
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal knowledge, willing to learn"
                    checked={
                        questions.question1 ===
                        "Minimal knowledge, willing to learn"
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
                    value="No prior experience"
                    checked={questions.question1 === "No prior experience"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                No prior experience
            </div>

            <label>
                Are you familiar with handling and preparing anatomical
                specimens for analysis?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Yes, I have extensive experience"
                    checked={
                        questions.question2 ===
                        "Yes, I have extensive experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Yes, I have extensive experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some experience but limited"
                    checked={
                        questions.question2 === "Some experience but limited"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                Some experience but limited
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No experience, but I'm eager to learn"
                    checked={
                        questions.question2 ===
                        "No experience, but I'm eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                No experience, but I'm eager to learn
            </div>

            <label>
                Do you have experience assisting with dissections or specimen
                preparations in an anatomical lab setting?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Yes, I have extensive hands-on experience"
                    checked={
                        questions.question3 ===
                        "Yes, I have extensive hands-on experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Yes, I have extensive hands-on experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Yes, I have some experience with basic procedures"
                    checked={
                        questions.question3 ===
                        "Yes, I have some experience with basic procedures"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Yes, I have some experience with basic procedures
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal experience, but I am eager to learn"
                    checked={
                        questions.question3 ===
                        "Minimal experience, but I am eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                Minimal experience, but I am eager to learn
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
                How comfortable are you with identifying and labeling anatomical
                structures?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Extremely Comfortable"
                    checked={questions.question4 === "Extremely Comfortable"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Extremely Comfortable
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Somewhat Comfortable"
                    checked={questions.question4 === "Somewhat Comfortable"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Somewhat Comfortable
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Limited Comfort"
                    checked={questions.question4 === "Limited Comfort"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Limited Comfort
                <input
                    type="radio"
                    name="relatedDegree"
                    value="No Comfort"
                    checked={questions.question4 === "No Comfort"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                No Comfort
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

export default AnatomicalQuestions;
