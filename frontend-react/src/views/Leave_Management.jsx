import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient"; // Import axiosClient
import "../styles/registration.css";
import "../styles/global.css";
import "../styles/LeaveRequest.css";
import "../styles/documentGenerator.css";
import "../styles/hrDashboard.css";
import useRefreshToken from "../hooks/useRefreshToken";
import useDocument from "../hooks/useDocuments";
import { MdDelete, MdEdit } from "react-icons/md";
import { jsPDF } from "jspdf";
import { RiFileDownloadFill } from "react-icons/ri";

function Leave_Management() {
    const [activeButton, setActiveButton] = useState("documentGenerator");
    const refresh = useRefreshToken();
    const [loading, setLoading] = useState(false);
    const [documentType, setDocumentType] = useState("");
    const [documentContent, setDocumentContent] = useState("");
    const [formData, setFormData] = useState({
        file: null,
        filePreview: null,
        start_date: "",
        end_date: "",
    });
    const [leaveRequests, setLeaveRequests] = useState({
        approved: [],
        declined: [],
        pending: [],
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const errorTimeoutRef = useRef(null);
    const [pdfUrl, setPdfUrl] = useState(null); // State to hold the selected PDF URL
    const [reason, setReason] = useState("");
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null); // Track selected request
    const [isGenerating, setIsGenerating] = useState(false);
    const [tone, setTone] = useState("formal"); // Default tone can be 'formal' or any other option

    // For Leave Form
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            const file = files[0];
            const filePreview = file ? URL.createObjectURL(file) : null;
            setFormData((prev) => ({
                ...prev,
                file,
                filePreview,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const removeFile = () => {
        setFormData((prev) => ({
            ...prev,
            file: null,
            filePreview: null,
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const toggleDocumentGenerator = () => {
        setActiveButton("documentGenerator");
    };

    const toggleLeaveRequest = () => {
        setActiveButton("leaveRequest");
    };

    const fetchLeaveRequestStatus = async () => {
        try {
            const response = await axiosClient.get("/leave-request-status");
            const {
                approvedLeaveRequests,
                declinedLeaveRequests,
                pendingLeaveRequests,
            } = response.data;

            // Convert the objects to arrays and add status property
            const approved = Object.values(approvedLeaveRequests).map(
                (req) => ({
                    ...req,
                    status: "approved",
                }),
            );
            const declined = Object.values(declinedLeaveRequests).map(
                (req) => ({
                    ...req,
                    status: "declined",
                }),
            );
            const pending = Object.values(pendingLeaveRequests).map((req) => ({
                ...req,
                status: "pending",
            }));

            // Combine all requests and sort
            const allRequests = [...approved, ...declined, ...pending].sort(
                (a, b) => {
                    // First prioritize pending requests
                    if (a.status === "pending" && b.status !== "pending")
                        return -1;
                    if (a.status !== "pending" && b.status === "pending")
                        return 1;

                    // For non-pending requests, sort by date (newest first)
                    if (a.status !== "pending" && b.status !== "pending") {
                        return new Date(b.start_date) - new Date(a.start_date);
                    }

                    // For pending requests, sort by date (newest first)
                    return new Date(b.start_date) - new Date(a.start_date);
                },
            );

            // Group the sorted requests by status
            const groupedRequests = {
                approved: allRequests.filter(
                    (req) => req.status === "approved",
                ),
                declined: allRequests.filter(
                    (req) => req.status === "declined",
                ),
                pending: allRequests.filter((req) => req.status === "pending"),
            };

            setLeaveRequests(groupedRequests);
        } catch (error) {
            console.error("Error fetching leave request status:", error);
        }
    };

    const getSortedRequests = (leaveRequests) => {
        const allRequests = [
            ...(leaveRequests.pending || []).map((req) => ({
                ...req,
                status: "pending",
            })),
            ...(leaveRequests.approved || []).map((req) => ({
                ...req,
                status: "approved",
            })),
            ...(leaveRequests.declined || []).map((req) => ({
                ...req,
                status: "declined",
            })),
        ].sort((a, b) => {
            // Pending requests always come first
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;

            // For non-pending requests, sort by date (newest first)
            return new Date(b.start_date) - new Date(a.start_date);
        });

        return allRequests;
    };

    useEffect(() => {
        fetchLeaveRequestStatus(); // Fetch leave requests when the component loads
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.file || !formData.start_date || !formData.end_date) {
            setError("Please fill in all required fields.");
            return;
        }

        const formDataObj = new FormData();
        formDataObj.append("file", formData.file);
        formDataObj.append("start_date", formData.start_date);
        formDataObj.append("end_date", formData.end_date);

        try {
            const response = await axiosClient.post("/leave", formDataObj, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage(response.data.message);
            setTimeout(() => {
                setMessage(null);
            }, 2000);
            setError("");
            // Reset form
            setFormData({
                file: null,
                filePreview: null,
                start_date: "",
                end_date: "",
            });
            // Fetch updated leave requests to show the newly added request
            fetchLeaveRequestStatus();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "There was an error submitting the leave request.",
            );
        }
    };

    // for Document Generator
    const generateDocumentContent = async () => {
        try {
            const response = await axiosClient.post("/generate-document", {
                documentType,
                reason,
            });

            // Debug: Log the entire response to understand the structure
            console.log("Document generation response:", response.data);

            // Check if the response data has the expected structure
            if (
                response.data.choices &&
                response.data.choices[0] &&
                response.data.choices[0].message
            ) {
                const generatedContent =
                    response.data.choices[0].message.content.trim();
                setDocumentContent(generatedContent);
            } else {
                setError(
                    "Unexpected response structure from document generation.",
                );
                console.error("Unexpected response structure:", response.data);
            }
        } catch (error) {
            console.error("Error generating document:", error);
            setError("Failed to generate document. Please try again later.");
        }
    };

    const handleGenerate = () => {
        if (documentType && reason) {
            setLoading(true);
            generateDocumentContent();
        } else {
            alert("Please select a document type and provide a reason.");
        }
    };

    const handleDownloadPdf = (filePath) => {
        if (filePath) {
            const baseUrl = import.meta.env.VITE_BASE_URL;
            const fullUrl = filePath.startsWith("http")
                ? filePath // Use the URL as is if it's already a full URL
                : `${baseUrl}/storage/${filePath}`; // Construct the URL based on the base URL

            console.log(fullUrl); // Log the full URL to ensure it's being passed correctly
            window.open(fullUrl, "_blank"); // Open the PDF in a new browser tab
        } else {
            alert("No PDF available for this file.");
        }
    };

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "documentGenerator"
                                    ? "active"
                                    : ""
                            }`}
                            onClick={toggleDocumentGenerator}
                        >
                            Template Generator
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "leaveRequest" ? "active" : ""
                            }`}
                            onClick={toggleLeaveRequest}
                        >
                            Leave Form
                        </button>
                    </li>
                </ul>
            </nav>

            <div>
                {activeButton === "documentGenerator" && (
                    <div>
                        <div className="bg-white p-10 rounded-xl flex flex-col items-center">
                            <h2 className="titles">
                                AI Letter Template Generator
                            </h2>
                            <div className="selector-container">
                                <label className="labels font-kodchasan mb-2 block">
                                    Document Type:
                                    <input
                                        type="text"
                                        value={documentType}
                                        onChange={(e) =>
                                            setDocumentType(e.target.value)
                                        }
                                        placeholder="Enter document type"
                                        className="input w-full px-3 py-2 border rounded-md text-black"
                                    />
                                </label>
                            </div>
                            <div className="selector-container">
                                <label className="labels font-kodchasan">
                                    Select Tone:
                                    <select
                                        value={tone}
                                        onChange={(e) =>
                                            setTone(e.target.value)
                                        }
                                        className="select text-black"
                                    >
                                        <option value="formal">Formal</option>
                                        <option value="neutral">Neutral</option>
                                        <option value="natural">Natural</option>
                                        <option value="friendly">
                                            Friendly
                                        </option>
                                    </select>
                                </label>
                            </div>
                            <p className="text-black text-base mt-8 mb-3">
                                Enter a brief description of the document you
                                want to generate:
                            </p>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows="3"
                                cols="50"
                                placeholder="Enter the reason for the document..."
                                className="h-40 w-full rounded-lg p-9 text-black border-2 border-green-800 text-base"
                            />
                            <button
                                className="button mt-2 mb-5 font-kodchasan"
                                onClick={handleGenerate}
                            >
                                Generate Document
                            </button>

                            {isGenerating ? (
                                <div>
                                    <Spinner size="30" />
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={documentContent}
                                        onChange={(e) =>
                                            setDocumentContent(e.target.value)
                                        }
                                        rows="10"
                                        cols="50"
                                        placeholder="Wait for the document..."
                                        className="h-full w-full mb-4 rounded-lg p-9 text-black border-2 border-green-800 text-base"
                                    />
                                    <button
                                        className="button font-kodchasan"
                                        onClick={handleDownloadPdf}
                                    >
                                        Download PDF
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {/* PDF Modal */}
                {isPdfModalOpen && pdfUrl && (
                    <div
                        className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        onClick={() => setIsPdfModalOpen(false)}
                    >
                        <div className="transparent p-6 rounded-xl w-3/4 xl:w-3/4 h-full text-black overflow-hidden flex flex-col">
                            <div className="mb-4 float-right flex justify-end">
                                <button
                                    className="bg-red-600 px-4 py-2 rounded-md text-white font-normal hover:bg-red-900 transition"
                                    onClick={() => setIsPdfModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <iframe
                                src={pdfUrl}
                                title="Generated Document"
                                width="100%"
                                height="750px"
                            />
                        </div>
                    </div>
                )}
                {activeButton === "leaveRequest" && (
                    <div className="bg-white p-4 md:p-6 rounded-xl text-black max-w-4xl mx-auto">
                        {/* Mobile Form */}
                        <div className="md:hidden">
                            <h2 className="text-xl  mb-4 text-center">
                                Submit Leave Request
                            </h2>
                            {message && (
                                <p className="success-message px-36 bg-green-100 text-green-700 p-2 rounded mb-4">
                                    {message}
                                </p>
                            )}
                            {error && (
                                <p className="mt-4 text-red-600 text-center">
                                    {error}
                                </p>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm mr-2 font-medium text-neutral-700">
                                        Start Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm mr-2 font-medium text-neutral-700">
                                        End Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="w-full p-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm mr-2 font-medium text-neutral-700">
                                        File:
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={handleChange}
                                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                    />
                                </div>
                                {formData.filePreview && (
                                    <div className="mt-2 flex items-center justify-center bg-neutral-50 p-2 rounded-lg">
                                        <div className="truncate">
                                            {formData.file?.type.startsWith(
                                                "image/",
                                            ) ? (
                                                <img
                                                    src={formData.filePreview}
                                                    alt="Preview"
                                                    className="h-20 w-auto"
                                                />
                                            ) : (
                                                <p className="text-sm">
                                                    {formData.file?.name}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="ml-2 p-2 text-red-500 hover:text-red-700"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-green-600 text-white p-3 rounded-lg font-medium hover:bg-green-700 transition"
                                >
                                    Submit Request
                                </button>
                            </form>
                        </div>

                        {/* Desktop Form */}
                        <div className="hidden md:block">
                            <h2 className="text-2xl  mb-4 text-center">
                                Submit Leave Request
                            </h2>
                            {message && (
                                <p className="success-message px-36 bg-green-100 text-green-700 p-2 rounded mb-4">
                                    {message}
                                </p>
                            )}
                            {error && (
                                <div className="error-message bg-red-100 text-red-700 p-2 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">
                                        Start Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm max-w-md mx-auto"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">
                                        End Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formData.end_date}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm max-w-md mx-auto"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">
                                        File:
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        onChange={handleChange}
                                        className="mt-1 block w-full max-w-md mx-auto"
                                    />
                                </div>
                                {formData.filePreview && (
                                    <div className="py-2 mt-2  flex items-center justify-center">
                                        {formData.file?.type.startsWith(
                                            "image/",
                                        ) ? (
                                            <img
                                                src={formData.filePreview}
                                                alt="Preview"
                                                className="max-w-xs max-h-lg"
                                            />
                                        ) : (
                                            <p>{formData.file?.name}</p>
                                        )}
                                        <button
                                            onClick={removeFile}
                                            className="ml-2 text-red-500"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="bg-green-600 text-white px-4 py-2 rounded w-full max-w-md mx-auto hover:bg-green-800 transition"
                                >
                                    Submit Leave Request
                                </button>
                            </form>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl mb-4 text-center">
                                History
                            </h3>

                            {/* Mobile Leave Requests */}
                            <div className="md:hidden">
                                <div className="space-y-3 max-h-[360px] overflow-y-auto px-2">
                                    {getSortedRequests(leaveRequests).map(
                                        (request, index) => {
                                            let statusColor = "bg-neutral-50";
                                            if (request.status === "approved")
                                                statusColor = "bg-green-50";
                                            if (request.status === "declined")
                                                statusColor = "bg-red-50";
                                            if (request.status === "pending")
                                                statusColor = "bg-yellow-50";

                                            return (
                                                <div
                                                    key={index}
                                                    className={`${statusColor} p-4 rounded-lg space-y-2 shadow-sm`}
                                                    onClick={() => {
                                                        setSelectedRequest(
                                                            request,
                                                        );
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <div className="flex flex-col justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="text-sm">
                                                                {formatDate(
                                                                    request.start_date,
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDate(
                                                                    request.end_date,
                                                                )}
                                                            </div>
                                                            <div className="font-medium">
                                                                {
                                                                    request.days_requested
                                                                }{" "}
                                                                days
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium">
                                                                {
                                                                    request.statuses
                                                                }
                                                            </div>
                                                            {request.remarks && (
                                                                <div className="text-xs text-neutral-600 mt-1">
                                                                    {
                                                                        request.remarks
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 flex justify-end border-t border-neutral-200">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadPdf(
                                                                    request.file_path,
                                                                );
                                                            }}
                                                            className="p-2 text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                                                        >
                                                            <RiFileDownloadFill
                                                                size={16}
                                                            />
                                                            Download
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                            {/* Desktop Leave Requests */}
                            <div className="hidden md:block overflow-x-auto">
                                <div className="overflow-auto max-h-64">
                                    <table className="min-w-full divide-y divide-neutral-200">
                                        <thead className="bg-neutral-50 sticky top-[-2px] z-10">
                                            <tr className="text-center">
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    Start Date
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    End Date
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    Days
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    Remarks
                                                </th>
                                                <th className="px-6 py-3 text-xs font-medium text-black uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-neutral-200 text-black">
                                            {getSortedRequests(
                                                leaveRequests,
                                            ).map((request, index) => {
                                                // Determine background color based on the request status
                                                let rowClass = "";
                                                if (
                                                    request.status ===
                                                    "approved"
                                                )
                                                    rowClass = "bg-green-50";
                                                if (
                                                    request.status ===
                                                    "declined"
                                                )
                                                    rowClass = "bg-red-50";

                                                return (
                                                    <tr
                                                        key={index}
                                                        className={rowClass}
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(
                                                                request.start_date,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {formatDate(
                                                                request.end_date,
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {
                                                                request.days_requested
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {request.statuses}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            {request.remarks ||
                                                                "No remarks"}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleDownloadPdf(
                                                                        request.file_path,
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center p-2 rounded-lg text-white bg-green-600 hover:bg-green-700"
                                                                title="Download PDF"
                                                            >
                                                                <RiFileDownloadFill
                                                                    size={20}
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedRequest(
                                                                        request,
                                                                    );
                                                                    setIsModalOpen(
                                                                        true,
                                                                    );
                                                                }}
                                                                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 text-sm font-medium"
                                                            >
                                                                Show Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {isModalOpen && selectedRequest && (
                    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white text-left text- p-6 rounded-xl w-3/4 lg:w-1/3 shadow-lg text-black text-sm md:text-base max-h-96 overflow-auto">
                            <h2 className="text-xl mb-4">
                                Leave Request Details
                            </h2>
                            <p>
                                <strong>Start Date:</strong>{" "}
                                {formatDate(selectedRequest.start_date)}
                            </p>
                            <p>
                                <strong>End Date:</strong>{" "}
                                {formatDate(selectedRequest.end_date)}
                            </p>
                            <p>
                                <strong>Days Requested:</strong>{" "}
                                {selectedRequest.days_requested}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedRequest.statuses}
                            </p>
                            <p>
                                <strong>Remarks:</strong>{" "}
                                {selectedRequest.remarks || "No remarks"}
                            </p>
                            <p>
                                <strong>File:</strong>{" "}
                                <a
                                    href={`${import.meta.env.VITE_BASE_URL}/storage/${selectedRequest.file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    View File
                                </a>
                            </p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leave_Management;
