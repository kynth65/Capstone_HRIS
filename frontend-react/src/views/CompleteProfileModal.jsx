import React, { useState, useCallback, useEffect } from "react";
import axiosClient from "../axiosClient";
import "../styles/modal.css";

function CompleteProfileModal({ show, onClose, onComplete, tempUser }) {
    const [formData, setFormData] = useState(() => ({
        date_of_birth: tempUser?.date_of_birth || "",
        marital_status: tempUser?.marital_status || "",
        nationality: tempUser?.nationality || "",
        mothers_maiden_name: tempUser?.mothers_maiden_name || "",
        fathers_name: tempUser?.fathers_name || "",
        address: tempUser?.address || "",
        city: tempUser?.city || "",
        province: tempUser?.province || "",
        postal_code: tempUser?.postal_code || "",
        country: tempUser?.country || "",
        // personal_email: tempUser?.personal_email || "",
        //  work_email: tempUser?.work_email || "",
        home_phone: tempUser?.home_phone || "",
        emergency_contact_name: tempUser?.emergency_contact_name || "",
        emergency_contact_relationship:
            tempUser?.emergency_contact_relationship || "",
        emergency_contact_phone: tempUser?.emergency_contact_phone || "",
        work_location: tempUser?.work_location || "",
        highest_degree_earned: tempUser?.highest_degree_earned || "",
        field_of_study: tempUser?.field_of_study || "",
        institution_name: tempUser?.institution_name || "",
        graduation_year: tempUser?.graduation_year || "",
        work_history: tempUser?.work_history || "",
        health_insurance_plan: tempUser?.health_insurance_plan || "",
        suffix: tempUser?.suffix || "",
        completed_training_programs:
            tempUser?.completed_training_programs || "",
        //  profile: "", // Profile is handled separately since it's a file
        notes: tempUser?.notes || "",
    }));

    useEffect(() => {
        if (tempUser) {
            setFormData((prevData) => ({
                ...prevData,
                date_of_birth: tempUser.date_of_birth || prevData.date_of_birth,
                marital_status:
                    tempUser.marital_status || prevData.marital_status,
                nationality: tempUser.nationality || prevData.nationality,
                mothers_maiden_name:
                    tempUser.mothers_maiden_name ||
                    prevData.mothers_maiden_name,
                fathers_name: tempUser.fathers_name || prevData.fathers_name,
                address: tempUser.address || prevData.address,
                city: tempUser.city || prevData.city,
                province: tempUser.province || prevData.province,
                postal_code: tempUser.postal_code || prevData.postal_code,
                country: tempUser.country || prevData.country,
                // personal_email:
                //     tempUser.personal_email || prevData.personal_email,
                //  work_email: tempUser.work_email || prevData.work_email,
                home_phone: tempUser.home_phone || prevData.home_phone,
                emergency_contact_name:
                    tempUser.emergency_contact_name ||
                    prevData.emergency_contact_name,
                emergency_contact_relationship:
                    tempUser.emergency_contact_relationship ||
                    prevData.emergency_contact_relationship,
                emergency_contact_phone:
                    tempUser.emergency_contact_phone ||
                    prevData.emergency_contact_phone,
                work_location: tempUser.work_location || prevData.work_location,
                highest_degree_earned:
                    tempUser.highest_degree_earned ||
                    prevData.highest_degree_earned,
                field_of_study:
                    tempUser.field_of_study || prevData.field_of_study,
                institution_name:
                    tempUser.institution_name || prevData.institution_name,
                graduation_year:
                    tempUser.graduation_year || prevData.graduation_year,
                work_history: tempUser.work_history || prevData.work_history,
                health_insurance_plan:
                    tempUser.health_insurance_plan ||
                    prevData.health_insurance_plan,
                suffix: tempUser.suffix || prevData.suffix,
                completed_training_programs:
                    tempUser.completed_training_programs ||
                    prevData.completed_training_programs,
                notes: tempUser.notes || prevData.notes,
            }));
        }
    }, [tempUser]);

    const [errors, setErrors] = useState(null);

    const handleChange = useCallback((e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: files[0], // Store the actual file object
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                [name]: value,
            }));
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Create FormData object for file upload
        const formDataToSend = new FormData();

        // Append all form fields
        Object.keys(formData).forEach((key) => {
            if (key === "profile" && formData[key] instanceof File) {
                formDataToSend.append(key, formData[key]);
            } else {
                formDataToSend.append(key, formData[key]);
            }
        });

        // Append user_id
        formDataToSend.append("user_id", tempUser?.user_id);

        axiosClient
            .post("/complete-info", formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(({ data }) => {
                localStorage.setItem("access_token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                onComplete(data.token, data.user);
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

                        {/* <div className="mb-4">
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
                        </div> */}

                        {/* <div className="mb-4">
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
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-black"
                            />
                        </div> */}

                        {/* <div className="mb-4">
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
                        </div> */}

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

                        {/* <div className="mb-4">
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
                        </div> */}

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
