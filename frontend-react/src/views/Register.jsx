import React, { useState, useRef } from "react";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";

export default function Register() {
    const { setUser, setToken } = useStateContext();
    const [errors, setErrors] = useState(null);
    const [success, setSuccess] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});
    const [positions, setPositions] = useState([]); // Store positions based on department
    const formRef = useRef(null);

    // Define department to position mappings
    const departmentPositions = {
        Admin: ["Accountant", "Marketing", "Purchasing", "Book Keeper"],
        Diagnostics: [
            "Medtech",
            "X-ray Tech",
            "Ultrasound",
            "Phlebotomist",
            "Sonographer",
        ],
        Clinic: ["Secretary", "Receptionist", "Physician"],
        Utility: ["Security", "Janitorial"],
    };

    const formSections = [
        {
            title: "Personal Information",
            fields: [
                "rfid",
                "first_name",
                "last_name",
                "middle_name",
                "suffix",
                "date_of_birth",
                "gender",
                "marital_status",
                "nationality",
                "mothers_maiden_name",
                "fathers_name",
            ],
        },
        {
            title: "Contact Information",
            fields: [
                "address",
                "city",
                "province",
                "postal_code",
                "country",
                "personal_email",
                "work_email",
                "home_phone",
                "contact_number",
            ],
        },
        {
            title: "Emergency Contact",
            fields: [
                "emergency_contact_name",
                "emergency_contact_relationship",
                "emergency_contact_phone",
            ],
        },
        {
            title: "Employment Information",
            fields: [
                "email",
                "hire_date",
                "employment_status",
                "department",
                "position",
                "reporting_manager",
                "work_location",
                "employee_type",
                "probation_end_date",
                "current_salary",
                "pay_frequency",
            ],
        },
        {
            title: "Education and Work History",
            fields: [
                "highest_degree_earned",
                "field_of_study",
                "institution_name",
                "graduation_year",
                "work_history",
            ],
        },
        {
            title: "Additional Information",
            fields: [
                "health_insurance_plan",
                "sick_leave_balance",
                "completed_training_programs",
                "work_permit_expiry_date",
                "notes",
            ],
        },
        {
            title: "Security Information",
            fields: ["password"],
        },
    ];

    const requiredFields = [
        "rfid",
        "first_name",
        "last_name",
        "email",
        "password",
        "date_of_birth",
        "gender",
        "hire_date",
        "employment_status",
        "position",
        "department",
        "employee_type",
        "current_salary",
        "contact_number",
    ];

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axiosClient.post("/register", formData);
            setUser(data.user);
            setToken(data.token);
            setErrors(null);
            setSuccess(data.message || "Registration successful!");
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            setErrors(responseErrors);
            setSuccess("");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Set positions based on the selected department
        if (name === "department") {
            setPositions(departmentPositions[value] || []);
            setFormData((prevData) => ({
                ...prevData,
                position: "", // Reset position when department changes
            }));
        }

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validateStep = () => {
        const currentFields = formSections[currentStep].fields;
        const requiredCurrentFields = currentFields.filter((field) =>
            requiredFields.includes(field)
        );
        const isStepValid = requiredCurrentFields.every(
            (field) => formData[field] && formData[field].trim() !== ""
        );
        return isStepValid;
    };

    const goToNextStep = () => {
        if (validateStep()) {
            setCurrentStep((prevStep) => prevStep + 1);
            setErrors(null);
        } else {
            setErrors({ general: ["Please fill in all required fields."] });
        }
    };

    const renderField = (fieldName) => {
        const commonProps = {
            id: fieldName,
            name: fieldName,
            value: formData[fieldName] || "",
            onChange: handleInputChange,
            className:
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            required: requiredFields.includes(fieldName),
        };

        switch (fieldName) {
            case "department":
                return (
                    <select {...commonProps}>
                        <option value="">Select Department</option>
                        {Object.keys(departmentPositions).map((department) => (
                            <option key={department} value={department}>
                                {department}
                            </option>
                        ))}
                    </select>
                );
            case "position":
                return (
                    <select {...commonProps}>
                        <option value="">Select Position</option>
                        {positions.map((position) => (
                            <option key={position} value={position}>
                                {position}
                            </option>
                        ))}
                    </select>
                );
            case "rfid":
                return (
                    <select {...commonProps}>
                        <option value="EF4CAA1E">EF4CAA1E</option>
                        <option value="A804A689">A804A689</option>
                        <option value="B47B96B0">B47B96B0</option>
                        <option value="RFID3">RFID3</option>
                        <option value="RFID4">RFID4</option>
                        <option value="RFID5">RFID5</option>
                        <option value="RFID6">RFID6</option>
                    </select>
                );
            case "gender":
                return (
                    <select {...commonProps}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                );
            case "marital_status":
                return (
                    <select {...commonProps}>
                        <option value="">Select Marital Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                );
            case "suffix":
                return (
                    <select {...commonProps}>
                        <option value="">Select Suffix</option>
                        <option value="Jr.">Jr.</option>
                        <option value="Sr.">Sr.</option>
                        <option value="II">II</option>
                        <option value="III">III</option>
                        <option value="IV">IV</option>
                        <option value="V">V</option>
                    </select>
                );
            case "employment_status":
                return (
                    <select {...commonProps}>
                        <option value="">Select Employment Status</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                    </select>
                );
            case "employee_type":
                return (
                    <select {...commonProps}>
                        <option value="">Select Employee Type</option>
                        <option value="Regular">Regular</option>
                        <option value="Temporary">Temporary</option>
                        <option value="Intern">Intern</option>
                    </select>
                );
            case "pay_frequency":
                return (
                    <select {...commonProps}>
                        <option value="">Select Pay Frequency</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-weekly">Bi-weekly</option>
                        <option value="Monthly">Monthly</option>
                    </select>
                );
            case "password":
                return <input type="password" {...commonProps} />;
            case "date_of_birth":
            case "hire_date":
            case "probation_end_date":
            case "work_permit_expiry_date":
                return <input type="date" {...commonProps} />;
            case "current_salary":
                return (
                    <input type="number" min="0" step="0.01" {...commonProps} />
                );
            case "email":
            case "personal_email":
            case "work_email":
                return <input type="email" {...commonProps} />;
            case "home_phone":
            case "contact_number":
            case "emergency_contact_phone":
                return <input type="tel" {...commonProps} />;
            case "graduation_year":
                return (
                    <input
                        type="number"
                        min="1900"
                        max="2099"
                        step="1"
                        {...commonProps}
                    />
                );
            case "sick_leave_balance":
                return (
                    <input type="number" min="0" step="1" {...commonProps} />
                );
            case "work_history":
            case "completed_training_programs":
            case "notes":
                return <textarea rows="4" {...commonProps}></textarea>;
            default:
                return <input type="text" {...commonProps} />;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-lg p-6 mt-10 mb-10 bg-white rounded-lg shadow-md text-black">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                    Register - {formSections[currentStep].title}
                </h2>
                {success && (
                    <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                        {success}
                    </div>
                )}
                {errors && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {Object.values(errors)
                            .flat()
                            .map((err, index) => (
                                <p key={index}>{err}</p>
                            ))}
                    </div>
                )}
                <form onSubmit={onSubmit} ref={formRef} className="space-y-4">
                    {formSections[currentStep].fields.map((fieldName) => (
                        <div className="form-group" key={fieldName}>
                            <label
                                htmlFor={fieldName}
                                className="block mb-1 font-medium text-gray-700"
                            >
                                {fieldName
                                    .split("_")
                                    .map(
                                        (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1)
                                    )
                                    .join(" ")}
                                {requiredFields.includes(fieldName) && (
                                    <span className="text-red-500">*</span>
                                )}
                            </label>
                            {renderField(fieldName)}
                        </div>
                    ))}
                    <div className="form-navigation flex justify-between mt-6">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    setCurrentStep((prevStep) => prevStep - 1)
                                }
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < formSections.length - 1 ? (
                            <button
                                type="button"
                                onClick={goToNextStep}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Submit
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
