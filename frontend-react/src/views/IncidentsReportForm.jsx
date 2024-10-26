import React, { useEffect, useState, useCallback } from "react";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";

const IncidentReportForm = () => {
    const { user, setUser } = useStateContext();
    const [activeButton, setActiveButton] = useState("submitReport");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [incidentDate, setIncidentDate] = useState("");
    const [severity, setSeverity] = useState("Low");
    const [status, setStatus] = useState("Pending");
    const [pdfFile, setPdfFile] = useState(null);
    const [message, setMessage] = useState("");
    const [reports, setReports] = useState([]);
    const [isExpandedModalOpen, setIsExpandedModalOpen] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState("");
    const [relatedEmployees, setRelatedEmployees] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [reportToDelete, setReportToDelete] = useState(null);
    const [reportedIncidents, setReportedIncidents] = useState([]);
    const [fetchInterval, setFetchInterval] = useState(null);
    const [complianceResponse, setComplianceResponse] = useState("");

    const openComplianceModal = (reportedIncident) => {
        setSelectedReport(reportedIncident);
        setIsDetailModalOpen(true);
    };
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axiosClient.get("/user");
                setUser(data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    try {
                        await refresh();
                        const { data } = await axiosClient.get("/user");
                        setUser(data);
                    } catch (refreshError) {
                        console.error("Error refreshing token:", refreshError);
                    }
                }
            }
        };
        fetchUser();
        fetchEmployees();
    }, [setUser]);

    const fetchReports = async (userId, setReports) => {
        try {
            const response = await axiosClient.get(
                `/employee/incidents/${userId}`,
            );
            setReports(response.data);
        } catch (error) {
            console.error("Error fetching user incidents:", error);
        }
    };

    const startFetching = useCallback(() => {
        // Clear any existing interval
        if (fetchInterval) {
            clearInterval(fetchInterval);
        }

        // Start new interval
        const interval = setInterval(() => {
            if (user && user.user_id) {
                fetchReports(user.user_id, setReports);
                fetchReportedIncidents();
            }
        }, 3000); // Fetch every 3 seconds

        setFetchInterval(interval);
    }, [user]);

    useEffect(() => {
        startFetching();

        // Cleanup on unmount
        return () => {
            if (fetchInterval) {
                clearInterval(fetchInterval);
            }
        };
    }, [startFetching]);

    useEffect(() => {
        if (user && user.user_id) {
            fetchReports(user.user_id, setReports);
        }
    }, [user]);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchReportedIncidents = async () => {
        try {
            const response = await axiosClient.get("/reported-incidents");
            setReportedIncidents(response.data);
        } catch (error) {
            console.error("Error fetching reported incidents:", error);
            setMessage("Failed to fetch reported incidents. Please try again.");
        }
    };

    useEffect(() => {
        if (user && user.user_id) {
            fetchReportedIncidents();
        }
    }, [user]);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleAddEmployee = () => {
        if (selectedEmployee && !relatedEmployees.includes(selectedEmployee)) {
            setRelatedEmployees([...relatedEmployees, selectedEmployee]);
            setSelectedEmployee("");
        }
    };

    const handleRemoveEmployee = (employeeId) => {
        setRelatedEmployees(relatedEmployees.filter((id) => id !== employeeId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("user_id", user.user_id);
        formData.append("name", user.name);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("incident_date", incidentDate);
        formData.append("severity", severity);
        formData.append("status", status);
        formData.append(
            "reported_employee_ids",
            JSON.stringify(relatedEmployees),
        );
        if (pdfFile) {
            formData.append("file_path", pdfFile);
        }

        try {
            await axiosClient.post("/incidents", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setMessage("Report submitted successfully");
            setTitle("");
            setDescription("");
            setIncidentDate("");
            setSeverity("Low");
            setStatus("Pending");
            setPdfFile(null);
            setRelatedEmployees([]);
            if (user && user.user_id) {
                await fetchReports(user.user_id, setReports);
                await fetchReportedIncidents();
            }
            startFetching();
        } catch (error) {
            console.error("Error submitting report:", error);
            setMessage("Failed to submit report");
        }
    };

    const confirmDelete = async () => {
        try {
            await axiosClient.delete(`/incidents/${reportToDelete}`);
            setMessage("Report deleted successfully");
            fetchReports();
            setIsDeleteModalOpen(false);
            setReportToDelete(null);
            if (user && user.user_id) {
                await fetchReports(user.user_id, setReports);
                await fetchReportedIncidents();
            }

            // Restart the fetch interval
            startFetching();
        } catch (error) {
            console.error("Error deleting report:", error);
            setMessage("Failed to delete report");
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setReportToDelete(null);
    };

    const openDetailModal = (report) => {
        setSelectedReport(report);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setSelectedReport(null);
        setIsDetailModalOpen(false);
    };

    const openExpandedModal = () => {
        setIsExpandedModalOpen(true);
    };

    const closeExpandedModal = () => {
        setIsExpandedModalOpen(false);
    };

    const handleDelete = async (id) => {
        setReportToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleComplianceSubmit = async (reportedIncidentId) => {
        try {
            const formData = new FormData();
            formData.append("report", complianceResponse);
            if (pdfFile) {
                formData.append("file_path", pdfFile);
            }

            const response = await axiosClient.post(
                `/reported-incidents/${reportedIncidentId}/compliance-reports`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            setComplianceResponse("");
            setPdfFile(null);
            fetchReportedIncidents();
            setMessage("Compliance response submitted successfully");
            closeDetailModal();
        } catch (error) {
            console.error("Error submitting compliance response:", error);
            setMessage(
                "Failed to submit compliance response: " +
                    (error.response?.data?.error || error.message),
            );
        }
    };

    const formatIncidentDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatReportedDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    return (
        <>
            <nav className="grid grid-cols-2 text-center">
                <button
                    className={`navButton ${
                        activeButton === "submitReport" ? "active" : ""
                    }`}
                    onClick={() => setActiveButton("submitReport")}
                >
                    Submit Incident Report
                </button>

                <button
                    className={`navButton ${
                        activeButton === "compliance" ? "active" : ""
                    }`}
                    onClick={() => setActiveButton("compliance")}
                >
                    Compliance Reports
                </button>
            </nav>
            <div className="p-6 bg-white rounded-xl shadow-md">
                {activeButton === "submitReport" && (
                    <>
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4 text-black"
                        >
                            <div className="md:grid md:grid-cols-3 md:space-x-2 items-center">
                                <div>
                                    <label className="block text-gray-700">
                                        Title of report
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        required
                                        className="w-full p-2 border border-green-900 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">
                                        Incident Date
                                    </label>
                                    <input
                                        type="date"
                                        value={incidentDate}
                                        onChange={(e) =>
                                            setIncidentDate(e.target.value)
                                        }
                                        required
                                        className="w-full p-2 border border-green-900 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700">
                                        Severity
                                    </label>
                                    <select
                                        value={severity}
                                        onChange={(e) =>
                                            setSeverity(e.target.value)
                                        }
                                        required
                                        className="w-full p-2 border border-green-900 py-[9px] rounded"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    required
                                    className="w-full p-2 border border-green-900 rounded h-60"
                                />
                            </div>

                            <div className="space-y-4 ">
                                <label className="block text-sm font-medium text-black">
                                    Reported Employees
                                </label>

                                {/* Selection Controls */}
                                <div className="flex items-center flex-col md:flex-row justify-center gap-3">
                                    <div className="">
                                        <select
                                            value={selectedEmployee}
                                            onChange={(e) =>
                                                setSelectedEmployee(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2.5 border mb-0 border-green-500 rounded-md bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        >
                                            <option
                                                value=""
                                                className="text-black/60"
                                            >
                                                Select an employee to report
                                            </option>
                                            {employees
                                                .filter(
                                                    (employee) =>
                                                        employee.user_id !==
                                                            user.user_id &&
                                                        !relatedEmployees.includes(
                                                            employee.user_id,
                                                        ),
                                                )
                                                .map((employee) => (
                                                    <option
                                                        key={employee.user_id}
                                                        value={employee.user_id}
                                                        className="text-black "
                                                    >
                                                        {employee.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddEmployee}
                                        disabled={!selectedEmployee}
                                        className="min-w-[100px] h-[42px] bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        Add
                                    </button>
                                </div>

                                {/* Selected Employees List */}
                                <div className="flex flex-wrap justify-center gap-2 min-h-[40px] p-2 bg-green-50/50 rounded-md">
                                    {relatedEmployees.length === 0 ? (
                                        <div className="w-full text-center text-black/60 py-1">
                                            No employees selected
                                        </div>
                                    ) : (
                                        relatedEmployees.map((employeeId) => (
                                            <div
                                                key={employeeId}
                                                className="inline-flex  items-center bg-white border border-green-600 rounded-md px-3 py-1.5 group transition-all duration-200 hover:border-green-400"
                                            >
                                                <span className="text-sm font-medium text-black">
                                                    {
                                                        employees.find(
                                                            (e) =>
                                                                e.user_id ===
                                                                employeeId,
                                                        )?.name
                                                    }
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveEmployee(
                                                            employeeId,
                                                        )
                                                    }
                                                    className="ml-2 text-black/40 hover:text-red-500 transition-colors duration-200"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6 pt-10">
                                {/* File Upload Section */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-black">
                                        Upload PDF Report (Optional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="application/pdf"
                                            className="w-full p-3 border border-green-500 rounded-md text-black bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-500 file:text-white hover:file:bg-green-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        <div className="text-xs text-black/60 mt-1">
                                            Supported format: PDF (Max size:
                                            10MB)
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button Section */}
                                <div className="flex flex-col gap-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3.5 bg-green-700 text-white rounded-md hover:bg-green-600 active:bg-green-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Submit Incident Report
                                    </button>

                                    {/* Optional help text */}
                                    <p className="text-center text-sm text-black/60">
                                        Please review all information before
                                        submitting the report
                                    </p>
                                </div>
                            </div>
                        </form>
                        {message && (
                            <p className="mt-4 text-green-900">{message}</p>
                        )}

                        <div
                            className="overflow-y-auto"
                            style={{ maxHeight: "400px" }}
                        >
                            <div className="md:hidden max-h-[400px] overflow-y-auto rounded-lg mt-2">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50"
                                    >
                                        <p className="text-gray-700">
                                            <strong>Title:</strong>{" "}
                                            {report.title}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Incident Date:</strong>{" "}
                                            {formatIncidentDate(
                                                report.incident_date,
                                            )}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Severity:</strong>{" "}
                                            {report.severity}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Status:</strong>{" "}
                                            {report.status}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>PDF:</strong>{" "}
                                            {report.file_path ? (
                                                <a
                                                    href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${report.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                "No PDF"
                                            )}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Reported Employees:</strong>{" "}
                                            {report.reported_employee_ids &&
                                            report.reported_employee_ids
                                                .length > 0
                                                ? report.reported_employee_ids.map(
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
                                                              report
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
                                        <div className="mt-2 flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    openDetailModal(report)
                                                }
                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(report.id)
                                                }
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block overflow-x-auto">
                                <table className="employee-table min-w-full border-collapse">
                                    <thead className="text-white sticky top-[-1px]">
                                        <tr>
                                            <th className="p-2">Title</th>
                                            <th className="p-2">
                                                Incident Date
                                            </th>
                                            <th className="p-2">
                                                Reported date
                                            </th>
                                            <th className="p-2">Severity</th>
                                            <th className="p-2">Status</th>
                                            <th className="p-2">PDF</th>
                                            <th className="p-2">
                                                Reported Employees
                                            </th>
                                            <th className="p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-black">
                                        {reports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className="text-center"
                                            >
                                                <td className="p-2 border">
                                                    {report.title}
                                                </td>
                                                <td className="p-2 border">
                                                    {formatIncidentDate(
                                                        report.incident_date,
                                                    )}
                                                </td>
                                                <td className="p-2 border">
                                                    {formatReportedDate(
                                                        report.created_at,
                                                    )}
                                                </td>
                                                <td className="p-2 border">
                                                    {report.severity}
                                                </td>
                                                <td className="p-2 border">
                                                    {report.status}
                                                </td>
                                                <td className="p-2 border">
                                                    {report.file_path ? (
                                                        <a
                                                            href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${report.file_path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            View
                                                        </a>
                                                    ) : (
                                                        "No PDF"
                                                    )}
                                                </td>
                                                <td className="p-2 border">
                                                    {report.reported_employee_ids &&
                                                    report.reported_employee_ids
                                                        .length > 0
                                                        ? report.reported_employee_ids.map(
                                                              (
                                                                  employeeId,
                                                                  index,
                                                              ) => (
                                                                  <span
                                                                      key={
                                                                          employeeId
                                                                      }
                                                                  >
                                                                      {
                                                                          employees.find(
                                                                              (
                                                                                  e,
                                                                              ) =>
                                                                                  e.user_id ===
                                                                                  employeeId,
                                                                          )
                                                                              ?.name
                                                                      }
                                                                      {index <
                                                                      report
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
                                                <td className="p-2 border">
                                                    <button
                                                        onClick={() =>
                                                            openDetailModal(
                                                                report,
                                                            )
                                                        }
                                                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                report.id,
                                                            )
                                                        }
                                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeButton === "compliance" && (
                    <div>
                        <h2 className="md:text-2xl text-base font-semibold mb-4 text-black">
                            Reported Incidents
                        </h2>
                        <div className="md:hidden max-h-[400px] overflow-y-auto rounded-lg">
                            {reportedIncidents.length === 0 ? (
                                <p className="text-black text-center py-4">
                                    No reported incidents found.
                                </p>
                            ) : (
                                reportedIncidents.map((incident) => (
                                    <div
                                        key={incident.id}
                                        className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50"
                                    >
                                        <p className="text-gray-700">
                                            <strong>Title:</strong>{" "}
                                            {incident.title}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Description:</strong>{" "}
                                            {incident.description}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Incident Date:</strong>{" "}
                                            {incident.incident_date}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Severity:</strong>{" "}
                                            {incident.severity}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>PDF:</strong>{" "}
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
                                        </p>
                                        <div className="mt-2">
                                            <button
                                                onClick={() =>
                                                    openComplianceModal(
                                                        incident,
                                                    )
                                                }
                                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                            >
                                                Submit Compliance Report
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Desktop View for Compliance Reports */}
                        <div className="hidden md:block">
                            {reportedIncidents.length === 0 ? (
                                <p className="text-black text-center py-4">
                                    No reported incidents found.
                                </p>
                            ) : (
                                <table className="employee-table min-w-full border-collapse">
                                    <thead className="text-white sticky top-[-1px]">
                                        <tr>
                                            <th className="p-2">Title</th>
                                            <th className="p-2">Description</th>
                                            <th className="p-2">
                                                Incident Date
                                            </th>
                                            <th className="p-2">
                                                Reported Date
                                            </th>
                                            <th className="p-2">Severity</th>
                                            <th className="p-2">PDF</th>
                                            <th className="p-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-black">
                                        {reportedIncidents.map((incident) => (
                                            <tr
                                                key={incident.id}
                                                className="text-center"
                                            >
                                                <td className="p-2 border">
                                                    {incident.title}
                                                </td>
                                                <td className="p-2 border">
                                                    {incident.description}
                                                </td>
                                                <td className="p-2 border">
                                                    {incident.incident_date}
                                                </td>
                                                <td className="p-2 border">
                                                    {new Date(
                                                        incident.created_at,
                                                    ).toLocaleString()}
                                                </td>
                                                <td className="p-2 border">
                                                    {incident.severity}
                                                </td>
                                                <td className="p-2 border">
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
                                                <td className="p-2 border">
                                                    <button
                                                        onClick={() =>
                                                            openComplianceModal(
                                                                incident,
                                                            )
                                                        }
                                                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                                                    >
                                                        Submit Compliance Report
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {isDetailModalOpen && selectedReport && (
                    <div className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl h-fit overflow-y-auto">
                            <h3 className="text-xl font-semibold mb-4 text-black">
                                {activeButton === "compliance"
                                    ? "Respond to Incident"
                                    : "Incident Report Details"}
                            </h3>
                            <div className="space-y-2 text-black text-start">
                                <p>
                                    <strong>Title:</strong>{" "}
                                    {selectedReport.title}
                                </p>
                                <p>
                                    <strong>Description:</strong>{" "}
                                    {selectedReport.description}
                                </p>
                                <p>
                                    <strong>Incident Date:</strong>{" "}
                                    {formatIncidentDate(
                                        selectedReport.incident_date,
                                    )}
                                </p>
                                <p>
                                    <strong>Reported Date:</strong>{" "}
                                    {formatReportedDate(
                                        selectedReport.created_at,
                                    )}
                                </p>
                                <p>
                                    <strong>Severity:</strong>{" "}
                                    {selectedReport.severity}
                                </p>
                                <p>
                                    <strong>Status:</strong>{" "}
                                    {selectedReport.status}
                                </p>
                                <p>
                                    <strong>PDF:</strong>{" "}
                                    {selectedReport.file_path ? (
                                        <a
                                            href={`${import.meta.env.VITE_BASE_URL.replace("/api", "")}/storage/${selectedReport.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    ) : (
                                        "No PDF"
                                    )}
                                </p>

                                {/* Compliance response form */}
                                {activeButton === "compliance" && (
                                    <div>
                                        <label className="block text-gray-700">
                                            Compliance Response:
                                        </label>
                                        <textarea
                                            value={complianceResponse}
                                            onChange={(e) =>
                                                setComplianceResponse(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-green-900 rounded h-40"
                                            placeholder="Enter your compliance response here..."
                                        />

                                        <label className="block text-gray-700 mt-4">
                                            Upload PDF response (optional)
                                        </label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="application/pdf"
                                            className="w-full p-2 border border-green-900 rounded"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 mt-4">
                                {/* Close button */}
                                <button
                                    onClick={closeDetailModal}
                                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                >
                                    Close
                                </button>

                                {/* Submit compliance button */}
                                {activeButton === "compliance" && (
                                    <button
                                        onClick={() =>
                                            handleComplianceSubmit(
                                                selectedReport.id,
                                            )
                                        }
                                        className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
                                    >
                                        Submit Compliance Response
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-xl font-semibold mb-4 text-black">
                                Confirm Deletion
                            </h3>
                            <p className="text-black">
                                Are you sure you want to delete this report?
                            </p>
                            <div className="mt-4 flex justify-center space-x-2 text-black">
                                <button
                                    onClick={cancelDelete}
                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-900"
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

export default IncidentReportForm;
