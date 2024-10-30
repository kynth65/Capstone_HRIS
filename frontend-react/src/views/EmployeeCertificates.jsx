import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { RiFileDownloadFill } from "react-icons/ri";

function EmployeeCertificate() {
    const [certificates, setCertificates] = useState([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCertificate, setSelectedCertificate] = useState(null);
    const [newFile, setNewFile] = useState(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [sentRequests, setSentRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("myCertificates");
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [newCertificateRequest, setNewCertificateRequest] = useState({
        certificate_name: "",
        expiring_date: "",
        issued_date: "",
        file: null,
        category: "",
        type: "expirable",
    });

    const userId = localStorage.getItem("user_id");

    const fetchCertificates = async () => {
        try {
            const response = await axiosClient.get("/certificates");
            setCertificates(response.data);
        } catch (error) {
            console.error("Error fetching employee certificates:", error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axiosClient.get(
                "/user-certificate-requests",
            );
            setPendingRequests(response.data);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };
    useEffect(() => {
        fetchCertificates();
        fetchPendingRequests();
    }, []);

    const handleRequestModal = () => setIsRequestModalOpen(!isRequestModalOpen);

    const handleRequestChange = (event) => {
        const { name, value, files } = event.target;
        setNewCertificateRequest({
            ...newCertificateRequest,
            [name]: name === "file" ? files[0] : value,
        });
    };

    const handleRequestSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append(
            "certificate_name",
            newCertificateRequest.certificate_name,
        );
        formData.append("type", newCertificateRequest.type);
        formData.append("category", newCertificateRequest.category);
        formData.append("issued_date", newCertificateRequest.issued_date);
        if (newCertificateRequest.type === "expirable") {
            formData.append(
                "expiring_date",
                newCertificateRequest.expiring_date,
            );
        }
        formData.append("certificate_file", newCertificateRequest.file);

        try {
            const response = await axiosClient.post(
                "/certificate-requests",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            alert(
                response.data.message || "Document request sent successfully!",
            );
            setIsRequestModalOpen(false);
            setNewCertificateRequest({
                certificate_name: "",
                expiring_date: "",
                issued_date: "",
                file: null,
                category: "",
                type: "expirable",
            });
            fetchPendingRequests();
        } catch (error) {
            console.error("Error sending certificate request:", error);
            alert("Failed to send certificate request. Please try again.");
        }
    };

    const handleOpenUpdateModal = (certificate) => {
        setSelectedCertificate(certificate);
        setIsUpdateModalOpen(true);
    };

    const handleFileChange = (event) => {
        setNewFile(event.target.files[0]);
    };

    const handleUpdateRequest = async (event) => {
        event.preventDefault();

        if (!newFile || !selectedCertificate) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append("certificate_file", newFile);
        formData.append("certificate_id", selectedCertificate.id);
        formData.append("user_id", userId);

        try {
            const response = await axiosClient.post(
                `/certificate-update-requests`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            alert(response.data.message || "Update request sent successfully.");

            setIsUpdateModalOpen(false);
            setSentRequests((prevSentRequests) => [
                ...prevSentRequests,
                selectedCertificate.id,
            ]);
            await fetchCertificates();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert(
                    "You already sent an update request for this certificate.",
                );
            } else {
                console.error("Error sending update request:", error);
            }
        }
    };

    const handleOpenDetailModal = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const handleOpenPdf = (pdfPath) => {
        if (pdfPath) {
            const pdfUrl = `http://localhost:8000/${pdfPath}`;
            setPdfUrl(pdfUrl);
            setIsPdfModalOpen(true);
        } else {
            alert("No PDF available for this certificate.");
        }
    };

    return (
        <>
            <div className="mb-4">
                <nav className="grid grid-cols-2">
                    <button
                        className={`navButton ${
                            activeTab === "myCertificates" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("myCertificates")}
                    >
                        Documents
                    </button>

                    {/* <button
                        className={`navButton ${
                            activeTab === "pendingRequests" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("pendingRequests")}
                    >
                        Pending Requests
                    </button> */}
                </nav>
            </div>
            <div className="container mx-auto p-4">
                {activeTab === "myCertificates" && (
                    <>
                        <div className="md:hidden max-h-[400px] overflow-y-auto space-y-4">
                            {certificates.length > 0 ? (
                                certificates.map((cert, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm space-y-2"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-semibold text-gray-800">
                                                {cert.certificate_name}
                                            </h3>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    cert.type ===
                                                    "non-expirable"
                                                        ? "bg-green-100 text-green-600"
                                                        : cert.expiring_date &&
                                                            new Date(
                                                                cert.expiring_date,
                                                            ) > new Date()
                                                          ? "bg-yellow-100 text-yellow-600"
                                                          : "bg-red-100 text-red-600"
                                                }`}
                                            >
                                                {cert.type === "non-expirable"
                                                    ? "Non-Expiring"
                                                    : cert.expiring_date
                                                      ? new Date(
                                                            cert.expiring_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                        )
                                                      : "Expired"}
                                            </span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="space-y-1 text-gray-700">
                                            <p className="text-xs">
                                                <strong>Date Issued:</strong>{" "}
                                                {new Date(
                                                    cert.issued_date,
                                                ).toLocaleDateString("en-US")}
                                            </p>
                                            <p className="text-xs">
                                                <strong>Expiring Date:</strong>{" "}
                                                {cert.type === "non-expirable"
                                                    ? "Non-Expiring"
                                                    : cert.expiring_date
                                                      ? new Date(
                                                            cert.expiring_date,
                                                        ).toLocaleDateString(
                                                            "en-US",
                                                        )
                                                      : "N/A"}
                                            </p>
                                            <p className="text-xs">
                                                <strong>Status:</strong>{" "}
                                                {cert.status}
                                            </p>
                                        </div>
                                        <button
                                            className="mt-2 w-full py-2 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                                            onClick={() =>
                                                handleOpenPdf(cert.file_url)
                                            }
                                        >
                                            Download Certificate
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No documents found.
                                </div>
                            )}
                        </div>

                        <div className="hidden md:block">
                            <table className="w-full bg-white border-collapse overflow-x-auto">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr className="text-left text-sm font-semibold text-gray-700">
                                        <th className="px-4 py-2">
                                            Document Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Date Issued
                                        </th>
                                        <th className="px-4 py-2">
                                            Expiring Date
                                        </th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-900">
                                    {certificates.length > 0 ? (
                                        certificates.map((cert) => (
                                            <tr
                                                key={cert.id}
                                                className="hover:bg-gray-100 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    {cert.certificate_name}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {new Date(
                                                        cert.issued_date,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {cert.type ===
                                                    "non-expirable"
                                                        ? "Non-Expiring"
                                                        : cert.expiring_date
                                                          ? new Date(
                                                                cert.expiring_date,
                                                            ).toLocaleDateString(
                                                                "en-US",
                                                            )
                                                          : "N/A"}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {cert.status}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                                        onClick={() =>
                                                            handleOpenPdf(
                                                                cert.file_url,
                                                            )
                                                        }
                                                    >
                                                        <RiFileDownloadFill
                                                            size={20}
                                                        />
                                                        Download
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="text-center py-8 text-gray-500"
                                            >
                                                No documents found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === "pendingRequests" && (
                    <>
                        {/* Mobile View */}
                        <div className="mb-6 flex md:hidden justify-end">
                            <button
                                onClick={handleRequestModal}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <span>Request Document</span>
                            </button>
                        </div>
                        <div className="md:hidden max-h-[400px] overflow-y-auto space-y-4">
                            {pendingRequests.length > 0 ? (
                                pendingRequests.map((request, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-300 p-4 rounded-lg bg-white shadow-sm space-y-2"
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-semibold text-gray-800">
                                                {request.certificate_name}
                                            </h3>
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full ${
                                                    request.status ===
                                                    "approved"
                                                        ? "bg-green-100 text-green-600"
                                                        : request.status ===
                                                            "pending"
                                                          ? "bg-yellow-100 text-yellow-600"
                                                          : "bg-red-100 text-red-600"
                                                }`}
                                            >
                                                {request.status}
                                            </span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="space-y-1 text-gray-700">
                                            <p className="text-xs">
                                                <strong>Date Requested:</strong>{" "}
                                                {new Date(
                                                    request.created_at,
                                                ).toLocaleDateString("en-US")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleOpenDetailModal(request)
                                            }
                                            className="mt-2 w-full py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-gray-500">
                                    No pending requests found.
                                </div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <div className="mb-6 flex justify-end">
                                <button
                                    onClick={handleRequestModal}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                                >
                                    <span>Request Document</span>
                                </button>
                            </div>
                            <table className="w-full bg-white border-collapse overflow-x-auto">
                                <thead className="bg-gray-100 sticky top-0 text-center">
                                    {" "}
                                    {/* Added text-center */}
                                    <tr className="text-sm font-semibold text-gray-700">
                                        <th className="px-4 py-2">
                                            Document Name
                                        </th>
                                        <th className="px-4 py-2">
                                            Date Requested
                                        </th>
                                        <th className="px-4 py-2">Remarks</th>{" "}
                                        {/* New column for remarks */}
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-gray-900">
                                    {pendingRequests.length > 0 ? (
                                        pendingRequests.map((request) => (
                                            <tr
                                                key={request.id}
                                                className="hover:bg-gray-100 transition-colors text-center"
                                            >
                                                {" "}
                                                {/* Centered text in rows */}
                                                <td className="px-4 py-4">
                                                    {request.certificate_name}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {new Date(
                                                        request.created_at,
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {request.remarks
                                                        ? request.remarks
                                                        : "No remarks"}{" "}
                                                    {/* Display remarks */}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {request.status}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() =>
                                                            handleOpenDetailModal(
                                                                request,
                                                            )
                                                        }
                                                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="text-center py-8 text-gray-500"
                                            >
                                                {" "}
                                                {/* Updated colspan to 5 */}
                                                No pending requests found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Modal for Certificate Update */}
                {isUpdateModalOpen && selectedCertificate && (
                    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                            <h2 className="text-lg font-bold mb-4">
                                Update Document
                            </h2>
                            <form onSubmit={handleUpdateRequest}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        document Name
                                    </label>
                                    <input
                                        type="text"
                                        name="certificate_name"
                                        value={
                                            selectedCertificate.certificate_name
                                        }
                                        className="w-full p-2 border rounded"
                                        readOnly
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Upload New Document (PDF)
                                    </label>
                                    <input
                                        type="file"
                                        name="certificate_file"
                                        accept=".pdf"
                                        className="w-full p-2 border rounded"
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        className="bg-blue-500 text-white p-2 rounded"
                                        type="submit"
                                    >
                                        Send Update Request
                                    </button>
                                    <button
                                        className="bg-red-500 text-white p-2 rounded"
                                        onClick={() =>
                                            setIsUpdateModalOpen(false)
                                        }
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal for Sending New Certificate Request */}
                {isRequestModalOpen && (
                    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                            <h2 className="text-lg font-bold mb-4">
                                Send New Document Request
                            </h2>
                            <form onSubmit={handleRequestSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Document Name
                                    </label>
                                    <input
                                        type="text"
                                        name="certificate_name"
                                        value={
                                            newCertificateRequest.certificate_name
                                        }
                                        onChange={handleRequestChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Type
                                    </label>
                                    <select
                                        name="type"
                                        value={newCertificateRequest.type}
                                        onChange={handleRequestChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="expirable">
                                            Expirable
                                        </option>
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
                                        value={
                                            newCertificateRequest.issued_date
                                        }
                                        onChange={handleRequestChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                {newCertificateRequest.type === "expirable" && (
                                    <>
                                        <div className="mb-4">
                                            <label className="block text-gray-700">
                                                Expiring Date
                                            </label>
                                            <input
                                                type="date"
                                                name="expiring_date"
                                                value={
                                                    newCertificateRequest.expiring_date
                                                }
                                                onChange={handleRequestChange}
                                                className="w-full p-2 border rounded"
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={newCertificateRequest.category}
                                        onChange={handleRequestChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="">
                                            Select Category
                                        </option>
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
                                <div className="mb-4">
                                    <label className="block text-gray-700">
                                        Upload Document (PDF)
                                    </label>
                                    <input
                                        type="file"
                                        name="file"
                                        accept=".pdf"
                                        onChange={handleRequestChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button
                                        className="bg-blue-500 text-white p-2 rounded"
                                        type="submit"
                                    >
                                        Send Request
                                    </button>
                                    <button
                                        className="bg-red-500 text-white p-2 rounded"
                                        onClick={handleRequestModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
                                title="Certificate PDF"
                                width="100%"
                                height="750px"
                            />
                        </div>
                    </div>
                )}

                {isDetailModalOpen && selectedRequest && (
                    <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                            <h2 className="text-lg font-bold mb-4">
                                Request Details
                            </h2>
                            <p>
                                <strong>Document Name:</strong>{" "}
                                {selectedRequest.certificate_name}
                            </p>
                            <p>
                                <strong>Date Requested:</strong>{" "}
                                {new Date(
                                    selectedRequest.created_at,
                                ).toLocaleDateString("en-US")}
                            </p>
                            <p>
                                <strong>Remarks:</strong>{" "}
                                {selectedRequest.remarks || "No remarks"}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedRequest.status}
                            </p>
                            <button
                                className="bg-red-500 text-white p-2 rounded mt-4"
                                onClick={() => setIsDetailModalOpen(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default EmployeeCertificate;
