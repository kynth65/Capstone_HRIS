import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import { parseISO, differenceInYears, format } from "date-fns";
import { X } from "lucide-react";
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

            {/* View Modal */}
            {selectedEmployee && (
                <div className="modal modal-overlay overflow-y-auto p-4 md:p-6">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <img
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                                    src={
                                        selectedEmployee.profile
                                            ? `http://127.0.0.1:8000/storage/images/${selectedEmployee.profile}`
                                            : defaultAvatar
                                    }
                                    alt={selectedEmployee.name}
                                />
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
                                        {selectedEmployee.name}
                                    </h2>
                                    <p className="text-neutral-600">
                                        {selectedEmployee.position}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                <button
                                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    onClick={handleEdit}
                                >
                                    Edit
                                </button>
                                <button
                                    className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
                                    onClick={handleCloseModal}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-4 md:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Personal Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    label: "Email",
                                                    value: selectedEmployee.email,
                                                },
                                                {
                                                    label: "Age",
                                                    value: calculateAge(
                                                        selectedEmployee.date_of_birth,
                                                    ),
                                                },
                                                {
                                                    label: "Date of Birth",
                                                    value: selectedEmployee.date_of_birth
                                                        ? format(
                                                              parseISO(
                                                                  selectedEmployee.date_of_birth,
                                                              ),
                                                              "MMMM d, yyyy",
                                                          )
                                                        : "N/A",
                                                },
                                                {
                                                    label: "Gender",
                                                    value: selectedEmployee.gender,
                                                },
                                                {
                                                    label: "Nationality",
                                                    value: selectedEmployee.nationality,
                                                },
                                                {
                                                    label: "Marital Status",
                                                    value: selectedEmployee.marital_status,
                                                },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    className="text-sm"
                                                >
                                                    <span className="block text-neutral-500">
                                                        {label}
                                                    </span>
                                                    <span className="font-medium text-neutral-900">
                                                        {value || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    label: "Contact",
                                                    value: selectedEmployee.contact_number,
                                                },
                                                {
                                                    label: "Address",
                                                    value: selectedEmployee.address,
                                                },
                                                {
                                                    label: "Personal Email",
                                                    value: selectedEmployee.personal_email,
                                                },
                                                {
                                                    label: "Work Email",
                                                    value: selectedEmployee.work_email,
                                                },
                                                {
                                                    label: "Home Phone",
                                                    value: selectedEmployee.home_phone,
                                                },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    className="text-sm"
                                                >
                                                    <span className="block text-neutral-500">
                                                        {label}
                                                    </span>
                                                    <span className="font-medium text-neutral-900">
                                                        {value || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Emergency Contacts
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    label: "Name",
                                                    value: selectedEmployee.emergency_contact_name,
                                                },
                                                {
                                                    label: "Relationship",
                                                    value: selectedEmployee.emergency_contact_relationship,
                                                },
                                                {
                                                    label: "Phone",
                                                    value: selectedEmployee.emergency_contact_phone,
                                                },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    className="text-sm"
                                                >
                                                    <span className="block text-neutral-500">
                                                        {label}
                                                    </span>
                                                    <span className="font-medium text-neutral-900">
                                                        {value || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Employment Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                {
                                                    label: "RFID Card",
                                                    value: selectedEmployee.rfid,
                                                },
                                                {
                                                    label: "Employee Type",
                                                    value: selectedEmployee.employee_type,
                                                },
                                                {
                                                    label: "Hire Date",
                                                    value: selectedEmployee.hire_date
                                                        ? format(
                                                              parseISO(
                                                                  selectedEmployee.hire_date,
                                                              ),
                                                              "MMMM d, yyyy",
                                                          )
                                                        : "N/A",
                                                },
                                                {
                                                    label: "Schedule",
                                                    value: selectedEmployee.schedule,
                                                },
                                                {
                                                    label: "Department",
                                                    value: selectedEmployee.department,
                                                },
                                                {
                                                    label: "Reporting Manager",
                                                    value: selectedEmployee.reporting_manager,
                                                },
                                                {
                                                    label: "Work Location",
                                                    value: selectedEmployee.work_location,
                                                },
                                                {
                                                    label: "Current Salary",
                                                    value: selectedEmployee.current_salary,
                                                },
                                                {
                                                    label: "Pay Frequency",
                                                    value: selectedEmployee.pay_frequency,
                                                },
                                            ].map(({ label, value }) => (
                                                <div
                                                    key={label}
                                                    className="text-sm"
                                                >
                                                    <span className="block text-neutral-500">
                                                        {label}
                                                    </span>
                                                    <span className="font-medium text-neutral-900">
                                                        {value || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalVisible && (
                <div className="modal modal-overlay overflow-y-auto p-4 text-black">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-900">
                                Edit Employee Details
                            </h2>
                            <button
                                className="p-2 text-neutral-600 hover:text-red-600 transition-colors"
                                onClick={handleCloseModal}
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(100vh-150px)]">
                            <form className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            {
                                                label: "Email",
                                                name: "email",
                                                type: "email",
                                            },
                                            {
                                                label: "Date of Birth",
                                                name: "date_of_birth",
                                                type: "date",
                                            },
                                            {
                                                label: "Gender",
                                                name: "gender",
                                                type: "select",
                                                options: [
                                                    "Male",
                                                    "Female",
                                                    "Other",
                                                ],
                                            },
                                            {
                                                label: "Nationality",
                                                name: "nationality",
                                                type: "text",
                                            },
                                            {
                                                label: "Marital Status",
                                                name: "marital_status",
                                                type: "select",
                                                options: [
                                                    "Single",
                                                    "Married",
                                                    "Divorced",
                                                    "Widowed",
                                                ],
                                            },
                                        ].map((field) => (
                                            <div
                                                key={field.name}
                                                className="space-y-1"
                                            >
                                                <label
                                                    htmlFor={field.name}
                                                    className="block text-sm font-medium text-neutral-700"
                                                >
                                                    {field.label}
                                                </label>
                                                {field.type === "select" ? (
                                                    <select
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            editData[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleEditInputChange
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">
                                                            Select {field.label}
                                                        </option>
                                                        {field.options.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            editData[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleEditInputChange
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            {
                                                label: "Contact Number",
                                                name: "contact_number",
                                                type: "tel",
                                            },
                                            {
                                                label: "Address",
                                                name: "address",
                                                type: "text",
                                            },
                                            {
                                                label: "Personal Email",
                                                name: "personal_email",
                                                type: "email",
                                            },
                                            {
                                                label: "Work Email",
                                                name: "work_email",
                                                type: "email",
                                            },
                                            {
                                                label: "Home Phone",
                                                name: "home_phone",
                                                type: "tel",
                                            },
                                        ].map((field) => (
                                            <div
                                                key={field.name}
                                                className="space-y-1"
                                            >
                                                <label
                                                    htmlFor={field.name}
                                                    className="block text-sm font-medium text-neutral-700"
                                                >
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    id={field.name}
                                                    name={field.name}
                                                    value={
                                                        editData[field.name] ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditInputChange
                                                    }
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            {
                                                label: "Name",
                                                name: "emergency_contact_name",
                                                type: "text",
                                            },
                                            {
                                                label: "Relationship",
                                                name: "emergency_contact_relationship",
                                                type: "text",
                                            },
                                            {
                                                label: "Phone",
                                                name: "emergency_contact_phone",
                                                type: "tel",
                                            },
                                        ].map((field) => (
                                            <div
                                                key={field.name}
                                                className="space-y-1"
                                            >
                                                <label
                                                    htmlFor={field.name}
                                                    className="block text-sm font-medium text-neutral-700"
                                                >
                                                    {field.label}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    id={field.name}
                                                    name={field.name}
                                                    value={
                                                        editData[field.name] ||
                                                        ""
                                                    }
                                                    onChange={
                                                        handleEditInputChange
                                                    }
                                                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Employment Details */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-4 text-neutral-900">
                                        Employment Details
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {[
                                            {
                                                label: "Employee Type",
                                                name: "employee_type",
                                                type: "select",
                                                options: [
                                                    "Regular",
                                                    "Temporary",
                                                    "Intern",
                                                ],
                                            },
                                            {
                                                label: "Hire Date",
                                                name: "hire_date",
                                                type: "date",
                                            },
                                            {
                                                label: "Department",
                                                name: "department",
                                                type: "select",
                                                options:
                                                    Object.keys(
                                                        departmentPositions,
                                                    ),
                                            },
                                            {
                                                label: "Reporting Manager",
                                                name: "reporting_manager",
                                                type: "text",
                                            },
                                            {
                                                label: "Work Location",
                                                name: "work_location",
                                                type: "text",
                                            },
                                            {
                                                label: "Current Salary",
                                                name: "current_salary",
                                                type: "number",
                                            },
                                            {
                                                label: "Pay Frequency",
                                                name: "pay_frequency",
                                                type: "select",
                                                options: [
                                                    "Weekly",
                                                    "Bi-weekly",
                                                    "Monthly",
                                                ],
                                            },
                                            {
                                                label: "Schedule",
                                                name: "schedule",
                                                type: "select",
                                                options: [
                                                    "7:00 - 16:00",
                                                    "8:00 - 17:00",
                                                    "12:00 - 21:00",
                                                ],
                                            },
                                        ].map((field) => (
                                            <div
                                                key={field.name}
                                                className="space-y-1"
                                            >
                                                <label
                                                    htmlFor={field.name}
                                                    className="block text-sm font-medium text-neutral-700"
                                                >
                                                    {field.label}
                                                </label>
                                                {field.type === "select" ? (
                                                    <select
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            editData[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleEditInputChange
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="">
                                                            Select {field.label}
                                                        </option>
                                                        {field.options.map(
                                                            (option) => (
                                                                <option
                                                                    key={option}
                                                                    value={
                                                                        option
                                                                    }
                                                                >
                                                                    {option}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type={field.type}
                                                        id={field.name}
                                                        name={field.name}
                                                        value={
                                                            editData[
                                                                field.name
                                                            ] || ""
                                                        }
                                                        onChange={
                                                            handleEditInputChange
                                                        }
                                                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Error Messages */}
                                {errors && (
                                    <div className="rounded-lg bg-red-50 p-4">
                                        <div className="text-sm text-red-600">
                                            {Object.values(errors).map(
                                                (error, index) => (
                                                    <p key={index}>{error}</p>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Success Message */}
                                {successMessage && (
                                    <div className="rounded-lg bg-green-50 p-4">
                                        <p className="text-sm text-green-600">
                                            {successMessage}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="sticky bottom-[-15px] bg-white p-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
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
