import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import {
    PlusCircle,
    ChevronLeft,
    ChevronRight,
    Building,
    Lock,
    X,
} from "lucide-react";

const getEventStatus = (eventDateTime) => {
    const now = new Date();
    const eventDate = new Date(eventDateTime);
    const isToday = eventDate.toDateString() === now.toDateString();
    const isPast = eventDate < now;

    if (isPast) return "done";
    if (isToday) {
        const eventTime = eventDate.getTime();
        const currentTime = now.getTime();
        // Check if the event is happening now (within a 2-hour window)
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
                cardStyle: "bg-green-50 hover:bg-green-100",
                dotColor: "bg-green-500",
                badge: "bg-green-100 text-green-800 border border-green-300",
                text: "Ongoing",
            };
        case "today":
            return {
                cardStyle: "bg-blue-50 hover:bg-blue-100",
                dotColor: "bg-blue-500",
                badge: "bg-blue-100 text-blue-800 border border-blue-300",
                text: "Today",
            };
        case "done":
            return {
                cardStyle: "bg-gray-50 opacity-75",
                dotColor: "bg-gray-500",
                badge: "bg-gray-100 text-gray-800 border border-gray-300",
                text: "Done",
            };
        default:
            return {
                cardStyle: "bg-gray-50 hover:bg-gray-100",
                dotColor: "bg-purple-500",
                badge: "bg-purple-100 text-purple-800 border border-purple-300",
                text: "Upcoming",
            };
    }
};

