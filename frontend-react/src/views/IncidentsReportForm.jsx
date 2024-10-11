import React, { useEffect, useState } from 'react';
import axiosClient from '../axiosClient';

const IncidentReportForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [severity, setSeverity] = useState('low');
    const [pdfFile, setPdfFile] = useState(null);
    const [message, setMessage] = useState('');
    const [reports, setReports] = useState([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axiosClient.get('/incidents'); // Adjust route if necessary
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
        formData.append('title', title);
        formData.append('description', description);
        formData.append('date', date);
        formData.append('severity', severity);
        if (pdfFile) {
            formData.append('pdf_file', pdfFile);
        }

        try {
            await axiosClient.post('/incidents', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage('Report submitted successfully');
            setTitle('');
            setDescription('');
            setDate('');
            setSeverity('low');
            setPdfFile(null);
            fetchReports(); // Refresh the report list
        } catch (error) {
            console.error("Error submitting report:", error);
            setMessage('Failed to submit report');
        }
    };

    return (
        <div>
            <h2>Submit Incident Report</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                <div>
                    <label>Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                    <label>Severity</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)} required>
                        <option value="low">Low</option>
                        <option value="high">High</option>
                        <option value="severe">Severe</option>
                    </select>
                </div>
                <div>
                    <label>Upload PDF (optional)</label>
                    <input type="file" onChange={handleFileChange} accept="application/pdf" />
                </div>
                <button type="submit">Submit Report</button>
            </form>
            {message && <p>{message}</p>}

            <h2>My Submitted Reports</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Severity</th>
                        <th>PDF</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report.id}>
                            <td>{report.title}</td>
                            <td>{report.description}</td>
                            <td>{report.date}</td>
                            <td>{report.severity}</td>
                            <td>
                                {report.pdf_file_path ? (
                                    <a href={`http://localhost:8000/storage/${report.pdf_file_path}`} target="_blank" rel="noopener noreferrer">
                                        View PDF
                                    </a>
                                ) : (
                                    'No PDF'
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IncidentReportForm;
