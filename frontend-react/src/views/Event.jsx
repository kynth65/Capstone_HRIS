import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axiosClient from "../axiosClient";

const UpcomingEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isHR, setIsHR] = useState(false); // You'll need to set this based on user role

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

    if (loading) return <div className="animate-pulse">Loading events...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    Upcoming Events
                </h2>
                {isHR && (
                    <button
                        onClick={() => {
                            /* Add your edit/add event handler */
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Add Event
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="text-2xl mr-4">{event.icon}</div>
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
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{event.audience}</span>
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
        </div>
    );
};

export default UpcomingEvents;
