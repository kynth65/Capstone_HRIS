import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import { PlusCircle, X } from "lucide-react";

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

    const handleEmployeeSelect = (userId) => {
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
        const department = departments.find((dept) => dept.id === departmentId);
        if (
            department &&
            !selectedDepartments.some((dept) => dept.id === departmentId)
        ) {
            setSelectedDepartments([...selectedDepartments, department]);
            setFormData({
                ...formData,
                selected_departments: [
                    ...formData.selected_departments,
                    departmentId,
                ],
            });
        }
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

    const fetchEvents = async () => {
        try {
            const response = await axiosClient.get("/events/upcoming");
            const sortedEvents = response.data.sort(
                (a, b) => new Date(a.event_date) - new Date(b.event_date),
            );
            setEvents(sortedEvents);
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

            let updatedEvent;
            if (editingEvent) {
                const response = await axiosClient.put(
                    `/events/${editingEvent.id}`,
                    payload,
                );
                updatedEvent = response.data;
                setEvents((currentEvents) =>
                    currentEvents.map((event) =>
                        event.id === editingEvent.id ? updatedEvent : event,
                    ),
                );
            } else {
                const response = await axiosClient.post("/events", payload);
                updatedEvent = response.data;
                setEvents((currentEvents) => [...currentEvents, updatedEvent]);
            }

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
            selected_users: event.selected_users || [],
            selected_departments: event.selected_departments || [],
        });

        if (event.selected_users && event.selected_users.length > 0) {
            const selectedUsers = employees.filter((emp) =>
                event.selected_users.includes(emp.user_id),
            );
            setSelectedEmployees(selectedUsers);
        }

        if (
            event.selected_departments &&
            event.selected_departments.length > 0
        ) {
            const selectedDepts = departments.filter((dept) =>
                event.selected_departments.includes(dept.id),
            );
            setSelectedDepartments(selectedDepts);
        }

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

    const formatEventDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
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
            {/* Render events and modal */}
            <div className="flex justify-between items-center px-4 mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="font-bold text-lg text-black">
                        Upcoming Events ({events.length})
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
                        {events.map((event) => {
                            const { date, time } = formatEventDateTime(
                                event.event_date,
                            );
                            return (
                                <div
                                    key={event.id}
                                    className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
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
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {date}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {time}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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

                            {/* Filtered Employee Selection */}
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
                                        value=""
                                    >
                                        <option value="">
                                            Select employee
                                        </option>
                                        {employees
                                            .filter(
                                                (emp) =>
                                                    !selectedEmployees.some(
                                                        (selected) =>
                                                            selected.user_id ===
                                                            emp.user_id,
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

                            {/* Filtered Department Selection */}
                            {formData.audience === "specific_department" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Departments
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            onChange={(e) =>
                                                handleDepartmentSelect(
                                                    parseInt(e.target.value),
                                                )
                                            }
                                            value=""
                                        >
                                            <option value="">
                                                Select department
                                            </option>
                                            {departments
                                                .filter(
                                                    (dept) =>
                                                        !selectedDepartments.some(
                                                            (selected) =>
                                                                selected.id ===
                                                                dept.id,
                                                        ),
                                                )
                                                .map((department) => (
                                                    <option
                                                        key={department.id}
                                                        value={department.id}
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
