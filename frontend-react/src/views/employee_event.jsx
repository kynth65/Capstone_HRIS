import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { Building, Lock } from "lucide-react";

const getEventStatus = (eventDateTime) => {
    const now = new Date();
    const eventDate = new Date(eventDateTime);
    const isToday = eventDate.toDateString() === now.toDateString();
    const isPast = eventDate < now;

    if (isPast) return "done";
    if (isToday) {
        const eventTime = eventDate.getTime();
        const currentTime = now.getTime();
        if (
            currentTime >= eventTime &&
            currentTime <= eventTime + 2 * 60 * 60 * 1000
        ) {
            return "ongoing";
        }
        return "today";
    }
    return "upcoming";
};

const getStatusStyles = (status) => {
    switch (status) {
        case "ongoing":
            return {
                cardStyle: "bg-green-50",
                dotColor: "bg-green-500",
                badge: "bg-green-100 text-green-800 border border-green-300",
                text: "Ongoing",
            };
        case "today":
            return {
                cardStyle: "bg-blue-50",
                dotColor: "bg-blue-500",
                badge: "bg-blue-100 text-blue-800 border border-blue-300",
                text: "Today",
            };
        case "done":
            return {
                cardStyle: "bg-neutral-50 opacity-75",
                dotColor: "bg-neutral-500",
                badge: "bg-neutral-100 text-neutral-800 border border-neutral-300",
                text: "Done",
            };
        default:
            return {
                cardStyle: "bg-neutral-50",
                dotColor: "bg-purple-500",
                badge: "bg-purple-100 text-purple-800 border border-purple-300",
                text: "Upcoming",
            };
    }
};

