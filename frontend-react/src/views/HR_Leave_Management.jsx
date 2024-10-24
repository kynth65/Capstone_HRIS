import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { jsPDF } from "jspdf";
import { MdVisibility } from "react-icons/md";
import { RiFileDownloadFill } from "react-icons/ri";
import { useStateContext } from "../contexts/ContextProvider";
import Spinner from "./SpinnerLoading";

const HR_Leave_Management = () => {
    const { user } = useStateContext();
    const [activeButton, setActiveButton] = useState("leaveFormList");
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [documentType, setDocumentType] = useState("leaveLetter");
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

    const handleFormChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData((prev) => ({
                ...prev,
                file: files[0],
                filePreview: URL.createObjectURL(files[0]),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formDataObj = new FormData();
        formDataObj.append("start_date", formData.start_date);
        formDataObj.append("end_date", formData.end_date);
        if (formData.file) formDataObj.append("file", formData.file);

        try {
            const response = await axiosClient.post("/leave", formDataObj, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setSuccessMessage(response.data.message);
            setFormData({
                start_date: "",
                end_date: "",
                file: null,
                filePreview: null,
            });
        } catch (error) {
            setErrorMessage("Failed to submit leave request.");
            console.error("Error submitting leave request:", error);
        }
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
                <nav className="mb-6 grid grid-cols-3">
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
                        Template Provider AI
                    </button>
                    <button
                        className={`navButton ${activeButton === "leaveForm" ? "active" : ""}`}
                        onClick={() => toggleView("leaveForm")}
                    >
                        Submit Leave Form
                    </button>
                </nav>
            </div>

            <div className="bg-white p-10 rounded-lg">
                {activeButton === "leaveFormList" && (
                    <div className="overflow-y-auto max-h-[600px]">
                        {successMessage && (
                            <p className="text-green-600 mb-4">
                                {successMessage}
                            </p>
                        )}
                        {errorMessage && (
                            <p className="text-red-600 mb-4">{errorMessage}</p>
                        )}
                        <table className="employee-table table-auto w-full border-collapse border border-gray-300">
                            <thead className="bg-gray-100 text-black sticky top-[-1px] z-10">
                                <tr>
                                    <th className="p-2 border-b border-gray-300">
                                        Employee Name
                                    </th>
                                    <th className="p-2 border-b border-gray-300 hidden sm:table-cell">
                                        Date Requested
                                    </th>
                                    <th className="p-2 border-b border-gray-300 hidden sm:table-cell">
                                        Start Date
                                    </th>
                                    <th className="p-2 border-b border-gray-300 hidden sm:table-cell">
                                        End Date
                                    </th>
                                    <th className="p-2 border-b border-gray-300 hidden lg:table-cell">
                                        Days Requested
                                    </th>
                                    <th className="p-2 border-b border-gray-300 hidden lg:table-cell">
                                        Status
                                    </th>

                                    <th className="p-2 border-b border-gray-300">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveRequests.length > 0 ? (
                                    leaveRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className={`hover:bg-white text-black ${
                                                request.statuses === "pending"
                                                    ? "bg-green-100"
                                                    : "bg-red-100"
                                            }`}
                                        >
                                            <td className="p-2 border sm:text-base border-gray-300">
                                                {request.user_name}
                                            </td>
                                            <td className="p-2 border border-gray-300 hidden sm:table-cell">
                                                {formatDate(request.created_at)}
                                            </td>
                                            <td className="p-2 border border-gray-300 hidden sm:table-cell">
                                                {formatDate(request.start_date)}
                                            </td>
                                            <td className="p-2 border border-gray-300 hidden sm:table-cell">
                                                {formatDate(request.end_date)}
                                            </td>
                                            <td className="p-2 border border-gray-300 hidden lg:table-cell">
                                                {request.days_requested}
                                            </td>
                                            <td className="p-2 border border-gray-300 hidden lg:table-cell">
                                                {request.statuses}
                                            </td>

                                            <td className="p-2 border border-gray-300">
                                                <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                    <button
                                                        className="sm:hidden w-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                                                        onClick={() =>
                                                            openModal(request)
                                                        }
                                                    >
                                                        View
                                                    </button>
                                                    {user.position ===
                                                        "Human Resource Manager" && (
                                                        <>
                                                            {request.file_path && (
                                                                <button
                                                                    className="px-4 hidden py-1 sm:flex  bg-blue-600 text-white rounded text-sm font-normal hover:bg-blue-600"
                                                                    onClick={() =>
                                                                        handleOpenPdf(
                                                                            request.file_path,
                                                                        )
                                                                    }
                                                                >
                                                                    Form
                                                                </button>
                                                            )}
                                                            <button
                                                                className={`px-3 w-full py-1 rounded ${
                                                                    request.statuses ===
                                                                        "approved" ||
                                                                    request.statuses ===
                                                                        "declined"
                                                                        ? "bg-gray-300 cursor-not-allowed"
                                                                        : "bg-green-500 hover:bg-green-600 text-white"
                                                                }`}
                                                                onClick={() =>
                                                                    handleApprove(
                                                                        request.id,
                                                                    )
                                                                }
                                                                disabled={
                                                                    request.statuses ===
                                                                        "approved" ||
                                                                    request.statuses ===
                                                                        "declined"
                                                                }
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className={`w-full px-3 py-1 rounded ${
                                                                    request.statuses ===
                                                                        "declined" ||
                                                                    request.statuses ===
                                                                        "approved"
                                                                        ? "bg-gray-300 cursor-not-allowed"
                                                                        : "bg-red-500 hover:bg-red-600 text-white"
                                                                }`}
                                                                onClick={() =>
                                                                    openDeclineModal(
                                                                        request.id,
                                                                    )
                                                                } // Ensure request.id is passed correctly
                                                                disabled={
                                                                    request.statuses ===
                                                                        "declined" ||
                                                                    request.statuses ===
                                                                        "approved"
                                                                }
                                                            >
                                                                Decline
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
                                            colSpan="8"
                                            className="text-center p-4"
                                        >
                                            No leave requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && selectedRequest && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 md:w-[600px] shadow-lg rounded-md bg-white">
                            <div className="mt-3 text-center">
                                <h3 className="text-lg leading-6 font-semibold text-gray-900">
                                    Leave Request Details
                                </h3>
                                <div className="mt-2 px-7 py-3 text-st">
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>Employee:</strong>{" "}
                                        {selectedRequest.user_name}
                                    </p>
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>Date Requested:</strong>{" "}
                                        {formatDate(selectedRequest.created_at)}
                                    </p>
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>Start Date:</strong>{" "}
                                        {formatDate(selectedRequest.start_date)}
                                    </p>
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>End Date:</strong>{" "}
                                        {formatDate(selectedRequest.end_date)}
                                    </p>
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>Days Requested:</strong>{" "}
                                        {selectedRequest.days_requested}
                                    </p>
                                    <p className="font-bold text-lg text-gray-500">
                                        <strong>Status:</strong>{" "}
                                        {selectedRequest.statuses}
                                    </p>
                                </div>
                                {user.position === "Human Resource Manager" && (
                                    <div className="flex justify-center space-x-4 mt-4">
                                        <button
                                            className={`px-3 w-full py-1 rounded ${
                                                request.statuses ===
                                                    "approved" ||
                                                request.statuses === "declined"
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-green-500 hover:bg-green-600 text-white"
                                            }`}
                                            onClick={() =>
                                                handleApprove(
                                                    selectedRequest.id,
                                                )
                                            }
                                            disabled={
                                                request.statuses ===
                                                    "approved" ||
                                                request.statuses === "declined"
                                            }
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className={`w-full px-3 py-1 rounded ${
                                                request.statuses ===
                                                    "declined" ||
                                                request.statuses === "approved"
                                                    ? "bg-gray-300 cursor-not-allowed"
                                                    : "bg-red-500 hover:bg-red-600 text-white"
                                            }`}
                                            onClick={() =>
                                                openDeclineModal(
                                                    selectedRequest.id,
                                                )
                                            }
                                            disabled={
                                                request.statuses ===
                                                    "declined" ||
                                                request.statuses === "approved"
                                            }
                                        >
                                            Decline
                                        </button>
                                        <button
                                            className="w-full py-1  bg-blue-600 text-white rounded text-sm font-normal hover:bg-blue-800"
                                            onClick={() =>
                                                handleOpenPdf(
                                                    selectedRequest.file_path,
                                                )
                                            }
                                        >
                                            Form
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    id="ok-btn"
                                    className="w-full py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2"
                                    onClick={closeModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeButton === "templateProviderAI" && (
                    <div className="bg-white rounded-xl p-4 flex flex-col items-center">
                        <h2 className="titles">AI Letter Template Generator</h2>
                        <div className="selector-container">
                            <label className="labels font-kodchasan">
                                Select Document Type:
                                <select
                                    value={documentType}
                                    onChange={(e) =>
                                        setDocumentType(e.target.value)
                                    }
                                    className="select text-black"
                                >
                                    <option value="leaveLetter">
                                        Leave Letter
                                    </option>
                                    <option value="resignationLetter">
                                        Resignation Letter
                                    </option>
                                    <option value="appreciationLetter">
                                        Appreciation Letter
                                    </option>
                                    <option value="ThankyouLetter">
                                        Thankyou Letter
                                    </option>
                                    <option value="complaintLetter">
                                        Complaint Letter
                                    </option>
                                </select>
                            </label>
                        </div>
                        <div className="selector-container">
                            <label className="labels font-kodchasan">
                                Select Tone:
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="select text-black"
                                >
                                    <option value="formal">Formal</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="natural">Natural</option>
                                    <option value="friendly">Friendly</option>
                                </select>
                            </label>
                        </div>
                        <p className="text-black text-base mt-8 mb-3">
                            Enter a brief description of the document you want
                            to generate:
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
                )}

                {activeButton === "leaveForm" && (
                    <div className="bg-white rounded-xl max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold mb-10 text-black">
                            Submit Leave Form
                        </h2>
                        <form onSubmit={handleFormSubmit}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Start Date:
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                />
                            </label>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                End Date:
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                                />
                            </label>
                            <label className="block mb-4 text-sm font-medium text-gray-700">
                                Upload File (Optional):
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleFormChange}
                                    className="mt-1 block w-full"
                                />
                            </label>
                            <button
                                type="submit"
                                className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-950 w-full"
                            >
                                Submit Leave Request
                            </button>
                        </form>
                    </div>
                )}

                {showDeclineModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 md:w-[600px] shadow-lg rounded-md bg-white">
                            <h2 className="text-lg font-semibold mb-4">
                                Decline Leave Request
                            </h2>
                            <textarea
                                value={remarks} // Bind value to remarks state
                                onChange={(e) => setRemarks(e.target.value)} // Update remarks state
                                placeholder="Enter remarks for declining the leave request"
                                className="w-full p-2 border border-gray-300 rounded mb-4"
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
