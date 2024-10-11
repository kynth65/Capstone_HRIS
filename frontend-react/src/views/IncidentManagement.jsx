import React, { useEffect, useState } from 'react';
import axiosClient from '../axiosClient';

const IncidentManagement = () => {
    const [incidents, setIncidents] = useState([]);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        status: 'pending', // Default status
        pdfFile: null,
    });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axiosClient.get('/incidents');
            setIncidents(response.data);
        } catch (error) {
            console.error("Error fetching incidents:", error);
        }
    };

    const handleEdit = (incident) => {
        setSelectedIncident(incident);
        setForm({
            status: incident.status,
            pdfFile: null,
        });
        setEditMode(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosClient.delete(`/incidents/${id}`);
            fetchIncidents();
        } catch (error) {
            console.error("Error deleting incident:", error);
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
        setForm((prevForm) => ({
            ...prevForm,
            pdfFile: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('status', form.status);
        if (form.pdfFile) {
            formData.append('pdf_file', form.pdfFile);
        }

        try {
            if (editMode && selectedIncident) {
                await axiosClient.put(`/incidents/${selectedIncident.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            setEditMode(false);
            setSelectedIncident(null);
            setForm({
                status: 'pending',
                pdfFile: null,
            });
            fetchIncidents();
        } catch (error) {
            console.error("Error updating incident:", error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Incident Management</h2>
            <div className="overflow-auto">
                <table className="min-w-full border-collapse border border-green-900">
                    <thead className="bg-green-900 text-white sticky top-0">
                        <tr>
                            <th className="p-2 border border-green-900">Title</th>
                            <th className="p-2 border border-green-900">Description</th>
                            <th className="p-2 border border-green-900">Date</th>
                            <th className="p-2 border border-green-900">Severity</th>
                            <th className="p-2 border border-green-900">Status</th>
                            <th className="p-2 border border-green-900">PDF</th>
                            <th className="p-2 border border-green-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((incident) => (
                            <tr key={incident.id} className="text-center">
                                <td className="p-2 border border-green-900">{incident.title}</td>
                                <td className="p-2 border border-green-900">{incident.description}</td>
                                <td className="p-2 border border-green-900">{incident.date}</td>
                                <td className="p-2 border border-green-900">{incident.severity}</td>
                                <td className="p-2 border border-green-900">{incident.status}</td>
                                <td className="p-2 border border-green-900">
                                    {incident.pdf_file_path ? (
                                        <a
                                            href={`http://localhost:8000/storage/${incident.pdf_file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View PDF
                                        </a>
                                    ) : (
                                        'No PDF'
                                    )}
                                </td>
                                <td className="p-2 border border-green-900">
                                    <button
                                        onClick={() => handleEdit(incident)}
                                        className="mr-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(incident.id)}
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

            {editMode && (
                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-2">Edit Incident Status</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border border-green-900 rounded"
                            >
                                <option value="pending">Pending</option>
                                <option value="investigating">Investigating</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700">Upload PDF Report (optional)</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="application/pdf"
                                className="w-full p-2 border border-green-900 rounded"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-green-900 text-white rounded hover:bg-green-800"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default IncidentManagement;
