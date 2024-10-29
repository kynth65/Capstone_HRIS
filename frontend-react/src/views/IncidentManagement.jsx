import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { MdDelete, MdEdit, MdExpandMore, MdExpandLess } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
import { BsSendExclamationFill } from "react-icons/bs";

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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedIncidentForDelete, setSelectedIncidentForDelete] =
        useState(null);
    const [deleteRemarks, setDeleteRemarks] = useState("");
    const [selectedIncidentForCompliance, setSelectedIncidentForCompliance] =
        useState(null);
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

    const handleDelete = async (id, remarks) => {
        try {
            await axiosClient.delete(`/incidents/${id}`, {
                data: { delete_remarks: remarks },
            });
            setSuccessMessage("Incident deleted successfully.");
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowDeleteModal(false);
            setSelectedIncidentForDelete(null);
            setDeleteRemarks("");
            fetchAllIncidents();
        } catch (error) {
            console.error("Error deleting incident:", error);
            setErrorMessage("Failed to delete the incident. Please try again.");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleDeleteClick = (incident) => {
        setSelectedIncidentForDelete(incident);
        setShowDeleteModal(true);
        setDeleteRemarks("");
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

    const handleSendComplianceClick = (incident) => {
        setSelectedIncidentForCompliance(incident);
        setShowConfirmModal(true);
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
        <div className="md:bg-white md:shadow-lg rounded-lg mr-3 text-black sm:ml-0">
            {/* Mobile View */}
            <div className="md:hidden">
                <div className="max-h-[500px] overflow-y-auto p-4">
                    {incidents && incidents.length > 0 ? (
                        incidents.map((incident) => (
                            <div
                                key={incident.id}
                                className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-medium text-black">
                                            {incident.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {incident.name}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {incident.status === "investigating" &&
                                            incident.reported_employee_ids
                                                ?.length > 0 && (
                                                <button
                                                    onClick={() =>
                                                        handleSendComplianceClick(
                                                            incident,
                                                        )
                                                    }
                                                    className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                                                >
                                                    <BsSendExclamationFill
                                                        size={18}
                                                    />
                                                </button>
                                            )}
                                        <button
                                            onClick={() => handleView(incident)}
                                            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                        >
                                            <IoMdEye size={18} />
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteClick(incident)
                                            }
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                        >
                                            <MdDelete size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Description
                                        </p>
                                        <p className="text-sm">
                                            {incident.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Severity
                                            </p>
                                            <p className="text-sm font-medium">
                                                {incident.severity}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                Response
                                            </p>
                                            {incident.compliance_reports_count >
                                            0 ? (
                                                <p className="text-green-600 font-bold text-sm">
                                                    {
                                                        incident.compliance_reports_count
                                                    }
                                                </p>
                                            ) : (
                                                <p className="text-red-600 text-sm">
                                                    No response
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Reported Employees
                                        </p>
                                        <p className="text-sm">
                                            {incident.reported_employee_ids &&
                                            incident.reported_employee_ids
                                                ?.length > 0
                                                ? incident.reported_employee_ids.map(
                                                      (employeeId, index) => (
                                                          <span
                                                              key={employeeId}
                                                          >
                                                              {
                                                                  employees.find(
                                                                      (e) =>
                                                                          e.user_id ===
                                                                          employeeId,
                                                                  )?.name
                                                              }
                                                              {index <
                                                              incident
                                                                  .reported_employee_ids
                                                                  .length -
                                                                  1
                                                                  ? ", "
                                                                  : ""}
                                                          </span>
                                                      ),
                                                  )
                                                : "None"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No incidents currently
                        </div>
                    )}
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="max-h-[500px] overflow-y-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="hidden px-6 py-3 text-left text-xs font-medium  text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reported Employees
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Response
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {incidents && incidents.length > 0 ? (
                                incidents.map((incident) => (
                                    <tr
                                        key={incident.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {incident.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {incident.title}
                                        </td>
                                        <td className="hidden px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            <span title={incident.description}>
                                                {incident.description}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {incident.severity}
                                        </td>
                                        <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-900">
                                            {incident.reported_employee_ids &&
                                            incident.reported_employee_ids
                                                .length > 0
                                                ? incident.reported_employee_ids.map(
                                                      (employeeId, index) => (
                                                          <span
                                                              key={employeeId}
                                                          >
                                                              {
                                                                  employees.find(
                                                                      (e) =>
                                                                          e.user_id ===
                                                                          employeeId,
                                                                  )?.name
                                                              }
                                                              {index <
                                                              incident
                                                                  .reported_employee_ids
                                                                  .length -
                                                                  1
                                                                  ? ", "
                                                                  : ""}
                                                          </span>
                                                      ),
                                                  )
                                                : "None"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {incident.compliance_reports_count >
                                            0 ? (
                                                <span className="text-green-600 font-bold">
                                                    {
                                                        incident.compliance_reports_count
                                                    }
                                                </span>
                                            ) : (
                                                <span className="text-red-600">
                                                    No response
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                {incident.status ===
                                                    "investigating" &&
                                                    incident
                                                        .reported_employee_ids
                                                        .length > 0 && (
                                                        <button
                                                            onClick={() =>
                                                                handleSendComplianceClick(
                                                                    incident,
                                                                )
                                                            }
                                                            className="p-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600"
                                                        >
                                                            <BsSendExclamationFill
                                                                size={18}
                                                            />
                                                        </button>
                                                    )}
                                                <button
                                                    onClick={() =>
                                                        handleView(incident)
                                                    }
                                                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                                                >
                                                    <IoMdEye size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteClick(
                                                            incident,
                                                        )
                                                    }
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                                                >
                                                    <MdDelete size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="px-6 py-4 text-sm text-center text-gray-500"
                                    >
                                        No incidents currently
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <>
            {" "}
            <nav className="grid grid-cols-3 ">
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
            <div className="pt-5 md:p-6 md:bg-white md:rounded-xl md:shadow-md mx-auto">
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
                            <h3 className="text-xl font-semibold mb-4 text-center text-black">
                                Incident Details
                            </h3>
                            <div className="space-y-2 mb-4 text-base text-start">
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
                                <p className="whitespace-pre-wrap break-words">
                                    <strong>Reported Employees:</strong>{" "}
                                    <span className="p-2">
                                        {selectedIncident.reported_employee_ids &&
                                        selectedIncident.reported_employee_ids
                                            .length > 0
                                            ? selectedIncident.reported_employee_ids.map(
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
                                                          selectedIncident
                                                              .reported_employee_ids
                                                              .length -
                                                              1
                                                              ? ", "
                                                              : ""}
                                                      </span>
                                                  ),
                                              )
                                            : "None"}
                                    </span>
                                </p>
                                <p>
                                    <strong>Incident Date:</strong>{" "}
                                    {formatDate(selectedIncident.incident_date)}
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
                                                {complianceReports?.map(
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
                                        className="w-2/3 p-2 mb-0 border border-green-900 rounded"
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
                                        className="w-2/3 p-2 mb-0 border border-green-900 rounded"
                                    />
                                </div>
                                <div className="flex justify-center space-x-2 pt-4">
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
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-black">
                            <h3 className="text-xl font-semibold mb-4 text-center">
                                Send Compliance Request
                            </h3>
                            <p className="mb-6 text-center">
                                Are you sure you want to send a compliance
                                request?
                            </p>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-900">
                                    <strong>Title:</strong>{" "}
                                    {selectedIncidentForCompliance?.title}
                                </p>
                                <p className="text-sm text-gray-900">
                                    <strong>Reported Employees:</strong>{" "}
                                    {selectedIncidentForCompliance?.reported_employee_ids.map(
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
                                                selectedIncidentForCompliance
                                                    .reported_employee_ids
                                                    .length -
                                                    1
                                                    ? ", "
                                                    : ""}
                                            </span>
                                        ),
                                    )}
                                </p>
                            </div>
                            <div className="flex justify-center space-x-4 mt-6">
                                <button
                                    onClick={() => {
                                        setShowConfirmModal(false);
                                        setSelectedIncidentForCompliance(null);
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        handleSendComplianceRequest(
                                            selectedIncidentForCompliance.id,
                                        );
                                        setShowConfirmModal(false);
                                        setSelectedIncidentForCompliance(null);
                                    }}
                                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                >
                                    Send Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md text-black">
                            <h3 className="text-xl font-semibold mb-4 text-center">
                                Delete Incident
                            </h3>
                            <p className="mb-4 text-center">
                                Are you sure you want to delete this incident?
                            </p>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-900">
                                    <strong>Title:</strong>{" "}
                                    {selectedIncidentForDelete?.title}
                                </p>
                                <p className="text-sm text-gray-900">
                                    <strong>Name:</strong>{" "}
                                    {selectedIncidentForDelete?.name}
                                </p>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Remarks (Required)
                                    </label>
                                    <textarea
                                        value={deleteRemarks}
                                        onChange={(e) =>
                                            setDeleteRemarks(e.target.value)
                                        }
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                        rows="3"
                                        placeholder="Enter your remarks for deleting this incident..."
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center space-x-4 mt-6">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedIncidentForDelete(null);
                                        setDeleteRemarks("");
                                    }}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (deleteRemarks.trim()) {
                                            handleDelete(
                                                selectedIncidentForDelete.id,
                                                deleteRemarks,
                                            );
                                        } else {
                                            setErrorMessage(
                                                "Please enter remarks before deleting.",
                                            );
                                            setTimeout(
                                                () => setErrorMessage(""),
                                                3000,
                                            );
                                        }
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    disabled={!deleteRemarks.trim()}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default IncidentManagement;
