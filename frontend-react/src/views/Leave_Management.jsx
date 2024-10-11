import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient"; // Import axiosClient
import "../styles/registration.css";
import "../styles/global.css";
import "../styles/LeaveRequest.css";
import "../styles/documentGenerator.css";
import "../styles/hrDashboard.css";
import useRefreshToken from "../hooks/useRefreshToken";
import useDocument from "../hooks/useDocuments";

function Leave_Management() {
    const [activeButton, setActiveButton] = useState("documentGenerator");
    const refresh = useRefreshToken();
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
    useEffect(() => {
        setDocumentContent(useDocument[documentType]);

        // Effect for styling adjustments
        const labels = document.querySelectorAll(".form label");
        labels.forEach((label) => {
            label.style.display = "block";
            label.style.marginBottom = "8px";
            label.style.textAlign = "left";
            label.style.color = "black";
        });

        return () => {
            labels.forEach((label) => {
                label.style.display = "";
                label.style.marginBottom = "";
                label.style.textAlign = "";
            });
            clearTimeout(errorTimeoutRef.current);
        };
    }, [documentType]);

    const handleDocumentChange = (event) => {
        setDocumentContent(event.target.value);
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
                    <div className="document-generator">
                        <h2 className="titles">Document Template</h2>
                        <p className="text-red-500 text-sm mb-3">
                            Change the corresponding data inside the brackets []
                        </p>
                        <div className="selector-container">
                            <label className="labels font-kodchasan">
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
                                </select>
                            </label>
                        </div>
                        <textarea
                            value={documentContent}
                            onChange={handleDocumentChange}
                            rows="10"
                            cols="50"
                            placeholder="Edit the document content here..."
                            className="textarea text-black"
                        />
                        <button className="button">Download PDF</button>
                    </div>
                )}

                {activeButton === "leaveRequest" && (
                    <div className="leave-request-form bg-white p-6 rounded-xl text-black max-w-2xl mx-auto">
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
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
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
                                    <tbody className="bg-white divide-y divide-gray-200 h-40 text-black">
                                        {Object.entries(leaveRequests).map(
                                            ([status, requests]) =>
                                                requests.map(
                                                    (request, index) => (
                                                        <tr
                                                            key={`${status}-${index}`}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <a
                                                                    href={`/${request.file_path}`}
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
                                                    ),
                                                ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leave_Management;
