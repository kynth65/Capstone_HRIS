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
function Leave_Management() {
    const [activeButton, setActiveButton] = useState("documentGenerator");
    const refresh = useRefreshToken();
    const [loading, setLoading] = useState(false);
    const [documentType, setDocumentType] = useState("leaveLetter");
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

    const toggleDocumentGenerator = () => {
        setActiveButton("documentGenerator");
    };

    const toggleLeaveRequest = () => {
        setActiveButton("leaveRequest");
    };

    useEffect(() => {
        const fetchLeaveRequestStatus = async () => {
            try {
                const response = await axiosClient.get("/leave-request-status");
                const {
                    approvedLeaveRequests,
                    declinedLeaveRequests,
                    pendingLeaveRequests,
                } = response.data;

                setLeaveRequests({
                    approved: Object.values(approvedLeaveRequests),
                    declined: Object.values(declinedLeaveRequests),
                    pending: Object.values(pendingLeaveRequests),
                });
            } catch (error) {
                console.error("Error fetching leave request status:", error);
            }
        };

        fetchLeaveRequestStatus();
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
            setError("");
            // Reset form
            setFormData({
                file: null,
                filePreview: null,
                start_date: "",
                end_date: "",
            });
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

    const handleDownloadPdf = () => {
        const doc = new jsPDF();

        // Set font style and size
        doc.setFont("times", "normal"); // or "bold" / "italic" etc.
        doc.setFontSize(12);

        // Define margins and content
        const leftMargin = 8;
        const topMargin = 10;
        const lineHeight = 5;

        // Split text into lines to handle multi-line content
        const lines = doc.splitTextToSize(documentContent, 200); // Adjust width as needed
        let verticalOffset = topMargin;

        lines.forEach((line) => {
            doc.text(line, leftMargin, verticalOffset);
            verticalOffset += lineHeight;
        });

        // Save and download the PDF
        doc.save("generated_document.pdf");
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
                            Template Provider
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
                    <div className="bg-white rounded-xl p-4">
                        <div className="">
                            <h2 className="titles pt-5">
                                AI Letter Template Generator
                            </h2>
                            <div className="selector-container">
                                <label className="labels">
                                    Select Document Type:
                                    <select
                                        value={documentType}
                                        onChange={(e) =>
                                            setDocumentType(e.target.value)
                                        }
                                        className="select"
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
                                    </select>
                                </label>
                            </div>
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
                            className="button mt-2 mb-5"
                            onClick={handleGenerate}
                        >
                            Generate Document
                        </button>
                        <p className="text-black text-base mt-8 mb-3">
                            Wait for the document to be generated.
                        </p>
                        <textarea
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            rows="10"
                            cols="50"
                            placeholder="Wait for the document..."
                            className="h-full w-full rounded-lg p-9 text-black border-2 border-green-800 text-base"
                        />
                        <button className="button" onClick={handleDownloadPdf}>
                            Download PDF
                        </button>
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
                    <div className="leave-request-form bg-white p-6 rounded-xl text-black max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Submit Leave Request
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Start Date:
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-w-md mx-auto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    End Date:
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm max-w-md mx-auto"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
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
                                <div className="file-preview mt-2 text-center">
                                    {formData.file?.type.startsWith(
                                        "image/",
                                    ) ? (
                                        <img
                                            src={formData.filePreview}
                                            alt="Preview"
                                            className="max-w-xs mx-auto"
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full max-w-md mx-auto"
                            >
                                Submit Leave Request
                            </button>
                        </form>

                        {message && (
                            <p className="mt-4 text-green-600 text-center">
                                {message}
                            </p>
                        )}
                        {error && (
                            <p className="mt-4 text-red-600 text-center">
                                {error}
                            </p>
                        )}

                        <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4 text-center">
                                Your Leave Requests
                            </h3>
                            <div className="overflow-x-auto">
                                {/* Limit table height and make it scrollable */}
                                <div className="overflow-y-auto max-h-64">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    File
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Start Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    End Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Days
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200 text-black">
                                            {Object.entries(leaveRequests).map(
                                                ([status, requests]) =>
                                                    requests.map(
                                                        (request, index) => {
                                                            // Determine background color based on status
                                                            let rowClass = "";
                                                            if (
                                                                status ===
                                                                "approved"
                                                            ) {
                                                                rowClass =
                                                                    "bg-green-100"; // Green background for approved
                                                            } else if (
                                                                status ===
                                                                "declined"
                                                            ) {
                                                                rowClass =
                                                                    "bg-red-100"; // Red background for declined
                                                            }

                                                            return (
                                                                <tr
                                                                    key={`${status}-${index}`}
                                                                    className={`${rowClass}`} // Apply the dynamic class here
                                                                >
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <a
                                                                            href={`http://localhost:8000/storage/${request.file_path}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:underline"
                                                                        >
                                                                            {
                                                                                request.file_name
                                                                            }
                                                                        </a>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {new Date(
                                                                            request.start_date,
                                                                        ).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {new Date(
                                                                            request.end_date,
                                                                        ).toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {
                                                                            request.days_requested
                                                                        }
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        {
                                                                            request.statuses
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leave_Management;
