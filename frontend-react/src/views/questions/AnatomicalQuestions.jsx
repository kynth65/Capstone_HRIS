export const anatomicalQuestions = [
    "Do you have a degree in a related field, such as Anatomy, Physiology, or Biomedical Science?",
    "Are you familiar with anatomical dissection techniques?",
    "Do you have experience working with human cadaver specimens?",
    "How many years of experience do you have in an anatomical or biological laboratory setting?",
    "How would you rate your proficiency in identifying and labeling anatomical structures?",
    "Are you comfortable using anatomical software or virtual dissection tools?",
    "Do you have experience teaching or presenting anatomical concepts to others?",
    "What is your level of proficiency in medical terminology?",
];

const AnatomicalQuestions = ({ questions, setQuestions, errors }) => {
    return (
        <div>
            <label>
                Do you have a degree in a related field, such as Anatomy,
                Physiology, or Biomedical Science?*
            </label>
            <div>
                <input
                    type="radio"
                    name="relatedDegree"
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
                <input
                    type="radio"
                    name="relatedDegree"
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
            </div>

            <label>
                Are you familiar with anatomical dissection techniques?*
            </label>
            <div>
                <input
                    type="radio"
                    name="dissectionTechniques"
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
                <input
                    type="radio"
                    name="dissectionTechniques"
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
            </div>

            <label>
                Do you have experience working with human cadaver specimens?*
            </label>
            <div>
                <input
                    type="radio"
                    name="cadaverExperience"
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
                <input
                    type="radio"
                    name="cadaverExperience"
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
            </div>

            <label>
                How many years of experience do you have in an anatomical or
                biological laboratory setting?*
            </label>
            <div>
                <input
                    type="number"
                    value={questions.question4 || ""}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question4: e.target.value,
                        })
                    }
                    min="0"
                />
            </div>

            <label>
                How would you rate your proficiency in identifying and labeling
                anatomical structures?*
            </label>
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
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                </select>
            </div>

            <label>
                Are you comfortable using anatomical software or virtual
                dissection tools?*
            </label>
            <div>
                <input
                    type="radio"
                    name="anatomicalSoftware"
                    value="Yes"
                    checked={questions.question6 === "Yes"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question6: e.target.value,
                        })
                    }
                />
                Yes
                <input
                    type="radio"
                    name="anatomicalSoftware"
                    value="No"
                    checked={questions.question6 === "No"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question6: e.target.value,
                        })
                    }
                />
                No
            </div>

            <label>
                Do you have experience teaching or presenting anatomical
                concepts to others?*
            </label>
            <div>
                <input
                    type="radio"
                    name="teachingExperience"
                    value="Yes"
                    checked={questions.question7 === "Yes"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question7: e.target.value,
                        })
                    }
                />
                Yes
                <input
                    type="radio"
                    name="teachingExperience"
                    value="No"
                    checked={questions.question7 === "No"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question7: e.target.value,
                        })
                    }
                />
                No
            </div>

            <label>
                What is your level of proficiency in medical terminology?*
            </label>
            <div>
                <select
                    value={questions.question8}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            question8: e.target.value,
                        })
                    }
                >
                    <option value="">Select an option</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                </select>
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
