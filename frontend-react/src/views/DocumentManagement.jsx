import React, { useState, useEffect, useCallback } from "react";
import {
    MdDelete,
    MdAdd,
    MdClose,
    MdArrowBack,
    MdRestore,
} from "react-icons/md";
import { RiFileDownloadFill } from "react-icons/ri";
import axiosClient from "../axiosClient";

// Constants
const DEPARTMENTS = ["Admin", "Diagnostics", "Clinic", "Utility", "HR"];
const CATEGORIES = [
    "Personal Identification",
    "Employment",
    "Legal and Compliance",
    "Educational",
    "Performance and Evaluation",
    "Training and Development",
    "Compensation and Benefits",
    "Health and Safety",
    "Company Assets",
    "Disciplinary Records",
];

// Utility functions
const getCertificateStatus = (expiringDate, type) => {
    if (type === "non-expirable") return "Active";
    if (!expiringDate) return "N/A";

    const today = new Date();
    const expDate = new Date(expiringDate);
    const daysDifference = Math.floor(
        (expDate - today) / (1000 * 60 * 60 * 24),
    );

    if (daysDifference < 0) return "Expired";
    if (daysDifference <= 30) return "Expiring";
    return "Active";
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 10);
};

const DocumentRequirementsManagement = () => {
    // View States
    const [currentView, setCurrentView] = useState("list"); // list, requirements, details, addDocument

    // Data States
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [requirements, setRequirements] = useState([]);
    const [documents, setDocuments] = useState([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");

    // Selected Item States
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Archive States
    const [archivedRequirements, setArchivedRequirements] = useState([]);
    const [showArchived, setShowArchived] = useState(false);

    // Form States
    const [newDocument, setNewDocument] = useState({
        name: "",
        file: null,
        issuedDate: "",
        expiryDate: "",
        type: "non-expirable",
        category: "",
        requirementId: null,
        userId: null,
    });

    const [newRequirement, setNewRequirement] = useState({
        name: "",
        category: "",
        type: "non-expirable",
    });
    // Error and Success States
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); // API Calls and Effects

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => {
                setError("");
                setSuccessMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeRequirements(selectedEmployee.user_id);
        }
    }, [selectedEmployee]);

    // Add useEffect to reset archive view on component mount
    useEffect(() => {
        setShowArchived(false);
    }, []);

    // Add useEffect to reset archive view when switching employees
    useEffect(() => {
        if (selectedEmployee) {
            setShowArchived(false);
        }
    }, [selectedEmployee]);

    // Fetch
    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            setEmployees(response.data);
            setFilteredEmployees(response.data);
        } catch (error) {
            setError("Error fetching employees");
            console.error("Error fetching employees:", error);
        }
    };

    const fetchEmployeeRequirements = async (userId) => {
        try {
            const response = await axiosClient.get(
                `/documents/requirements/${userId}`,
            );
            setRequirements(response.data);

            // Extract documents from requirements that have submissions
            const submittedDocs = response.data
                .filter((req) => req.document)
                .map((req) => req.document);
            setDocuments(submittedDocs);
        } catch (error) {
            setError("Error fetching requirements");
            console.error("Error fetching requirements:", error);
        }
    };

    const fetchArchivedRequirements = async (userId) => {
        try {
            const response = await axiosClient.get(
                `/documents/requirements/${userId}/archived`,
            );
            setArchivedRequirements(response.data);
        } catch (error) {
            setError("Error fetching archived requirements");
            console.error("Error fetching archived requirements:", error);
        }
    };

    // Handlers
    const handleDeleteRequirement = async (requirementId) => {
        if (
            window.confirm("Are you sure you want to delete this requirement?")
        ) {
            try {
                await axiosClient.delete(
                    `/documents/requirements/${requirementId}`,
                );
                // Refresh the requirements list
                fetchEmployeeRequirements(selectedEmployee.user_id);
                setSuccessMessage("Requirement deleted successfully");
            } catch (error) {
                setError("Error deleting requirement");
                console.error("Error deleting requirement:", error);
            }
        }
    };

    // Permanently delete in archive
    const handlePermanentDelete = async (requirementId) => {
        if (
            window.confirm(
                "Are you sure you want to permanently delete this requirement? This action cannot be undone.",
            )
        ) {
            try {
                await axiosClient.delete(
                    `/documents/requirements/${requirementId}/permanent`,
                );
                // Refresh the archived requirements list
                await fetchArchivedRequirements(selectedEmployee.user_id);
                setSuccessMessage("Requirement permanently deleted");
            } catch (error) {
                setError("Error deleting requirement");
                console.error("Error deleting requirement:", error);
            }
        }
    };

    // Recover
    const handleRecoverRequirement = async (requirementId) => {
        if (
            window.confirm("Are you sure you want to recover this requirement?")
        ) {
            try {
                await axiosClient.post(
                    `/documents/requirements/${requirementId}/recover`,
                );
                // Refresh both active and archived requirements
                await fetchEmployeeRequirements(selectedEmployee.user_id);
                await fetchArchivedRequirements(selectedEmployee.user_id);
                setSuccessMessage("Requirement recovered successfully");
            } catch (error) {
                setError("Error recovering requirement");
                console.error("Error recovering requirement:", error);
            }
        }
    };

    const handleAddRequirement = useCallback(
        async (requirementData) => {
            try {
                // Include the user_id in the requirement data
                const dataToSubmit = {
                    ...requirementData,
                    user_id: selectedEmployee.user_id,
                };

                const response = await axiosClient.post(
                    "/documents/requirements",
                    dataToSubmit,
                );

                // Refresh the requirements list
                fetchEmployeeRequirements(selectedEmployee.user_id);
                setCurrentView("requirements");
                setSuccessMessage("Requirement added successfully");
            } catch (error) {
                setError("Error adding requirement");
                console.error("Error adding requirement:", error);
            }
        },
        [selectedEmployee],
    );
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        let filtered = employees;
        if (selectedDepartment) {
            filtered = filtered.filter(
                (emp) => emp.department === selectedDepartment,
            );
        }

        filtered = filtered.filter(
            (emp) =>
                emp.name.toLowerCase().includes(query) ||
                emp.user_id.toString().includes(query),
        );

        setFilteredEmployees(filtered);
    };

    const handleDepartmentChange = (event) => {
        const department = event.target.value;
        setSelectedDepartment(department);

        let filtered = employees;
        if (department) {
            filtered = filtered.filter((emp) => emp.department === department);
        }

        if (searchQuery) {
            filtered = filtered.filter(
                (emp) =>
                    emp.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    emp.user_id.toString().includes(searchQuery),
            );
        }

        setFilteredEmployees(filtered);
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee);
        setCurrentView("requirements");
        setShowArchived(false); // Reset to active view
    };

    const handleAddDocument = async (formData) => {
        if (!selectedEmployee) return;
        try {
            const requirement = requirements.find(
                (r) => r.id === newDocument.requirementId,
            );
            if (!requirement) {
                setError("Requirement not found");
                return;
            }

            // Debug logging
            console.log("Initial FormData contents:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            formData.append("user_id", selectedEmployee.user_id);
            formData.append("requirement_id", requirement.id);
            formData.append("type", requirement.type);
            formData.append("category", requirement.category);

            // Debug logging after adding all fields
            console.log("Final FormData contents:");
            for (let pair of formData.entries()) {
                console.log(pair[0] + ": " + pair[1]);
            }

            const response = await axiosClient.post(
                "/documents/submit",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            console.log("Upload response:", response.data);
            await fetchEmployeeRequirements(selectedEmployee.user_id);
            setDocuments((prev) => [...prev, response.data]);
            setSuccessMessage("Document added successfully");
            setCurrentView("requirements");
        } catch (error) {
            console.error("Upload error details:", error.response?.data);
            setError(error.response?.data?.message || "Error adding document");
        }
    };

    const handleShowAddDocument = (requirement) => {
        setNewDocument((prev) => ({
            ...prev,
            requirementId: requirement.id,
            type: requirement.type,
            category: requirement.category,
            userId: selectedEmployee.user_id,
        }));
        setCurrentView("addDocument");
    };

    const handleCheckDocument = async (documentId) => {
        try {
            await axiosClient.post(`/documents/check/${documentId}`, {
                is_checked: true,
            });
            fetchEmployeeRequirements(selectedEmployee.user_id);
            setSuccessMessage("Document verified successfully");
        } catch (error) {
            setError("Error verifying document");
            console.error("Error checking document:", error);
        }
    };

    const handleViewDetails = (document) => {
        setSelectedDocument(document);
        setCurrentView("details");
    };

    const handleBack = () => {
        switch (currentView) {
            case "requirements":
                setCurrentView("list");
                setSelectedEmployee(null);
                setShowArchived(false); // Reset to active view
                break;
            case "details":
                setCurrentView("requirements");
                setSelectedDocument(null);
                setShowArchived(false); // Reset to active view
                break;
            case "addDocument":
                setCurrentView("requirements");
                setNewDocument({
                    name: "",
                    file: null,
                    issuedDate: "",
                    expiryDate: "",
                    type: "non-expirable",
                    category: "",
                    requirementId: null,
                    userId: null,
                });
                break;
            case "addRequirement":
                setCurrentView("requirements");
                setNewRequirement({
                    name: "",
                    category: "",
                    type: "non-expirable",
                });
                break;
            default:
                setCurrentView("list");
                setShowArchived(false); // Reset to active view
        }
    };

    const handleArchiveRequirement = async (requirementId) => {
        if (
            window.confirm("Are you sure you want to archive this requirement?")
        ) {
            try {
                await axiosClient.post(
                    `/documents/requirements/${requirementId}/archive`,
                );
                // Refresh both active and archived requirements
                await fetchEmployeeRequirements(selectedEmployee.user_id);
                await fetchArchivedRequirements(selectedEmployee.user_id);
                setSuccessMessage("Requirement archived successfully");
            } catch (error) {
                setError("Error archiving requirement");
                console.error("Error archiving requirement:", error);
            }
        }
    };

    // View Components
    const EmployeeListView = () => (
        <div className="bg-white rounded-lg shadow-lg text-black">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Employees</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredEmployees.map((employee) => (
                                <tr key={employee.user_id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {employee.user_id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {employee.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <button
                                            onClick={() =>
                                                handleEmployeeSelect(employee)
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                        >
                                            View Requirements
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const RequirementsView = () => (
        <div className="bg-white rounded-lg shadow-lg text-black">
            <div className="p-6">
                {/* Header section with archive toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <MdArrowBack size={24} />
                        </button>
                        <h2 className="text-xl font-semibold">
                            {showArchived
                                ? "Archived Requirements"
                                : "Requirements"}{" "}
                            for {selectedEmployee?.name}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setShowArchived(!showArchived);
                                if (!showArchived) {
                                    fetchArchivedRequirements(
                                        selectedEmployee.user_id,
                                    );
                                }
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-300 rounded-lg hover:bg-gray-500"
                        >
                            {showArchived ? "Show Active" : "Show Archived"}
                        </button>
                        {!showArchived && (
                            <button
                                onClick={() => setCurrentView("addRequirement")}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <MdAdd size={20} />
                                Add Requirement
                            </button>
                        )}
                    </div>
                </div>

                {/* Requirements List */}
                <div className="space-y-4">
                    {showArchived ? (
                        // Archived Requirements View
                        archivedRequirements.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg
                                        className="w-16 h-16 mx-auto"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                        />
                                    </svg>
                                </div>
                                <p className="text-gray-500 text-lg">
                                    No archived requirements found
                                </p>
                            </div>
                        ) : (
                            archivedRequirements.map((requirement) => (
                                <div
                                    key={requirement.id}
                                    className="bg-gray-50 rounded-lg p-6 border border-gray-100 hover:border-gray-200 transition-all"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <h3 className="text-base font-semibold text-gray-900">
                                                {requirement.name}
                                            </h3>
                                            <div className="mt-2">
                                                <span
                                                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                        requirement.type ===
                                                        "expirable"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-blue-100 text-blue-800"
                                                    }`}
                                                >
                                                    {requirement.type}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="font-medium mr-2">
                                                        Category:
                                                    </span>
                                                    {requirement.category}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <span className="font-medium mr-2">
                                                        Archived on:
                                                    </span>
                                                    {new Date(
                                                        requirement.archived_at,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {requirement.document && (
                                                <button
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            requirement.document,
                                                        )
                                                    }
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                >
                                                    <RiFileDownloadFill
                                                        size={20}
                                                    />
                                                    View Document
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleRecoverRequirement(
                                                        requirement.id,
                                                    )
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                            >
                                                <MdRestore size={20} />
                                                Recover
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handlePermanentDelete(
                                                        requirement.id,
                                                    )
                                                }
                                                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                            >
                                                <MdDelete size={20} />
                                                Delete Permanently
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )
                    ) : // Active Requirements View (Keep existing requirements mapping)
                    requirements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No requirements found. Add some requirements to get
                            started.
                        </div>
                    ) : (
                        requirements.map((requirement) => {
                            const isCompleted = requirement.is_submitted;
                            const document = requirement.document;

                            return (
                                <div
                                    key={requirement.id}
                                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative inline-block">
                                                <input
                                                    type="checkbox"
                                                    checked={isCompleted}
                                                    disabled
                                                    className="peer hidden"
                                                />
                                                <div
                                                    className={`w-5 h-5 border rounded ${
                                                        isCompleted
                                                            ? "bg-green-700 border-green-800"
                                                            : "bg-white border-gray-300"
                                                    } flex items-center justify-center`}
                                                >
                                                    {isCompleted && (
                                                        <svg
                                                            className="w-3 h-3 text-white"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M5 13l4 4L19 7"
                                                            />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {requirement.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {requirement.category}
                                                </p>
                                            </div>
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${
                                                    requirement.type ===
                                                    "expirable"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-blue-100 text-blue-800"
                                                }`}
                                            >
                                                {requirement.type}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isCompleted && document ? (
                                                <>
                                                    <button
                                                        onClick={() =>
                                                            handleViewDetails(
                                                                document,
                                                            )
                                                        }
                                                        className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                                    >
                                                        View Details
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleShowAddDocument(
                                                            requirement,
                                                        )
                                                    }
                                                    className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                                >
                                                    Add Document
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleArchiveRequirement(
                                                        requirement.id,
                                                    )
                                                }
                                                className="px-4 py-2 text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                                            >
                                                Archive
                                            </button>
                                            {/* <button
                                                onClick={() =>
                                                    handleDeleteRequirement(
                                                        requirement.id,
                                                    )
                                                }
                                                className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600"
                                            >
                                                <MdDelete size={20} />
                                            </button> */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );

    const DocumentDetailsView = () => {
        // Add base URL construction
        const baseUrl = import.meta.env.VITE_BASE_URL;

        // Function to construct full URL
        const getFullUrl = (filePath) => {
            if (!filePath) return "";
            return filePath.startsWith("http")
                ? filePath
                : `${baseUrl}/storage/${filePath}`;
        };

        return (
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={handleBack}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <MdArrowBack size={24} />
                        </button>
                        <h2 className="text-xl font-semibold text-black">
                            Document Details
                        </h2>
                    </div>

                    {selectedDocument && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Document Name
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {selectedDocument.certificate_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Category
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {selectedDocument.category}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Type
                                        </label>
                                        <span
                                            className={`inline-block px-2 py-1 text-xs rounded ${
                                                selectedDocument.type ===
                                                "expirable"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {selectedDocument.type}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Issued Date
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {new Date(
                                                selectedDocument.issued_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {selectedDocument.type === "expirable" && (
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Expiring Date
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {new Date(
                                                    selectedDocument.expiring_date,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PDF Viewer */}
                            {selectedDocument.certificate_file_path && (
                                <div className="w-full h-[600px] border border-gray-200 rounded-lg">
                                    <object
                                        data={getFullUrl(
                                            selectedDocument.certificate_file_path,
                                        )}
                                        type="application/pdf"
                                        width="100%"
                                        height="100%"
                                        className="rounded-lg"
                                    >
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">
                                                Unable to display PDF.
                                                <a
                                                    href={getFullUrl(
                                                        selectedDocument.certificate_file_path,
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:text-blue-700 ml-1"
                                                >
                                                    Click here to open
                                                </a>
                                            </p>
                                        </div>
                                    </object>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Move AddRequirementView outside the main component
    const AddRequirementView = ({ onSubmit, onBack, initialValues }) => {
        const [formData, setFormData] = useState(initialValues);

        const handleSubmit = (e) => {
            e.preventDefault();
            onSubmit(formData);
        };

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        };

        return (
            <div className="bg-white rounded-lg shadow-lg text-black">
                <div className="p-6">
                    <h2 className="text-xl font-semibold">Add Requirement</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onBack}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <MdArrowBack size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center flex-col">
                            <label className="block text-sm font-medium text-gray-700">
                                Requirement Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full mb-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-center flex-col">
                            <label className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="mt-1 block w-full mb-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="">Select a category</option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center flex-col">
                            <label className="block text-sm font-medium text-gray-700">
                                Type
                            </label>
                            <select
                                required
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="mt-1 block w-full mb-0 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                                <option value="non-expirable">
                                    Non-Expirable
                                </option>
                                <option value="expirable">Expirable</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Add Requirement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const AddDocumentView = ({
        onSubmit,
        onBack,
        requirementType,
        requirement, // Pass the full requirement object
    }) => {
        const [formData, setFormData] = useState({
            certificateName: "",
            issuedDate: "",
            expiryDate: "",
            certificateFile: null,
        });

        const handleSubmit = (e) => {
            e.preventDefault();
            if (!formData.certificateFile) {
                setError("Please select a file to upload");
                return;
            }

            const formDataToSubmit = new FormData();

            // Match the database column name exactly
            formDataToSubmit.append(
                "certificate_file_path",
                formData.certificateFile,
            );
            formDataToSubmit.append(
                "certificate_name",
                formData.certificateName,
            );
            formDataToSubmit.append("issued_date", formData.issuedDate);

            if (requirementType === "expirable" && formData.expiryDate) {
                formDataToSubmit.append("expiring_date", formData.expiryDate);
            }

            onSubmit(formDataToSubmit);
        };

        const handleChange = (e) => {
            const { name, type, files, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "file" ? files[0] : value,
            }));
        };

        return (
            <div className="bg-white rounded-lg shadow-lg text-black">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={onBack}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <MdArrowBack size={24} />
                        </button>
                        <h2 className="text-xl font-semibold">Add Document</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Certificate Name
                            </label>
                            <input
                                type="text"
                                name="certificateName"
                                required
                                value={formData.certificateName}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter certificate name"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Issue Date
                                </label>
                                <input
                                    type="date"
                                    name="issuedDate"
                                    required
                                    value={formData.issuedDate}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {requirementType === "expirable" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        required
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Upload Certificate
                            </label>
                            <input
                                type="file"
                                name="certificateFile" // Changed from "file" to "certificateFile"
                                required
                                onChange={handleChange}
                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Upload Document
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    // Main Render
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Error and Success Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-200 text-green-700 rounded-md">
                    {successMessage}
                </div>
            )}

            {/* Filters - Only show in list view */}
            {currentView === "list" && (
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm text-black">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">
                                Department
                            </label>
                            <select
                                value={selectedDepartment}
                                onChange={handleDepartmentChange}
                                className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Departments</option>
                                {DEPARTMENTS.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm text-gray-600 mb-1">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name or ID"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content - Conditional Rendering */}
            {currentView === "list" && <EmployeeListView />}
            {currentView === "requirements" && <RequirementsView />}
            {currentView === "details" && <DocumentDetailsView />}
            {currentView === "addRequirement" && (
                <AddRequirementView
                    initialValues={newRequirement}
                    onSubmit={handleAddRequirement}
                    onBack={handleBack}
                />
            )}
            {currentView === "addDocument" && (
                <AddDocumentView
                    onSubmit={handleAddDocument}
                    onBack={handleBack}
                    requirementType={newDocument.type}
                    requirement={requirements.find(
                        (r) => r.id === newDocument.requirementId,
                    )}
                />
            )}
        </div>
    );
};

export default DocumentRequirementsManagement;
