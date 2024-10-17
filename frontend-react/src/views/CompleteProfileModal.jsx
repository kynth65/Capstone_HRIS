// CompleteProfileModal.jsx
import React, { useState } from "react";
import axiosClient from "../axiosClient";
import "../styles/modal.css"; // Make sure you create this CSS file for styling the modal

function CompleteProfileModal({ show, onClose, onComplete, tempUser }) {
    const [formData, setFormData] = useState({
        date_of_birth: "",
        gender: "",
        marital_status: "",
        nationality: "",
        mothers_maiden_name: "",
        fathers_name: "",
        address: "",
        city: "",
        province: "",
        postal_code: "",
        country: "",
        personal_email: "",
        work_email: "",
        home_phone: "",
        contact_number: "",
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        hire_date: "",
        department: "",
        reporting_manager: "",
        work_location: "",
        probation_end_date: "",
        pay_frequency: "",
        highest_degree_earned: "",
        field_of_study: "",
        institution_name: "",
        graduation_year: "",
        work_history: "",
        health_insurance_plan: "",
        suffix: "",
        completed_training_programs: "",
        work_permit_expiry_date: "",
        profile: "",
        notes: "",
    });
    const [errors, setErrors] = useState(null);

    if (!show) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Ensure user_id is passed in the payload
        const payload = {
            ...formData,
            user_id: tempUser?.user_id, // Use user_id instead of id
        };

        axiosClient
            .post("/user-information", payload)
            .then(() => {
                onComplete();
            })
            .catch((error) => {
                setErrors(
                    error.response?.data?.errors || {
                        general: ["An unexpected error occurred"],
                    },
                );
            });
    };

    const InputField = ({ label, name, type = "text", ...props }) => (
        <div className="mb-4">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                {...props}
            />
        </div>
    );

    const TextAreaField = ({ label, name, ...props }) => (
        <div className="mb-4">
            <label
                htmlFor={name}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>
            <textarea
                id={name}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                {...props}
            ></textarea>
        </div>
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content bg-white p-5 max-h-[80vh] overflow-y-auto rounded-lg w-full max-w-4xl">
                <form onSubmit={handleSubmit} className="w-full">
                    {errors && (
                        <div className="alert mb-4">
                            {Object.keys(errors).map((key) => (
                                <p key={key} className="text-red-500">
                                    {errors[key][0]}
                                </p>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <InputField
                            label="Date of Birth"
                            name="date_of_birth"
                            type="date"
                        />
                        <InputField label="Gender" name="gender" />
                        <InputField
                            label="Marital Status"
                            name="marital_status"
                        />
                        <InputField label="Nationality" name="nationality" />
                        <InputField
                            label="Mother's Maiden Name"
                            name="mothers_maiden_name"
                        />
                        <InputField label="Father's Name" name="fathers_name" />
                        <InputField label="Address" name="address" />
                        <InputField label="City" name="city" />
                        <InputField label="Province" name="province" />
                        <InputField label="Postal Code" name="postal_code" />
                        <InputField label="Country" name="country" />
                        <InputField
                            label="Personal Email"
                            name="personal_email"
                            type="email"
                        />
                        <InputField
                            label="Work Email"
                            name="work_email"
                            type="email"
                        />
                        <InputField label="Home Phone" name="home_phone" />
                        <InputField
                            label="Contact Number"
                            name="contact_number"
                        />
                        <InputField
                            label="Emergency Contact Name"
                            name="emergency_contact_name"
                        />
                        <InputField
                            label="Emergency Contact Relationship"
                            name="emergency_contact_relationship"
                        />
                        <InputField
                            label="Emergency Contact Phone"
                            name="emergency_contact_phone"
                        />
                        <InputField
                            label="Hire Date"
                            name="hire_date"
                            type="date"
                        />
                        <InputField label="Department" name="department" />
                        <InputField
                            label="Reporting Manager"
                            name="reporting_manager"
                        />
                        <InputField
                            label="Work Location"
                            name="work_location"
                        />
                        <InputField
                            label="Probation End Date"
                            name="probation_end_date"
                            type="date"
                        />
                        <InputField
                            label="Pay Frequency"
                            name="pay_frequency"
                        />
                        <InputField
                            label="Highest Degree Earned"
                            name="highest_degree_earned"
                        />
                        <InputField
                            label="Field of Study"
                            name="field_of_study"
                        />
                        <InputField
                            label="Institution Name"
                            name="institution_name"
                        />
                        <InputField
                            label="Graduation Year"
                            name="graduation_year"
                            type="number"
                        />
                        <InputField
                            label="Health Insurance Plan"
                            name="health_insurance_plan"
                        />
                        <InputField label="Suffix" name="suffix" />
                        <InputField
                            label="Work Permit Expiry Date"
                            name="work_permit_expiry_date"
                            type="date"
                        />
                        <InputField label="Profile" name="profile" />
                        <TextAreaField
                            label="Work History"
                            name="work_history"
                        />
                        <TextAreaField
                            label="Completed Training Programs"
                            name="completed_training_programs"
                        />
                        <TextAreaField label="Notes" name="notes" />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CompleteProfileModal;
