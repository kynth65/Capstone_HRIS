import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";
import "../styles/registration.css";
import "../styles/global.css";
import "../styles/employeeList.css";
import defaultAvatar from "../assets/default-avatar.png";
import { parseISO, differenceInYears, format } from "date-fns";

function EmployeeManagement() {
    const [activeButton, setActiveButton] = useState("employeeList");
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [archivedEmployees, setArchivedEmployees] = useState([]);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showPermanentConfirmation, setShowPermanentConfirmation] =
        useState(false);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef();
    const [errors, setErrors] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const errorTimeoutRef = useRef(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [positions, setPositions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({});

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
            fields: ["password", "confirm_password"],
        },
    ];

    const requiredFields = [
        "rfid",
        "first_name",
        "last_name",
        "address",
        "city",
        "province",
        "email",
        "password",
        "confirm_password",
        "date_of_birth",
        "gender",
        "hire_date",
        "employment_status",
        "department",
        "position",
        "employee_type",
        "current_salary",
        "contact_number",
    ];

    useEffect(() => {
        if (activeButton === "employeeList") {
            axiosClient
                .get("/employees")
                .then((response) => {
                    setEmployees(response.data);
                    setFilteredEmployees(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching employees:", error);
                });
        }
    }, [activeButton]);

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

    const handleSearch = () => {
        const searchTerm = searchRef.current.value.trim().toLowerCase();
        const filtered = employees.filter(
            (employee) =>
                employee.name.toLowerCase().includes(searchTerm) ||
                employee.user_id.toString().includes(searchTerm)
        );
        setFilteredEmployees(filtered);
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
            requiredFields.includes(field)
        );
        const allFieldsFilled = requiredCurrentFields.every(
            (field) =>
                (field === "confirm_password"
                    ? confirmPassword
                    : formData[field]) &&
                (field === "confirm_password"
                    ? confirmPassword
                    : formData[field]
                ).trim() !== ""
        );

        if (
            currentFields.includes("password") &&
            currentFields.includes("confirm_password")
        ) {
            if (formData.password !== confirmPassword) {
                setPasswordError("Passwords do not match");
                return false;
            } else {
                setPasswordError("");
            }
        }

        return allFieldsFilled;
    };

    const goToNextStep = () => {
        if (validateStep()) {
            setCurrentStep((prevStep) => prevStep + 1);
            setErrors(null);
        } else {
            setErrors({ general: ["Please fill in all required fields."] });
        }
    };

    const goToPreviousStep = () => {
        setCurrentStep((prevStep) => prevStep - 1);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== confirmPassword) {
            setErrors({ password: ["Passwords do not match"] });
            return;
        }
        try {
            const { data } = await axiosClient.post("/register", formData);
            setSuccessMessage("Employee registered successfully!");
            setFormData({});
            setConfirmPassword("");
            setCurrentStep(0);
        } catch (err) {
            const responseErrors = err.response?.data?.errors;
            setErrors(responseErrors);
        }
    };

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
                        <option value="EF4CAA1E">EF4CAA1E</option>
                        <option value="A804A6889">A804A6889</option>
                        <option value="B47B96B0">B47B96B0</option>
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
            case "emergency_contact_relationship":
                return (
                    <select {...commonProps}>
                        <option value="">Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Partner">Partner</option>
                        <option value="Parent">Parent</option>
                        <option value="Child">Child</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Aunt/Uncle">Aunt/Uncle</option>
                        <option value="Cousin">Cousin</option>
                        <option value="Friend">Friend</option>
                        <option value="Other">Other</option>
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
            case "confirm_password":
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
                return <textarea rows="7" {...commonProps}></textarea>;
            default:
                return <input type="text" {...commonProps} />;
        }
    };

    const handleView = (employee) => {
        setSelectedEmployee(employee);
    };

    const handleDeleteView = (employeeId) => {
        setShowConfirmation(true);
        setSelectedEmployeeId(employeeId);
    };

    const handlePermanentDeleteView = (employeeId) => {
        setShowPermanentConfirmation(true);
        setSelectedEmployeeId(employeeId);
    };

    const handleDelete = async (employeeId) => {
        try {
            await axiosClient.delete(`/employees/${employeeId}`);
            setEmployees(
                employees.filter((employee) => employee.id !== employeeId)
            );
            setFilteredEmployees(
                filteredEmployees.filter(
                    (employee) => employee.id !== employeeId
                )
            );
            setSuccessMessage("Employee successfully deleted and archived.");
            setTimeout(() => setSuccessMessage(""), 4000);
            setShowConfirmation(false);
        } catch (error) {
            console.error("Error deleting employee:", error);
            setErrors({ general: ["Failed to delete employee."] });
            errorTimeoutRef.current = setTimeout(() => setErrors(null), 4000);
        }
    };

    const handlePermanentDelete = async (employeeId) => {
        setLoading(true);
        try {
            await axiosClient.delete(`/employees-delete/${employeeId}`);
            setEmployees(
                employees.filter((employee) => employee.id !== employeeId)
            );
            setFilteredEmployees(
                filteredEmployees.filter(
                    (employee) => employee.id !== employeeId
                )
            );
            setSuccessMessage("Employee's data permanently deleted.");
            setTimeout(() => setSuccessMessage(""), 4000);
            setShowPermanentConfirmation(false);
            setArchivedEmployees(false);
        } catch (error) {
            console.error("Error deleting employee:", error);
            setErrors({ general: ["Failed to delete employee."] });
            errorTimeoutRef.current = setTimeout(() => setErrors(null), 4000);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = () => {
        axiosClient
            .get("/archived-employees")
            .then((response) => {
                setArchivedEmployees(response.data);
                setShowArchiveModal(true);
            })
            .catch((error) => {
                console.error("Error fetching archived employees:", error);
            });
    };

    const handleCloseArchiveModal = () => {
        setShowArchiveModal(false);
    };

    const handleCloseModal = () => {
        setSelectedEmployee(null);
        setShowConfirmation(null);
        setShowPermanentConfirmation(null);
    };

    const handleRestore = async (employeeId) => {
        try {
            const response = await axiosClient.put(
                `/archived-employees/${employeeId}/restore`
            );
            const successMessage = response.data.message;
            const restoredEmployee = archivedEmployees.find(
                (emp) => emp.id === employeeId
            );
            setEmployees([...employees, restoredEmployee]);
            setArchivedEmployees(
                archivedEmployees.filter((emp) => emp.id !== employeeId)
            );
            setSuccessMessage(successMessage);
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            console.error(
                "Error restoring employee:",
                error.response ? error.response.data : error.message
            );
            setErrors("Failed to restore employee.");
            setTimeout(() => setErrors(""), 4000);
        }
    };

    function calculateAge(birthdate) {
        const birthDate = parseISO(birthdate);
        const today = new Date();
        return differenceInYears(today, birthDate);
    }

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "employeeList" ? "active" : ""
                            }`}
                            onClick={() => setActiveButton("employeeList")}
                        >
                            Employee List
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "createAccount" ? "active" : ""
                            }`}
                            onClick={() => setActiveButton("createAccount")}
                        >
                            Create Account
                        </button>
                    </li>
                </ul>
            </nav>

            <div>
                {activeButton === "employeeList" && (
                    <div className="employee-list">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name..."
                            onChange={handleSearch}
                            className="search-bar"
                        />
                        <button className="btnArchive" onClick={handleArchive}>
                            Archive
                        </button>
                        <div className="employee-list-container animated fadeInDown">
                            <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4 xl:w-11/12">
                                <thead>
                                    <tr className="font-bold text-base">
                                        <th className="hidden lg:table-cell w-16"></th>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th className="hidden lg:table-cell">
                                            Email
                                        </th>
                                        <th className="hidden lg:table-cell">
                                            Contact Number
                                        </th>
                                        <th className="hidden lg:table-cell">
                                            Gender
                                        </th>
                                        <th>Position</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr
                                                key={employee.id}
                                                className="font-bold"
                                            >
                                                {" "}
                                                {/* Add key prop here */}
                                                <td className="hidden lg:table-cell lg:w-fit">
                                                    <img
                                                        src={
                                                            employee.profile
                                                                ? `http://127.0.0.1:8000/storage/images/${employee.profile}`
                                                                : defaultAvatar
                                                        }
                                                        alt="Profile"
                                                        className="profile-icon"
                                                    />
                                                </td>
                                                <td>{employee.user_id}</td>
                                                <td>{employee.name}</td>
                                                <td className="hidden lg:table-cell">
                                                    {employee.email}
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    {employee.contact_number}
                                                </td>
                                                <td className="hidden lg:table-cell">
                                                    {employee.gender}
                                                </td>
                                                <td>{employee.position}</td>
                                                <td className="space-x-2">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            className="bg-green-900 px-4 py-2 rounded-md text-white font-normal border-2 border-green-900 hover:bg-white hover:text-green-900 transition"
                                                            onClick={() =>
                                                                handleView(
                                                                    employee
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="bg-red-700 px-4 py-2 rounded-md text-white font-normal border-2 border-red-700 hover:bg-white hover:text-red-700 transition"
                                                            onClick={() =>
                                                                handleDeleteView(
                                                                    employee.user_id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeButton === "createAccount" && (
                    <div className="register animated fadeInDown">
                        <div className="bg-white px-7 py-6 text-black rounded-xl pb-9">
                            <h2 className="text-2xl font-bold mb-6 text-center">
                                Register - {formSections[currentStep].title}
                            </h2>
                            {errors && (
                                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                                    {Object.values(errors)
                                        .flat()
                                        .map((err, index) => (
                                            <p key={index}>{err}</p>
                                        ))}
                                </div>
                            )}
                            <form
                                onSubmit={onSubmit}
                                className="flex flex-col w-full"
                            >
                                {formSections[currentStep].fields.map(
                                    (fieldName) => (
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
                                                            word
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                            word.slice(1)
                                                    )
                                                    .join(" ")}
                                                {requiredFields.includes(
                                                    fieldName
                                                ) && (
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <div className="w-2/3">
                                                {renderFormField(fieldName)}
                                            </div>
                                        </div>
                                    )
                                )}
                                {passwordError && (
                                    <div className="text-red-500 mb-4">
                                        {passwordError}
                                    </div>
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
                )}
            </div>

            {successMessage && (
                <div className="successMessageDiv">
                    <p>{successMessage}</p>
                </div>
            )}

            {showArchiveModal && (
                <div className="modal modal-overlay">
                    <div className="modal-contents text-center">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg">Archived Employees</h2>
                            <span
                                className="cursor-pointer text-xl text-gray-500 hover:text-gray-700"
                                onClick={handleCloseArchiveModal}
                            >
                                &times;
                            </span>
                        </div>

                        <table className="archived-employee-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th></th>
                                    <th>Position</th>
                                    <th></th>
                                    <th></th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivedEmployees.length > 0 ? (
                                    archivedEmployees.map((employee) => (
                                        <tr key={employee.id}>
                                            <td>{employee.profile}</td>
                                            <td>{employee.name}</td>
                                            <td></td>
                                            <td>{employee.position}</td>
                                            <td></td>
                                            <td></td>
                                            <td>
                                                <button
                                                    className="restore-button"
                                                    onClick={() =>
                                                        handleRestore(
                                                            employee.id
                                                        )
                                                    }
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handlePermanentDeleteView(
                                                            employee.user_id
                                                        )
                                                    }
                                                >
                                                    Permanently Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            No archived employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {showConfirmation && (
                <div className="modal modal-overlay">
                    <div className="modal-content">
                        <h2>
                            "Are you sure you want to delete this employee's
                            data?"
                        </h2>

                        <button
                            className="btnConfirm"
                            onClick={() => handleDelete(selectedEmployeeId)}
                        >
                            Confirm
                        </button>
                        <button
                            className="btnCancel"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {showPermanentConfirmation && (
                <div className="modal modal-overlay">
                    <div className="modal-content">
                        <h2>
                            "Are you sure you want to delete this employee's
                            data permanently?"
                        </h2>

                        <button
                            className="btnConfirm"
                            onClick={() =>
                                handlePermanentDelete(selectedEmployeeId)
                            }
                        >
                            Confirm
                        </button>
                        <button
                            className="btnCancel"
                            onClick={handleCloseModal}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {selectedEmployee && (
                <div className="modal modal-overlay overflow-y-auto">
                    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-6xl pt-[600px] xl:pt-10">
                        <button
                            className="float-right right-8 px-3 py-1 text-xl text-white rounded-full bg-red-600 hover:text-red-600 hover:bg-white hover:border-red-600 hover:border transition"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>

                        {/* Employee Header */}
                        <div className="profile-header mb-6">
                            <div className="flex items-center">
                                <img
                                    className="w-40 h-40 rounded-full object-cover"
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
                                <div className="profile-details text-base">
                                    {renderField(
                                        "Email",
                                        selectedEmployee.email
                                    )}
                                    {renderField(
                                        "Age",
                                        calculateAge(
                                            selectedEmployee.date_of_birth
                                        )
                                    )}
                                    {renderField(
                                        "Date of Birth",
                                        selectedEmployee.date_of_birth
                                            ? format(
                                                  parseISO(
                                                      selectedEmployee.date_of_birth
                                                  ),
                                                  "MMMM d, yyyy"
                                              )
                                            : "N/A"
                                    )}
                                    {renderField(
                                        "Gender",
                                        selectedEmployee.gender
                                    )}
                                    {renderField(
                                        "Nationality",
                                        selectedEmployee.nationality
                                    )}
                                    {renderField(
                                        "Marital Status",
                                        selectedEmployee.marital_status
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Contact Information
                                </h3>
                                <div className="profile-details text-base">
                                    {renderField(
                                        "Contact",
                                        selectedEmployee.contact_number
                                    )}
                                    {renderField(
                                        "Address",
                                        selectedEmployee.address
                                    )}
                                    {renderField(
                                        "Personal Email",
                                        selectedEmployee.personal_email
                                    )}
                                    {renderField(
                                        "Work Email",
                                        selectedEmployee.work_email
                                    )}
                                    {renderField(
                                        "Home Phone",
                                        selectedEmployee.home_phone
                                    )}
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Emergency Contacts
                                </h3>
                                <div className="profile-details text-base">
                                    {renderField(
                                        "Emergency Contact",
                                        selectedEmployee.emergency_contact_name
                                    )}
                                    {renderField(
                                        "Emergency Contact Relationship",
                                        selectedEmployee.emergency_contact_relationship
                                    )}
                                    {renderField(
                                        "Emergency Contact Phone",
                                        selectedEmployee.emergency_contact_phone
                                    )}
                                </div>
                            </div>

                            {/* Employment Details */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Employment Details
                                </h3>
                                <div className="profile-details text-base">
                                    {renderField(
                                        "Employee Type",
                                        selectedEmployee.employee_type
                                    )}
                                    {renderField(
                                        "Hire Date",
                                        selectedEmployee.hire_date
                                            ? format(
                                                  parseISO(
                                                      selectedEmployee.hire_date
                                                  ),
                                                  "MMMM d, yyyy"
                                              )
                                            : "N/A"
                                    )}
                                    {renderField(
                                        "Department",
                                        selectedEmployee.department
                                    )}
                                    {renderField(
                                        "Reporting Manager",
                                        selectedEmployee.reporting_manager
                                    )}
                                    {renderField(
                                        "Work Location",
                                        selectedEmployee.work_location
                                    )}
                                    {renderField(
                                        "Current Salary",
                                        selectedEmployee.current_salary
                                    )}
                                    {renderField(
                                        "Pay Frequency",
                                        selectedEmployee.pay_frequency
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

export default EmployeeManagement;
