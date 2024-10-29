import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";
import "../styles/registration.css";
import "../styles/global.css";
import "../styles/employeeList.css";
import defaultAvatar from "../assets/default-avatar.png";
import { parseISO, differenceInYears, format } from "date-fns";
import { FaPlus } from "react-icons/fa";
import { X } from "lucide-react";
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
    const [isRfidLoading, setIsRfidLoading] = useState(false);
    const [showDepartmentModal, setShowDepartmentModal] = useState(false); // Modal state
    const [newDepartment, setNewDepartment] = useState("");
    const [newPositions, setNewPositions] = useState([""]);
    const [departmentPositions, setDepartmentPositions] = useState({
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
    });

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

    const handleAddDepartment = () => {
        setShowDepartmentModal(true); // Open the modal
    };
    const handleAddPositionField = () => {
        setNewPositions([...newPositions, ""]);
    };

    const handleCloseDepartmentModal = () => {
        setShowDepartmentModal(false); // Close the modal
        setNewDepartment(""); // Reset form fields
        setNewPositions([""]);
    };

    const handleSaveDepartment = async () => {
        if (newDepartment.trim() && newPositions.every((pos) => pos.trim())) {
            try {
                // Send POST request to backend API to save department and positions
                const response = await axiosClient.post("/departments", {
                    department: newDepartment,
                    positions: newPositions,
                });

                // Update the local state with the new department and positions
                setDepartmentPositions((prev) => ({
                    ...prev,
                    [newDepartment]: newPositions,
                }));

                // Close the modal and reset fields
                handleCloseDepartmentModal();

                // Show success message (optional)
                setSuccessMessage(response.data.message);
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                console.error("Error saving department:", error);
                setErrors("Failed to save department.");
                setTimeout(() => setErrors(""), 4000);
            }
        } else {
            alert("Please enter a valid department and positions.");
        }
    };

    const handlePositionChange = (index, value) => {
        const updatedPositions = [...newPositions];
        updatedPositions[index] = value;
        setNewPositions(updatedPositions);
    };

    const handleRemovePositionField = (index) => {
        const updatedPositions = [...newPositions];
        updatedPositions.splice(index, 1); // Remove the position at the given index
        setNewPositions(updatedPositions); // Update the state
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

    useEffect(() => {
        if (activeButton === "createAccount") {
            fetchRfidCards();
        }
    }, [activeButton]);

    const fetchRfidCards = async () => {
        setIsRfidLoading(true);
        try {
            const response = await axiosClient.get("/rfid-cards/available");
            const availableCards = response.data || [];
            setRfidCards(availableCards);
        } catch (error) {
            console.error("Error fetching RFID cards:", error);
        } finally {
            setIsRfidLoading(false);
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
            if (response.data.user) {
                fetchRfidCards();
            }
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
                    <select {...commonProps} disabled={isRfidLoading}>
                        <option value="">Select available RFID</option>
                        {isRfidLoading ? (
                            <option>Loading...</option>
                        ) : (
                            Array.isArray(rfidCards) &&
                            rfidCards.map((card) => (
                                <option key={card.id} value={card.rfid_uid}>
                                    {card.rfid_uid}
                                </option>
                            ))
                        )}
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
                    <div className="flex items-center justify-center ml-8">
                        <select {...commonProps}>
                            <option value="">Select Department</option>
                            {Object.keys(departmentPositions).map(
                                (department) => (
                                    <option key={department} value={department}>
                                        {department}
                                    </option>
                                ),
                            )}
                        </select>
                        <button
                            type="button"
                            onClick={handleAddDepartment}
                            className="text-green-500 mb-3 ml-3 hover:text-green-700"
                        >
                            <FaPlus size={20} />
                        </button>
                    </div>
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
            setEmployees((prevEmployees) =>
                prevEmployees.filter(
                    (employee) => employee.user_id !== employeeId,
                ),
            );
            setFilteredEmployees((prevFiltered) =>
                prevFiltered.filter(
                    (employee) => employee.user_id !== employeeId,
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
            const employeesResponse = await axiosClient.get("/employees");
            setEmployees(employeesResponse.data);
            setFilteredEmployees(employeesResponse.data);
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
        if (!birthdate) {
            return "N/A"; // Return N/A if birthdate is null or undefined
        }
        try {
            const birthDate = parseISO(birthdate);
            const today = new Date();
            return differenceInYears(today, birthDate);
        } catch (error) {
            console.error("Error calculating age:", error);
            return "N/A";
        }
    }

    return (
        <div>
            <nav className="grid grid-cols-3">
                <button
                    className={`navButton ${
                        activeButton === "employeeList" ? "active" : ""
                    }`}
                    onClick={() => setActiveButton("employeeList")}
                >
                    Employee List
                </button>

                <button
                    className={`navButton ${
                        activeButton === "createAccount" ? "active" : ""
                    }`}
                    onClick={() => setActiveButton("createAccount")}
                >
                    Create Account
                </button>

                <button
                    className={`navButton ${activeButton === "probationaryList" ? "active" : ""}`}
                    onClick={() => setActiveButton("probationaryList")}
                >
                    Probationary Candidates
                </button>
            </nav>

            {activeButton === "employeeList" && (
                <div className="employee-list">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4 px-4">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name..."
                            onChange={handleSearch}
                            className="w-full md:w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        />
                        <button
                            className="w-full md:w-auto px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
                            onClick={handleArchive}
                        >
                            Archive
                        </button>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto px-4">
                        <table className="w-full bg-white text-black rounded-xl overflow-hidden shadow-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b">
                                    <th className="w-28 px-4 py-3 text-left"></th>
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Email
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Contact Number
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Gender
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Position
                                    </th>
                                    <th className="px-4 py-3 text-left">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="px-4 py-3">
                                                <img
                                                    src={
                                                        employee.profile
                                                            ? `${import.meta.env.VITE_BASE_URL}/storage/images/${employee.profile}`
                                                            : defaultAvatar
                                                    }
                                                    alt="Profile"
                                                    className="rounded-full h-10 w-10 object-cover"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {employee.user_id}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {employee.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {employee.email}
                                            </td>
                                            <td className="px-4 py-3">
                                                {employee.contact_number}
                                            </td>
                                            <td className="px-4 py-3">
                                                {employee.gender}
                                            </td>
                                            <td className="px-4 py-3">
                                                {employee.position}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className="px-3 py-1.5 bg-green-900 text-white text-sm rounded-md hover:bg-green-800 transition"
                                                        onClick={() =>
                                                            handleView(employee)
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 bg-red-700 text-white text-sm rounded-md hover:bg-red-600 transition"
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
                                        <td
                                            colSpan="8"
                                            className="px-4 py-3 text-center text-gray-500"
                                        >
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden px-4 space-y-4">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="bg-white rounded-lg shadow-sm p-4"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={
                                                employee.profile
                                                    ? `${import.meta.env.VITE_BASE_URL}/storage/images/${employee.profile}`
                                                    : defaultAvatar
                                            }
                                            alt="Profile"
                                            className="rounded-full h-12 w-12 object-cover"
                                        />
                                        <div>
                                            <h3 className="font-medium text-neutral-900">
                                                {employee.name}
                                            </h3>
                                            <p className="text-sm text-neutral-500">
                                                {employee.position}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-black">
                                        <div className="grid grid-cols-3">
                                            <span className="text-neutral-500">
                                                ID:
                                            </span>
                                            <span className="col-span-2">
                                                {employee.user_id}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3">
                                            <span className="text-neutral-500">
                                                Email:
                                            </span>
                                            <span className="col-span-2 break-words">
                                                {employee.email}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3">
                                            <span className="text-neutral-500">
                                                Contact:
                                            </span>
                                            <span className="col-span-2">
                                                {employee.contact_number}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3">
                                            <span className="text-neutral-500">
                                                Gender:
                                            </span>
                                            <span className="col-span-2">
                                                {employee.gender}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            className="flex-1 px-3 py-2 bg-green-900 text-white text-sm rounded-md hover:bg-green-800 transition"
                                            onClick={() => handleView(employee)}
                                        >
                                            View
                                        </button>
                                        <button
                                            className="flex-1 px-3 py-2 bg-red-700 text-white text-sm rounded-md hover:bg-red-600 transition"
                                            onClick={() =>
                                                handleDeleteView(
                                                    employee.user_id,
                                                )
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                No employees found.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeButton === "createAccount" && (
                <div className="register animated fadeInDown px-4">
                    <div className="max-w-6xl fixed left-0 sm:relative mx-auto bg-white p-4 md:p-7 text-black rounded-xl shadow-sm">
                        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">
                            Register Employee Account
                        </h2>

                        {errors && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                                {Object.values(errors)
                                    .flat()
                                    .map((err, index) => (
                                        <p key={index} className="text-sm">
                                            {err}
                                        </p>
                                    ))}
                            </div>
                        )}

                        <form
                            onSubmit={onSubmit}
                            className="flex flex-col w-full"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                {formSections[currentStep].fields.map(
                                    (fieldName) => (
                                        <div
                                            className="form-group"
                                            key={fieldName}
                                        >
                                            <label
                                                htmlFor={fieldName}
                                                className="block font-medium text-neutral-700 mb-1 md:mb-2"
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
                                                    <span className="text-red-500 ml-1">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <div className="w-full">
                                                {renderFormField(fieldName)}
                                            </div>
                                        </div>
                                    ),
                                )}
                            </div>

                            {passwordError && (
                                <div className="text-red-500 text-sm mt-4">
                                    {passwordError}
                                </div>
                            )}

                            <div className="flex justify-center mt-6">
                                <button
                                    type="submit"
                                    className="w-full sm:w-full px-6 py-2.5 bg-green-900 text-white rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeButton === "probationaryList" && (
                <div className="candidate-list w-full max-w-7xl mx-auto px-4">
                    <input
                        type="text"
                        ref={searchRef}
                        placeholder="Search candidates..."
                        onChange={handleSearch}
                        className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    />

                    {/* Desktop View */}
                    <div className="hidden md:block candidate-list-container">
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
                                                );
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

                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {filteredCandidates.length > 0 ? (
                            filteredCandidates.map((candidate) => {
                                const userExists = checkIfUserExists(
                                    candidate.name,
                                );
                                return (
                                    <div
                                        key={candidate.id}
                                        className="bg-white rounded-lg shadow-sm p-4 space-y-3"
                                    >
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium text-neutral-900">
                                                        {candidate.name}
                                                    </h3>
                                                    <p className="text-sm text-neutral-500">
                                                        {candidate.position}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-neutral-600">
                                                <p className="break-words">
                                                    {candidate.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            {userExists ? (
                                                <button
                                                    className="w-full bg-gray-500 px-4 py-2.5 rounded-md text-white cursor-not-allowed"
                                                    disabled
                                                >
                                                    Already Created
                                                </button>
                                            ) : (
                                                <button
                                                    className="w-full bg-green-900 px-4 py-2.5 rounded-md text-white hover:bg-green-700 transition-colors"
                                                    onClick={() =>
                                                        setShowCreateAccountModal(
                                                            true,
                                                        )
                                                    }
                                                >
                                                    Create Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center text-gray-500 py-4 bg-white rounded-lg">
                                No probationary candidates found.
                            </div>
                        )}
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
                                <div className="sticky bottom-0 bg-white p-4 border-t flex flex-col sm:flex-row gap-3 justify-end">
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
            {successMessage && (
                <div className="successMessageDiv">
                    <p>{successMessage}</p>
                </div>
            )}

            {showDepartmentModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full relative text-black">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl"
                            onClick={handleCloseDepartmentModal}
                        >
                            &times;
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Add Department and Positions
                        </h2>
                        <div className="space-y-6">
                            <div className="form-group flex flex-col items-start">
                                <label
                                    htmlFor="newDepartment"
                                    className="block font-medium text-gray-700 mb-2"
                                >
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    id="newDepartment"
                                    value={newDepartment}
                                    onChange={(e) =>
                                        setNewDepartment(e.target.value)
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter department name"
                                />
                            </div>

                            <div className="form-group">
                                <label className="block font-medium text-gray-700 mb-2">
                                    Positions
                                </label>
                                {newPositions.map((position, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center mb-2 space-x-2"
                                    >
                                        <input
                                            type="text"
                                            value={position}
                                            onChange={(e) =>
                                                handlePositionChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter position"
                                        />
                                        {newPositions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemovePositionField(
                                                        index,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700 font-semibold"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddPositionField}
                                    className="mt-2 text-blue-500 hover:text-blue-700 font-semibold"
                                >
                                    + Add Another Position
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                onClick={handleSaveDepartment}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EmployeeManagement;
