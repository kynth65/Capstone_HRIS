import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const IncidentManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [form, setForm] = useState({
        status: "Pending",
        pdfFile: null,
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axiosClient.get("/incidents");
            setIncidents(response.data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
        }
    };

    const getFullName = (user) => {
        if (!user) return "N/A";
        const { first_name, middle_name, last_name, suffix } = user;
        return `${first_name} ${middle_name ? middle_name + " " : ""}${last_name}${suffix ? " " + suffix : ""}`.trim();
    };

    const handleView = (incident) => {
        console.log("Viewing incident:", incident); // Debug log
        setSelectedIncident(incident);
        setForm({
            status: incident.status || "Pending", // Default to 'pending' if undefined
            pdfFile: null,
        });
        setViewMode(true);
    };
    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/incidents/${id}`);
            setSuccessMessage("Incident deleted successfully.");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchIncidents();
        } catch (error) {
            console.error("Error deleting incident:", error);
            setErrorMessage("Failed to delete the incident. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        console.log("Form status before submit:", form.status); // Debug log
        formData.append("status", form.status); // Make sure "status" is the correct key
        if (form.pdfFile instanceof File) {
            formData.append("pdf_report", form.pdfFile, form.pdfFile.name);
        }

        try {
            const response = await axiosClient.put(
                `/incidents/${selectedIncident.id}`,
                formData,
            );

            console.log("Response data after update:", response.data);

            if (response.data.incident) {
                setSuccessMessage("Incident updated successfully.");
                setTimeout(() => setSuccessMessage(""), 3000);

                // Refetch all incidents to ensure data is fresh
                await fetchIncidents();

                setViewMode(false);
                setSelectedIncident(null);
                setForm({ status: "Pending", pdfFile: null });
            } else {
                setErrorMessage(
                    "Update failed to return updated incident data.",
                );
            }
        } catch (error) {
            if (error.response) {
                console.error("Error response data:", error.response.data); // Debugging line
            }
            console.error("Error updating incident:", error);
            setErrorMessage("Failed to update the incident. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(`Setting form ${name} to ${value}`); // Debug log
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setForm((prevForm) => ({
            ...prevForm,
            pdfFile: file,
        }));
    };

    return (
        <div className="pt-5 md:p-6 bg-white rounded-xl shadow-md mx-auto">
            {successMessage && (
                <p className="text-green-600 ">{successMessage}</p>
            )}
            {errorMessage && <p className="text-red-600 ">{errorMessage}</p>}
            <h2 className="text-lg lg:text-2xl font-semibold mb-4 text-black">
                Incident Management
            </h2>
            <div className="overflow-y-auto max-h-[600px]">
                <table className="employee-table min-w-full border-collapse w-full">
                    <thead className="bg-gray-100 text-black sticky top-0 z-10">
                        <tr>
                            <th className="p-2 hidden md:table-cell">Name</th>
                            <th className="p-2 ">Title</th>
                            <th className="p-2  hidden md:table-cell">
                                Description
                            </th>
                            <th className="p-2  hidden lg:table-cell">Date</th>
                            <th className="p-2  hidden md:table-cell">
                                Severity
                            </th>
                            <th className="p-2 ">Status</th>
                            <th className="p-2  hidden md:table-cell">PDF</th>
                            <th className="p-2 ">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {incidents.map((incident) => (
                            <tr key={incident.id} className="text-center">
                                <td className="p-2  hidden md:table-cell">
                                    {incident.name}
                                </td>
                                <td className="p-2 ">{incident.title}</td>
                                <td className="p-2 max-w-xs truncate overflow-hidden  hidden md:table-cell">
                                    <span title={incident.description}>
                                        {incident.description}
                                    </span>
                                </td>
                                <td className="p-2  hidden lg:table-cell">
                                    {incident.incident_date}
                                </td>
                                <td className="p-2  hidden md:table-cell">
                                    {incident.severity}
                                </td>
                                <td className="p-2 ">{incident.status}</td>
                                <td className="p-2  hidden md:table-cell">
                                    {incident.file_path ? (
                                        <a
                                            href={`http://localhost:8000/storage/${incident.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    ) : (
                                        "No PDF"
                                    )}
                                </td>
                                <td className="flex flex-col lg:grid lg:grid-cols-2 gap-3 p-2">
                                    <button
                                        onClick={() => handleView(incident)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleDelete(incident.id)
                                        }
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {viewMode && selectedIncident && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl py-12 shadow-md w-full max-w-4xl text-black">
                        <h3 className="text-xl font-semibold mb-4 text-center">
                            Incident Details
                        </h3>
                        <div className="space-y-2 mb-4 text-base">
                            <p>
                                <strong>Title:</strong> {selectedIncident.name}
                            </p>
                            <p>
                                <strong>Title:</strong> {selectedIncident.title}
                            </p>
                            <p className="whitespace-pre-wrap break-words">
                                <strong>Description:</strong>{" "}
                                {selectedIncident.description}
                            </p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {selectedIncident.incident_date}
                            </p>
                            <p>
                                <strong>Severity:</strong>{" "}
                                {selectedIncident.severity}
                            </p>
                            <p>
                                <strong>Status:</strong>{" "}
                                {selectedIncident.status}
                            </p>
                            {selectedIncident.file_path && (
                                <p>
                                    <strong>PDF: </strong>
                                    <a
                                        href={`http://localhost:8000/storage/${selectedIncident.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline"
                                    >
                                        View PDF
                                    </a>
                                </p>
                            )}
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <label className="text-black w-1/3">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={form.status}
                                    onChange={handleChange}
                                    className="w-2/3 p-2 border border-green-900 rounded"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Investigating">
                                        Investigating
                                    </option>
                                    <option value="Resolved">Resolved</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-4">
                                <label className="text-gray-700 w-1/3">
                                    Upload PDF Report (optional)
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="application/pdf"
                                    className="w-2/3 p-2 border border-green-900 rounded"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setViewMode(false)}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentManagement;
