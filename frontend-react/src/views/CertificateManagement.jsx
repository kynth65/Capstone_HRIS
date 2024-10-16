import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { MdDelete, MdEdit, MdRestore } from "react-icons/md";
import { RiFileDownloadFill } from "react-icons/ri";

function CertificateManagement() {
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // State for PDF modal
    const [pdfUrl, setPdfUrl] = useState(null); // State to hold the selected PDF URL
    const [employees, setEmployees] = useState([]);
    const [certificates, setCertificates] = useState([]); // All certificates state
    const [filteredCertificates, setFilteredCertificates] = useState([]); // State for filtered certificates
    const [filteredEmployees, setFilteredEmployees] = useState([]); // State for filtered employees
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [searchEmployeeQuery, setSearchEmployeeQuery] = useState(""); // State for employee search input
    const [searchQuery, setSearchQuery] = useState(""); // State for certificate search input
    const [errorMessage, setErrorMessage] = useState(""); // State for error message
    const [activeButton, setActiveButton] = useState("employeeList"); // State for active button
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCertificate, setEditingCertificate] = useState(null);
    const [successMessage, setSuccessMessage] = useState(""); // State for success messages
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [newCertificate, setNewCertificate] = useState({
        user_id: "",
        certificate_name: "",
        expiring_date: "",
        issued_date: "",
        file: null,
        category: "",
        type: "expirable", // Default to expirable
    });
    const [selectedDepartment, setSelectedDepartment] = useState(""); // State for selected department
    const [isArchivedModalOpen, setIsArchivedModalOpen] = useState(false);
    const [archivedCertificates, setArchivedCertificates] = useState([]); // Initialize as an empty array
    const [selectedCategory, setSelectedCategory] = useState(""); // Add state for selected category
    const [archivedSearchQuery, setArchivedSearchQuery] = useState("");
    const [isUpdateRequestModalOpen, setIsUpdateRequestModalOpen] =
        useState(false);
    const [certificateUpdateRequests, setCertificateUpdateRequests] = useState(
        [],
    ); // Store update requests

    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newIssuedDate, setNewIssuedDate] = useState("");
    const [newExpiringDate, setNewExpiringDate] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newType, setNewType] = useState("expirable"); // Default to expirable
    const [newCertificateName, setNewCertificateName] = useState(
        selectedRequest?.certificate_name || "",
    );
    const [newFile, setNewFile] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailedCertificate, setDetailedCertificate] = useState(null);
    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
        useState(false);
    const [certificateToDelete, setCertificateToDelete] = useState(null);
    const [isArchivedDetailModalOpen, setIsArchivedDetailModalOpen] =
        useState(false);
    const [selectedArchivedCertificate, setSelectedArchivedCertificate] =
        useState(null);

    const [archivedSuccessMessage, setArchivedSuccessMessage] = useState("");

    // Define departments
    const departments = ["Admin", "Diagnostics", "Clinic", "Utility", "HR"];

    // Define the categories
    const categories = [
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 10); // Returns 'YYYY-MM-DD'
    };

    useEffect(() => {
        // Fetch all employees
        axiosClient
            .get("/employees")
            .then((response) => {
                setEmployees(response.data);
                setFilteredEmployees(response.data); // Initialize filtered employees
            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
            });
    }, []);

    useEffect(() => {
        if (activeButton === "employeeCertificate") {
            fetchAllCertificates();
        } else {
            setCertificates([]);
            setFilteredCertificates([]);
        }
    }, [activeButton]);

    const fetchAllCertificates = async () => {
        try {
            setSelectedDepartment(""); // Reset department filter
            const response = await axiosClient.get("/allCertificates");
            const nonArchivedCertificates = response.data.filter(
                (certificate) => !certificate.is_archived,
            );
            setCertificates(nonArchivedCertificates);
            setFilteredCertificates(nonArchivedCertificates);
        } catch (error) {
            console.error("Error fetching certificates:", error);
        }
    };

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axiosClient.get("/allCertificates");
                console.log(response.data); // Check the response data structure here
                setCertificates(response.data);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };

        fetchCertificates();
    }, []);

    const handleViewModal = (employee) => {
        setSelectedEmployee(employee);
        setSelectedCategory(null); // Clear the selected category
        fetchCertificatesForEmployee(employee.user_id); // Fetch all certificates for the selected employee
        setIsViewModalOpen(true);
    };

    const handleAddModal = () => setIsAddModalOpen(!isAddModalOpen);

    const handleEditModal = (certificate) => {
        setEditingCertificate({
            ...certificate,
            issued_date: formatDate(certificate.issued_date),
            expiring_date: certificate.expiring_date
                ? formatDate(certificate.expiring_date)
                : "",
        });
        setIsEditModalOpen(true);
    };

    const handleEditChange = (event) => {
        const { name, value, files } = event.target;
        setEditingCertificate((prev) => ({
            ...prev,
            [name]: name === "certificate_file" ? files[0] : value, // Handle file input correctly
        }));
    };

    const handleFileChange = (event) => {
        const { name, value, files } = event.target;

        // Check if the input is of type file
        if (name === "file" && files.length > 0) {
            setNewCertificate({
                ...newCertificate,
                file: files[0], // Assign the first selected file
            });
        } else {
            setNewCertificate({
                ...newCertificate,
                [name]: value, // For other inputs like text and select
            });
        }
    };

    const getCertificateStatus = (expiring_date, type) => {
        // For non-expirable certificates, always return "Active"
        if (type === "non-expirable") {
            return "Active";
        }

        // For expirable certificates, check the expiration date
        if (!expiring_date) {
            return "N/A"; // Return N/A if no expiring date is provided
        }

        const today = new Date();
        const expirationDate = new Date(expiring_date);
        const daysDifference = Math.floor(
            (expirationDate - today) / (1000 * 60 * 60 * 24),
        );

        if (daysDifference < 0) {
            return "Expired"; // Certificate is expired
        } else if (daysDifference <= 30) {
            return "Expiring"; // Expiring within 30 days
        } else {
            return "Active"; // Certificate is still active
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!selectedEmployee) {
            setErrorMessage("Please select an employee");
            return;
        }

        // Initialize FormData within the function
        const formData = new FormData();
        formData.append("user_id", selectedEmployee.user_id); // Ensure user_id is added
        formData.append("certificate_name", newCertificate.certificate_name);
        formData.append("type", newCertificate.type);

        if (newCertificate.type === "expirable") {
            formData.append("expiring_date", newCertificate.expiring_date);
            formData.append("issued_date", newCertificate.issued_date);
        }

        formData.append("certificate_file", newCertificate.file);
        formData.append("category", newCertificate.category);

        // Make the axios post request with the initialized formData
        axiosClient
            .post("/certificates", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                // Fetch certificates again after successfully adding a new certificate
                fetchCertificatesForEmployee(selectedEmployee.user_id);

                setIsAddModalOpen(false); // Close the modal
                setNewCertificate({
                    user_id: "",
                    certificate_name: "",
                    expiring_date: "",
                    issued_date: "",
                    file: null,
                    category: "", // Reset category
                    type: "expirable", // Reset type to expirable
                });
                setErrorMessage(""); // Clear error message on successful submission
                setSuccessMessage("Certificate successfully created!"); // Set success message
                setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds
            })
            .catch((error) => {
                console.error(
                    "Error adding certificate:",
                    error.response ? error.response.data : error,
                );
            });
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append(
            "certificate_name",
            editingCertificate.certificate_name,
        );
        formData.append("type", editingCertificate.type);
        formData.append("issued_date", editingCertificate.issued_date);
        formData.append("expiring_date", editingCertificate.expiring_date);

        if (editingCertificate.certificate_file) {
            formData.append(
                "certificate_file",
                editingCertificate.certificate_file,
            );
        }

        axiosClient
            .post(
                `/certificates/${editingCertificate.id}?_method=PUT`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            )
            .then((response) => {
                // Refresh the certificate list after the update
                fetchCertificatesForEmployee(selectedEmployee.user_id);

                // Close modal
                setIsEditModalOpen(false);

                setSuccessMessage("Certificate successfully updated!"); // Set success message
                setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds
            })
            .catch((error) => {
                console.error("Error updating certificate:", error);
            });
    };

    const handleOpenPdf = (pdfUrl) => {
        if (pdfUrl) {
            console.log(pdfUrl); // Log the pdfUrl to ensure it's being passed correctly
            window.open(pdfUrl, "_blank"); // Open the PDF in a new browser tab
        } else {
            alert("No PDF available for this certificate.");
        }
    };

    // Category selection handling for view modal
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        if (category) {
            // If a category is selected, fetch certificates for that category
            fetchCertificatesByCategory(category);
        } else {
            // If no category is selected, fetch all certificates for the employee
            fetchCertificatesForEmployee(selectedEmployee.user_id);
        }
    };
    const fetchCertificatesForEmployee = (userId) => {
        axiosClient
            .get(`/certificates/${userId}`)
            .then((response) => {
                setFilteredCertificates(response.data);
            })
            .catch((error) => {
                console.error(
                    "Error fetching certificates for employee:",
                    error,
                );
            });
    };

    const fetchCertificatesByCategory = (category) => {
        const userId = selectedEmployee.user_id;
        axiosClient
            .get(`/certificates/${userId}/category/${category}`)
            .then((response) => {})
            .catch((error) => {
                console.error(
                    "Error fetching certificates by category:",
                    error,
                );
            });
    };

    // Function to handle employee search input change
    const handleEmployeeSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchEmployeeQuery(query);

        let updatedEmployees = employees;

        // Filter employees based on the department and search query
        if (selectedDepartment !== "") {
            updatedEmployees = updatedEmployees.filter(
                (emp) => emp.department === selectedDepartment,
            );
        }

        if (query === "") {
            setFilteredEmployees(updatedEmployees); // Show filtered by department if search is empty
        } else {
            setFilteredEmployees(
                updatedEmployees.filter(
                    (emp) =>
                        emp.name.toLowerCase().includes(query) ||
                        emp.user_id.toString().includes(query),
                ),
            );
        }
    };

    // Handle department change for employee and certificates filtering
    const handleDepartmentChange = (event) => {
        const department = event.target.value;
        setSelectedDepartment(department);

        let updatedEmployees = employees;

        if (department !== "") {
            updatedEmployees = employees.filter(
                (emp) => emp.department === department,
            );
        }

        // Filter employees based on department selection
        setFilteredEmployees(updatedEmployees);

        // Filter certificates for employees in the selected department
        const employeeIds = updatedEmployees.map((emp) => emp.user_id);
        const filteredCerts = certificates.filter((cert) =>
            employeeIds.includes(cert.user_id),
        );

        setFilteredCertificates(filteredCerts);
    };

    const handleSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);

        // Filter certificates based on search query (certificate name, employee name, user ID, or date issued)
        const filtered = certificates.filter((cert) => {
            const issuedDate = new Date(cert.issued_date).toLocaleDateString(
                "en-US",
            );
            return (
                cert.certificate_name.toLowerCase().includes(query) ||
                cert.employee_name?.toLowerCase().includes(query) ||
                cert.user_id.toString().includes(query) ||
                issuedDate.includes(query) // Check if the search query matches the formatted date
            );
        });

        // Update the filtered certificates
        setFilteredCertificates(filtered);
    };

    const handleDelete = (certificateId) => {
        if (
            window.confirm("Are you sure you want to archive this certificate?")
        ) {
            axiosClient
                .post(`/certificates/archive/${certificateId}`)
                .then((response) => {
                    console.log("Archive response:", response.data);

                    // Immediately remove the archived certificate from the local state
                    setCertificates((prevCertificates) =>
                        prevCertificates.filter(
                            (cert) => cert.id !== certificateId,
                        ),
                    );
                    setFilteredCertificates((prevFiltered) =>
                        prevFiltered.filter(
                            (cert) => cert.id !== certificateId,
                        ),
                    );
                    alert(response.data.message);
                })
                .catch((error) => {
                    console.error("Error archiving certificate:", error);
                });
        }
    };

    const fetchArchivedCertificates = async () => {
        try {
            const response = await axiosClient.get("/archived-certificates");
            console.log("Archived certificates response:", response.data);

            if (response.data && Array.isArray(response.data.data)) {
                setArchivedCertificates(response.data.data);
            } else {
                console.error("Unexpected response format:", response.data);
                setArchivedCertificates([]);
            }
        } catch (error) {
            console.error(
                "Error fetching archived certificates:",
                error.response ? error.response.data : error.message,
            );
            setArchivedCertificates([]);
        }
    };

    const handleOpenArchiveModal = () => {
        fetchArchivedCertificates();
        setIsArchivedModalOpen(true);
        setArchivedSuccessMessage(""); // Clear any existing messages
    };

    const handleGrantUpdateAccess = (certificateId) => {
        if (!selectedEmployee) {
            alert("No employee selected.");
            return;
        }

        axiosClient
            .post(`/certificates/grant-access/${certificateId}`, {
                user_id: selectedEmployee.user_id,
            })
            .then((response) => {
                // Handle success, for example showing a success message
                alert(
                    response.data.message ||
                        "Update access granted for this certificate.",
                );
            })
            .catch((error) => {
                console.error("Error granting access:", error);
                alert("Failed to grant access. Please try again.");
            });
    };

    const fetchCertificateUpdateRequests = async () => {
        try {
            const response = await axiosClient.get(
                "/certificate-update-requests",
            );
            setCertificateUpdateRequests(response.data); // Ensure file_url is now included in the response
        } catch (error) {
            console.error("Error fetching update requests:", error);
        }
    };

    const handleOpenUpdateRequestModal = () => {
        fetchCertificateUpdateRequests();
        setIsUpdateRequestModalOpen(true);
    };

    const handleOpenUpdateModal = (request) => {
        console.log(request); // Check if the correct request data is logged
        setSelectedRequest(request);
        setNewIssuedDate(request.issued_date); // Set the initial issued date
        setNewExpiringDate(request.expiring_date); // Set the initial expiring date
        setNewCategory(request.category); // Set the initial category
        setNewType(request.type); // Set the initial type
        setIsUpdateModalOpen(true); // Open the update modal
    };

    const handleViewCertificate = (certificate) => {
        setSelectedCertificate(certificate);
        setShowCertificateModal(true);
    };

    const handleUpdateSubmit = async (event) => {
        event.preventDefault();

        // Ensure certificate name is not null or empty
        if (!newCertificateName || newCertificateName.trim() === "") {
            alert("Certificate name is required");
            return;
        }

        const formData = new FormData();
        formData.append("certificate_name", newCertificateName); // Ensure the name is provided
        formData.append("type", newType);
        formData.append("issued_date", newIssuedDate);
        formData.append("expiring_date", newExpiringDate || "");
        formData.append("category", newCategory);

        // Use the existing file path from the selected request
        formData.append(
            "certificate_file_path",
            selectedRequest.certificate_file_path,
        );

        try {
            // Update the certificate
            await axiosClient.post(
                `/certificates/${selectedRequest.certificate_id}?_method=PUT`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            // After successful update, remove the update request
            await axiosClient.post(
                `/certificate-update-requests/${selectedRequest.id}/approve`,
            );

            // Remove the request from the UI
            setCertificateUpdateRequests((prevRequests) =>
                prevRequests.filter(
                    (request) => request.id !== selectedRequest.id,
                ),
            );

            setSuccessMessage("Certificate successfully updated!"); // Add the success message here
            setTimeout(() => setSuccessMessage(""), 3000); // Clear message after 3 seconds

            // Close the update modal
            setIsUpdateModalOpen(false);
        } catch (error) {
            console.error("Error updating certificate:", error);
        }
    };

    const handleReject = (requestId, certificateId) => {
        if (!certificateId) {
            console.error("Certificate ID is undefined");
            return;
        }

        if (
            window.confirm(
                "Are you sure you want to reject this request and revoke access?",
            )
        ) {
            // First, reject the request
            axiosClient
                .post(`/certificate-update-requests/${requestId}/reject`)
                .then((response) => {
                    alert(
                        response.data.message ||
                            "Request rejected successfully.",
                    );

                    // Revoke access for the certificate after rejecting the request
                    axiosClient
                        .post(`/certificates/revoke-access/${certificateId}`)
                        .then((revokeResponse) => {
                            alert(
                                revokeResponse.data.message ||
                                    "Access revoked successfully.",
                            );

                            // Remove the rejected request from the UI
                            setCertificateUpdateRequests((prevRequests) =>
                                prevRequests.filter(
                                    (request) => request.id !== requestId,
                                ),
                            );
                        })
                        .catch((revokeError) => {
                            console.error(
                                "Error revoking access:",
                                revokeError,
                            );
                            alert("Failed to revoke access. Please try again.");
                        });
                })
                .catch((error) => {
                    console.error("Error rejecting the request:", error);
                    alert("Failed to reject the request. Please try again.");
                });
        }
    };

    const handleOpenDetailModal = async (certificateId) => {
        try {
            // Fetch the complete certificate details from the backend by ID
            const response = await axiosClient.get(
                `/certificates/show/${certificateId}`,
            );

            // Set the fetched data in the detailedCertificate state
            setDetailedCertificate(response.data);

            // Open the detail modal
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error("Error fetching detailed certificate data:", error);
            alert("Failed to load certificate details. Please try again.");
        }
    };

    const handleViewArchivedDetails = (certificate) => {
        setSelectedArchivedCertificate(certificate);
        setIsArchivedDetailModalOpen(true);
    };

    const handleRecoverCertificate = async (certificateId) => {
        try {
            await axiosClient.post(`/certificates/${certificateId}/recover`);
            setArchivedSuccessMessage("Certificate recovered successfully!");
            await fetchArchivedCertificates(); // Fetch updated list
            await fetchAllCertificates(); // Fetch all certificates to update the main list
        } catch (error) {
            console.error("Error recovering certificate:", error);
            setArchivedSuccessMessage(
                "Failed to recover certificate. Please try again.",
            );
        }
    };

    const openDeleteConfirmModal = (certificate) => {
        setCertificateToDelete(certificate);
        setIsDeleteConfirmModalOpen(true);
    };

    const handlePermanentDelete = async () => {
        if (!certificateToDelete) return;

        try {
            await axiosClient.delete(
                `/certificates/${certificateToDelete.id}/permanent`,
            );
            setArchivedSuccessMessage("Certificate permanently deleted!");
            await fetchArchivedCertificates(); // Fetch updated list
            setIsDeleteConfirmModalOpen(false);
        } catch (error) {
            console.error("Error deleting certificate permanently:", error);
            setArchivedSuccessMessage(
                "Failed to delete certificate permanently. Please try again.",
            );
        }
    };

    const today = new Date();
    const maxDate = new Date(today);
    const minDate = new Date(today);

    // Set the minimum date to 200 years in the past
    minDate.setFullYear(today.getFullYear() - 200);

    // Set the maximum date to 200 years in the future
    maxDate.setFullYear(today.getFullYear() + 200);

    // Format dates as 'YYYY-MM-DD' for the date input field
    const formatDateString = (date) => date.toISOString().slice(0, 10);

    return (
        <>
            <div className="mb-4">
                <nav className="grid grid-cols-2">
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
                            activeButton === "employeeCertificate"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => setActiveButton("employeeCertificate")}
                    >
                        Employee Certificates
                    </button>
                </nav>
            </div>

            {activeButton === "employeeList" && (
                <div className="employee-list-container animated fadeInDown">
                    {/* Department Filter */}
                    <div className="flex flex-col items-center sm:grid sm:grid-cols-3 sm:gap-2 mb-4">
                        <select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            className="w-full p-2 border rounded text-black"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Search employees by name or ID"
                            className="w-full p-2 border rounded text-black"
                            value={searchEmployeeQuery}
                            onChange={handleEmployeeSearchChange}
                        />

                        {/* Button to open certificate update request modal */}
                        <button
                            className="md:px-3 sm:mb-4 w-full py-[10px] bg-green-700 text-white h-fit rounded text-sm font-normal hover:bg-green-900"
                            onClick={handleOpenUpdateRequestModal}
                        >
                            Certificate Requests
                        </button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto rounded-lg">
                        <table className="bg-white employee-table text-black w-full xl:w-full">
                            <thead className="sticky top-0 bg-gray-200 border-b-2">
                                <tr className="text-sm font-semibold">
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        ID
                                    </th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <tr
                                            key={employee.user_id}
                                            className="text-sm hover:bg-gray-100"
                                        >
                                            <td className="px-4 py-2 hidden md:table-cell">
                                                {employee.user_id}
                                            </td>
                                            <td className="px-4 py-2">
                                                {employee.name}
                                            </td>
                                            <td className="px-4 py-2">
                                                <button
                                                    className="bg-green-800 w-full px-4 py-2 rounded-md text-white font-normal hover:bg-green-900 transition"
                                                    onClick={() =>
                                                        handleViewModal(
                                                            employee,
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="text-center py-2"
                                        >
                                            No employees found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeButton === "employeeCertificate" && (
                <div className="certificate-list-container animated fadeInDown">
                    {/* Department Filter and Search */}
                    <div className="flex flex-col items-center sm:grid sm:grid-cols-3 sm:gap-2 mb-4">
                        <select
                            value={selectedDepartment}
                            onChange={handleDepartmentChange}
                            className="w-full p-2 border rounded text-black"
                        >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>
                                    {dept}
                                </option>
                            ))}
                        </select>

                        <input
                            type="text"
                            placeholder="Search certificate, employee name, user ID, or date issued"
                            className="w-full p-2 border rounded text-black"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />

                        <button
                            className="md:px-3 sm:mb-4 w-full py-[10px] bg-green-700 text-white h-fit rounded text-sm font-normal hover:bg-green-900"
                            onClick={handleOpenArchiveModal}
                        >
                            View Archived Certificates
                        </button>
                    </div>

                    <div className="max-h-[450px] overflow-x-auto overflow-y-auto rounded-lg">
                        <table className="employee-table bg-white text-black w-full">
                            <thead className="sticky top-0 bg-gray-200 border-b-2">
                                <tr className="border-b-2 text-sm font-semibold">
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        User ID
                                    </th>
                                    <th className="px-4 py-2">Employee Name</th>
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        Certificate Name
                                    </th>
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        Date Issued
                                    </th>
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        Expiring Date
                                    </th>
                                    <th className="px-4 py-2 hidden md:table-cell">
                                        Status
                                    </th>
                                    <th className="px-4 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCertificates.length > 0 ? (
                                    filteredCertificates.map((cert) => {
                                        const status = getCertificateStatus(
                                            cert.expiring_date,
                                            cert.type,
                                        );
                                        return (
                                            <tr
                                                key={cert.id}
                                                className="text-sm font-semibold hover:bg-gray-100"
                                            >
                                                <td className="border px-4 py-2 hidden md:table-cell">
                                                    {cert.user_id}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    {cert.employee_name}
                                                </td>
                                                <td className="border px-4 py-2 hidden md:table-cell">
                                                    {cert.certificate_name}
                                                </td>
                                                <td className="border px-4 py-2 hidden md:table-cell">
                                                    {new Date(
                                                        cert.issued_date,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                    )}
                                                </td>
                                                <td className="border px-4 py-2 hidden md:table-cell">
                                                    {cert.type ===
                                                    "non-expirable"
                                                        ? "N/A"
                                                        : cert.expiring_date
                                                          ? new Date(
                                                                cert.expiring_date,
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                            )
                                                          : ""}
                                                </td>
                                                <td
                                                    className="border px-4 font-normal hidden md:table-cell"
                                                    style={{
                                                        backgroundColor:
                                                            status ===
                                                            "Expiring"
                                                                ? "#f19c09"
                                                                : status ===
                                                                    "Expired"
                                                                  ? "#ff0000"
                                                                  : "rgb(34, 197, 94)",
                                                    }}
                                                >
                                                    {status}
                                                </td>
                                                <td className="border px-4 py-2">
                                                    <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                                                        <button
                                                            className="md:hidden px-3 py-2 bg-blue-500 text-white rounded text-sm font-normal hover:bg-blue-600"
                                                            onClick={() =>
                                                                handleViewCertificate(
                                                                    cert,
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                        <button
                                                            className="px-3 py-2 bg-red-500 text-white rounded text-sm font-normal hover:bg-red-600"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    cert.id,
                                                                )
                                                            }
                                                        >
                                                            <MdDelete
                                                                size={20}
                                                            />
                                                        </button>
                                                        {cert.file_url && (
                                                            <button
                                                                className="px-3 py-2 bg-green-500 text-white rounded text-sm font-normal hover:bg-green-600"
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        cert.file_url,
                                                                    )
                                                                }
                                                            >
                                                                <RiFileDownloadFill
                                                                    size={20}
                                                                />
                                                            </button>
                                                        )}
                                                        <button
                                                            className="hidden md:block bg-purple-500 font-normal text-white px-3 py-2 rounded-md hover:bg-purple-700"
                                                            onClick={() =>
                                                                handleOpenDetailModal(
                                                                    cert.id,
                                                                )
                                                            }
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="text-center py-2"
                                        >
                                            No certificates found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Certificate View Modal for Small Screens */}
            {showCertificateModal && selectedCertificate && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                    onClick={() => setShowCertificateModal(false)}
                >
                    <div
                        className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                Certificate Details
                            </h3>
                            <div className="mt-2 py-3 text-left text-base">
                                <p className="text-gray-700">
                                    <strong>Employee Name:</strong>{" "}
                                    {selectedCertificate.employee_name}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Certificate Name:</strong>{" "}
                                    {selectedCertificate.certificate_name}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Date Issued:</strong>{" "}
                                    {new Date(
                                        selectedCertificate.issued_date,
                                    ).toLocaleDateString("en-US")}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Expiring Date:</strong>{" "}
                                    {selectedCertificate.type ===
                                    "non-expirable"
                                        ? "N/A"
                                        : selectedCertificate.expiring_date
                                          ? new Date(
                                                selectedCertificate.expiring_date,
                                            ).toLocaleDateString("en-US")
                                          : ""}
                                </p>
                                <p className="text-gray-700">
                                    <strong>Status:</strong>{" "}
                                    {getCertificateStatus(
                                        selectedCertificate.expiring_date,
                                        selectedCertificate.type,
                                    )}
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-4">
                                {selectedCertificate.file_url && (
                                    <button
                                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                                        onClick={() =>
                                            handleOpenPdf(
                                                selectedCertificate.file_url,
                                            )
                                        }
                                    >
                                        Download
                                    </button>
                                )}
                                <button
                                    className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
                                    onClick={() =>
                                        handleOpenDetailModal(
                                            selectedCertificate.id,
                                        )
                                    }
                                >
                                    View Details
                                </button>
                                <button
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                    onClick={() =>
                                        setShowCertificateModal(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Certificates Modal */}
            {isViewModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-3/4  text-black overflow-hidden">
                        <h2 className="text-lg font-bold mb-10">
                            Certificates for {selectedEmployee?.name}
                        </h2>
                        {successMessage && (
                            <div className="bg-green-200 text-green-800 p-4 mb-4 rounded">
                                {successMessage}
                            </div>
                        )}
                        <div className="mb-4">
                            <label className="block text-gray-700">
                                Select Category
                            </label>
                            <select
                                className="w-full p-2 border rounded"
                                value={selectedCategory || ""} // Bind the value
                                onChange={(e) =>
                                    handleCategorySelect(e.target.value)
                                } // Handle change and fetch certificates
                            >
                                <option value="">All Certificates</option>{" "}
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Always show the table, even if no category is selected */}
                        <div className="overflow-auto h-[400px]">
                            <table className="table-auto w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-400 text-center">
                                    <tr className="font-bold text-base">
                                        <th className="px-4 py-2">Type</th>{" "}
                                        {/* New Type Column */}
                                        <th className="px-4 py-2">
                                            Category
                                        </th>{" "}
                                        {/* New Category Column */}
                                        <th className="px-4 py-2">
                                            Certificate Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Date Issued
                                        </th>
                                        <th className="px-4 py-2">
                                            Expiring Date
                                        </th>
                                        <th>Status</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {filteredCertificates.length > 0 ? (
                                        filteredCertificates.map((cert) => {
                                            const status = getCertificateStatus(
                                                cert.expiring_date,
                                                cert.type,
                                            );
                                            const typeColor =
                                                cert.type === "expirable"
                                                    ? "bg-yellow-400"
                                                    : "bg-blue-400"; // Color logic

                                            return (
                                                <tr
                                                    key={cert.id}
                                                    className="hover:bg-gray-100"
                                                >
                                                    <td
                                                        className={`border px-4 py-2 text-black ${typeColor}`}
                                                    >
                                                        {cert.type ===
                                                        "expirable"
                                                            ? "Expirable"
                                                            : "Non-Expirable"}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {cert.category}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {cert.certificate_name}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {new Date(
                                                            cert.issued_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                        )}
                                                    </td>
                                                    <td className="border px-4 py-2">
                                                        {cert.type ===
                                                        "non-expirable"
                                                            ? "N/A"
                                                            : cert.expiring_date
                                                              ? new Date(
                                                                    cert.expiring_date,
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                )
                                                              : ""}
                                                    </td>
                                                    <td
                                                        className="border px-4 font-normal"
                                                        style={{
                                                            backgroundColor:
                                                                status ===
                                                                "Expiring"
                                                                    ? "#f19c09"
                                                                    : status ===
                                                                        "Expired"
                                                                      ? "#ff0000"
                                                                      : "rgb(34, 197, 94)",
                                                        }}
                                                    >
                                                        {status}
                                                    </td>
                                                    <td className="border px-4 py-2 flex space-x-2">
                                                        {/* Delete Button */}
                                                        <button
                                                            className="px-3 py-2 bg-red-500 text-white rounded text-sm font-normal hover:bg-red-600"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    cert.id,
                                                                )
                                                            }
                                                        >
                                                            <MdDelete
                                                                size={20}
                                                            />
                                                        </button>
                                                        {/* Download Button */}
                                                        {cert.file_url && (
                                                            <button
                                                                className="px-3 py-2 bg-green-500 text-white rounded text-sm font-normal hover:bg-green-600"
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        cert.file_url,
                                                                    )
                                                                }
                                                            >
                                                                <RiFileDownloadFill
                                                                    size={20}
                                                                />
                                                            </button>
                                                        )}
                                                        {/* Edit Button */}
                                                        <button
                                                            className="bg-blue-500 font-normal text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                            onClick={() =>
                                                                handleEditModal(
                                                                    cert,
                                                                )
                                                            }
                                                        >
                                                            Update
                                                        </button>
                                                        {/* Grant Update Access Button */}
                                                        <button
                                                            className="bg-yellow-500 px-3 py-2 rounded text-white font-normal hover:bg-yellow-600"
                                                            onClick={() =>
                                                                handleGrantUpdateAccess(
                                                                    cert.id,
                                                                )
                                                            }
                                                        >
                                                            Grant Access
                                                        </button>
                                                        <button
                                                            className="bg-purple-500 font-normal text-white px-3 py-2 rounded-md hover:bg-purple-700"
                                                            onClick={() =>
                                                                handleOpenDetailModal(
                                                                    cert.id,
                                                                )
                                                            }
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="text-center py-2"
                                            >
                                                No certificates found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex justify-between">
                            <button
                                className="bg-red-700 px-4 py-2 rounded-md text-white font-normal hover:bg-red-900 transition"
                                onClick={() => {
                                    setIsViewModalOpen(false);
                                    setFilteredCertificates([]); // Clear certificates when closing modal
                                    setSelectedCategory(null); // Clear the selected category
                                }}
                            >
                                Close
                            </button>
                            <button
                                className="bg-blue-700 px-4 py-2 rounded-md text-white font-normal hover:bg-blue-900 transition"
                                onClick={handleAddModal}
                            >
                                Add Certificate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Certificate Modal */}
            {isAddModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">
                            Add Certificate
                        </h2>
                        <form onSubmit={handleSubmit}>
                            {/* Display the selected employee name */}
                            {selectedEmployee && (
                                <div className="mb-4">
                                    <p className="text-gray-700">
                                        Employee: {selectedEmployee.name}
                                    </p>
                                </div>
                            )}
                            {/* Input for Certificate Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Certificate Name
                                </label>
                                <input
                                    type="text"
                                    name="certificate_name"
                                    className="w-full p-2 border rounded"
                                    value={newCertificate.certificate_name}
                                    onChange={handleFileChange}
                                    required
                                />
                            </div>

                            {/* Select for Expirable or Non-expirable */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    className="w-full p-2 border rounded"
                                    value={newCertificate.type}
                                    onChange={handleFileChange}
                                    required
                                >
                                    <option value="expirable">Expirable</option>
                                    <option value="non-expirable">
                                        Non-expirable
                                    </option>
                                </select>
                            </div>

                            {/* Conditionally show date inputs based on certificate type */}
                            {newCertificate.type === "expirable" && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Date Issued
                                        </label>
                                        <input
                                            type="date"
                                            name="issued_date"
                                            className="w-full p-2 border rounded"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Expiring Date
                                        </label>
                                        <input
                                            type="date"
                                            name="expiring_date"
                                            className="w-full p-2 border rounded"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    className="w-full p-2 border rounded"
                                    value={newCertificate.category} // Bind the value
                                    onChange={handleFileChange} // Handle the change event
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Personal Identification">
                                        Personal Identification
                                    </option>
                                    <option value="Employment">
                                        Employment
                                    </option>
                                    <option value="Legal and Compliance">
                                        Legal and Compliance
                                    </option>
                                    <option value="Educational">
                                        Educational
                                    </option>
                                    <option value="Performance and Evaluation">
                                        Performance and Evaluation
                                    </option>
                                    <option value="Training and Development">
                                        Training and Development
                                    </option>
                                    <option value="Compensation and Benefits">
                                        Compensation and Benefits
                                    </option>
                                    <option value="Health and Safety">
                                        Health and Safety
                                    </option>
                                    <option value="Company Assets">
                                        Company Assets
                                    </option>
                                    <option value="Disciplinary Records">
                                        Disciplinary Records
                                    </option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Upload Certificate (PDF)
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    accept=".pdf"
                                    className="w-full p-2 border rounded"
                                    onChange={handleFileChange}
                                    required
                                />
                                {errorMessage && (
                                    <div className="text-red-500 text-sm mb-4">
                                        {errorMessage}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    className="btnSave bg-blue-500 text-white p-2 rounded"
                                    type="submit"
                                >
                                    Save
                                </button>
                                <button
                                    className="btnClose bg-red-500 text-white p-2 rounded"
                                    onClick={handleAddModal}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Certificate Modal */}
            {isEditModalOpen && editingCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">
                            Edit Certificate
                        </h2>
                        <form onSubmit={handleEditSubmit}>
                            {/* Display the selected employee name */}
                            {selectedEmployee && (
                                <div className="mb-4">
                                    <p className="text-gray-700">
                                        Employee: {selectedEmployee.name}
                                    </p>
                                </div>
                            )}

                            {/* Input for Certificate Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Certificate Name
                                </label>
                                <input
                                    type="text"
                                    name="certificate_name"
                                    value={editingCertificate.certificate_name}
                                    className="w-full p-2 border rounded"
                                    onChange={handleEditChange}
                                    required
                                />
                            </div>

                            {/* Select for Expirable or Non-expirable */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Type
                                </label>
                                <select
                                    name="type"
                                    className="w-full p-2 border rounded"
                                    value={editingCertificate.type}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="expirable">Expirable</option>
                                    <option value="non-expirable">
                                        Non-expirable
                                    </option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Date Issued
                                </label>
                                <input
                                    type="date"
                                    name="issued_date"
                                    className="w-full p-2 border rounded"
                                    value={editingCertificate.issued_date}
                                    onChange={handleEditChange}
                                    required
                                    min={formatDateString(minDate)} // Set the min attribute
                                    max={formatDateString(maxDate)} // Set the max attribute
                                />
                            </div>
                            {/* Conditionally show date inputs based on certificate type */}
                            {editingCertificate.type === "expirable" && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Expiring Date
                                        </label>
                                        <input
                                            type="date"
                                            name="expiring_date"
                                            value={
                                                editingCertificate.expiring_date ||
                                                ""
                                            }
                                            className="w-full p-2 border rounded"
                                            onChange={handleEditChange}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Category
                                </label>
                                <select
                                    name="category"
                                    className="w-full p-2 border rounded"
                                    value={editingCertificate.category}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File Upload */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Upload New Certificate (PDF)
                                </label>
                                <input
                                    type="file"
                                    name="certificate_file"
                                    accept=".pdf"
                                    className="w-full p-2 border rounded"
                                    onChange={handleEditChange}
                                />
                            </div>

                            <div className="flex justify-between">
                                <button
                                    className="btnSave bg-blue-500 text-white p-2 rounded"
                                    type="submit"
                                >
                                    Update
                                </button>
                                <button
                                    className="btnClose bg-red-500 text-white p-2 rounded"
                                    onClick={() => setIsEditModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isArchivedModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-3/4 text-black overflow-hidden">
                        <h2 className="text-lg font-bold mb-4">
                            Archived Certificates
                        </h2>
                        {archivedSuccessMessage && (
                            <div className="bg-green-200 text-green-800 p-4 mb-4 rounded">
                                {archivedSuccessMessage}
                            </div>
                        )}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search archived certificates"
                                className="w-full p-2 border rounded text-black"
                                value={archivedSearchQuery}
                                onChange={(e) =>
                                    setArchivedSearchQuery(e.target.value)
                                }
                            />
                        </div>
                        <div className="overflow-auto h-[400px]">
                            <table className="employee-table table-auto w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-400 text-center">
                                    <tr className="font-semibold text-sm">
                                        <th className="px-4 py-2">
                                            Certificate Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Date Issued
                                        </th>
                                        <th className="px-4 py-2">
                                            Employee ID
                                        </th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archivedCertificates.length > 0 ? (
                                        archivedCertificates
                                            .filter(
                                                (cert) =>
                                                    cert.certificate_name
                                                        .toLowerCase()
                                                        .includes(
                                                            archivedSearchQuery.toLowerCase(),
                                                        ) ||
                                                    cert.user_id
                                                        .toLowerCase()
                                                        .includes(
                                                            archivedSearchQuery.toLowerCase(),
                                                        ),
                                            )
                                            .map((cert) => (
                                                <tr key={cert.id}>
                                                    <td>
                                                        {cert.certificate_name}
                                                    </td>
                                                    <td>
                                                        {cert.issued_date
                                                            ? new Date(
                                                                  cert.issued_date,
                                                              ).toLocaleDateString()
                                                            : "N/A"}
                                                    </td>
                                                    <td>{cert.user_id}</td>
                                                    <td>
                                                        <div className="flex justify-center space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleViewArchivedDetails(
                                                                        cert,
                                                                    )
                                                                }
                                                                className="px-3 w-full py-2 flex  justify-center items-center bg-blue-500 text-white rounded text-sm font-normal hover:bg-blue-600"
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleRecoverCertificate(
                                                                        cert.id,
                                                                    )
                                                                }
                                                                className="px-3 w-full py-2 flex  justify-center items-center bg-green-500 text-white rounded text-sm font-normal hover:bg-green-600"
                                                            >
                                                                <MdRestore
                                                                    size={20}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    openDeleteConfirmModal(
                                                                        cert,
                                                                    )
                                                                }
                                                                className="px-3 w-full py-2 flex  justify-center items-center bg-red-500 text-white rounded text-sm font-normal hover:bg-red-600"
                                                            >
                                                                <MdDelete
                                                                    size={20}
                                                                />
                                                            </button>
                                                            {cert.certificate_file_path && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleOpenPdf(
                                                                            `/storage/${cert.certificate_file_path}`,
                                                                        )
                                                                    }
                                                                    className="px-3 w-full py-2 flex  justify-center items-center bg-purple-500 text-white rounded text-sm font-normal hover:bg-purple-600"
                                                                >
                                                                    <RiFileDownloadFill
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No archived certificates found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button
                                className="bg-red-700 px-4 py-2 rounded-md text-white font-normal hover:bg-red-900 transition"
                                onClick={() => setIsArchivedModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isArchivedDetailModalOpen && selectedArchivedCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-8 rounded-lg w-3/4 max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Archived Certificate Details
                        </h2>
                        <div className="text-black space-y-4 mb-6">
                            <p>
                                <strong className="font-semibold">
                                    Certificate Name:
                                </strong>{" "}
                                {selectedArchivedCertificate.certificate_name}
                            </p>
                            <p>
                                <strong className="font-semibold">Type:</strong>{" "}
                                {selectedArchivedCertificate.type}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Category:
                                </strong>{" "}
                                {selectedArchivedCertificate.category}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Date Issued:
                                </strong>{" "}
                                {new Date(
                                    selectedArchivedCertificate.issued_date,
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Expiring Date:
                                </strong>{" "}
                                {selectedArchivedCertificate.expiring_date
                                    ? new Date(
                                          selectedArchivedCertificate.expiring_date,
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Employee ID:
                                </strong>{" "}
                                {selectedArchivedCertificate.user_id}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Created By:
                                </strong>{" "}
                                {selectedArchivedCertificate.created_by}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Updated By:
                                </strong>{" "}
                                {selectedArchivedCertificate.updated_by}
                            </p>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition duration-200"
                                onClick={() =>
                                    handleRecoverCertificate(
                                        selectedArchivedCertificate.id,
                                    )
                                }
                            >
                                Recover
                            </button>
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-200"
                                onClick={() => {
                                    setIsArchivedDetailModalOpen(false);
                                    openDeleteConfirmModal(
                                        selectedArchivedCertificate,
                                    );
                                }}
                            >
                                Delete Permanently
                            </button>
                            <button
                                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                                onClick={() =>
                                    setIsArchivedDetailModalOpen(false)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteConfirmModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-8 rounded-lg w-96">
                        <h2 className="text-xl font-bold mb-4 text-center">
                            Confirm Permanent Deletion
                        </h2>
                        <p className="mb-6 text-center">
                            Are you sure you want to permanently delete this
                            certificate? This action cannot be undone.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-200"
                                onClick={handlePermanentDelete}
                            >
                                Delete Permanently
                            </button>
                            <button
                                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-200"
                                onClick={() =>
                                    setIsDeleteConfirmModalOpen(false)
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isUpdateRequestModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-xl w-3/4 xl:w-3/4 text-black overflow-hidden">
                        <h2 className="text-lg font-bold mb-4">
                            Certificate Update Requests
                        </h2>
                        {successMessage && (
                            <div className="bg-green-200 text-green-800 p-4 mb-4 rounded">
                                {successMessage}
                            </div>
                        )}
                        <div className="overflow-auto h-[400px]">
                            <table className="table-auto w-full text-sm text-left border-collapse">
                                <thead className="bg-gray-400 text-center">
                                    <tr className="font-bold text-base">
                                        <th className="px-4 py-2">
                                            Employee Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Certificate Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Requested Date
                                        </th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-center">
                                    {certificateUpdateRequests.length > 0 ? (
                                        certificateUpdateRequests.map(
                                            (request) => (
                                                <tr key={request.id}>
                                                    <td>
                                                        {request.employee_name}
                                                    </td>
                                                    <td>
                                                        {
                                                            request.certificate_name
                                                        }
                                                    </td>
                                                    <td>
                                                        {new Date(
                                                            request.requested_at,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="flex space-x-2 py-2 justify-center">
                                                        {/* Show PDF button */}
                                                        <td>
                                                            {request.certificate_file_path && (
                                                                <button
                                                                    className="px-3 py-2 bg-green-500 text-white rounded text-sm font-normal hover:bg-green-600"
                                                                    onClick={() =>
                                                                        handleOpenPdf(
                                                                            request.file_url,
                                                                        )
                                                                    }
                                                                >
                                                                    <RiFileDownloadFill
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                </button>
                                                            )}
                                                        </td>
                                                        {/* Update button */}
                                                        <button
                                                            className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-normal hover:bg-blue-600 ml-2"
                                                            onClick={() =>
                                                                handleOpenUpdateModal(
                                                                    request,
                                                                )
                                                            }
                                                        >
                                                            Update
                                                        </button>
                                                        {/* Reject button */}
                                                        <button
                                                            className="px-3 py-2 bg-red-500 text-white rounded text-sm font-normal hover:bg-red-600 ml-2"
                                                            onClick={() =>
                                                                handleReject(
                                                                    request.id,
                                                                    request.certificate_id,
                                                                )
                                                            } // Pass both request id and certificate id
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No update requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between">
                            <button
                                className="bg-red-700 px-4 py-2 rounded-md text-white font-normal hover:bg-red-900 transition"
                                onClick={() =>
                                    setIsUpdateRequestModalOpen(false)
                                }
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isUpdateModalOpen && selectedRequest && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">
                            Update Certificate
                        </h2>
                        <form onSubmit={handleUpdateSubmit}>
                            {/* Display and Edit Certificate Name */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Certificate Name
                                </label>
                                <input
                                    type="text"
                                    name="certificate_name"
                                    value={newCertificateName} // Use the newCertificateName state
                                    onChange={(e) =>
                                        setNewCertificateName(e.target.value)
                                    } // Update the state on change
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            {/* Select for Expirable or Non-expirable */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Type
                                </label>
                                <select
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="non-expirable">
                                        Non-expirable
                                    </option>
                                    <option value="expirable">Expirable</option>
                                </select>
                            </div>
                            {/* Category Selection */}
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Category
                                </label>
                                <select
                                    value={newCategory}
                                    onChange={(e) =>
                                        setNewCategory(e.target.value)
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Date Issued
                                </label>
                                <input
                                    type="date"
                                    value={newIssuedDate}
                                    onChange={(e) =>
                                        setNewIssuedDate(e.target.value)
                                    }
                                    className="w-full p-2 border rounded"
                                    required
                                    min={formatDateString(minDate)} // Set minimum date
                                    max={formatDateString(maxDate)} // Set maximum date
                                />
                            </div>
                            {/* Conditionally show date inputs based on certificate type */}
                            {newType === "expirable" && (
                                <>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">
                                            Expiring Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newExpiringDate}
                                            onChange={(e) =>
                                                setNewExpiringDate(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex justify-between">
                                <button
                                    className="bg-blue-500 text-white p-2 rounded"
                                    type="submit"
                                >
                                    Save
                                </button>
                                <button
                                    className="bg-red-500 text-white p-2 rounded"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDetailModalOpen && detailedCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-8 rounded-lg w-3/4 max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Certificate Details
                        </h2>
                        <div className="text-black space-y-4 mb-6">
                            <p>
                                <strong className="font-semibold">
                                    Certificate Name:
                                </strong>{" "}
                                {detailedCertificate.certificate_name}
                            </p>
                            <p>
                                <strong className="font-semibold">Type:</strong>{" "}
                                {detailedCertificate.type}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Category:
                                </strong>{" "}
                                {detailedCertificate.category}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Date Issued:
                                </strong>{" "}
                                {new Date(
                                    detailedCertificate.issued_date,
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                <strong className="font-semibold">
                                    Expiring Date:
                                </strong>{" "}
                                {detailedCertificate.expiring_date
                                    ? new Date(
                                          detailedCertificate.expiring_date,
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </p>
                            <div className="space-y-2">
                                <p>
                                    <strong className="font-semibold">
                                        Created By:
                                    </strong>{" "}
                                    {detailedCertificate.created_by_name}
                                </p>
                                <p>
                                    <strong className="font-semibold">
                                        Updated By:
                                    </strong>{" "}
                                    {detailedCertificate.updated_by_name}
                                </p>
                            </div>
                            <p>
                                <strong className="font-semibold">
                                    Status:
                                </strong>{" "}
                                {getCertificateStatus(
                                    detailedCertificate.expiring_date,
                                    detailedCertificate.type,
                                )}
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <button
                                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-200"
                                onClick={() => setIsDetailModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CertificateManagement;
