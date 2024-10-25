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
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // Define department to position mappings
    const departmentPositions = {
        Admin: ["Admin", "Purchasing"],
        HR: [
            "Human Resource Manager",
            "Human Resource Assistant",
            "Accountant",
            "Marketing",
            "Book Keeper",
        ],
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
                "email",
                "personal_email",
                "contact_number",
                "gender",
                "department",
                "position",
                "schedule",
                "employment_status",
                "employee_type",
                "hire_date",
                "probation_end_date",
                "pay_frequency",
                "reporting_manager",
                "password",
                "confirm_password",
            ],
        },
    ];

    const requiredFields = [
        "rfid",
        "first_name",
        "last_name",
        "middle_name",
        "department",
        "email",
        "position",
        "schedule",
        "contact_number",
        "hire_date",
        "probation_end_date",
        "pay_frequency",
        "employment_status",
        "employee_type",
        "reporting_manager",
        "password",
        "confirm_password",
    ];

    const onSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            setErrors({ password: ["Passwords do not match"] });
            return;
        }
        try {
            const { data } = await axiosClient.post("/register", formData);
            setSuccessMessage("Employee registered successfully!");
            const successTimer = setTimeout(() => {
                setSuccessMessage("");
            }, 2000);

            setFormData({});
            setConfirmPassword("");
            setCurrentStep(0);
            return () => clearTimeout(successTimer);
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            setErrors(responseErrors);
            setTimeout(() => {
                setErrors(null);
            }, 2000);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "confirm_password") {
            setConfirmPassword(value);
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
        if (name === "department") {
            setPositions(departmentPositions[value] || []);
            setFormData((prevData) => ({
                ...prevData,
                position: "", // Reset position when department changes
            }));
        }
    };
    const validateStep = () => {
        const currentFields = formSections[currentStep].fields;
        const requiredCurrentFields = currentFields.filter((field) =>
            requiredFields.includes(field),
        );
        const isStepValid = requiredCurrentFields.every(
            (field) => formData[field] && formData[field].trim() !== "",
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
    const renderField = (label, value) => (
        <>
            <div className="flex h-full py-2 lg items-center font-semibold text-black text-start">
                <div className="w-full font-bold">{label}:</div>
                <div className="w-full">{value || "N/A"}</div>
            </div>
            <div className="w-full border-b-2 border-green-900"></div>
        </>
    );
    const renderFormField = (fieldName) => {
        const commonProps = {
            id: fieldName,
            name: fieldName,
            value:
                fieldName === "confirm_password"
                    ? confirmPassword
                    : formData[fieldName] || "",
            onChange: handleInputChange,
            className:
                "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
            required: requiredFields.includes(fieldName),
        };

        switch (fieldName) {
            case "rfid":
                return (
                    <select {...commonProps}>
                        <option value="">Select RFID</option>
                        <option value="A804A689">A804A689</option>
                        <option value="12D8051E">12D8051E</option>
                        <option value="EF4CAA1E">EF4CAA1E</option>
                        <option value="B47B96B0">B47B96B0</option>
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
            case "schedule":
                return (
                    <select {...commonProps}>
                        <option value="">Select Schedule</option>
                        <option value="7:00 - 16:00">7am - 4pm</option>
                        <option value="8:00 - 17:00">8am - 5pm</option>
                        <option value="12:00 - 21:00">12nn - 9pm</option>
                    </select>
                );
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
            case "confirm_password":
                return <input type="password" {...commonProps} />;
            case "hire_date":
            case "probation_end_date":
                return <input type="date" {...commonProps} />;
            case "email":
                return <input type="email" {...commonProps} />;
            case "personal_email":
                return <input type="email" {...commonProps} />;
            case "contact_number":
                return <input type="text" {...commonProps} />;
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
                <form onSubmit={onSubmit} className="flex flex-col w-full">
                    {formSections[currentStep].fields.map((fieldName) => (
                        <div
                            className="form-group flex items-center mb-4"
                            key={fieldName}
                        >
                            <label
                                htmlFor={fieldName}
                                className="block font-medium text-gray-700 w-1/3"
                            >
                                {fieldName
                                    .split("_")
                                    .map(
                                        (word) =>
                                            word.charAt(0).toUpperCase() +
                                            word.slice(1),
                                    )
                                    .join(" ")}
                                {requiredFields.includes(fieldName) && (
                                    <span className="text-red-500">*</span>
                                )}
                            </label>
                            <div className="w-2/3">
                                {renderFormField(fieldName)}
                            </div>
                        </div>
                    ))}
                    {passwordError && (
                        <div className="text-red-500 mb-4">{passwordError}</div>
                    )}
                    <div className="form-navigation flex justify-between mt-6">
                        {currentStep > 0 && (
                            <button
                                type="button"
                                onClick={goToPreviousStep}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                            >
                                Previous
                            </button>
                        )}
                        {currentStep < formSections.length - 1 ? (
                            <button
                                type="button"
                                onClick={goToNextStep}
                                className="px-4 py-2 bg-green-900 text-white rounded hover:opacity-85 "
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
