import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";
const IncidentReportForm = () => {
    const { user, token, setToken, setUser } = useStateContext();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [incidentDate, setIncidentDate] = useState("");
    const [severity, setSeverity] = useState("Low");
    const [status, setStatus] = useState("Pending");
    const [pdfFile, setPdfFile] = useState(null);
    const [message, setMessage] = useState("");
    const [reports, setReports] = useState([]);
    const [userId, setUserId] = useState(""); // New state for user ID

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axiosClient.get("/user");
                setUser(data);
                // console.log("User fetched successfully:", data); // Debugging line
            } catch (error) {
                // console.error("Error fetching user:", error.response); // Debugging line
                if (error.response && error.response.status === 401) {
                    try {
                        await refresh();
                        const { data } = await axiosClient.get("/user");
                        setUser(data);
                        //   console.log("User fetched after refresh:", data); // Debugging line
                    } catch (refreshError) {
                        //    console.error("Error refreshing token:", refreshError); // Debugging line
                    }
                } else {
                }
            }
        };
        fetchReports();
        fetchUser();
    }, [setUser]);
    const fetchReports = async () => {
        try {
            const response = await axiosClient.get("/incidents");
            setReports(response.data);
        } catch (error) {
            console.error("Error fetching incident reports:", error);
        }
    };

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("user_id", user.user_id); // Attach the user ID
        formData.append("name", user.name); // Attach the user's name
        formData.append("title", title);
        formData.append("description", description);
        formData.append("incident_date", incidentDate);
        formData.append("severity", severity);
        formData.append("status", status);
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
            setSeverity("low");
            setStatus("Pending");
            setPdfFile(null);
            fetchReports();
        } catch (error) {
            console.error("Error submitting report:", error);
            setMessage("Failed to submit report");
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="md:text-2xl text-base font-semibold mb-4 text-black">
                Submit Incident Report
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-black">
                <div className="grid grid-cols-3 space-x-2 items-center">
                    <div>
                        <label className="block text-gray-700">
                            Title of report
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                            onChange={(e) => setIncidentDate(e.target.value)}
                            required
                            className="w-full p-2 border border-green-900 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700">Severity</label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
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
                    <label className="block text-gray-700">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-2 border border-green-900 rounded"
                    />
                </div>
                <div>
                    <label className="block text-gray-700">
                        Upload PDF report (optional)
                    </label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept="application/pdf"
                        className="w-full p-2 border border-green-900 rounded"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full p-2 bg-green-900 text-white font-semibold rounded hover:bg-green-800"
                >
                    Submit Report
                </button>
            </form>
            {message && <p className="mt-4 text-green-900">{message}</p>}

            <h2 className="md:text-xl text-base font-semibold mt-8 mb-4 text-black">
                My Submitted Reports
            </h2>
            <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
                <table className="employee-table min-w-full border-collapse border border-green-900">
                    <thead className="bg-green-900 text-white sticky top-[-1px]">
                        <tr>
                            <th className="p-2 border border-green-900">
                                Title
                            </th>
                            <th className="p-2 border border-green-900 hidden md:table-cell">
                                Description
                            </th>
                            <th className="p-2 border border-green-900 hidden lg:table-cell">
                                Incident Date
                            </th>
                            <th className="p-2 border border-green-900">
                                Severity
                            </th>
                            <th className="p-2 border border-green-900">
                                Status
                            </th>
                            <th className="p-2 border border-green-900">PDF</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {reports.map((report) => (
                            <tr key={report.id} className="text-center">
                                <td className="p-2 border border-green-900">
                                    {report.title}
                                </td>
                                <td className="p-2 border border-green-900 hidden md:table-cell">
                                    {report.description}
                                </td>
                                <td className="p-2 border border-green-900 hidden lg:table-cell">
                                    {report.incident_date}
                                </td>
                                <td className="p-2 border border-green-900">
                                    {report.severity}
                                </td>
                                <td className="p-2 border border-green-900">
                                    {report.status}
                                </td>
                                <td className="p-2 border border-green-900">
                                    {report.file_path ? (
                                        <a
                                            href={`http://localhost:8000/storage/${report.file_path}`}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentReportForm;
