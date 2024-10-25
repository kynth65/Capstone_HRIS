export const medicalSecretaryQuestions = [
    "Do you have experience with medical scheduling software?",
    "Are you proficient in medical terminology?",
    "How comfortable are you with patient interaction?",
];

const MedicalSecretaryQuestions = ({ questions, setQuestions, errors }) => (
    <div>
        <label>
            Do you have experience with medical scheduling software?*
            <div>
                <input
                    type="radio"
                    name="schedulingExperience"
                    value="Yes"
                    checked={questions.questions1 === "Yes"}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            questions1: e.target.value,
                        })
                    }
                />
                Yes
                <input
                    type="radio"
                    name="schedulingExperience"
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
        </label>

        <label>
            Are you proficient in medical terminology?*
            <div>
                <input
                    type="radio"
                    name="medicalTerminology"
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
                    name="medicalTerminology"
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
        </label>

        <label>
            How comfortable are you with patient interaction?*
            <div>
                <select
                    value={questions.patientInteraction}
                    onChange={(e) =>
                        setQuestions({
                            ...questions,
                            questions3: e.target.value,
                        })
                    }
                >
                    <option value="">Select an option</option>
                    <option value="Very comfortable">Very comfortable</option>
                    <option value="Somewhat comfortable">
                        Somewhat comfortable
                    </option>
                    <option value="Not comfortable">Not comfortable</option>
                </select>
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

export default MedicalSecretaryQuestions;
