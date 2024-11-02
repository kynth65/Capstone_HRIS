import React, { useState, useEffect } from "react";
import { MdArrowBack } from "react-icons/md";
import axiosClient from "../axiosClient";

const EmployeeDocumentsView = () => {
    const [currentView, setCurrentView] = useState("list");
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEmployeeRequirements();
    }, []);

    const fetchEmployeeRequirements = async () => {
        try {
            const response = await axiosClient.get("/my-requirements");

            if (response.data.success) {
                console.log("Requirements Data:", response.data.data); // Debug log
                console.log("Debug Info:", response.data.debug_info); // Debug log

                // Check for documents
                const requirementsWithDocs = response.data.data.filter(
                    (req) => req.document,
                );
                console.log(
                    "Requirements with documents:",
                    requirementsWithDocs,
                );

                setRequirements(response.data.data);
            } else {
                setError(
                    response.data.message || "Error fetching your documents",
                );
            }
        } catch (error) {
            setError("Error fetching your documents");
            console.error("Error fetching requirements:", error);
        }
    };

    const handleViewDetails = async (document) => {
        try {
            if (!document) {
                setError("No document details available");
                return;
            }

            // If we already have the document details, just show them
            setSelectedDocument(document);
            setCurrentView("details");
        } catch (error) {
            setError("Error fetching document details");
            console.error("Error fetching document details:", error);
        }
    };

    const handleBack = () => {
        setCurrentView("list");
        setSelectedDocument(null);
    };

    const RequirementsListView = () => (
        <div className="bg-white rounded-lg shadow-lg text-black">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">My Documents</h2>
                <div className="space-y-4">
                    {requirements.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No requirements found.
                        </div>
                    ) : (
                        requirements.map((requirement) => (
                            <div
                                key={requirement.id}
                                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Status indicator */}
                                        <div className="relative inline-block">
                                            <div
                                                className={`w-5 h-5 border rounded flex items-center justify-center ${
                                                    requirement.is_submitted
                                                        ? requirement.is_checked
                                                            ? "bg-green-700 border-green-800"
                                                            : "bg-yellow-500 border-yellow-600"
                                                        : "bg-gray-200 border-gray-300"
                                                }`}
                                            >
                                                {requirement.is_submitted &&
                                                    (requirement.is_checked ? (
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
                                                    ) : (
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
                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                            />
                                                        </svg>
                                                    ))}
                                            </div>
                                        </div>

                                        {/* Requirement info */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-900">
                                                    {requirement.name}
                                                </h3>
                                                {requirement.is_personal && (
                                                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                                                        Personal
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {requirement.category}
                                            </p>
                                        </div>

                                        {/* Type badge */}
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${
                                                requirement.type === "expirable"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {requirement.type}
                                        </span>

                                        {/* Status badge */}
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${
                                                !requirement.is_submitted
                                                    ? "bg-gray-100 text-gray-800"
                                                    : requirement.is_checked
                                                      ? "bg-green-100 text-green-800"
                                                      : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {!requirement.is_submitted
                                                ? "Not Submitted"
                                                : requirement.is_checked
                                                  ? "Verified"
                                                  : "Pending Verification"}
                                        </span>
                                    </div>

                                    {/* Action buttons */}
                                    {requirement.document ? (
                                        <button
                                            onClick={() =>
                                                handleViewDetails(
                                                    requirement.document,
                                                )
                                            }
                                            className="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                        >
                                            View Details
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            No document submitted
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const DocumentDetailsView = () => {
        const baseUrl = import.meta.env.VITE_BASE_URL;

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
                        <h2 className="text-xl font-semibold">
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
                                    <div>
                                        <label className="text-sm text-gray-600">
                                            Verification Status
                                        </label>
                                        <span
                                            className={`inline-block px-2 py-1 text-xs rounded ${
                                                selectedDocument.is_checked
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {selectedDocument.is_checked
                                                ? "Verified"
                                                : "Pending Verification"}
                                        </span>
                                    </div>
                                </div>
                            </div>

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
                                                Unable to display PDF.{" "}
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

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-200 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {currentView === "list" ? (
                <RequirementsListView />
            ) : (
                <DocumentDetailsView />
            )}
        </div>
    );
};

export default EmployeeDocumentsView;
