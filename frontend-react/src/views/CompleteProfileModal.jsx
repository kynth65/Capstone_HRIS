import React, { useState, useCallback } from "react";
import axiosClient from "../axiosClient";
import "../styles/modal.css";

function CompleteProfileModal({ show, onClose, onComplete, tempUser }) {
    const [formData, setFormData] = useState({
        date_of_birth: "",
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
        emergency_contact_name: "",
        emergency_contact_relationship: "",
        emergency_contact_phone: "",
        work_location: "",
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

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Temp User:", tempUser); // Add a console log to check if tempUser is passed correctly

        const payload = {
            ...formData,
            user_id: tempUser?.user_id, // Pass user_id from tempUser
        };

        axiosClient
            .post("/complete-info", payload)
            .then(() => {
                onComplete();
            })
            .catch((error) => {
                setErrors(
                    error.response?.data?.errors || {
                        general: ["An unexpected error occurred"],
                    },
                );
                setTimeout(() => {
                    setErrors(null);
                }, 2000);
            });
    };

    // Don't render the modal if `show` is false
    if (!show) return null;

    // Memoized InputField component
    const InputField = ({ label, name, type = "text", value, onChange }) => (
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
                value={value}
                onChange={onChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
            />
        </div>
    );

    const TextAreaField = ({ label, name, value, onChange }) => (
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
                value={value}
                onChange={onChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                rows="4"
            ></textarea>
        </div>
    );

    return (
        <div className="modal-overlay">
            <div
                className="modal-content bg-white p-5 max-h-[80vh] overflow-y-auto rounded-lg w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing on content click
            >
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
                    <h2 className="text-black text-2xl font-semibold uppercase pb-5">
                        Complete the information before login
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="mb-4">
                            <label
                                htmlFor="date_of_birth"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                id="date_of_birth"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="suffix"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Suffix
                            </label>
                            <select
                                id="suffix"
                                name="suffix"
                                value={formData.suffix}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            >
                                <option value="">Select Suffix</option>
                                <option value="N/A">N/A</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                                <option value="V">V</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="nationality"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Nationality
                            </label>
                            <input
                                type="text"
                                id="nationality"
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="mothers_maiden_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Mother's Maiden Name
                            </label>
                            <input
                                type="text"
                                id="mothers_maiden_name"
                                name="mothers_maiden_name"
                                value={formData.mothers_maiden_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="fathers_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Father's Name
                            </label>
                            <input
                                type="text"
                                id="fathers_name"
                                name="fathers_name"
                                value={formData.fathers_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="address"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Address
                            </label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="city"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                City
                            </label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="province"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Province
                            </label>
                            <input
                                type="text"
                                id="province"
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="postal_code"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Postal Code
                            </label>
                            <input
                                type="text"
                                id="postal_code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="country"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Country
                            </label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="personal_email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Personal Email
                            </label>
                            <input
                                type="email"
                                id="personal_email"
                                name="personal_email"
                                value={formData.personal_email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="work_email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Work Email
                            </label>
                            <input
                                type="email"
                                id="work_email"
                                name="work_email"
                                value={formData.work_email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="home_phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Home Phone
                            </label>
                            <input
                                type="text"
                                id="home_phone"
                                name="home_phone"
                                value={formData.home_phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="marital_status"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Marital Status
                            </label>
                            <select
                                id="marital_status"
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            >
                                <option value="">Select Marital Status</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="separated">Separated</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="emergency_contact_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Emergency Contact Name
                            </label>
                            <input
                                type="text"
                                id="emergency_contact_name"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="emergency_contact_relationship"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Emergency Contact Relationship
                            </label>
                            <select
                                id="emergency_contact_relationship"
                                name="emergency_contact_relationship"
                                value={formData.emergency_contact_relationship}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            >
                                <option value="">Select Relationship</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Friend">Friend</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="emergency_contact_phone"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Emergency Contact Phone
                            </label>
                            <input
                                type="text"
                                id="emergency_contact_phone"
                                name="emergency_contact_phone"
                                value={formData.emergency_contact_phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="work_location"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Work Location
                            </label>
                            <input
                                type="text"
                                id="work_location"
                                name="work_location"
                                value={formData.work_location}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="highest_degree_earned"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Highest Degree Earned
                            </label>
                            <input
                                type="text"
                                id="highest_degree_earned"
                                name="highest_degree_earned"
                                value={formData.highest_degree_earned}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="field_of_study"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Field of Study
                            </label>
                            <input
                                type="text"
                                id="field_of_study"
                                name="field_of_study"
                                value={formData.field_of_study}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="institution_name"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Institution Name
                            </label>
                            <input
                                type="text"
                                id="institution_name"
                                name="institution_name"
                                value={formData.institution_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="graduation_year"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Graduation Year
                            </label>
                            <input
                                type="number"
                                id="graduation_year"
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="health_insurance_plan"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Health Insurance Plan
                            </label>
                            <input
                                type="text"
                                id="health_insurance_plan"
                                name="health_insurance_plan"
                                value={formData.health_insurance_plan}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="work_permit_expiry_date"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Work Permit Expiry Date
                            </label>
                            <input
                                type="date"
                                id="work_permit_expiry_date"
                                name="work_permit_expiry_date"
                                value={formData.work_permit_expiry_date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="profile"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Profile Picture
                            </label>
                            <input
                                type="file"
                                id="profile"
                                name="profile"
                                accept="image/*"
                                value={formData.profile}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="work_history"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Work History
                            </label>
                            <textarea
                                id="work_history"
                                name="work_history"
                                value={formData.work_history}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="completed_training_programs"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Completed Training Programs
                            </label>
                            <textarea
                                id="completed_training_programs"
                                name="completed_training_programs"
                                value={formData.completed_training_programs}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="notes"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div>
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
