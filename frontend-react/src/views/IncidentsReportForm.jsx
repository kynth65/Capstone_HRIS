import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const IncidentReportForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [severity, setSeverity] = useState("low");
  const [status, setStatus] = useState("pending");
  const [pdfFile, setPdfFile] = useState(null);
  const [message, setMessage] = useState("");
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

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
    formData.append("title", title);
    formData.append("description", description);
    formData.append("date", date);
    formData.append("severity", severity);
    formData.append("status", status);
    if (pdfFile) {
      formData.append("pdf_file", pdfFile);
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
      setDate("");
      setSeverity("low");
      setStatus("pending");
      setPdfFile(null);
      fetchReports();
    } catch (error) {
      console.error("Error submitting report:", error);
      setMessage("Failed to submit report");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="md:text-2xl text-base font-semibold mb-4 text-black">Submit Incident Report</h2>
      <form onSubmit={handleSubmit} className="space-y-4 text-black">
        <div>
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full p-2 border border-green-900 rounded"
          />
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
        <div className="flex justify-center items-center space-x-2">
          <div>
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
              className="w-full p-2 border border-green-900 py-3 rounded"
            >
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-gray-700">Upload PDF (optional)</label>
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

      <h2 className="md:text-xl text-base font-semibold mt-8 mb-4 text-black">My Submitted Reports</h2>
      <div className="overflow-auto">
        <table className="min-w-full border-collapse border border-green-900">
          <thead className="bg-green-900 text-white sticky top-0">
            <tr>
              <th className="p-2 border border-green-900">Title</th>
              <th className="p-2 border border-green-900 hidden md:table-cell">Description</th>
              <th className="p-2 border border-green-900 hidden lg:table-cell">Date</th>
              <th className="p-2 border border-green-900">Severity</th>
              <th className="p-2 border border-green-900">Status</th>
              <th className="p-2 border border-green-900">PDF</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="text-center">
                <td className="p-2 border border-green-900">{report.title}</td>
                <td className="p-2 border border-green-900 hidden md:table-cell">
                  {report.description}
                </td>
                <td className="p-2 border border-green-900 hidden lg:table-cell">{report.date}</td>
                <td className="p-2 border border-green-900">
                  {report.severity}
                </td>
                <td className="p-2 border border-green-900">{report.status}</td>
                <td className="p-2 border border-green-900">
                  {report.pdf_file_path ? (
                    <a
                      href={`http://localhost:8000/storage/${report.pdf_file_path}`}
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