const EmployeeEvent = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewModal, setViewModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        fetchEvents();
        fetchDepartments();
        fetchEmployees();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await axiosClient.get("/departments");
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosClient.get("/events/upcoming");
            const processedEvents = response.data.map((event) => ({
                ...event,
                selected_users: event.selected_users
                    ? typeof event.selected_users === "string"
                        ? JSON.parse(event.selected_users)
                        : event.selected_users
                    : [],
                selected_departments: event.selected_departments
                    ? typeof event.selected_departments === "string"
                        ? JSON.parse(event.selected_departments)
                        : event.selected_departments
                    : [],
            }));

            const sortedEvents = processedEvents.sort((a, b) => {
                const statusA = getEventStatus(a.event_date);
                const statusB = getEventStatus(b.event_date);

                const priority = {
                    ongoing: 4,
                    today: 3,
                    upcoming: 2,
                    done: 1,
                };

                if (priority[statusA] !== priority[statusB]) {
                    return priority[statusB] - priority[statusA];
                }

                if (statusA === "done" && statusB === "done") {
                    return new Date(b.event_date) - new Date(a.event_date);
                }

                return new Date(a.event_date) - new Date(b.event_date);
            });

            setEvents(sortedEvents);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to load events");
            setLoading(false);
        }
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

    const formatEventDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);

            if (isNaN(date.getTime())) {
                console.error("Invalid date string:", dateTimeStr);
                return {
                    date: "Invalid Date",
                    time: "Invalid Date",
                };
            }

            return {
                date: date.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                }),
                time: date.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                }),
            };
        } catch (error) {
            console.error("Error formatting date:", error);
            return {
                date: "Invalid Date",
                time: "Invalid Date",
            };
        }
    };

    const handleView = (event) => {
        setSelectedEvent(event);
        setViewModal(true);
    };

    if (loading) return <div className="animate-pulse">Loading events...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <>
            <div className="flex w-full justify-center space-x-5 py-2 px-4 mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="font-bold text-lg text-black">
                        Upcoming Events
                    </h1>
                </div>
            </div>

            <div className="md:hidden w-full px-4 overflow-y-auto max-h-[360px]">
                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event) => {
                            const { date, time } = formatEventDateTime(
                                event.event_date,
                            );
                            const status = getEventStatus(event.event_date);
                            const styles = getStatusStyles(status);

                            return (
                                <div
                                    key={event.id}
                                    onClick={() => handleView(event)}
                                    className={`p-3 rounded-lg transition-colors cursor-pointer relative ${styles.cardStyle} hover:bg-opacity-75`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">
                                            {getEventIcon(event.type)}
                                        </span>
                                        <h3 className="font-semibold text-neutral-800 truncate flex-1">
                                            {event.title}
                                        </h3>
                                        <span
                                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}
                                        >
                                            {styles.text}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-600">
                                        {time} · {date}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-neutral-600 py-4">
                        No upcoming events
                    </div>
                )}
            </div>

            <div className="hidden md:block w-full px-4 overflow-y-auto max-h-[360px]">
                {events.length > 0 ? (
                    <div className="space-y-3">
                        {events.map((event) => {
                            const { date, time } = formatEventDateTime(
                                event.event_date,
                            );
                            const status = getEventStatus(event.event_date);
                            const styles = getStatusStyles(status);

                            return (
                                <div
                                    key={event.id}
                                    className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer relative ${styles.cardStyle}`}
                                    onClick={() => handleView(event)}
                                >
                                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2">
                                        <div
                                            className={`w-2 h-2 rounded-full ${styles.dotColor}`}
                                        ></div>
                                    </div>

                                    <div className="text-2xl mr-3">
                                        {getEventIcon(event.type)}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-neutral-800 truncate max-w-[200px]">
                                                {event.title}
                                            </h3>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}
                                            >
                                                {styles.text}
                                            </span>
                                            {event.selected_users?.length >
                                                0 && (
                                                <span className="text-sm text-neutral-600 truncate">
                                                    with{" "}
                                                    {
                                                        event.selected_users
                                                            .length
                                                    }{" "}
                                                    {event.selected_users
                                                        .length === 1
                                                        ? "person"
                                                        : "people"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {event.audience === "all_team" ? (
                                                <div className="flex -space-x-2">
                                                    {[...Array(3)].map(
                                                        (_, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-white"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            ) : event.audience === "none" ? (
                                                <Lock className="w-5 h-5 text-neutral-400" />
                                            ) : (
                                                <Building className="w-5 h-5 text-neutral-500" />
                                            )}
                                            <span className="text-sm text-neutral-600 ml-1 truncate max-w-[150px]">
                                                {event.audience === "all_team"
                                                    ? "All Team"
                                                    : event.audience === "none"
                                                      ? "Private"
                                                      : `${event.selected_departments?.length || 0} ${
                                                            event
                                                                .selected_departments
                                                                ?.length === 1
                                                                ? "Department"
                                                                : "Departments"
                                                        }`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="text-sm font-medium text-neutral-900">
                                            {time}
                                        </div>
                                        <div className="text-sm text-neutral-600">
                                            {date}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-neutral-600 py-4">
                        No upcoming events
                    </div>
                )}
            </div>

            {viewModal && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                    {getEventIcon(selectedEvent.type)}
                                </span>
                                <div>
                                    <h2 className="text-xl font-bold text-left">
                                        {selectedEvent.title}
                                    </h2>
                                    <p className="text-sm text-neutral-600">
                                        {selectedEvent.type
                                            .charAt(0)
                                            .toUpperCase() +
                                            selectedEvent.type.slice(1)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="text-left">
                                    <p className="text-sm font-semibold">
                                        Date & Time
                                    </p>
                                    <p className="text-sm">
                                        {
                                            formatEventDateTime(
                                                selectedEvent.event_date,
                                            ).date
                                        }{" "}
                                        at{" "}
                                        {
                                            formatEventDateTime(
                                                selectedEvent.event_date,
                                            ).time
                                        }
                                    </p>
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-semibold">
                                        Audience
                                    </p>
                                    <p className="text-sm">
                                        {selectedEvent.audience === "all_team"
                                            ? "All Team Members"
                                            : selectedEvent.audience === "none"
                                              ? "Private Event"
                                              : "Specific Departments"}
                                    </p>
                                </div>

                                {selectedEvent.selected_departments?.length >
                                    0 && (
                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Departments
                                        </p>
                                        <div className="space-y-1">
                                            {selectedEvent.selected_departments.map(
                                                (deptId) => {
                                                    const department =
                                                        departments.find(
                                                            (d) =>
                                                                d.id === deptId,
                                                        );
                                                    return (
                                                        <div
                                                            key={deptId}
                                                            className="text-sm py-1 px-2 bg-neutral-50 rounded-md"
                                                        >
                                                            {department
                                                                ? department.name
                                                                : "Unknown Department"}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedEvent.selected_users?.length > 0 && (
                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Participants
                                        </p>
                                        <div className="space-y-1">
                                            {selectedEvent.selected_users.map(
                                                (userId) => {
                                                    const employee =
                                                        employees.find(
                                                            (e) =>
                                                                e.user_id ===
                                                                userId,
                                                        );
                                                    return (
                                                        <div
                                                            key={userId}
                                                            className="text-sm py-1 px-2 bg-neutral-50 rounded-md"
                                                        >
                                                            {employee
                                                                ? `${employee.first_name} ${employee.last_name}`
                                                                : "Unknown Employee"}
                                                        </div>
                                                    );
                                                },
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => {
                                        setViewModal(false);
                                        setSelectedEvent(null);
                                    }}
                                    className="px-4 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-neutral-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EmployeeEvent;
