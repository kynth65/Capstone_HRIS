export const receptionistQuestions = [
    "Can you describe your experience with basic office software (e.g., Microsoft Office, scheduling systems)?",
    "What strategies do you use to prioritize tasks during busy periods at the front desk?",
    "How do you handle scheduling conflicts when managing appointments?",
    "How comfortable are you with greeting and assisting visitors professionally?",
];

const ReceptionistQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Can you describe your experience with basic office software
                (e.g., Microsoft Office, scheduling systems)?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very proficient and experienced"
                    checked={
                        questions.question1 ===
                        "Very proficient and experienced"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Very proficient and experienced
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Some proficiency with basic tasks"
                    checked={
                        questions.question1 ===
                        "Some proficiency with basic tasks"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Some proficiency with basic tasks
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Minimal proficiency but willing to learn"
                    checked={
                        questions.question1 ===
                        "Minimal proficiency but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question1: e.target.value,
                        })
                    }
                />
                Minimal proficiency but willing to learn
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
                What strategies do you use to prioritize tasks during busy
                periods at the front desk?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have effective strategies and extensive experience"
                    checked={
                        questions.question2 ===
                        "I have effective strategies and extensive experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have effective strategies and extensive experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have some strategies but limited experience"
                    checked={
                        questions.question2 ===
                        "I have some strategies but limited experience"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have some strategies but limited experience
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have minimal experience but am eager to learn"
                    checked={
                        questions.question2 ===
                        "I have minimal experience but am eager to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have minimal experience but am eager to learn
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have no experience but am willing to develop skills"
                    checked={
                        questions.question2 ===
                        "I have no experience but am willing to develop skills"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question2: e.target.value,
                        })
                    }
                />
                I have no experience but am willing to develop skills
            </div>

            <label>
                How do you handle scheduling conflicts when managing
                appointments?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have extensive experience and effective solutions for conflictsr"
                    checked={
                        questions.question3 ===
                        "I have extensive experience and effective solutions for conflicts"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                I have extensive experience and effective solutions for
                conflicts
                <input
                    type="radio"
                    name="relatedDegree"
                    value="I have some experience and can manage basic conflicts"
                    checked={
                        questions.question3 ===
                        "I have some experience and can manage basic conflicts"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question3: e.target.value,
                        })
                    }
                />
                I have some experience and can manage basic conflicts
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
                How do you handle scheduling conflicts when managing
                appointments?
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
                    value="Very Comfortable"
                    checked={questions.question4 === "Very Comfortable"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Very Comfortable
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
                    value="Limited experience but willing to learn"
                    checked={
                        questions.question4 ===
                        "Limited experience but willing to learn"
                    }
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Limited experience but willing to learn
                <input
                    type="radio"
                    name="relatedDegree"
                    value=" Limited Comfort"
                    checked={questions.question4 === " Limited Comfort"}
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
                    value="  Not Comfortable"
                    checked={questions.question4 === " Not Comfortable"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                />
                Not Comfortable
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

export default ReceptionistQuestions;
