import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import { parseISO, differenceInYears, format } from "date-fns";

function User() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

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

    // Set the selected employee to view the details in a modal
    const handleView = (employee) => {
        setSelectedEmployee(employee); // Directly set the employee object here
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null); // Close the modal by resetting the selected employee
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
                    <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4 xl:w-11/12">
                        <thead>
                            <tr className="font-bold text-base">
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((employee) => (
                                    <tr key={employee.id} className="font-bold">
                                        <td>{employee.user_id}</td>
                                        <td>{employee.name}</td>
                                        <td>{employee.email}</td>
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
                            className="float-right right-8 px-3 py-1 text-xl text-white rounded-full bg-red-600 hover:text-red-600 hover:bg-white hover:border-red-600 hover:border transition"
                            onClick={handleCloseModal}
                        >
                            &times;
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
        </div>
    );
}

export default User;
