import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { PlusCircle } from "lucide-react";

const Event = () => {
    // Define TYPES and AUDIENCES constants
    const TYPES = {
        meeting: "Meeting",
        party: "Party",
        birthday: "Birthday",
        anniversary: "Anniversary",
        other: "Other",
    };

    const AUDIENCES = {
        all_team: "All Team",
        specific_department: "Specific Department",
        specific_people: "Specific People",
    };

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        event_date: "",
        event_time: "",
        audience: "all_team",
        with_person: "",
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axiosClient.get("/events/upcoming");
            setEvents(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events");
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventDateTime = `${formData.event_date}T${formData.event_time}`;
            const payload = {
                ...formData,
                event_date: eventDateTime,
            };

            if (editingEvent) {
                await axiosClient.put(`/events/${editingEvent.id}`, payload);
            } else {
                await axiosClient.post("/events", payload);
            }

            setShowModal(false);
            setEditingEvent(null);
            setFormData({
                title: "",
                type: "",
                event_date: "",
                event_time: "",
                audience: "all_team",
                with_person: "",
            });
            fetchEvents();
        } catch (error) {
            console.error("Error saving event:", error);
        }
    };

    const handleEdit = (event) => {
        const eventDate = new Date(event.event_date);
        setEditingEvent(event);
        setFormData({
            title: event.title,
            type: event.type,
            event_date: eventDate.toISOString().split("T")[0],
            event_time: eventDate.toTimeString().slice(0, 5),
            audience: event.audience,
            with_person: event.with_person || "",
        });
        setShowModal(true);
    };

    const getEventIcon = (type) => {
        const icons = {
            meeting: "🏢",
            party: "🎉",
            birthday: "🎂",
            anniversary: "🎊",
            other: "📅",
        };
        return icons[type] || "📅";
    };

    if (loading) return <div className="animate-pulse">Loading events...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <>
            <div className="flex justify-between items-center px-4 mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="font-bold text-lg text-black">
                        Upcoming Events
                    </h1>
                    <span className="text-gray-400">→</span>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="text-blue-600 hover:text-blue-700"
                >
                    <PlusCircle className="w-5 h-5" />
                </button>
            </div>

            <div className="w-full px-4 overflow-y-auto max-h-[260px]">
                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                onClick={() => handleEdit(event)}
                            >
                                <div className="text-2xl mr-3">
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-gray-800">
                                            {event.title}
                                        </h3>
                                        {event.with_person && (
                                            <span className="text-sm text-gray-500">
                                                with {event.with_person}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {event.audience === "all_team" && (
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-sm text-gray-500 ml-1">
                                            {event.audience === "all_team"
                                                ? "All Team"
                                                : event.audience}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-900">
                                        {event.time}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {event.date}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-4">
                        No upcoming events
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md text-black">
                        <h2 className="text-xl font-bold mb-4">
                            {editingEvent ? "Edit Event" : "Add New Event"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            title: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            type: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select type</option>
                                    {Object.entries(TYPES).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.event_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                event_date: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.event_time}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                event_time: e.target.value,
                                            })
                                        }
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    With Person
                                </label>
                                <input
                                    type="text"
                                    value={formData.with_person}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            with_person: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Audience
                                </label>
                                <select
                                    value={formData.audience}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            audience: e.target.value,
                                        })
                                    }
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    {Object.entries(AUDIENCES).map(
                                        ([key, value]) => (
                                            <option key={key} value={key}>
                                                {value}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingEvent(null);
                                        setFormData({
                                            title: "",
                                            type: "",
                                            event_date: "",
                                            event_time: "",
                                            audience: "all_team",
                                            with_person: "",
                                        });
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingEvent ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Event;
