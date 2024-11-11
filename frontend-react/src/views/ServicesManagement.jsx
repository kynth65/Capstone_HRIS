import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';

const ServicesManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axiosClient.get('/services');
            setServices(Array.isArray(response.data.data) ? response.data.data : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Failed to fetch services');
            setServices([]);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axiosClient.put(`/services/${editingId}`, formData);
            } else {
                await axiosClient.post('/services', formData);
            }
            await fetchServices();
            resetForm();
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this service?')) return;
        try {
            await axiosClient.delete(`/services/${id}`);
            await fetchServices();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete service');
        }
    };

    const handleEdit = (service) => {
        setFormData({
            title: service.title,
            description: service.description,
        });
        setEditingId(service.id);
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({ title: '', description: '' });
        setEditingId(null);
        setShowForm(false);
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow text-black">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-green-800">Services Management</h2>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="px-3 py-1 bg-green-800 text-white text-sm rounded hover:bg-green-700"
                    >
                        {showForm ? 'Cancel' : 'Add Service'}
                    </button>
                </div>

                {error && (
                    <div className="m-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                        <button onClick={() => setError(null)} className="float-right">×</button>
                    </div>
                )}

                {showForm && (
                    <div className="p-4 border-b">
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full p-2 border rounded text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-2 border rounded text-sm"
                                    rows={3}
                                    required
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    type="submit"
                                    className="px-3 py-1 bg-green-800 text-white text-sm rounded hover:bg-green-700"
                                >
                                    {editingId ? 'Update' : 'Add'}
                                </button>
                                <button 
                                    type="button"
                                    className="px-3 py-1 border text-sm rounded hover:bg-gray-50"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {services.length > 0 ? (
                        services.map((service) => (
                            <div key={service.id} className="border rounded-lg p-3">
                                <h3 className="font-medium text-green-800">{service.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="px-2 py-1 text-xs border border-green-800 text-green-800 rounded hover:bg-green-800 hover:text-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="px-2 py-1 text-xs border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-4 text-gray-500">
                            No services available
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicesManagement;