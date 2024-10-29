import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { jsPDF } from "jspdf";
import { MdVisibility } from "react-icons/md";
import { RiFileDownloadFill } from "react-icons/ri";
import { useStateContext } from "../contexts/ContextProvider";
import Spinner from "./SpinnerLoading";
import { FaCheckCircle } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { X } from "lucide-react";

const HR_Leave_Management = () => {
    const { user } = useStateContext();
    const [activeButton, setActiveButton] = useState("leaveFormList");
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documentContent, setDocumentContent] = useState("");
    const [tone, setTone] = useState("formal");
    const [reason, setReason] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null); // Add this state
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [remarks, setRemarks] = useState(""); // Define remarks state

    const [formData, setFormData] = useState({
        start_date: "",
        end_date: "",
        file: null,
        filePreview: null,
    });

    useEffect(() => {
        if (activeButton === "leaveFormList") {
            axiosClient
                .get("/leave-request")
                .then((response) => {
                    const sortedRequests = sortLeaveRequests(
                        response.data.leaveRequests || [],
                    );
                    setLeaveRequests(sortedRequests);
                })
                .catch((error) => {
                    console.error("Error fetching leave requests:", error);
                    setErrorMessage("Failed to fetch leave requests.");
                });
        }
    }, [activeButton]);

    const sortLeaveRequests = (requests) => {
        return requests.sort((a, b) => {
            // Define the order of statuses
            const statusOrder = { pending: 0, approved: 1, declined: 2 };

            // Compare based on status order
            return statusOrder[a.statuses] - statusOrder[b.statuses];
        });
    };

    const handleApprove = async (requestId) => {
        try {
            const response = await axiosClient.post(
                `/leave-requests/${requestId}/approve`,
            );
            setSuccessMessage(response.data.message);
            setLeaveRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === requestId
                        ? { ...request, statuses: "approved" }
                        : request,
                ),
            );
            setTimeout(() => setSuccessMessage(""), 4000);
        } catch (error) {
            console.error("Error approving leave request:", error);
            setErrorMessage("Error approving request.");
        }
    };

    const openDeclineModal = (requestId) => {
        console.log("Opening decline modal for request ID:", requestId); // Debugging log
        setSelectedRequestId(requestId); // Store the request ID
        setShowDeclineModal(true); // Show the decline modal
    };

    const closeDeclineModal = () => {
        setShowDeclineModal(false);
        setRemarks(""); // Reset remarks field
        setSelectedRequestId(null);
    };

    const handleDecline = async () => {
        if (!selectedRequestId) {
            console.error("No request ID available for decline.");
            return;
        }
        try {
            const response = await axiosClient.post(
                `/leave-requests/${selectedRequestId}/decline`, // Use selectedRequestId
                { remarks }, // Send remarks along with the decline request
            );
            console.log("Decline request sent for ID:", selectedRequestId); // Debugging log
            setSuccessMessage(response.data.message);
            setLeaveRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === selectedRequestId
                        ? { ...request, statuses: "declined" }
                        : request,
                ),
            );
            setTimeout(() => setSuccessMessage(""), 4000);
            closeDeclineModal();
        } catch (error) {
            console.error("Error declining leave request:", error);
            setErrorMessage("Error declining request.");
        }
    };

    const generateDocumentContent = async () => {
        try {
            const response = await axiosClient.post("/generate-document", {
                documentType,
                reason,
                tone,
            });
            if (
                response.data.choices &&
                response.data.choices[0] &&
                response.data.choices[0].message
            ) {
                const generatedContent =
                    response.data.choices[0].message.content.trim();
                setDocumentContent(generatedContent);
            } else {
                setErrorMessage(
                    "Unexpected response structure from document generation.",
                );
                console.error("Unexpected response structure:", response.data);
            }
        } catch (error) {
            console.error("Error generating document:", error);
            setErrorMessage(
                "Failed to generate document. Please try again later.",
            );
        } finally {
            setIsGenerating(false);
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        if (documentType && reason) {
            setIsGenerating(true);
            setDocumentContent(""); // Clear any previous content
            generateDocumentContent();
        } else {
            alert("Please select a document type and provide a reason.");
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        const leftMargin = 8;
        const topMargin = 10;
        const lineHeight = 5;
        const lines = doc.splitTextToSize(documentContent, 200);
        let verticalOffset = topMargin;
        lines.forEach((line) => {
            doc.text(line, leftMargin, verticalOffset);
            verticalOffset += lineHeight;
        });
        doc.save("generated_document.pdf");
    };

    const toggleView = (view) => {
        setActiveButton(view);
    };

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const openModal = (request) => {
        setSelectedRequest(request);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedRequest(null);
    };

    const handleOpenPdf = (pdfUrl) => {
        // Check if the URL already has the backend URL prefix
        const backendBaseUrl = import.meta.env.VITE_BASE_URL;
        const fullUrl = pdfUrl.startsWith("http")
            ? pdfUrl
            : `${backendBaseUrl}/storage/${pdfUrl}`;

        if (fullUrl) {
            window.open(fullUrl, "_blank"); // Open the PDF in a new tab
        } else {
            alert("No PDF available for this file.");
        }
    };

    return (
        <>
            <div className="text-start">
                <nav className="mb-6 grid grid-cols-2">
                    <button
                        className={`navButton ${activeButton === "leaveFormList" ? "active" : ""}`}
                        onClick={() => toggleView("leaveFormList")}
                    >
                        Leave Form List
                    </button>
                    <button
                        className={`navButton ${activeButton === "templateProviderAI" ? "active" : ""}`}
                        onClick={() => toggleView("templateProviderAI")}
                    >
                        Template Generator
                    </button>
                </nav>
            </div>

            <div className="">
                {activeButton === "leaveFormList" && (
                    <div className="flex bg-white rounded-lg sm:ml-0 flex-col w-full pb-4 px-4">
                        {/* Messages */}
                        <div className="mb-4">
                            {successMessage && (
                                <p className="text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                                    {successMessage}
                                </p>
                            )}
                            {errorMessage && (
                                <p className="text-red-600 font-medium bg-red-50 p-3 rounded-lg">
                                    {errorMessage}
                                </p>
                            )}
                        </div>

                        {/* Status Legend */}
                        <div className="mb-4 flex flex-wrap gap-4">
                            {[
                                {
                                    label: "Pending",
                                    color: "gray",
                                    bg: "white",
                                },
                                {
                                    label: "Approved",
                                    color: "green",
                                    bg: "green",
                                },
                                { label: "Declined", color: "red", bg: "red" },
                            ].map((status) => (
                                <div
                                    key={status.label}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`w-4 h-4 border border-${status.color}-300 bg-${status.bg}-50`}
                                    ></div>
                                    <span className="text-sm text-gray-600">
                                        {status.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block relative rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-900 tracking-wider border-b">
                                            Employee Name
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-900 tracking-wider border-b">
                                            Start Date
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-900 tracking-wider border-b">
                                            End Date
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-900 tracking-wider border-b">
                                            Days Requested
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-900 tracking-wider border-b">
                                            Leave Balance
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-neutral-900 tracking-wider border-b ">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {leaveRequests.length > 0 ? (
                                        leaveRequests.map((request) => (
                                            <tr
                                                key={request.id}
                                                className={`hover:bg-opacity-80 transition-colors ${
                                                    request.statuses ===
                                                    "pending"
                                                        ? ""
                                                        : request.statuses ===
                                                            "approved"
                                                          ? "bg-green-50"
                                                          : "bg-red-50"
                                                }`}
                                            >
                                                <td className="px-6 py-4 text-sm text-neutral-900">
                                                    {request.user_name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-neutral-600">
                                                    {formatDate(
                                                        request.start_date,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-neutral-600">
                                                    {formatDate(
                                                        request.end_date,
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-neutral-600">
                                                    {request.days_requested}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-center text-neutral-600">
                                                    {request.sick_leave_balance}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    request,
                                                                )
                                                            }
                                                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                        >
                                                            View
                                                        </button>
                                                        {user.position ===
                                                            "Human Resource Manager" && (
                                                            <>
                                                                <button
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            request.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        request.statuses !==
                                                                        "pending"
                                                                    }
                                                                    className={`p-2 rounded-md ${
                                                                        request.statuses !==
                                                                        "pending"
                                                                            ? "bg-gray-100 text-gray-400"
                                                                            : "bg-green-600 text-white hover:bg-green-700"
                                                                    } transition-colors`}
                                                                >
                                                                    <FaCheckCircle className="w-5 h-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        openDeclineModal(
                                                                            request.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        request.statuses !==
                                                                        "pending"
                                                                    }
                                                                    className={`p-2 rounded-md ${
                                                                        request.statuses !==
                                                                        "pending"
                                                                            ? "bg-gray-100 text-gray-400"
                                                                            : "bg-red-600 text-white hover:bg-red-700"
                                                                    } transition-colors`}
                                                                >
                                                                    <RxCrossCircled className="w-5 h-5" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-4 text-center text-sm text-gray-500"
                                            >
                                                No leave requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {leaveRequests.length > 0 ? (
                                leaveRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className={`rounded-lg border p-4 ${
                                            request.statuses === "pending"
                                                ? "bg-white"
                                                : request.statuses ===
                                                    "approved"
                                                  ? "bg-green-50"
                                                  : "bg-red-50"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-neutral-900">
                                                    {request.user_name}
                                                </h3>
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-sm text-neutral-600">
                                                        <span className="font-medium">
                                                            Start:
                                                        </span>{" "}
                                                        {formatDate(
                                                            request.start_date,
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-neutral-600">
                                                        <span className="font-medium">
                                                            End:
                                                        </span>{" "}
                                                        {formatDate(
                                                            request.end_date,
                                                        )}
                                                    </p>
                                                    <p className="text-sm text-neutral-600">
                                                        <span className="font-medium">
                                                            Days:
                                                        </span>{" "}
                                                        {request.days_requested}
                                                    </p>
                                                    <p className="text-sm text-neutral-600">
                                                        <span className="font-medium">
                                                            Days:
                                                        </span>{" "}
                                                        {request.leave}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() =>
                                                        openModal(request)
                                                    }
                                                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                                >
                                                    View
                                                </button>
                                                {user.position ===
                                                    "Human Resource Manager" && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() =>
                                                                handleApprove(
                                                                    request.id,
                                                                )
                                                            }
                                                            disabled={
                                                                request.statuses !==
                                                                "pending"
                                                            }
                                                            className={`p-2 rounded-md ${
                                                                request.statuses !==
                                                                "pending"
                                                                    ? "bg-gray-100 text-gray-400"
                                                                    : "bg-green-600 text-white hover:bg-green-700"
                                                            } transition-colors`}
                                                        >
                                                            <FaCheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                openDeclineModal(
                                                                    request.id,
                                                                )
                                                            }
                                                            disabled={
                                                                request.statuses !==
                                                                "pending"
                                                            }
                                                            className={`p-2 rounded-md ${
                                                                request.statuses !==
                                                                "pending"
                                                                    ? "bg-gray-100 text-gray-400"
                                                                    : "bg-red-600 text-white hover:bg-red-700"
                                                            } transition-colors`}
                                                        >
                                                            <RxCrossCircled className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-gray-500 bg-white p-4 rounded-lg border">
                                    No leave requests found
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showModal && selectedRequest && (
                    <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20 p-4">
                        <div className="relative top-10 mx-auto border shadow-lg rounded-lg bg-white max-w-lg">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b flex justify-between items-center">
                                <h3 className="text-lg md:text-xl font-semibold text-neutral-900">
                                    Leave Request Details
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-neutral-500 hover:text-neutral-700 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[
                                        {
                                            label: "Employee",
                                            value: selectedRequest.user_name,
                                        },
                                        {
                                            label: "Date Requested",
                                            value: formatDate(
                                                selectedRequest.created_at,
                                            ),
                                        },
                                        {
                                            label: "Start Date",
                                            value: formatDate(
                                                selectedRequest.start_date,
                                            ),
                                        },
                                        {
                                            label: "End Date",
                                            value: formatDate(
                                                selectedRequest.end_date,
                                            ),
                                        },
                                        {
                                            label: "Days Requested",
                                            value: selectedRequest.days_requested,
                                        },
                                        {
                                            label: "Status",
                                            value: selectedRequest.statuses,
                                            isStatus: true,
                                        },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-2 gap-4"
                                        >
                                            <span className="text-sm text-neutral-500">
                                                {item.label}:
                                            </span>
                                            {item.isStatus ? (
                                                <span
                                                    className={`text-sm font-medium capitalize ${
                                                        selectedRequest.statuses ===
                                                        "approved"
                                                            ? "text-green-600"
                                                            : selectedRequest.statuses ===
                                                                "declined"
                                                              ? "text-red-600"
                                                              : "text-yellow-600"
                                                    }`}
                                                >
                                                    {item.value}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-neutral-900">
                                                    {item.value}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                {user.position === "Human Resource Manager" && (
                                    <div className="mt-8 space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() =>
                                                    handleApprove(
                                                        selectedRequest.id,
                                                    )
                                                }
                                                disabled={
                                                    selectedRequest.statuses !==
                                                    "pending"
                                                }
                                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedRequest.statuses !==
                                                    "pending"
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-green-600 text-white hover:bg-green-700"
                                                }`}
                                            >
                                                Approve Request
                                            </button>
                                            <button
                                                onClick={() =>
                                                    openDeclineModal(
                                                        selectedRequest.id,
                                                    )
                                                }
                                                disabled={
                                                    selectedRequest.statuses !==
                                                    "pending"
                                                }
                                                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                                    selectedRequest.statuses !==
                                                    "pending"
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        : "bg-red-600 text-white hover:bg-red-700"
                                                }`}
                                            >
                                                Decline Request
                                            </button>
                                        </div>

                                        {selectedRequest.file_path && (
                                            <button
                                                onClick={() =>
                                                    handleOpenPdf(
                                                        selectedRequest.file_path,
                                                    )
                                                }
                                                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                View Form
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Close Button - Always at bottom */}
                                <div className="mt-6">
                                    <button
                                        onClick={closeModal}
                                        className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeButton === "templateProviderAI" && (
                    <>
                        <div className="md:mr-0">
                            <div className="bg-white p-6 rounded-xl flex flex-col items-center">
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
                                            <option value="formal">
                                                Formal
                                            </option>
                                            <option value="neutral">
                                                Neutral
                                            </option>
                                            <option value="natural">
                                                Natural
                                            </option>
                                            <option value="friendly">
                                                Friendly
                                            </option>
                                        </select>
                                    </label>
                                </div>
                                <p className="text-black text-base mt-8 mb-3">
                                    Enter a brief description of the document
                                    you want to generate:
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
                                                setDocumentContent(
                                                    e.target.value,
                                                )
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
                    </>
                )}

                {showDeclineModal && (
                    <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative mx-auto p-5 border w-11/12 sm:w-96 md:w-[600px] shadow-lg rounded-md bg-white">
                            <h2 className="text-lg font-semibold mb-4 text-black">
                                Decline Leave Request
                            </h2>
                            <textarea
                                value={remarks} // Bind value to remarks state
                                onChange={(e) => setRemarks(e.target.value)} // Update remarks state
                                placeholder="Enter remarks for declining the leave request"
                                className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
                                rows="5"
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={closeDeclineModal}
                                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDecline}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default HR_Leave_Management;
