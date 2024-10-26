import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import { parseISO, differenceInYears, format } from "date-fns";

function User() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [editData, setEditData] = useState({});
    const [errors, setErrors] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const departmentPositions = {
        Admin: ["Admin", "Purchasing"],
        HR: [
            "Human Resource Manager",
            "HR Manager",
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

    // Fetch all employees on component mount
    useEffect(() => {
        axiosClient
            .get("/employees") // This calls the API you provided
            .then((response) => {
                setEmployees(response.data);
            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
            });
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Set the selected employee to view the details in a modal
    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setViewModalVisible(true);
    };

    const handleEdit = () => {
        setEditData(selectedEmployee);
        setViewModalVisible(false);
        setEditModalVisible(true);
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
        setViewModalVisible(false);
        setEditModalVisible(false);
        setErrors(null);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        if (name === "department") {
            setPositions(departmentPositions[value] || []);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.put(
                `/employees/${selectedEmployee.user_id}/update-personal-info`,
                editData,
            );

            setSelectedEmployee(response.data.user);
            setSuccessMessage("Employee details updated successfully!");
            setEditModalVisible(false);
            setViewModalVisible(true);

            // Fetch updated employee list
            await fetchEmployees();

            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            console.error("Error updating employee details:", error);
            setErrors(
                error.response?.data?.errors || { general: ["Update failed"] },
            );
        }
    };

    // Calculate employee's age from birthdate, check for null or invalid dates
    function calculateAge(birthdate) {
        if (!birthdate) return "N/A";
        try {
            const birthDate = parseISO(birthdate);
            const today = new Date();
            return differenceInYears(today, birthDate);
        } catch (error) {
            return "N/A"; // Return "N/A" if parsing fails
        }
    }

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
        <div>
            <div className="employee-list-container">
                <div className="employee-list">
                    <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-full md:w-3/4 xl:w-11/12">
                        <thead>
                            <tr className="font-bold text-base">
                                <th className="hidden md:table-cell">ID</th>
                                <th>Name</th>
                                <th className="hidden lg:table-cell">Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <tr key={employee.id} className="font-bold">
                                        <td className="hidden md:table-cell">
                                            {employee.user_id}
                                        </td>
                                        <td>{employee.name}</td>
                                        <td className="hidden lg:table-cell">
                                            {employee.email}
                                        </td>
                                        <td>
                                            <button
                                                className="bg-green-900 hover:bg-white font-normal text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                                                onClick={() =>
                                                    handleView(employee)
                                                }
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">No employees found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal to view employee details */}
            {selectedEmployee && (
                <div className="modal modal-overlay overflow-y-auto">
                    <div className=" p-6 bg-white rounded-lg shadow-lg w-full max-w-6xl">
                        <button
                            className="float-right right-8 px-3 py-1 text-xl text-white rounded-full bg-red-700 hover:text-red-600 hover:bg-white hover:border-red-600 hover:border transition"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>
                        <button
                            className="float-right mr-4 bg-blue-700 px-4 py-2 rounded-md text-white font-normal border-2 border-blue-700 hover:bg-white hover:text-blue-700 transition"
                            onClick={handleEdit}
                        >
                            Edit
                        </button>

                        {/* Employee Header */}
                        <div className="profile-header mb-6 ">
                            <div className="flex items-center">
                                <img
                                    className="w-24 h-24 rounded-full object-cover"
                                    src={
                                        selectedEmployee.profile
                                            ? `http://127.0.0.1:8000/storage/images/${selectedEmployee.profile}`
                                            : defaultAvatar
                                    }
                                    alt={selectedEmployee.name}
                                />
                                <div className="profile-info ml-4">
                                    <h2 className="profile-name text-2xl font-bold">
                                        {selectedEmployee.name}
                                    </h2>
                                    <h4 className="profile-position text-lg">
                                        {selectedEmployee.position}
                                    </h4>
                                </div>
                            </div>
                        </div>

                        {/* Four Categories in Two Columns */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[500px] overflow-auto ">
                            {/* Personal Information */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Personal Information
                                </h3>
                                <div className="profile-details text-base font-kodchasan">
                                    {renderField(
                                        "Email",
                                        selectedEmployee.email,
                                    )}
                                    {renderField(
                                        "Sick Leave Balance",
                                        selectedEmployee.sick_leave_balance,
                                    )}
                                    {renderField(
                                        "Age",
                                        calculateAge(
                                            selectedEmployee.date_of_birth,
                                        ),
                                    )}
                                    {renderField(
                                        "Date of Birth",
                                        selectedEmployee.date_of_birth
                                            ? format(
                                                  parseISO(
                                                      selectedEmployee.date_of_birth,
                                                  ),
                                                  "MMMM d, yyyy",
                                              )
                                            : "N/A",
                                    )}
                                    {renderField(
                                        "Gender",
                                        selectedEmployee.gender,
                                    )}
                                    {renderField(
                                        "Nationality",
                                        selectedEmployee.nationality,
                                    )}
                                    {renderField(
                                        "Marital Status",
                                        selectedEmployee.marital_status,
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Contact Information
                                </h3>
                                <div className="profile-details text-base font-kodchasan">
                                    {renderField(
                                        "Contact",
                                        selectedEmployee.contact_number,
                                    )}
                                    {renderField(
                                        "Address",
                                        selectedEmployee.address,
                                    )}

                                    {renderField(
                                        "Personal Email",
                                        selectedEmployee.personal_email,
                                    )}
                                    {renderField(
                                        "Work Email",
                                        selectedEmployee.work_email,
                                    )}
                                    {renderField(
                                        "Home Phone",
                                        selectedEmployee.home_phone,
                                    )}
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Emergency Contacts
                                </h3>
                                <div className="profile-details text-base font-kodchasan">
                                    {renderField(
                                        "Emergency Contact",
                                        selectedEmployee.emergency_contact_name,
                                    )}
                                    {renderField(
                                        "Emergency Contact Relationship",
                                        selectedEmployee.emergency_contact_relationship,
                                    )}
                                    {renderField(
                                        "Emergency Contact Phone",
                                        selectedEmployee.emergency_contact_phone,
                                    )}
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Employment Details
                                </h3>
                                <div className="profile-details text-base font-kodchasan">
                                    {renderField(
                                        "Rfid card",
                                        selectedEmployee.rfid,
                                    )}
                                    {renderField(
                                        "Employee Type",
                                        selectedEmployee.employee_type,
                                    )}
                                    {renderField(
                                        "Hire Date",
                                        selectedEmployee.hire_date
                                            ? format(
                                                  parseISO(
                                                      selectedEmployee.hire_date,
                                                  ),
                                                  "MMMM d, yyyy",
                                              )
                                            : "N/A",
                                    )}
                                    {renderField(
                                        "Schedule",
                                        selectedEmployee.schedule,
                                    )}
                                    {renderField(
                                        "Department",
                                        selectedEmployee.department,
                                    )}
                                    {renderField(
                                        "Reporting Manager",
                                        selectedEmployee.reporting_manager,
                                    )}
                                    {renderField(
                                        "Work Location",
                                        selectedEmployee.work_location,
                                    )}
                                    {renderField(
                                        "Current Salary",
                                        selectedEmployee.current_salary,
                                    )}
                                    {renderField(
                                        "Pay Frequency",
                                        selectedEmployee.pay_frequency,
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalVisible && (
                <div className="modal modal-overlay overflow-y-auto">
                    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[600px] overflow-auto">
                        <button
                            className="float-right right-8 px-3 py-1 text-xl text-white rounded-full bg-red-700 hover:text-red-600 hover:bg-white hover:border-red-600 hover:border transition"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6">
                            Edit Employee Details
                        </h2>
                        <form className="flex flex-col w-full space-y-4">
                            {/* Personal Information Section */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="date_of_birth"
                                            className="font-semibold mb-1"
                                        >
                                            Date of Birth:
                                        </label>
                                        <input
                                            type="date"
                                            id="date_of_birth"
                                            name="date_of_birth"
                                            value={editData.date_of_birth || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="gender"
                                            className="font-semibold mb-1"
                                        >
                                            Gender:
                                        </label>
                                        <select
                                            id="gender"
                                            name="gender"
                                            value={editData.gender || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Gender
                                            </option>
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="nationality"
                                            className="font-semibold mb-1"
                                        >
                                            Nationality:
                                        </label>
                                        <input
                                            type="text"
                                            id="nationality"
                                            name="nationality"
                                            value={editData.nationality || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="marital_status"
                                            className="font-semibold mb-1"
                                        >
                                            Marital Status:
                                        </label>
                                        <select
                                            id="marital_status"
                                            name="marital_status"
                                            value={
                                                editData.marital_status || ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Marital Status
                                            </option>
                                            <option value="Single">
                                                Single
                                            </option>
                                            <option value="Married">
                                                Married
                                            </option>
                                            <option value="Divorced">
                                                Divorced
                                            </option>
                                            <option value="Widowed">
                                                Widowed
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="sick_leave_balance"
                                            className="font-semibold mb-1"
                                        >
                                            Sick Leave Balance:
                                        </label>
                                        <input
                                            type="number"
                                            id="sick_leave_balance"
                                            name="sick_leave_balance"
                                            value={
                                                editData.sick_leave_balance ||
                                                ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Contact Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="contact_number"
                                            className="font-semibold mb-1"
                                        >
                                            Contact Number:
                                        </label>
                                        <input
                                            type="text"
                                            id="contact_number"
                                            name="contact_number"
                                            value={
                                                editData.contact_number || ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="address"
                                            className="font-semibold mb-1"
                                        >
                                            Address:
                                        </label>
                                        <input
                                            type="text"
                                            id="address"
                                            name="address"
                                            value={editData.address || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="personal_email"
                                            className="font-semibold mb-1"
                                        >
                                            Personal Email:
                                        </label>
                                        <input
                                            type="email"
                                            id="personal_email"
                                            name="personal_email"
                                            value={
                                                editData.personal_email || ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="work_email"
                                            className="font-semibold mb-1"
                                        >
                                            Work Email:
                                        </label>
                                        <input
                                            type="email"
                                            id="work_email"
                                            name="work_email"
                                            value={editData.work_email || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="home_phone"
                                            className="font-semibold mb-1"
                                        >
                                            Home Phone:
                                        </label>
                                        <input
                                            type="text"
                                            id="home_phone"
                                            name="home_phone"
                                            value={editData.home_phone || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contact Section */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="emergency_contact_name"
                                            className="font-semibold mb-1"
                                        >
                                            Emergency Contact Name:
                                        </label>
                                        <input
                                            type="text"
                                            id="emergency_contact_name"
                                            name="emergency_contact_name"
                                            value={
                                                editData.emergency_contact_name ||
                                                ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="emergency_contact_relationship"
                                            className="font-semibold mb-1"
                                        >
                                            Emergency Contact Relationship:
                                        </label>
                                        <input
                                            type="text"
                                            id="emergency_contact_relationship"
                                            name="emergency_contact_relationship"
                                            value={
                                                editData.emergency_contact_relationship ||
                                                ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="emergency_contact_phone"
                                            className="font-semibold mb-1"
                                        >
                                            Emergency Contact Phone:
                                        </label>
                                        <input
                                            type="text"
                                            id="emergency_contact_phone"
                                            name="emergency_contact_phone"
                                            value={
                                                editData.emergency_contact_phone ||
                                                ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Employment Details Section */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Employment Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="employee_type"
                                            className="font-semibold mb-1"
                                        >
                                            Employee Type:
                                        </label>
                                        <select
                                            id="employee_type"
                                            name="employee_type"
                                            value={editData.employee_type || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Employee Type
                                            </option>
                                            <option value="Regular">
                                                Regular
                                            </option>
                                            <option value="Temporary">
                                                Temporary
                                            </option>
                                            <option value="Intern">
                                                Intern
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="hire_date"
                                            className="font-semibold mb-1"
                                        >
                                            Hire Date:
                                        </label>
                                        <input
                                            type="date"
                                            id="hire_date"
                                            name="hire_date"
                                            value={editData.hire_date || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="department"
                                            className="font-semibold mb-1"
                                        >
                                            Department:
                                        </label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={editData.department || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Department
                                            </option>
                                            {Object.keys(
                                                departmentPositions,
                                            ).map((dept) => (
                                                <option key={dept} value={dept}>
                                                    {dept}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="reporting_manager"
                                            className="font-semibold mb-1"
                                        >
                                            Reporting Manager:
                                        </label>
                                        <input
                                            type="text"
                                            id="reporting_manager"
                                            name="reporting_manager"
                                            value={
                                                editData.reporting_manager || ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="work_location"
                                            className="font-semibold mb-1"
                                        >
                                            Work Location:
                                        </label>
                                        <input
                                            type="text"
                                            id="work_location"
                                            name="work_location"
                                            value={editData.work_location || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="current_salary"
                                            className="font-semibold mb-1"
                                        >
                                            Current Salary:
                                        </label>
                                        <input
                                            type="number"
                                            id="current_salary"
                                            name="current_salary"
                                            value={
                                                editData.current_salary || ""
                                            }
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="pay_frequency"
                                            className="font-semibold mb-1"
                                        >
                                            Pay Frequency:
                                        </label>
                                        <select
                                            id="pay_frequency"
                                            name="pay_frequency"
                                            value={editData.pay_frequency || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Pay Frequency
                                            </option>
                                            <option value="Weekly">
                                                Weekly
                                            </option>
                                            <option value="Bi-weekly">
                                                Bi-weekly
                                            </option>
                                            <option value="Monthly">
                                                Monthly
                                            </option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="schedule"
                                            className="font-semibold mb-1"
                                        >
                                            Schedule:
                                        </label>
                                        <select
                                            id="schedule"
                                            name="schedule"
                                            value={editData.schedule || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">
                                                Select Schedule
                                            </option>
                                            <option value="7:00 - 16:00">
                                                7am - 4pm
                                            </option>
                                            <option value="8:00 - 17:00">
                                                8am - 5pm
                                            </option>
                                            <option value="12:00 - 21:00">
                                                12nn - 9pm
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Error and Success Messages */}
                            {errors && (
                                <div className="text-red-500 text-sm mt-2">
                                    {Object.values(errors).map(
                                        (error, index) => (
                                            <p key={index}>{error}</p>
                                        ),
                                    )}
                                </div>
                            )}

                            {successMessage && (
                                <div className="text-green-500 text-sm mt-2">
                                    {successMessage}
                                </div>
                            )}

                            {/* Save and Cancel Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    className="bg-green-500 px-4 py-2 rounded-md text-white font-normal border-2 border-green-500 hover:bg-white hover:text-green-500 transition"
                                    onClick={handleUpdate}
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 px-4 py-2 rounded-md text-white font-normal border-2 border-gray-500 hover:bg-white hover:text-gray-500 transition"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Success Message Overlay */}
            {successMessage && (
                <div className="successMessageDiv">
                    <p>{successMessage}</p>
                </div>
            )}
        </div>
    );
}

export default User;
