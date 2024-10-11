import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/profile.css";
import defaultAvatar from "../assets/default-avatar.png";
import axiosClient from "../axiosClient";
import { parseISO, differenceInYears, format } from "date-fns";
import { MdEdit } from "react-icons/md";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Icons for expand/collapse

function Profile() {
    const { user, setUser } = useStateContext();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [expandedSections, setExpandedSections] = useState({
        personalInfo: true,
        contactInfo: false,
        emergencyContacts: false,
        employmentDetails: false,
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await axiosClient.get("/user");
            setUser(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleFileChange = (e) => {
        setFormData({
            ...formData,
            profile: e.target.files[0],
        });
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpload = async () => {
        const data = new FormData();
        for (let key in formData) {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        }

        try {
            const response = await axiosClient.post("/profile-update", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setUser(response.data.user);
            setShowModal(false);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    function calculateAge(birthdate) {
        if (!birthdate) return "N/A";
        const birthDate = parseISO(birthdate);
        const today = new Date();
        return differenceInYears(today, birthDate);
    }

    const toggleSection = (section) => {
        setExpandedSections((prevState) => ({
            ...prevState,
            [section]: !prevState[section],
        }));
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

    return (
        <div className="bg-white px-14 py-10 rounded-lg mr-6 animated fadeInDown">
            <div className="flex items-center mb-8 text-black">
                <img
                    className="w-40 h-40 rounded-md  object-cover"
                    src={
                        user.profile
                            ? `http://127.0.0.1:8000/storage/images/${user.profile}`
                            : defaultAvatar
                    }
                    alt={user.name}
                />
                <div className="text-start flex justify-between w-full ml-4">
                    <div>
                        <h2 className="text-green-900 text-2xl font-semibold uppercase">
                            {user.name}
                        </h2>
                        <h4 className="text-base font-semibold">
                            {user.position}
                        </h4>
                    </div>
                    <div>
                        <button
                            className="px-4 py-2 bg-white text-black font-kodchasan"
                            onClick={() => setShowModal(true)}
                        >
                            <MdEdit size={20} color="red" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="profile-section text-black">
                <div
                    className="section-header flex items-center cursor-pointer"
                    onClick={() => toggleSection("personalInfo")}
                >
                    <h3 className="text-xl font-semibold">
                        Personal Information
                    </h3>
                    {expandedSections.personalInfo ? (
                        <AiOutlineUp className="ml-2" />
                    ) : (
                        <AiOutlineDown className="ml-2" />
                    )}
                </div>
                {expandedSections.personalInfo && (
                    <div className="profile-details text-base font-kodchasan">
                        {renderField("Email", user.email)}
                        {renderField("Age", calculateAge(user.date_of_birth))}
                        {renderField(
                            "Date of Birth",
                            user.date_of_birth
                                ? format(
                                      parseISO(user.date_of_birth),
                                      "MMMM d, yyyy"
                                  )
                                : "N/A"
                        )}
                        {renderField("Gender", user.gender)}
                        {renderField("Nationality", user.nationality)}
                        {renderField("Marital Status", user.marital_status)}
                    </div>
                )}
            </div>

            {/* Contact Information Section */}
            <div className="profile-section mt-4 text-black">
                <div
                    className="section-header flex items-center cursor-pointer"
                    onClick={() => toggleSection("contactInfo")}
                >
                    <h3 className="text-xl font-semibold">
                        Contact Information
                    </h3>
                    {expandedSections.contactInfo ? (
                        <AiOutlineUp className="ml-2" />
                    ) : (
                        <AiOutlineDown className="ml-2" />
                    )}
                </div>
                {expandedSections.contactInfo && (
                    <div className="profile-details text-base font-kodchasan">
                        {renderField("Contact", user.contact_number)}
                        {renderField("Address", user.address)}
                        {renderField("Personal Email", user.personal_email)}
                        {renderField("Work Email", user.work_email)}
                        {renderField("Home Phone", user.home_phone)}
                    </div>
                )}
            </div>

            {/* Emergency Contacts Section */}
            <div className="profile-section mt-4 text-black">
                <div
                    className="section-header flex items-center cursor-pointer"
                    onClick={() => toggleSection("emergencyContacts")}
                >
                    <h3 className="text-xl font-semibold">
                        Emergency Contacts
                    </h3>
                    {expandedSections.emergencyContacts ? (
                        <AiOutlineUp className="ml-2" />
                    ) : (
                        <AiOutlineDown className="ml-2" />
                    )}
                </div>
                {expandedSections.emergencyContacts && (
                    <div className="profile-details text-base font-kodchasan">
                        {renderField(
                            "Emergency Contact",
                            user.emergency_contact_name
                        )}
                        {renderField(
                            "Emergency Contact Relationship",
                            user.emergency_contact_relationship
                        )}
                        {renderField(
                            "Emergency Contact Phone",
                            user.emergency_contact_phone
                        )}
                    </div>
                )}
            </div>

            {/* Employment Details Section */}
            <div className="profile-section mt-4 text-black">
                <div
                    className="section-header flex items-center cursor-pointer"
                    onClick={() => toggleSection("employmentDetails")}
                >
                    <h3 className="text-xl font-semibold">
                        Employment Details
                    </h3>
                    {expandedSections.employmentDetails ? (
                        <AiOutlineUp className="ml-2" />
                    ) : (
                        <AiOutlineDown className="ml-2" />
                    )}
                </div>
                {expandedSections.employmentDetails && (
                    <div className="profile-details text-base font-kodchasan">
                        {renderField("Employee Type", user.employee_type)}
                        {renderField(
                            "Hire Date",
                            format(parseISO(user.hire_date), "MMMM d, yyyy")
                        )}
                        {renderField("Department", user.department)}
                        {renderField(
                            "Reporting Manager",
                            user.reporting_manager
                        )}
                        {renderField("Work Location", user.work_location)}
                        {renderField("Current Salary", user.current_salary)}
                        {renderField("Pay Frequency", user.pay_frequency)}
                    </div>
                )}
            </div>
            {showModal && (
                <div className="modal fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 pt-28">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl text-black">
                        <h2 className="text-2xl font-semibold mb-4">
                            Edit Profile
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {/* Contact Number */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="contact_number"
                                >
                                    Contact Number
                                </label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    value={formData.contact_number || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Address */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="address"
                                >
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Profile Picture */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="profile"
                                >
                                    Profile Picture
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full"
                                />
                            </div>

                            {/* Gender */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="gender"
                                >
                                    Gender
                                </label>
                                <input
                                    type="text"
                                    name="gender"
                                    value={formData.gender || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Marital Status */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="marital_status"
                                >
                                    Marital Status
                                </label>
                                <input
                                    type="text"
                                    name="marital_status"
                                    value={formData.marital_status || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Personal Email */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="personal_email"
                                >
                                    Personal Email
                                </label>
                                <input
                                    type="email"
                                    name="personal_email"
                                    value={formData.personal_email || ""}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Emergency Contact Name */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="emergency_contact_name"
                                >
                                    Emergency Contact Name
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_name"
                                    value={
                                        formData.emergency_contact_name || ""
                                    }
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Emergency Contact Relationship */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="emergency_contact_relationship"
                                >
                                    Emergency Contact Relationship
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_relationship"
                                    value={
                                        formData.emergency_contact_relationship ||
                                        ""
                                    }
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>

                            {/* Emergency Contact Phone */}
                            <div className="mb-4">
                                <label
                                    className="block text-sm font-semibold mb-2"
                                    htmlFor="emergency_contact_phone"
                                >
                                    Emergency Contact Phone
                                </label>
                                <input
                                    type="text"
                                    name="emergency_contact_phone"
                                    value={
                                        formData.emergency_contact_phone || ""
                                    }
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                            </div>
                        </div>

                        {/* Save and Cancel Buttons */}
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={handleUpload}
                                className="bg-green-900 hover:bg-white text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-red-500 hover:bg-white text-white py-2 px-4 rounded border-2 border-red-500 transition hover:text-red-500"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
