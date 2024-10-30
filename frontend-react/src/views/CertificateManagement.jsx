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
    const [certificateRequests, setCertificateRequests] = useState([]);
    const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [isRejectedModalOpen, setIsRejectedModalOpen] = useState(false);
    const [rejectedDocuments, setRejectedDocuments] = useState([]);
    const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
    const [selectedRemarks, setSelectedRemarks] = useState(null);
    const [remark, setRemark] = useState("");
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
    const [archivedCertificateCount, setArchivedCertificateCount] = useState(0); // State for archived certificate count
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
    const [newType, setNewType] = useState("expirable"); // Default to expirable\
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [requestSearchQuery, setRequestSearchQuery] = useState("");
    const [selectedRequestDepartment, setSelectedRequestDepartment] =
        useState("");
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
    const [certificateUpdateRequestCount, setCertificateUpdateRequestCount] =
        useState(0);

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

    const fetchCertificateRequests = async () => {
        try {
            const response = await axiosClient.get("/certificate-requests");
            // Handle the response, e.g., set it to a state variable
            setCertificateRequests(response.data);
            setCertificateUpdateRequestCount(response.data.length); // Set the count of requests
        } catch (error) {
            console.error("Error fetching user's certificate requests:", error);
        }
    };

    useEffect(() => {
        if (activeButton === "certificateRequests") {
            fetchCertificateRequests();
        }
    }, [activeButton]);

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

    const handleOpenRemarkModal = (requestId) => {
        setSelectedRequestId(requestId);
        setIsRemarkModalOpen(true);
    };

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

    const handleApprove = async (requestId) => {
        try {
            await axiosClient.post(
                `/certificate-requests/${requestId}/approve`,
            );
            alert("Certificate request approved successfully.");
            fetchCertificateRequests();
        } catch (error) {
            console.error("Error approving certificate request:", error);
            alert("Failed to approve certificate request.");
        }
    };

    const handleDeny = async () => {
        try {
            await axiosClient.post(
                `/certificate-requests/${selectedRequestId}/reject`,
                { remarks: remark },
            );
            alert("Certificate request denied successfully.");

            // Update the local state of certificateRequests to reflect the change
            setCertificateRequests((prev) =>
                prev.map((req) =>
                    req.id === selectedRequestId
                        ? { ...req, status: "rejected", remarks: remark }
                        : req,
                ),
            );

            setIsRemarkModalOpen(false);
            setRemark("");
            fetchCertificateRequests(); // Refresh the list
        } catch (error) {
            console.error("Error denying certificate request:", error);
            alert("Failed to deny certificate request.");
        }
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
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const fullUrl = pdfUrl.startsWith("http")
                ? pdfUrl // Use the URL as is if it’s already a full URL
                : `${baseUrl}/storage/${pdfUrl}`; // Construct the URL based on the base URL

            console.log(fullUrl); // Log the full URL to ensure it's being passed correctly
            window.open(fullUrl, "_blank"); // Open the PDF in a new browser tab
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

    // Fetch certificates by category for a specific employee
    const fetchCertificatesByCategory = (category) => {
        const userId = selectedEmployee.user_id;
        axiosClient
            .get(`/certificates/${userId}/category/${category}`)
            .then((response) => {
                setFilteredCertificates(response.data); // Store filtered certificates
            })
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
                setArchivedCertificateCount(response.data.data.length); // Set the count of archived certificates
            } else {
                console.error("Unexpected response format:", response.data);
                setArchivedCertificates([]);
                setArchivedCertificateCount(0); // Reset count if no data
            }
        } catch (error) {
            console.error(
                "Error fetching archived certificates:",
                error.response ? error.response.data : error.message,
            );
            setArchivedCertificates([]);
            setArchivedCertificateCount(0); // Reset count if error occurs
        }
    };

    const handleOpenArchiveModal = () => {
        fetchArchivedCertificates();
        setIsArchivedModalOpen(true);
        setArchivedSuccessMessage(""); // Clear any existing messages
    };

    useEffect(() => {
        fetchArchivedCertificates(); // Fetch the certificates and update the count when the component loads
    }, []);

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
            setCertificateUpdateRequests(response.data);
            setCertificateUpdateRequestCount(response.data.length); // Set the count of requests
        } catch (error) {
            console.error("Error fetching update requests:", error);
        }
    };

    const handleOpenUpdateRequestModal = () => {
        fetchCertificateUpdateRequests();
        setIsUpdateRequestModalOpen(true);
    };
    useEffect(() => {
        fetchCertificateUpdateRequests();
    }, []);

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
                    fetchCertificateUpdateRequests(); // Re-fetch after rejecting to update the list and count
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

    // functions for certificate requests filtering
    const handleRequestDepartmentChange = (event) => {
        const department = event.target.value;
        setSelectedRequestDepartment(department);

        let filtered = [...certificateRequests];

        if (department !== "") {
            filtered = filtered.filter((request) => {
                // Find the employee matching the request's user_id
                const employee = employees.find(
                    (emp) => emp.user_id === request.user_id,
                );
                return employee && employee.department === department;
            });
        }

        // Apply search filter if exists
        if (requestSearchQuery) {
            filtered = filtered.filter(
                (request) =>
                    request.employee_name
                        .toLowerCase()
                        .includes(requestSearchQuery.toLowerCase()) ||
                    request.certificate_name
                        .toLowerCase()
                        .includes(requestSearchQuery.toLowerCase()) ||
                    request.user_id?.toString().includes(requestSearchQuery) ||
                    new Date(request.issued_date)
                        .toLocaleDateString()
                        .includes(requestSearchQuery),
            );
        }

        setFilteredRequests(filtered);
    };

    const handleRequestSearchChange = (event) => {
        const query = event.target.value.toLowerCase();
        setRequestSearchQuery(query);

        let filtered = [...certificateRequests];

        // Apply department filter if selected
        if (selectedRequestDepartment) {
            filtered = filtered.filter((request) => {
                const employee = employees.find(
                    (emp) => emp.user_id === request.user_id,
                );
                return (
                    employee &&
                    employee.department === selectedRequestDepartment
                );
            });
        }

        // Apply search filter
        if (query) {
            filtered = filtered.filter(
                (request) =>
                    request.employee_name.toLowerCase().includes(query) ||
                    request.certificate_name.toLowerCase().includes(query) ||
                    request.user_id?.toString().includes(query) ||
                    new Date(request.issued_date)
                        .toLocaleDateString()
                        .includes(query),
            );
        }

        setFilteredRequests(filtered);
    };

    // initialize filteredRequests when certificateRequests changes
    useEffect(() => {
        if (activeButton === "certificateRequests") {
            fetchCertificateRequests();
        }
    }, [activeButton]);

    // When certificate requests are fetched, initialize filtered requests
    useEffect(() => {
        if (certificateRequests.length > 0) {
            const requestsWithDepartment = certificateRequests.map(
                (request) => {
                    const employee = employees.find(
                        (emp) => emp.user_id === request.user_id,
                    );
                    return {
                        ...request,
                        department: employee?.department || "Unknown",
                    };
                },
            );
            setFilteredRequests(requestsWithDepartment);
            setSelectedRequestDepartment("");
            setRequestSearchQuery("");
        }
    }, [certificateRequests, employees]);

    useEffect(() => {
        if (certificateRequests.length > 0 && selectedRequestDepartment) {
            handleRequestDepartmentChange({
                target: { value: selectedRequestDepartment },
            });
        }
    }, [selectedRequestDepartment, certificateRequests]);

    const fetchRejectedDocuments = async () => {
        try {
            // Fetch the rejected certificate requests from the backend API
            const response = await axiosClient.get("/rejected-certificates");
            const { count, data } = response.data;

            console.log("Rejected documents count:", count); // Log the count
            console.log("Rejected documents:", data); // Log the data

            // Set the rejected documents to the state
            setRejectedDocuments(data);
        } catch (error) {
            console.error("Error fetching rejected documents:", error);
        }
    };

    // Trigger fetching rejected documents when the modal is opened
    useEffect(() => {
        if (isRejectedModalOpen) {
            fetchRejectedDocuments(); // Filter rejected documents when modal opens
        }
    }, [isRejectedModalOpen, certificateRequests]); // Ensure it runs when modal is opened and requests change

    const handleViewRemarks = (doc) => {
        if (doc.remarks) {
            setSelectedRemarks(doc.remarks);
        } else {
            setSelectedRemarks("No remarks available for this request."); // Provide a default message
        }
        setIsRemarksModalOpen(true);
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
                <nav className="grid grid-cols-2 ">
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
                        Employee Documents
                    </button>
                    {/* <button
                        className={`navButton ${activeButton === "certificateRequests" ? "active" : ""}`}
                        onClick={() => setActiveButton("certificateRequests")}
                    >
                        Documents Requests
                    </button> */}
                </nav>
            </div>

            {activeButton === "employeeList" && (
                <div className="w-full max-w-7xl mx-auto px-4 animated fadeInDown   sm:ml-0 text-black">
                    {/* Filters and Controls Section */}
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    Department
                                </label>
                                <select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
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
                                    value={searchEmployeeQuery}
                                    onChange={handleEmployeeSearchChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    &nbsp;
                                </label>
                                <button
                                    className="relative w-full p-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                                    onClick={handleOpenUpdateRequestModal}
                                >
                                    Documents Update Requests
                                    {certificateUpdateRequestCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {certificateUpdateRequestCount}
                                        </span>
                                    )}
                                </button>
                            </div> */}
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg">
                        {/* Mobile View */}
                        <div className="md:hidden">
                            <div className="max-h-[500px] overflow-y-auto p-4">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <div
                                            key={employee.user_id}
                                            className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h3 className="font-medium text-black">
                                                        {employee.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        ID: {employee.user_id}
                                                    </p>
                                                </div>
                                                <button
                                                    className="bg-green-700 px-4 py-2 rounded-lg text-white hover:bg-green-800 transition-colors"
                                                    onClick={() =>
                                                        handleViewModal(
                                                            employee,
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No employees found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
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
                                        {filteredEmployees.length > 0 ? (
                                            filteredEmployees.map(
                                                (employee) => (
                                                    <tr
                                                        key={employee.user_id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {employee.user_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {employee.name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                className="bg-green-700 px-4 py-2 rounded-lg text-white hover:bg-green-800 transition-colors mx-auto block"
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
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="3"
                                                    className="px-6 py-4 text-sm text-center text-gray-500"
                                                >
                                                    No employees found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeButton === "employeeCertificate" && (
                <div className="w-full max-w-7xl mx-auto px-4 animated fadeInDown">
                    {/* Filters and Controls Section */}
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm sm:ml-0 text-black">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    Department
                                </label>
                                <select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
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
                                    placeholder="Search certificate, name, ID, or date"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-black focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    &nbsp;
                                </label>
                                <button
                                    className="relative w-full p-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
                                    onClick={handleOpenArchiveModal}
                                >
                                    View Archived Documents
                                    {archivedCertificateCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {archivedCertificateCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg sm:ml-0 text-black">
                        {/* Mobile View */}
                        <div className="md:hidden">
                            <div className="max-h-[500px] overflow-y-auto p-4">
                                {filteredCertificates.length > 0 ? (
                                    filteredCertificates.map((cert) => {
                                        const status = getCertificateStatus(
                                            cert.expiring_date,
                                            cert.type,
                                        );
                                        const statusColor =
                                            status === "Expiring"
                                                ? "#f19c09"
                                                : status === "Expired"
                                                  ? "#ff0000"
                                                  : "rgb(34, 197, 94)";

                                        return (
                                            <div
                                                key={cert.id}
                                                className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-black">
                                                            {cert.employee_name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            ID: {cert.user_id}
                                                        </p>
                                                    </div>
                                                    <div
                                                        className="text-sm font-medium px-2 py-1 rounded"
                                                        style={{
                                                            backgroundColor:
                                                                statusColor,
                                                            color: "white",
                                                        }}
                                                    >
                                                        {status}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500">
                                                            Document
                                                        </p>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                cert.certificate_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Issued Date
                                                            </p>
                                                            <p className="text-sm">
                                                                {new Date(
                                                                    cert.issued_date,
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Expiring Date
                                                            </p>
                                                            <p className="text-sm">
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
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewCertificate(
                                                                cert,
                                                            )
                                                        }
                                                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    {cert.file_url && (
                                                        <button
                                                            onClick={() =>
                                                                handleOpenPdf(
                                                                    cert.file_url,
                                                                )
                                                            }
                                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                        >
                                                            <RiFileDownloadFill
                                                                size={20}
                                                            />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                cert.id,
                                                            )
                                                        }
                                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No documents found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User ID
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Document Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date Issued
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Expiring Date
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCertificates.length > 0 ? (
                                            filteredCertificates.map((cert) => {
                                                const status =
                                                    getCertificateStatus(
                                                        cert.expiring_date,
                                                        cert.type,
                                                    );
                                                const statusColor =
                                                    status === "Expiring"
                                                        ? "#f19c09"
                                                        : status === "Expired"
                                                          ? "#ff0000"
                                                          : "rgb(34, 197, 94)";

                                                return (
                                                    <tr
                                                        key={cert.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {cert.user_id}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {cert.employee_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {
                                                                cert.certificate_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(
                                                                cert.issued_date,
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className="px-2 py-1 text-sm font-medium rounded text-white"
                                                                style={{
                                                                    backgroundColor:
                                                                        statusColor,
                                                                }}
                                                            >
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            <div className="flex justify-center items-center space-x-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleOpenDetailModal(
                                                                            cert.id,
                                                                        )
                                                                    }
                                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                                >
                                                                    View Details
                                                                </button>
                                                                {cert.file_url && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenPdf(
                                                                                cert.file_url,
                                                                            )
                                                                        }
                                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                                    >
                                                                        <RiFileDownloadFill
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            cert.id,
                                                                        )
                                                                    }
                                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                                                >
                                                                    <MdDelete
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
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
                                                    className="px-6 py-4 text-sm text-center text-gray-500"
                                                >
                                                    No documents found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                        className="relative top-20 mx-auto p-5 border w-11/12 md:w-[32rem] shadow-lg rounded-lg bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Mobile View */}
                        <div className="md:hidden">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                                Document Details
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Employee Name
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    selectedCertificate.employee_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Certificate Name
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    selectedCertificate.certificate_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Date Issued
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {new Date(
                                                    selectedCertificate.issued_date,
                                                ).toLocaleDateString("en-US")}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Expiring Date
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {selectedCertificate.type ===
                                                "non-expirable"
                                                    ? "N/A"
                                                    : selectedCertificate.expiring_date
                                                      ? new Date(
                                                            selectedCertificate.expiring_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                        )
                                                      : ""}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Status
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {getCertificateStatus(
                                                    selectedCertificate.expiring_date,
                                                    selectedCertificate.type,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    {selectedCertificate.file_url && (
                                        <button
                                            className="w-full bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition-colors"
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
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                                        onClick={() =>
                                            handleOpenDetailModal(
                                                selectedCertificate.id,
                                            )
                                        }
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                                        onClick={() =>
                                            setShowCertificateModal(false)
                                        }
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <div className="mt-3">
                                <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4 text-center">
                                    Document Details
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Employee Name
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    selectedCertificate.employee_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Document Name
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {
                                                    selectedCertificate.certificate_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Date Issued
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {new Date(
                                                    selectedCertificate.issued_date,
                                                ).toLocaleDateString("en-US")}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Expiring Date
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {selectedCertificate.type ===
                                                "non-expirable"
                                                    ? "N/A"
                                                    : selectedCertificate.expiring_date
                                                      ? new Date(
                                                            selectedCertificate.expiring_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                        )
                                                      : ""}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600">
                                                Status
                                            </label>
                                            <p className="font-medium text-gray-900">
                                                {getCertificateStatus(
                                                    selectedCertificate.expiring_date,
                                                    selectedCertificate.type,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-center space-x-4 mt-6">
                                    {selectedCertificate.file_url && (
                                        <button
                                            className="bg-green-700 hover:bg-green-800 text-white py-2 px-6 rounded-lg transition-colors"
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
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors"
                                        onClick={() =>
                                            handleOpenDetailModal(
                                                selectedCertificate.id,
                                            )
                                        }
                                    >
                                        View Details
                                    </button>
                                    <button
                                        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg transition-colors"
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
                </div>
            )}

            {/* View Certificates Modal */}
            {isViewModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 text-black">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b">
                            <h2 className="text-2xl font-semibold text-gray-900">
                                Documents for {selectedEmployee?.name}
                            </h2>
                            {successMessage && (
                                <div className="mt-2 p-3 bg-green-100 border border-green-200 text-green-700 rounded-md">
                                    {successMessage}
                                </div>
                            )}
                        </div>

                        {/* Filters */}
                        <div className="px-6 py-3 border-b bg-gray-50 flex justify-center">
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Category
                                </label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    value={selectedCategory || ""}
                                    onChange={(e) =>
                                        handleCategorySelect(e.target.value)
                                    }
                                >
                                    <option value="">All Documents</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-auto">
                            {/* Mobile View */}
                            <div className="block md:hidden p-4 space-y-4">
                                {filteredCertificates.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No documents found.
                                    </div>
                                ) : (
                                    filteredCertificates.map((cert) => {
                                        const status = getCertificateStatus(
                                            cert.expiring_date,
                                            cert.type,
                                        );
                                        const statusColor = {
                                            Expiring: "bg-yellow-500",
                                            Expired: "bg-red-500",
                                            Active: "bg-green-500",
                                        }[status];

                                        return (
                                            <div
                                                key={cert.id}
                                                className="bg-white border rounded-lg shadow-sm overflow-hidden"
                                            >
                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span
                                                                className={`inline-block px-2 py-1 text-xs rounded ${cert.type === "expirable" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                                                            >
                                                                {cert.type ===
                                                                "expirable"
                                                                    ? "Expirable"
                                                                    : "Non-Expirable"}
                                                            </span>
                                                            <h3 className="mt-2 font-medium text-gray-900">
                                                                {
                                                                    cert.certificate_name
                                                                }
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {cert.category}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`px-2 py-1 text-xs font-medium text-white rounded ${statusColor}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                        <div>
                                                            <p className="text-gray-500">
                                                                Issued Date
                                                            </p>
                                                            <p>
                                                                {new Date(
                                                                    cert.issued_date,
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-gray-500">
                                                                Expiring Date
                                                            </p>
                                                            <p>
                                                                {cert.type ===
                                                                "non-expirable"
                                                                    ? "N/A"
                                                                    : cert.expiring_date
                                                                      ? new Date(
                                                                            cert.expiring_date,
                                                                        ).toLocaleDateString()
                                                                      : ""}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    cert.id,
                                                                )
                                                            }
                                                            className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                                                        >
                                                            <MdDelete
                                                                size={18}
                                                            />
                                                        </button>
                                                        {cert.file_url && (
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        cert.file_url,
                                                                    )
                                                                }
                                                                className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                                                            >
                                                                <RiFileDownloadFill
                                                                    size={18}
                                                                />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() =>
                                                                handleEditModal(
                                                                    cert,
                                                                )
                                                            }
                                                            className="flex-1 py-2 px-3 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                                        >
                                                            Update
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleGrantUpdateAccess(
                                                                    cert.id,
                                                                )
                                                            }
                                                            className="flex-1 py-2 px-3 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                                                        >
                                                            Grant Access
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenDetailModal(
                                                                    cert.id,
                                                                )
                                                            }
                                                            className="flex-1 py-2 px-3 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Type
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Category
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Issued Date
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Expiring Date
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCertificates.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan="7"
                                                    className="px-6 py-8 text-center text-gray-500"
                                                >
                                                    No documents found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCertificates.map((cert) => {
                                                const status =
                                                    getCertificateStatus(
                                                        cert.expiring_date,
                                                        cert.type,
                                                    );
                                                const statusColor = {
                                                    Expiring: "bg-yellow-500",
                                                    Expired: "bg-red-500",
                                                    Active: "bg-green-500",
                                                }[status];

                                                return (
                                                    <tr
                                                        key={cert.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`inline-block px-2 py-1 text-xs rounded ${cert.type === "expirable" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                                                            >
                                                                {cert.type ===
                                                                "expirable"
                                                                    ? "Expirable"
                                                                    : "Non-Expirable"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {cert.category}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {
                                                                cert.certificate_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(
                                                                cert.issued_date,
                                                            ).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {cert.type ===
                                                            "non-expirable"
                                                                ? "N/A"
                                                                : cert.expiring_date
                                                                  ? new Date(
                                                                        cert.expiring_date,
                                                                    ).toLocaleDateString()
                                                                  : ""}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-medium text-white rounded ${statusColor}`}
                                                            >
                                                                {status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            cert.id,
                                                                        )
                                                                    }
                                                                    className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                                                                    title="Delete"
                                                                >
                                                                    <MdDelete
                                                                        size={
                                                                            18
                                                                        }
                                                                    />
                                                                </button>
                                                                {cert.file_url && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenPdf(
                                                                                cert.file_url,
                                                                            )
                                                                        }
                                                                        className="p-2 text-white bg-green-500 rounded-md hover:bg-green-600"
                                                                        title="Download"
                                                                    >
                                                                        <RiFileDownloadFill
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() =>
                                                                        handleEditModal(
                                                                            cert,
                                                                        )
                                                                    }
                                                                    className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleGrantUpdateAccess(
                                                                            cert.id,
                                                                        )
                                                                    }
                                                                    className="px-3 py-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                                                                >
                                                                    Grant Access
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleOpenDetailModal(
                                                                            cert.id,
                                                                        )
                                                                    }
                                                                    className="px-3 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
                                                                >
                                                                    View Details
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <div className="flex justify-between gap-4">
                                <button
                                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
                                    onClick={() => {
                                        setIsViewModalOpen(false);
                                        setFilteredCertificates([]);
                                        setSelectedCategory(null);
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
                                    onClick={handleAddModal}
                                >
                                    Add Document
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Certificate Modal */}
            {isAddModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">Add Document</h2>
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
                                    Document Name
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
                                    Upload Document (PDF)
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
                            Edit Document
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
                                    Document Name
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
                                    Upload New Document (PDF)
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
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg w-full md:w-3/4 max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-black">
                        <div className="p-4 md:p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">
                                Archived Documents
                            </h2>

                            {archivedSuccessMessage && (
                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                    {archivedSuccessMessage}
                                </div>
                            )}

                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search archived certificates"
                                    className="w-full p-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    value={archivedSearchQuery}
                                    onChange={(e) =>
                                        setArchivedSearchQuery(e.target.value)
                                    }
                                />
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden flex-1 max-h-[450px] overflow-y-auto">
                                <div className="space-y-4">
                                    {filteredCertificates.length > 0 ? (
                                        filteredCertificates.map((cert) => (
                                            <div
                                                key={cert.id}
                                                className="bg-gray-50 rounded-lg p-4"
                                            >
                                                <div className="space-y-2 mb-4">
                                                    <div>
                                                        <label className="text-sm text-gray-600">
                                                            Document Name
                                                        </label>
                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                cert.certificate_name
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-600">
                                                            Date Issued
                                                        </label>
                                                        <p className="font-medium text-gray-900">
                                                            {cert.issued_date
                                                                ? new Date(
                                                                      cert.issued_date,
                                                                  ).toLocaleDateString()
                                                                : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-gray-600">
                                                            Employee ID
                                                        </label>
                                                        <p className="font-medium text-gray-900">
                                                            {cert.user_id}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleViewArchivedDetails(
                                                                cert,
                                                            )
                                                        }
                                                        className="flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleRecoverCertificate(
                                                                cert.id,
                                                            )
                                                        }
                                                        className="flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        <MdRestore size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            openDeleteConfirmModal(
                                                                cert,
                                                            )
                                                        }
                                                        className="flex items-center justify-center py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <MdDelete size={20} />
                                                    </button>
                                                    {cert.certificate_file_path && (
                                                        <button
                                                            onClick={() =>
                                                                handleOpenPdf(
                                                                    cert.certificate_file_path,
                                                                )
                                                            }
                                                            className="flex items-center justify-center py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                        >
                                                            <RiFileDownloadFill
                                                                size={20}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No archived documents found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block flex-1 overflow-y-auto">
                                <div className="overflow-auto max-h-[400px]">
                                    <table className="w-full border-collapse">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Document Name
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date Issued
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Employee ID
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredCertificates.length > 0 ? (
                                                filteredCertificates.map(
                                                    (cert) => (
                                                        <tr
                                                            key={cert.id}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {
                                                                    cert.certificate_name
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {cert.issued_date
                                                                    ? new Date(
                                                                          cert.issued_date,
                                                                      ).toLocaleDateString()
                                                                    : "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {cert.user_id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex justify-center space-x-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleViewArchivedDetails(
                                                                                cert,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRecoverCertificate(
                                                                                cert.id,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                                                                    >
                                                                        <MdRestore
                                                                            size={
                                                                                20
                                                                            }
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            openDeleteConfirmModal(
                                                                                cert,
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                                                    >
                                                                        <MdDelete
                                                                            size={
                                                                                20
                                                                            }
                                                                        />
                                                                    </button>
                                                                    {cert.certificate_file_path && (
                                                                        <button
                                                                            onClick={() =>
                                                                                handleOpenPdf(
                                                                                    cert.certificate_file_path,
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
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
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="px-6 py-4 text-center text-sm text-gray-500"
                                                    >
                                                        No archived documents
                                                        found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    className="bg-gray-500 px-6 py-2 rounded-lg text-white hover:bg-gray-600 transition-colors"
                                    onClick={() =>
                                        setIsArchivedModalOpen(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isArchivedDetailModalOpen && selectedArchivedCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="w-full md:w-3/4 max-w-2xl bg-white rounded-lg shadow-xl">
                        {/* Mobile View */}
                        <div className="md:hidden p-4">
                            <h2 className="text-xl font-bold mb-4 text-center text-gray-900">
                                Archived Document Details
                            </h2>
                            <div className="space-y-4 bg-gray-50 p-4 rounded-lg mb-4">
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Document Name
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {
                                            selectedArchivedCertificate.certificate_name
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Type
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.type}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Category
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.category}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Date Issued
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {new Date(
                                            selectedArchivedCertificate.issued_date,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Expiring Date
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.expiring_date
                                            ? new Date(
                                                  selectedArchivedCertificate.expiring_date,
                                              ).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Employee ID
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.user_id}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Created By
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.created_by}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">
                                        Updated By
                                    </label>
                                    <p className="font-medium text-gray-900">
                                        {selectedArchivedCertificate.updated_by}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button
                                    className="w-full bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 transition-colors"
                                    onClick={() =>
                                        handleRecoverCertificate(
                                            selectedArchivedCertificate.id,
                                        )
                                    }
                                >
                                    Recover
                                </button>
                                <button
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
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
                                    className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                    onClick={() =>
                                        setIsArchivedDetailModalOpen(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block p-8">
                            <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
                                Archived Document Details
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Document Name
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {
                                                selectedArchivedCertificate.certificate_name
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Type
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {selectedArchivedCertificate.type}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Category
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {
                                                selectedArchivedCertificate.category
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Date Issued
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {new Date(
                                                selectedArchivedCertificate.issued_date,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Expiring Date
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {selectedArchivedCertificate.expiring_date
                                                ? new Date(
                                                      selectedArchivedCertificate.expiring_date,
                                                  ).toLocaleDateString()
                                                : "N/A"}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Employee ID
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {
                                                selectedArchivedCertificate.user_id
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Created By
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {
                                                selectedArchivedCertificate.created_by
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Updated By
                                        </label>
                                        <p className="font-medium text-gray-900">
                                            {
                                                selectedArchivedCertificate.updated_by
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <button
                                    className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 transition-colors"
                                    onClick={() =>
                                        handleRecoverCertificate(
                                            selectedArchivedCertificate.id,
                                        )
                                    }
                                >
                                    Recover
                                </button>
                                <button
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
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
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                    onClick={() =>
                                        setIsArchivedDetailModalOpen(false)
                                    }
                                >
                                    Close
                                </button>
                            </div>
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
                            document? This action cannot be undone.
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

            {/* {isUpdateRequestModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50 text-black">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-xl font-bold text-black">
                                Document Update Requests
                            </h2>
                            {successMessage && (
                                <div className="bg-green-200 text-green-800 p-3 mt-3 rounded">
                                    {successMessage}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 max-h-[450px] overflow-auto p-4">
                            <div className="md:hidden space-y-4">
                                {certificateUpdateRequests.length > 0 ? (
                                    certificateUpdateRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                                        >
                                            <div className="space-y-2 mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Employee
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {request.employee_name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Document
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {
                                                            request.certificate_name
                                                        }
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Requested Date
                                                    </p>
                                                    <p className="text-sm">
                                                        {new Date(
                                                            request.requested_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {request.certificate_file_path && (
                                                    <button
                                                        onClick={() =>
                                                            handleOpenPdf(
                                                                request.file_url,
                                                            )
                                                        }
                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                    >
                                                        <RiFileDownloadFill
                                                            size={20}
                                                        />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        handleOpenUpdateModal(
                                                            request,
                                                        )
                                                    }
                                                    className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleReject(
                                                            request.id,
                                                            request.certificate_id,
                                                        )
                                                    }
                                                    className="flex-1 py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No update requests found.
                                    </div>
                                )}
                            </div>

                            <div className="hidden md:block">
                                <table className="w-full border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Employee Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Document Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Requested Date
                                            </th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {certificateUpdateRequests.length >
                                        0 ? (
                                            certificateUpdateRequests.map(
                                                (request) => (
                                                    <tr
                                                        key={request.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {
                                                                request.employee_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {
                                                                request.certificate_name
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(
                                                                request.requested_at,
                                                            ).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex justify-center items-center space-x-2">
                                                                {request.certificate_file_path && (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenPdf(
                                                                                request.file_url,
                                                                            )
                                                                        }
                                                                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                                                    >
                                                                        <RiFileDownloadFill
                                                                            size={
                                                                                18
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() =>
                                                                        handleOpenUpdateModal(
                                                                            request,
                                                                        )
                                                                    }
                                                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            request.id,
                                                                            request.certificate_id,
                                                                        )
                                                                    }
                                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-4 text-sm text-center text-gray-500"
                                                >
                                                    No update requests found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="p-4 border-t">
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                            Update Document
                        </h2>
                        <form onSubmit={handleUpdateSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Document Name
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
            )} */}
            {isDetailModalOpen && detailedCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-8 rounded-lg w-3/4 max-w-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-center">
                            Document Details
                        </h2>
                        <div className="text-black space-y-4 mb-6">
                            <p>
                                <strong className="font-semibold">
                                    Document Name:
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

            {/* {activeButton === "certificateRequests" && (
                <div className="w-full max-w-5xl mx-auto px-4 animated fadeInDown sm:ml-0 text-black">
            
                    <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    Department
                                </label>
                                <select
                                    value={selectedRequestDepartment} // Changed from selectedDepartment
                                    onChange={handleRequestDepartmentChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dept) => (
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
                                    placeholder="Search certificate, name, ID, or date"
                                    value={requestSearchQuery} // Changed from searchQuery
                                    onChange={handleRequestSearchChange}
                                    className="w-full p-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm text-gray-600 mb-1">
                                    &nbsp;
                                </label>
                                <button
                                    onClick={() => setIsRejectedModalOpen(true)}
                                    className="w-full p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors relative"
                                >
                                    Rejected Documents
                                    {rejectedDocuments.length > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                            {rejectedDocuments.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="md:hidden">
                        <div className="space-y-4">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-white rounded-lg shadow-sm p-4"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-base font-medium">
                                                    {request.employee_name}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    ID: {request.id}
                                                </p>
                                            </div>
                                            <span className="px-2 py-1 text-sm bg-gray-200 rounded-full">
                                                {request.status}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm font-medium">
                                                Document:{" "}
                                                {request.certificate_name}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">
                                                    Issued Date
                                                </p>
                                                <p>
                                                    {new Date(
                                                        request.issued_date,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">
                                                    Expiring Date
                                                </p>
                                                <p>
                                                    {request.type ===
                                                    "non-expirable"
                                                        ? "N/A"
                                                        : request.expiring_date
                                                          ? new Date(
                                                                request.expiring_date,
                                                            ).toLocaleDateString()
                                                          : ""}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    handleApprove(request.id)
                                                }
                                                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleOpenRemarkModal(
                                                        request.id,
                                                    )
                                                }
                                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                            >
                                                Deny
                                            </button>
                                            {request.certificate_file_path && (
                                                <button
                                                    onClick={() =>
                                                        handleOpenPdf(
                                                            request.certificate_file_path,
                                                        )
                                                    }
                                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                                                >
                                                    <RiFileDownloadFill
                                                        size={20}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                                    No document requests found
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block bg-white rounded-lg shadow-sm">
                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Document Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Issued
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Expiring Date
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((request) => (
                                            <tr
                                                key={request.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {request.user_id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {request.employee_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {request.certificate_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-sm bg-gray-200 rounded-full">
                                                        {request.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {new Date(
                                                        request.issued_date,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {request.type ===
                                                    "non-expirable"
                                                        ? "N/A"
                                                        : request.expiring_date
                                                          ? new Date(
                                                                request.expiring_date,
                                                            ).toLocaleDateString()
                                                          : ""}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    request.id,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleOpenRemarkModal(
                                                                    request.id,
                                                                )
                                                            }
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                        >
                                                            Deny
                                                        </button>
                                                        {request.certificate_file_path && (
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        request.certificate_file_path,
                                                                    )
                                                                }
                                                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                <RiFileDownloadFill
                                                                    size={18}
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
                                                colSpan="7"
                                                className="px-6 py-4 text-center text-gray-500"
                                            >
                                                No document requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )} */}

            {/* Remark Modal */}
            {isRemarkModalOpen && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="md:hidden">
                        {/* Swipe indicator */}
                        <div className="w-full flex justify-center pt-2">
                            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                        </div>

                        <div className="p-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-900">
                                Enter Remark for Denial
                            </h2>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg mb-4 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows="4"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Enter your remark here..."
                            ></textarea>
                            <div className="flex flex-col space-y-2">
                                <button
                                    className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                    onClick={handleDeny}
                                >
                                    Deny Request
                                </button>
                                <button
                                    className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                    onClick={() => setIsRemarkModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block w-2/4 p-6 rounded-lg bg-white">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            Enter Remark for Denial
                        </h2>
                        <textarea
                            className="w-full h-60 p-3 border border-gray-200 rounded-lg mb-6 text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows="4"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter your remark here..."
                        ></textarea>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                onClick={handleDeny}
                            >
                                Deny Request
                            </button>
                            <button
                                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                                onClick={() => setIsRemarkModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isRejectedModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto text-black">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Rejected Documents
                            </h2>
                            <button
                                onClick={() => setIsRejectedModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Employee Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Document Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date Requested
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {rejectedDocuments.length > 0 ? (
                                        rejectedDocuments.map((doc) => (
                                            <tr
                                                key={doc.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                                                    {doc.employee_name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                                                    {doc.certificate_name}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-900">
                                                    {new Date(
                                                        doc.issued_date,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                                        {doc.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-xs">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() =>
                                                                handleViewRemarks(
                                                                    doc,
                                                                )
                                                            }
                                                            className="p-1 px-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                        >
                                                            View Remarks
                                                        </button>
                                                        {doc.certificate_file_path && (
                                                            <button
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        doc.certificate_file_path,
                                                                    )
                                                                }
                                                                className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                            >
                                                                View PDF
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-4 py-2 text-center text-gray-500"
                                            >
                                                No rejected documents found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {isRemarksModalOpen && selectedRemarks && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">
                                Rejection Remarks
                            </h3>
                            <button
                                onClick={() => setIsRemarksModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-700">{selectedRemarks}</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setIsRemarksModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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
