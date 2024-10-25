import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const IncidentManagement = () => {
    const [pendingIncidents, setPendingIncidents] = useState([]);
    const [investigatingIncidents, setInvestigatingIncidents] = useState([]);
    const [resolvedIncidents, setResolvedIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [viewMode, setViewMode] = useState(false);
    const [form, setForm] = useState({
        status: "pending",
        pdfFile: null,
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [employees, setEmployees] = useState([]);
    const [activeStatus, setActiveStatus] = useState("pending");
    const [complianceReports, setComplianceReports] = useState([]);

    useEffect(() => {
        fetchAllIncidents();
        fetchEmployees();
    }, []);

    const fetchAllIncidents = async () => {
        try {
            const pendingResponse = await axiosClient.get(
                "/incidents?status=pending&include_compliance_reports_count=true",
            );
            const investigatingResponse = await axiosClient.get(
                "/incidents?status=investigating&include_compliance_reports_count=true",
            );
            const resolvedResponse = await axiosClient.get(
                "/incidents?status=resolved&include_compliance_reports_count=true",
            );

            setPendingIncidents(pendingResponse.data);
            setInvestigatingIncidents(investigatingResponse.data);
            setResolvedIncidents(resolvedResponse.data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
            setErrorMessage("Failed to fetch incidents. Please try again.");
        }
    };

    const fetchComplianceReports = async (incidentId) => {
        try {
            const response = await axiosClient.get(`/incidents/${incidentId}`);
            setSelectedIncident(response.data.incident);
            setComplianceReports(response.data.complianceReports);
        } catch (error) {
            console.error("Error fetching incident details:", error);
            setErrorMessage(
                "Failed to fetch incident details. Please try again.",
            );
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setErrorMessage("Failed to fetch employees. Please try again.");
        }
    };

    const handleStatusChange = (status) => {
        setActiveStatus(status.toLowerCase());
    };

    const handleView = (incident) => {
        setSelectedIncident(incident);
        setForm({
            status: incident.status,
            pdfFile: null,
        });
        if (incident.status === "investigating") {
            fetchComplianceReports(incident.id);
        }
        setViewMode(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/incidents/${id}`);
            setSuccessMessage("Incident deleted successfully.");
            setTimeout(() => setSuccessMessage(""), 3000);
            fetchAllIncidents();
        } catch (error) {
            console.error("Error deleting incident:", error);
            setErrorMessage("Failed to delete the incident. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("status", form.status);
        if (form.pdfFile instanceof File) {
            formData.append("pdf_report", form.pdfFile, form.pdfFile.name);
        }

        try {
            const response = await axiosClient.put(
                `/incidents/${selectedIncident.id}`,
                formData,
            );

            if (response.data.incident) {
                setSuccessMessage("Incident updated successfully.");
                setTimeout(() => setSuccessMessage(""), 3000);
                await fetchAllIncidents();
                setViewMode(false);
                setSelectedIncident(null);
                setForm({ status: activeStatus, pdfFile: null });
            } else {
                setErrorMessage(
                    "Update failed to return updated incident data.",
                );
            }
        } catch (error) {
            console.error("Error updating incident:", error);
            setErrorMessage("Failed to update the incident. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
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

    const handleSendComplianceRequest = async (incidentId) => {
        try {
            await axiosClient.post(
                `/incidents/${incidentId}/send-compliance-request`,
            );
            setSuccessMessage("Compliance request sent successfully.");
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            console.error("Error sending compliance request:", error);
            setErrorMessage(
                "Failed to send compliance request. Please try again.",
            );
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };
    const renderIncidentTable = (incidents) => (
        <table className="employee-table min-w-full border-collapse w-full">
            <thead className="bg-gray-100 text-black sticky top-0 z-1">
                <tr>
                    <th className="p-2 hidden md:table-cell">Name</th>
                    <th className="p-2">Title</th>
                    <th className="p-2 hidden md:table-cell">Description</th>
                    <th className="p-2 hidden lg:table-cell">Date</th>
                    <th className="p-2 hidden md:table-cell">Severity</th>
                    <th className="p-2 hidden md:table-cell">PDF</th>
                    <th className="p-2 hidden lg:table-cell">
                        Reported Employees
                    </th>
                    <th className="p-2">Response</th>
                    <th className="p-2">Actions</th>
                </tr>
            </thead>
            <tbody className="text-black">
                {incidents && incidents.length > 0 ? (
                    incidents.map((incident) => (
                        <tr key={incident.id} className="text-center">
                            <td className="p-2 hidden md:table-cell">
                                {incident.name}
                            </td>
                            <td className="p-2">{incident.title}</td>
                            <td className="p-2 max-w-xs truncate overflow-hidden hidden md:table-cell">
                                <span title={incident.description}>
                                    {incident.description}
                                </span>
                            </td>
                            <td className="p-2 hidden lg:table-cell">
                                {incident.incident_date}
                            </td>
                            <td className="p-2 hidden md:table-cell">
                                {incident.severity}
                            </td>
                            <td className="p-2 hidden md:table-cell">
                                {incident.file_path ? (
                                    <a
                                        href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${incident.file_path}`}
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
                            <td className="p-2 hidden lg:table-cell">
                                {incident.reported_employee_ids &&
                                incident.reported_employee_ids.length > 0
                                    ? incident.reported_employee_ids.map(
                                          (employeeId, index) => (
                                              <span key={employeeId}>
                                                  {
                                                      employees.find(
                                                          (e) =>
                                                              e.user_id ===
                                                              employeeId,
                                                      )?.name
                                                  }
                                                  {index <
                                                  incident.reported_employee_ids
                                                      .length -
                                                      1
                                                      ? ", "
                                                      : ""}
                                              </span>
                                          ),
                                      )
                                    : "None"}
                            </td>
                            <td className="p-2">
                                {incident.compliance_reports_count > 0 ? (
                                    <span className="text-green-600 font-bold">
                                        {incident.compliance_reports_count}
                                    </span>
                                ) : (
                                    <span className="text-red-600">
                                        No response
                                    </span>
                                )}
                            </td>
                            <td className="flex gap-3 justify-center">
                                {incident.status === "investigating" &&
                                    incident.reported_employee_ids.length >
                                        0 && (
                                        <button
                                            onClick={() =>
                                                handleSendComplianceRequest(
                                                    incident.id,
                                                )
                                            }
                                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                        >
                                            Send Compliance Request
                                        </button>
                                    )}
                                <button
                                    onClick={() => handleView(incident)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => handleDelete(incident.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="9" className="text-center py-4">
                            No incidents currently
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );

    return (
        <>
            {" "}
            <nav className="grid grid-cols-3 space-x-4 mb-4">
                <button
                    className={`navButton ${
                        activeStatus === "pending" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("pending")}
                >
                    Pending
                </button>

                <button
                    className={`navButton ${
                        activeStatus === "investigating" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("investigating")}
                >
                    Investigating
                </button>

                <button
                    className={`navButton ${
                        activeStatus === "resolved" ? "active" : ""
                    }`}
                    onClick={() => handleStatusChange("resolved")}
                >
                    Resolved
                </button>
            </nav>
            <div className="pt-5 md:p-6 bg-white rounded-xl shadow-md mx-auto">
                {successMessage && (
                    <p className="text-green-600 mb-4">{successMessage}</p>
                )}
                {errorMessage && (
                    <p className="text-red-600 mb-4">{errorMessage}</p>
                )}

                <div className="overflow-y-auto max-h-[600px]">
                    {activeStatus === "pending" &&
                        renderIncidentTable(pendingIncidents)}
                    {activeStatus === "investigating" &&
                        renderIncidentTable(investigatingIncidents)}
                    {activeStatus === "resolved" &&
                        renderIncidentTable(resolvedIncidents)}
                </div>

                {viewMode && selectedIncident && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl py-12 shadow-md w-full max-w-4xl text-black overflow-y-auto max-h-[90vh]">
                            <h3 className="text-xl font-semibold mb-4 text-center">
                                Incident Details
                            </h3>
                            <div className="space-y-2 mb-4 text-base">
                                <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedIncident.name}
                                </p>
                                <p>
                                    <strong>Title:</strong>{" "}
                                    {selectedIncident.title}
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
                                            href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${selectedIncident.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    </p>
                                )}
                            </div>

                            {selectedIncident.status === "investigating" &&
                                complianceReports.length > 0 && (
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold mb-2">
                                            Compliance Reports
                                        </h4>
                                        <table className="min-w-full border-collapse">
                                            <thead className="bg-gray-200">
                                                <tr>
                                                    <th className="p-2">
                                                        User
                                                    </th>
                                                    <th className="p-2">
                                                        Response
                                                    </th>
                                                    <th className="p-2">PDF</th>
                                                    <th className="p-2">
                                                        Submitted Date
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {complianceReports.map(
                                                    (report) => (
                                                        <tr key={report.id}>
                                                            <td className="p-2 border">
                                                                {report.user
                                                                    ? report
                                                                          .user
                                                                          .name ||
                                                                      `${report.user.first_name} ${report.user.last_name}`
                                                                    : "Unknown User"}
                                                            </td>
                                                            <td className="p-2 border">
                                                                {report.report ||
                                                                    "No response"}
                                                            </td>
                                                            <td className="p-2 border">
                                                                {report.file_path ? (
                                                                    <a
                                                                        href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${report.file_path}`}
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
                                                            <td className="p-2 border">
                                                                {report.created_at
                                                                    ? new Date(
                                                                          report.created_at,
                                                                      ).toLocaleString()
                                                                    : "Unknown Date"}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-4 mt-6"
                            >
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
                                        <option value="pending">Pending</option>
                                        <option value="investigating">
                                            Investigating
                                        </option>
                                        <option value="resolved">
                                            Resolved
                                        </option>
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
        </>
    );
};

export default IncidentManagement;