const Event = () => {
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
        none: "None",
    };

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [newDepartment, setNewDepartment] = useState("");
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        type: "",
        event_date: "",
        event_time: "",
        audience: "all_team",
        selected_users: [],
        selected_departments: [],
    });

    useEffect(() => {
        fetchEvents();
        fetchEmployees();
        fetchDepartments();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employees");
            console.log("Fetched employees:", response.data);
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axiosClient.get("/departments");
            setDepartments(response.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const handleAddDepartment = async () => {
        if (!newDepartment.trim()) return;

        try {
            const response = await axiosClient.post("/departments", {
                name: newDepartment,
            });
            setDepartments([...departments, response.data]);
            setNewDepartment("");
        } catch (error) {
            console.error("Error adding department:", error);
        }
    };

    const handleEmployeeSelect = (userId) => {
        if (!userId) return;

        const employee = employees.find((emp) => emp.user_id === userId);
        if (
            employee &&
            !selectedEmployees.some((emp) => emp.user_id === userId)
        ) {
            setSelectedEmployees([...selectedEmployees, employee]);
            setFormData({
                ...formData,
                selected_users: [...formData.selected_users, userId],
            });
        }
        setSelectedEmployeeId(""); // Reset the select input
    };

    const handleRemoveEmployee = (userId) => {
        setSelectedEmployees(
            selectedEmployees.filter((emp) => emp.user_id !== userId),
        );
        setFormData({
            ...formData,
            selected_users: formData.selected_users.filter(
                (id) => id !== userId,
            ),
        });
    };

    const handleDepartmentSelect = (departmentId) => {
        if (!departmentId) return;

        const department = departments.find(
            (dept) => dept.id === parseInt(departmentId),
        );
        if (
            department &&
            !selectedDepartments.some(
                (dept) => dept.id === parseInt(departmentId),
            )
        ) {
            setSelectedDepartments([...selectedDepartments, department]);
            setFormData({
                ...formData,
                selected_departments: [
                    ...formData.selected_departments,
                    parseInt(departmentId),
                ],
            });
        }
        setSelectedDepartmentId(""); // Reset the select input
    };

    const handleRemoveDepartment = (departmentId) => {
        setSelectedDepartments(
            selectedDepartments.filter((dept) => dept.id !== departmentId),
        );
        setFormData({
            ...formData,
            selected_departments: formData.selected_departments.filter(
                (id) => id !== departmentId,
            ),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const eventDateTime = `${formData.event_date}T${formData.event_time}`;
            const payload = {
                ...formData,
                event_date: eventDateTime,
                selected_users: formData.selected_users || [],
                // Clear departments if audience is none
                selected_departments:
                    formData.audience === "none"
                        ? []
                        : formData.selected_departments || [],
                is_active: 1,
            };

            let updatedEvent;
            if (editingEvent) {
                const response = await axiosClient.put(
                    `/events/${editingEvent.id}`,
                    payload,
                );
                updatedEvent = response.data;
            } else {
                const response = await axiosClient.post("/events", payload);
                updatedEvent = response.data;
            }

            // Close modal and reset form
            setShowModal(false);
            setEditingEvent(null);
            setFormData({
                title: "",
                type: "",
                event_date: "",
                event_time: "",
                audience: "all_team",
                selected_users: [],
                selected_departments: [],
            });
            setSelectedEmployees([]);
            setSelectedDepartments([]);

            // Fetch fresh data instead of updating state directly
            await fetchEvents();
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
            selected_users: event.selected_users || [],
            selected_departments: event.selected_departments || [],
        });
        setShowModal(true);

        // Set selected employees and departments
        if (event.selected_users && event.selected_users.length > 0) {
            const selectedUsers = employees.filter((emp) =>
                event.selected_users.includes(emp.user_id),
            );
            setSelectedEmployees(selectedUsers);
        } else {
            setSelectedEmployees([]);
        }

        if (
            event.selected_departments &&
            event.selected_departments.length > 0
        ) {
            const selectedDepts = departments.filter((dept) =>
                event.selected_departments.includes(dept.id),
            );
            setSelectedDepartments(selectedDepts);
        } else {
            setSelectedDepartments([]);
        }
    };

    const fetchEvents = async () => {
        try {
            const response = await axiosClient.get("/events/upcoming");

            // Process the events data
            const processedEvents = response.data.map((event) => ({
                ...event,
                // Handle both string JSON and array formats
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

            // Sort events by status priority and date
            const sortedEvents = processedEvents.sort((a, b) => {
                const statusA = getEventStatus(a.event_date);
                const statusB = getEventStatus(b.event_date);

                const priority = {
                    ongoing: 4,
                    today: 3,
                    upcoming: 2,
                    done: 1,
                };

                // First compare by status priority
                if (priority[statusA] !== priority[statusB]) {
                    return priority[statusB] - priority[statusA];
                }

                // If same status, sort by date
                // For 'done' status, sort in reverse chronological order
                if (statusA === "done" && statusB === "done") {
                    return new Date(b.event_date) - new Date(a.event_date);
                }

                // For other statuses, sort chronologically
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

            // Check if date is invalid
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
                <div className="flex justify-end ">
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-blue-600  hover:text-blue-700"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
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
                                    onClick={() => handleEdit(event)}
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
                                    onClick={() => handleEdit(event)}
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

            {/* Modal remains the same */}
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
                                    With Employees
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <select
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        onChange={(e) =>
                                            handleEmployeeSelect(e.target.value)
                                        }
                                        value={selectedEmployeeId}
                                    >
                                        <option value="">
                                            Select employee
                                        </option>
                                        {employees
                                            .filter(
                                                (employee) =>
                                                    !selectedEmployees.some(
                                                        (selected) =>
                                                            selected.user_id ===
                                                            employee.user_id,
                                                    ),
                                            )
                                            .map((employee) => (
                                                <option
                                                    key={employee.user_id}
                                                    value={employee.user_id}
                                                >
                                                    {employee.first_name}{" "}
                                                    {employee.last_name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="mt-2 space-y-2">
                                    {selectedEmployees.map((employee) => (
                                        <div
                                            key={employee.user_id}
                                            className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                                        >
                                            <span>
                                                {employee.first_name}{" "}
                                                {employee.last_name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveEmployee(
                                                        employee.user_id,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
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

                            {/* Department Selection */}
                            {formData.audience === "specific_department" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Departments
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                onChange={(e) =>
                                                    handleDepartmentSelect(
                                                        e.target.value,
                                                    )
                                                }
                                                value={selectedDepartmentId}
                                            >
                                                <option value="">
                                                    Select department
                                                </option>
                                                {departments
                                                    .filter(
                                                        (department) =>
                                                            !selectedDepartments.some(
                                                                (selected) =>
                                                                    selected.id ===
                                                                    department.id,
                                                            ),
                                                    )
                                                    .map((department) => (
                                                        <option
                                                            key={department.id}
                                                            value={
                                                                department.id
                                                            }
                                                        >
                                                            {department.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="mt-2 space-y-2">
                                            {selectedDepartments.map(
                                                (department) => (
                                                    <div
                                                        key={department.id}
                                                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                                                    >
                                                        <span>
                                                            {department.name}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveDepartment(
                                                                    department.id,
                                                                )
                                                            }
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                            selected_users: [],
                                            selected_departments: [],
                                        });
                                        setSelectedEmployees([]);
                                        setSelectedDepartments([]);
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
