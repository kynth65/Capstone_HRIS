import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { jsPDF } from "jspdf";

const HR_Leave_Management = () => {
    const [activeButton, setActiveButton] = useState("leaveFormList");
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [documentType, setDocumentType] = useState("leaveLetter");
    const [documentContent, setDocumentContent] = useState("");
    const [reason, setReason] = useState("");
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
                    setLeaveRequests(response.data.leaveRequests || []);
                })
                .catch((error) => {
                    console.error("Error fetching leave requests:", error);
                    setErrorMessage("Failed to fetch leave requests.");
                });
        }
    }, [activeButton]);

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

    const handleDecline = async (requestId) => {
        try {
            const response = await axiosClient.post(
                `/leave-requests/${requestId}/decline`,
            );
            setSuccessMessage(response.data.message);
            setLeaveRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === requestId
                        ? { ...request, statuses: "declined" }
                        : request,
                ),
            );
            setTimeout(() => setSuccessMessage(""), 4000);
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
        }
    };

    const handleGenerate = () => {
        if (documentType && reason) {
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

    return (
        <>
            <div className="text-start">
                <nav className="mb-6">
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
                                    <th className="p-2 border-b border-gray-300">
                                        Start Date
                                    </th>
                                    <th className="p-2 border-b border-gray-300">
                                        End Date
                                    </th>
                                    <th className="p-2 border-b border-gray-300">
                                        Days Requested
                                    </th>
                                    <th className="p-2 border-b border-gray-300">
                                        Status
                                    </th>
                                    <th className="p-2 border-b border-gray-300">
                                        File
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
                                            className="hover:bg-gray-50 text-black"
                                        >
                                            <td className="p-2 border border-gray-300">
                                                {request.user_name}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {request.start_date}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {request.end_date}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {request.days_requested}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                {request.statuses}
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                <a
                                                    href={`/${request.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View PDF
                                                </a>
                                            </td>
                                            <td className="p-2 border border-gray-300">
                                                <button
                                                    className={`px-3 py-1 rounded ${request.statuses === "approved" || request.statuses === "declined" ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}
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
                                                    className={`ml-2 px-3 py-1 rounded ${request.statuses === "declined" || request.statuses === "approved" ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                                    onClick={() =>
                                                        handleDecline(
                                                            request.id,
                                                        )
                                                    }
                                                    disabled={
                                                        request.statuses ===
                                                            "declined" ||
                                                        request.statuses ===
                                                            "approved"
                                                    }
                                                >
                                                    Decline
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
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

                {activeButton === "templateProviderAI" && (
                    <div className="bg-white rounded-xl p-4">
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

                {activeButton === "leaveForm" && (
                    <div className="bg-white rounded-xl p-4 max-w-md mx-auto">
                        <h2 className="text-2xl font-semibold mb-4">
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
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                            >
                                Submit Leave Request
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
};

export default HR_Leave_Management;
