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
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
    const [existingUsers, setExistingUsers] = useState([]);
    const [rfidCards, setRfidCards] = useState([]);
    const [viewModalVisible, setViewModalVisible] = useState(false); // New state for view modal
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editData, setEditData] = useState({});
    const [isEditing, setIsEditing] = useState(false);

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
        "personal_email",
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
        } else if (activeButton === "probationaryList") {
            axiosClient
                .post("/candidates")
                .then((response) => {
                    const probationaryCandidates = response.data.filter(
                        (candidate) =>
                            candidate.recruitment_stage === "probationary",
                    );
                    setCandidates(probationaryCandidates);
                    setFilteredCandidates(probationaryCandidates);
                })
                .catch((error) => {
                    console.error("Error fetching candidates:", error);
                });

            axiosClient
                .get("/users") // Fetching all users to check for existing accounts
                .then((response) => {
                    setExistingUsers(response.data);
                })
                .catch((error) => {
                    console.error("Error fetching users:", error);
                });
        }
    }, [activeButton]);
    const checkIfUserExists = (candidateName) => {
        return existingUsers.some((user) => user.name === candidateName);
    };
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
        if (activeButton === "employeeList") {
            const filtered = employees.filter(
                (employee) =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.user_id.toString().includes(searchTerm),
            );
            setFilteredEmployees(filtered);
        } else if (activeButton === "probationaryList") {
            const filtered = candidates.filter(
                (candidate) =>
                    candidate.name.toLowerCase().includes(searchTerm) ||
                    candidate.email.toLowerCase().includes(searchTerm),
            );
            setFilteredCandidates(filtered);
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

    useEffect(() => {
        if (activeButton === "createAccount") {
            const fetchRfidCards = async () => {
                try {
                    const response = await axiosClient.get("/rfid-cards");
                    // Use the available cards from the response
                    const availableCards = response.data.available || [];
                    setRfidCards(availableCards);
                } catch (error) {
                    console.error("Error fetching RFID cards:", error);
                }
            };

            fetchRfidCards();
        }
    }, [activeButton]);

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
        const allFieldsFilled = requiredCurrentFields.every(
            (field) =>
                (field === "confirm_password"
                    ? confirmPassword
                    : formData[field]) &&
                (field === "confirm_password"
                    ? confirmPassword
                    : formData[field]
                ).trim() !== "",
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
                        <option value="">Select available RFID</option>
                        {Array.isArray(rfidCards) &&
                            rfidCards.map((card) => (
                                <option key={card.id} value={card.rfid_uid}>
                                    {card.rfid_uid}
                                </option>
                            ))}
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
            case "personal_email":
                return <input type="email" {...commonProps} />;
            case "confirm_password":
                return <input type="password" {...commonProps} />;
            case "hire_date":
            case "probation_end_date":
                return <input type="date" {...commonProps} />;
            case "email":
                return <input type="email" {...commonProps} />;
            case "contact_number":
                return <input type="text" {...commonProps} />;
            default:
                return <input type="text" {...commonProps} />;
        }
    };
    const handleView = (employee) => {
        setSelectedEmployee(employee);
        setViewModalVisible(true); // Show the view modal instead of edit modal
    };

    const handleEdit = () => {
        setEditData(selectedEmployee); // Set edit data from selected employee
        setViewModalVisible(false); // Hide view modal
        setEditModalVisible(true); // Show edit modal
    };

    const handleDeleteView = (employeeId) => {
        setShowConfirmation(true);
        setSelectedEmployeeId(employeeId);
    };

    const handlePermanentDeleteView = (employeeId) => {
        setShowPermanentConfirmation(true);
        setSelectedEmployeeId(employeeId);
    };

    const renderEditableField = (label, value, field) => (
        <div className="flex h-full py-2 lg items-center font-semibold text-black text-start">
            <div className="w-full font-bold">{label}:</div>
            <div className="w-full">
                {isEditing ? (
                    <input
                        type="text"
                        value={editData[field]}
                        onChange={(e) =>
                            setEditData({
                                ...editData,
                                [field]: e.target.value,
                            })
                        }
                        className="border px-2 py-1 rounded-md w-full"
                    />
                ) : (
                    value || "N/A"
                )}
            </div>
        </div>
    );

    // Update employee details
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.put(
                `/employees/${selectedEmployee.user_id}/update-personal-info`,
                editData,
            );

            // Update the selected employee with the new data
            setSelectedEmployee(response.data.user);
            setSuccessMessage("Employee details updated successfully!");
            setEditModalVisible(false);
            setViewModalVisible(true);

            // Fetch updated employee list
            const employeesResponse = await axiosClient.get("/employees");
            setEmployees(employeesResponse.data);
            setFilteredEmployees(employeesResponse.data);

            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            console.error("Error updating employee details:", error);
            setErrors(
                error.response?.data?.errors || { general: ["Update failed"] },
            );
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Handle department change for positions dropdown
        if (name === "department") {
            setPositions(departmentPositions[value] || []);
        }
    };

    const handleDelete = async (employeeId) => {
        try {
            await axiosClient.delete(`/employees/${employeeId}`);
            setEmployees(
                employees.filter((employee) => employee.id !== employeeId),
            );
            setFilteredEmployees(
                filteredEmployees.filter(
                    (employee) => employee.id !== employeeId,
                ),
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
                employees.filter((employee) => employee.id !== employeeId),
            );
            setFilteredEmployees(
                filteredEmployees.filter(
                    (employee) => employee.id !== employeeId,
                ),
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
        setViewModalVisible(false);
        setEditModalVisible(false);
        setShowConfirmation(false);
        setShowPermanentConfirmation(false);
        setIsEditing(false);
    };

    const handleRestore = async (employeeId) => {
        try {
            const response = await axiosClient.put(
                `/archived-employees/${employeeId}/restore`,
            );
            const successMessage = response.data.message;
            const restoredEmployee = archivedEmployees.find(
                (emp) => emp.id === employeeId,
            );
            setEmployees([...employees, restoredEmployee]);
            setArchivedEmployees(
                archivedEmployees.filter((emp) => emp.id !== employeeId),
            );
            setSuccessMessage(successMessage);
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            console.error(
                "Error restoring employee:",
                error.response ? error.response.data : error.message,
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
                    <li>
                        <button
                            className={`navButton ${activeButton === "probationaryList" ? "active" : ""}`}
                            onClick={() => setActiveButton("probationaryList")}
                        >
                            Probationary Candidates
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
                            className="search-bar text-black"
                        />
                        <button className="btnArchive" onClick={handleArchive}>
                            Archive
                        </button>
                        <div className="employee-list-container animated fadeInDown">
                            <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4 xl:w-full">
                                <thead>
                                    <tr className="font-bold text-base">
                                        <th className="hidden lg:table-cell w-28"></th>
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
                                                <td className="hidden lg:table-cell lg:w-fit lg:justify-center">
                                                    <img
                                                        src={
                                                            employee.profile
                                                                ? `${import.meta.env.VITE_BASE_URL}/storage/images/${employee.profile}`
                                                                : defaultAvatar
                                                        }
                                                        alt="Profile"
                                                        className="rounded-full h-10 w-10"
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
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="bg-red-700 px-4 py-2 rounded-md text-white font-normal border-2 border-red-700 hover:bg-white hover:text-red-700 transition"
                                                            onClick={() =>
                                                                handleDeleteView(
                                                                    employee.user_id,
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
                                                            word.slice(1),
                                                    )
                                                    .join(" ")}
                                                {requiredFields.includes(
                                                    fieldName,
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
                                    ),
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
            {activeButton === "probationaryList" && (
                <div className="candidate-list w-full max-w-7xl mx-auto px-4">
                    <input
                        type="text"
                        ref={searchRef}
                        placeholder="Search candidates..."
                        onChange={handleSearch}
                        className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />
                    <div className="candidate-list-container">
                        <div className="max-h-[500px] overflow-y-auto rounded-lg shadow-lg">
                            <table className="w-full bg-white text-black">
                                <thead className="sticky top-0 bg-white shadow-sm">
                                    <tr className="text-center text-base font-semibold border-b">
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Position</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredCandidates.length > 0 ? (
                                        filteredCandidates.map((candidate) => {
                                            const userExists =
                                                checkIfUserExists(
                                                    candidate.name,
                                                ); // Check if the candidate exists in the users table
                                            return (
                                                <tr
                                                    key={candidate.id}
                                                    className="text-center"
                                                >
                                                    <td className="px-6 py-4">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {candidate.email}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {candidate.position}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {userExists ? (
                                                            <button
                                                                className="bg-gray-500 px-4 py-2 rounded-md text-white cursor-not-allowed"
                                                                disabled
                                                            >
                                                                Already Created
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="bg-green-900 px-4 py-2 rounded-md text-white hover:bg-green-700 transition-colors"
                                                                onClick={() =>
                                                                    setShowCreateAccountModal(
                                                                        true,
                                                                    )
                                                                }
                                                            >
                                                                Create Account
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                No probationary candidates
                                                found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {showCreateAccountModal && (
                <div className="modal modal-overlay">
                    <div className="modal-content bg-white p-6 rounded-lg">
                        <button
                            className="close-button text-red-500 text-xl"
                            onClick={() => setShowCreateAccountModal(false)}
                        >
                            &times;
                        </button>
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
                                                        word.slice(1),
                                                )
                                                .join(" ")}
                                            {requiredFields.includes(
                                                fieldName,
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
                                ),
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
                                                            employee.id,
                                                        )
                                                    }
                                                >
                                                    Restore
                                                </button>
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handlePermanentDeleteView(
                                                            employee.user_id,
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

            {/* View Modal */}
            {viewModalVisible && selectedEmployee && (
                <div className="modal modal-overlay overflow-y-auto">
                    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-6xl">
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
                        <div className="profile-header mb-6">
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
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-[500px] overflow-auto">
                            {/* Personal Information */}
                            <div className="profile-section text-black">
                                <h3 className="text-xl font-semibold mb-4">
                                    Personal Information
                                </h3>
                                <div className="profile-details text-base">
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
                                <div className="profile-details text-base">
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
                                <div className="profile-details text-base">
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
                                <div className="profile-details text-base">
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
                                            htmlFor="email"
                                            className="font-semibold mb-1"
                                        >
                                            Email:
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={editData.email || ""}
                                            onChange={handleEditInputChange}
                                            className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
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
                                <div className="text-green-500 text-sm mt-2 modal">
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
            {successMessage && (
                <div className="successMessageDiv">
                    <p>{successMessage}</p>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;
