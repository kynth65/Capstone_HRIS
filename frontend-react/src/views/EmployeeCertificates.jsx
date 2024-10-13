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
    const [sentRequests, setSentRequests] = useState([]); // New state for tracking sent requests

    const userId = localStorage.getItem("user_id");

    const fetchCertificates = async () => {
        try {
            const response = await axiosClient.get("/certificates");
            setCertificates(response.data);
        } catch (error) {
            console.error("Error fetching employee certificates:", error);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, []);

    // Function to open the update modal
    const handleOpenUpdateModal = (certificate) => {
        setSelectedCertificate(certificate);
        setIsUpdateModalOpen(true);
    };

    // Function to handle file change
    const handleFileChange = (event) => {
        setNewFile(event.target.files[0]);
    };

    // Function to send certificate update request
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

            // Close the modal after a successful request
            setIsUpdateModalOpen(false);

            // Mark this certificate as sent
            setSentRequests((prevSentRequests) => [
                ...prevSentRequests,
                selectedCertificate.id,
            ]);

            // Refresh certificates list to reflect updated `can_update` status
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

    const handleOpenPdf = (pdfPath) => {
        if (pdfPath) {
            const pdfUrl = `http://localhost:8000/${pdfPath}`; // Prefix with localhost:8000
            setPdfUrl(pdfUrl);
            setIsPdfModalOpen(true);
        } else {
            alert("No PDF available for this certificate.");
        }
    };

    return (
        <div className="max-h-[400px] overflow-y-auto rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">My Certificates</h2>
            <table className="bg-white text-black w-full xl:w-full">
                <thead className="sticky top-0 bg-gray-200 border-b-2">
                    <tr className="text-base">
                        <th className="px-4 py-2">Certificate Name</th>
                        <th className="px-4 py-2">Date Issued</th>
                        <th className="px-4 py-2">Expiring Date</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {certificates.length > 0 ? (
                        certificates.map((cert) => {
                            const status =
                                cert.type === "non-expirable"
                                    ? "Non-Expiring"
                                    : cert.expiring_date
                                      ? new Date(
                                            cert.expiring_date,
                                        ).toLocaleDateString()
                                      : "N/A";

                            return (
                                <tr
                                    key={cert.id}
                                    className="font-medium hover:bg-gray-100"
                                >
                                    <td className="px-4 py-6">
                                        {cert.certificate_name}
                                    </td>
                                    <td className="px-4 py-6">
                                        {new Date(
                                            cert.issued_date,
                                        ).toLocaleDateString("en-US")}
                                    </td>
                                    <td className="px-4 py-6">
                                        {cert.type === "non-expirable"
                                            ? "N/A"
                                            : cert.expiring_date
                                              ? new Date(
                                                    cert.expiring_date,
                                                ).toLocaleDateString("en-US")
                                              : ""}
                                    </td>
                                    <td className="px-4 py-6">{status}</td>
                                    <td className="px-4 py-6 flex space-x-3">
                                        {cert.file_url && (
                                            <button
                                                className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                                onClick={() =>
                                                    handleOpenPdf(cert.file_url)
                                                }
                                            >
                                                <RiFileDownloadFill size={20} />
                                            </button>
                                        )}
                                        {cert.can_update &&
                                        !sentRequests.includes(cert.id) ? (
                                            <button
                                                className="px-3 py-2 bg-yellow-500 text-white rounded"
                                                onClick={() =>
                                                    handleOpenUpdateModal(cert)
                                                }
                                            >
                                                Update Certificate
                                            </button>
                                        ) : (
                                            <span className="text-gray-400">
                                                {sentRequests.includes(cert.id)
                                                    ? "Sent Successfully"
                                                    : "Update not available"}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-20">
                                No certificates found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Modal for Certificate Update */}
            {isUpdateModalOpen && selectedCertificate && (
                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="modal-content bg-white p-6 rounded-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">
                            Update Certificate
                        </h2>
                        <form onSubmit={handleUpdateRequest}>
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Certificate Name
                                </label>
                                <input
                                    type="text"
                                    name="certificate_name"
                                    value={selectedCertificate.certificate_name}
                                    className="w-full p-2 border rounded"
                                    readOnly
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">
                                    Upload New Certificate (PDF)
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
                                    onClick={() => setIsUpdateModalOpen(false)}
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
        </div>
    );
}

export default EmployeeCertificate;
