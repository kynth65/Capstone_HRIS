import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/profile.css";
import defaultAvatar from "../assets/default-avatar.png";
import axiosClient from "../axiosClient";
import { parseISO, differenceInYears } from "date-fns";
import EmployeeEvent from "./employee_event";
import { Eye } from "lucide-react";
import {
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Clock,
    CalendarDays,
} from "lucide-react";
const EmployeeDashboard = () => {
    const { user } = useStateContext();
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [employee, setEmployee] = useState({
        name: user.name || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        address: user.address || "",
        gender: user.gender || "",
        employee_type: user.employee_type || "",
        profile: null,
        date_of_birth: null, // Added date_of_birth field
        leave: 0,
    });
    const [highlightedDates, setHighlightedDates] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [leaveRequests, setLeaveRequests] = useState({
        approved: [],
        declined: [],
        pending: [],
    });
    const [todos, setTodos] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [editDate, setEditDate] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const handleView = (request) => {
        setSelectedLeave(request);
        setShowModal(true);
    };
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await axiosClient.get("/user");
                setEmployee(response.data);
            } catch (error) {
                console.error("Error fetching employee data:", error);
            }
        };

        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const fetchLeaveRequestStatus = async () => {
            try {
                const response = await axiosClient.get("/leave-request-status");
                const {
                    approvedLeaveRequests,
                    declinedLeaveRequests,
                    pendingLeaveRequests,
                } = response.data;

                setLeaveRequests({
                    approved: Object.values(approvedLeaveRequests),
                    declined: Object.values(declinedLeaveRequests),
                    pending: Object.values(pendingLeaveRequests),
                });
            } catch (error) {
                console.error("Error fetching leave request status:", error);
            }
        };

        fetchLeaveRequestStatus();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosClient.get(
                    "/employee-notifications",
                );
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);
    useEffect(() => {
        // Fetch both leave dates and certificate dates
        Promise.all([
            axiosClient.get("/highlighted-dates-leave"),
            axiosClient.get("/highlighted-dates-expiring-cerfiticates"), // your expiring certificates endpoint
        ])
            .then(([leaveResponse, certificatesResponse]) => {
                // Process leave dates
                const leaveDates = leaveResponse.data.map((item) => ({
                    date: new Date(item.date).toISOString().split("T")[0],
                    name: item.name,
                    status: `${item.name}'s Leave start`,
                }));

                // Process certificate dates
                const certificateDates = certificatesResponse.data.map(
                    (item) => ({
                        date: new Date(item.date).toISOString().split("T")[0],
                        status: `${item.name}'s ${item.certificate_name} expires soon`,
                    }),
                );

                // Combine both arrays
                const allHighlightedDates = [
                    ...leaveDates,
                    ...certificateDates,
                ];
                setHighlightedDates(allHighlightedDates);
                console.log("All highlighted dates:", allHighlightedDates);
            })
            .catch((error) => console.error("Error fetching dates:", error));
    }, []);

    // Update your isHighlighted function to handle both types
    const isHighlighted = (date) => {
        const targetDate = `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1,
        ).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

        const highlight = highlightedDates.find(
            (highlightDate) => highlightDate.date === targetDate,
        );

        return highlight ? highlight.status : null;
    };

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const handlePreviousMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
        );
    };

    const handleNextMonth = () => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
        );
    };

    const handleMonthChange = (e) => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), parseInt(e.target.value)),
        );
    };

    const handleYearChange = (e) => {
        setCurrentDate(
            new Date(parseInt(e.target.value), currentDate.getMonth()),
        );
    };

    function calculateAge(date_of_birth) {
        if (!date_of_birth) return "N/A";
        const birthDate = parseISO(date_of_birth);
        const today = new Date();
        return differenceInYears(today, birthDate);
    }

    const formatSentDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const timeDiff = Math.abs(now - date);
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) return "Sent today";
        if (daysDiff === 1) return "Sent yesterday";
        return `Sent ${daysDiff} days ago`;
    };
    const renderCalendar = () => {
        const startOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1,
        );
        const endOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            0,
        );
        const daysInMonth = endOfMonth.getDate();
        const firstDayOfMonth = startOfMonth.getDay();
        const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const isHighlighted = (date) => {
            const targetDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(date).padStart(2, "0")}`;

            console.log("Checking date:", targetDate); // Debug log

            const highlight = highlightedDates.find((highlightDate) => {
                return highlightDate.date === targetDate;
            });

            return highlight ? highlight.status : null;
        };

        return (
            <div className="bg-white rounded-lg p-4 mb-4 mr-2 sm:mr-0">
                <div className="mb-4 flex items-center justify-between text-black">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex gap-2 text-black w-50">
                        <select
                            value={currentDate.getMonth()}
                            onChange={handleMonthChange}
                            className="border rounded p-1"
                        >
                            {months.map((month, index) => (
                                <option key={month} value={index}>
                                    {month}
                                </option>
                            ))}
                        </select>

                        <select
                            value={currentDate.getFullYear()}
                            onChange={handleYearChange}
                            className="border rounded p-1"
                        >
                            {Array.from(
                                { length: 10 },
                                (_, i) => currentDate.getFullYear() - 5 + i,
                            ).map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 rounded"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="custom-calendar">
                    <div className="calendar-header">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                            (day) => (
                                <div key={day}>{day}</div>
                            ),
                        )}
                    </div>
                    <div className="calendar-grid">
                        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div
                                key={`empty-${i}`}
                                className="empty-date"
                            ></div>
                        ))}
                        {dates.map((date) => (
                            <div
                                key={date}
                                className={`calendar-date ${isHighlighted(date) ? "highlighted" : ""}`}
                            >
                                {date}
                                {isHighlighted(date) && (
                                    <div className="tooltip">
                                        {isHighlighted(date)}{" "}
                                        {/* Show recruitment stage */}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        try {
            setIsLoading(true);
            const response = await axiosClient.get("/todos");
            setTodos(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load todos");
            console.error("Error fetching todos:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        console.log("Submitting with date:", dueDate);
        if (!newTodo.trim()) return;

        // Add this console.log to debug
        console.log("Submitting with date:", dueDate);

        try {
            const response = await axiosClient.post("/todos", {
                text: newTodo,
                due_date: dueDate || null, // This line is sending null if dueDate is empty
            });
            setTodos([response.data, ...todos]);
            setNewTodo("");
            setDueDate("");
            setError(null);
        } catch (err) {
            setError("Failed to add todo");
            console.error("Error adding todo:", err);
        }
    };

    const toggleTodo = async (todo) => {
        try {
            const response = await axiosClient.put(`/todos/${todo.id}`, {
                completed: !todo.completed,
            });
            setTodos(todos.map((t) => (t.id === todo.id ? response.data : t)));
            setError(null);
        } catch (err) {
            setError("Failed to update todo");
            console.error("Error updating todo:", err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axiosClient.delete(`/todos/${id}`);
            setTodos(todos.filter((todo) => todo.id !== id));
            setError(null);
        } catch (err) {
            setError("Failed to delete todo");
            console.error("Error deleting todo:", err);
        }
    };

    const startEdit = (todo) => {
        setEditingId(todo.id);
        setEditText(todo.text);
        setEditDate(todo.due_date || "");
    };

    const saveEdit = async (todo) => {
        try {
            const response = await axiosClient.put(`/todos/${todo.id}`, {
                text: editText,
                due_date: editDate || null,
            });
            setTodos(todos.map((t) => (t.id === todo.id ? response.data : t)));
            setEditingId(null);
            setEditText("");
            setEditDate("");
            setError(null);
        } catch (err) {
            setError("Failed to update todo");
            console.error("Error updating todo:", err);
        }
    };

    const getDueStatus = (dueDate) => {
        if (!dueDate) return null;

        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return {
                status: "overdue",
                color: "text-red-600 bg-red-50",
                icon: <AlertCircle className="w-4 h-4" />,
                text: "Overdue",
            };
        } else if (diffDays === 0) {
            return {
                status: "today",
                color: "text-orange-600 bg-orange-50",
                icon: <Clock className="w-4 h-4" />,
                text: "Due Today",
            };
        } else if (diffDays <= 2) {
            return {
                status: "upcoming",
                color: "text-yellow-600 bg-yellow-50",
                icon: <CalendarDays className="w-4 h-4" />,
                text: "Due Soon",
            };
        }
        return {
            status: "future",
            color: "text-green-600 bg-green-50",
            icon: <CalendarDays className="w-4 h-4" />,
            text: `Due in ${diffDays} days`,
        };
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const BASE_URL = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL

    return (
        <div className="animated fadeInDown">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
                <div className="flex flex-col lg:col-span-2 bg-white text-black rounded-xl">
                    <div>{renderCalendar()}</div>
                </div>

                <div className="flex flex-col lg:col-span-3 items-center bg-white text-black p-6 rounded-xl">
                    <EmployeeEvent />
                </div>
            </div>

            {/* TODO List Section */}
            <div className="bg-white text-black p-4 sm:p-6 rounded-xl shadow-sm mb-5">
                <h2 className="font-bold text-xl mb-6">Todo List</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={addTodo}
                    className="flex flex-col items-center gap-3 mb-6"
                >
                    <input
                        type="text"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        className="flex-1 mb-0 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="flex flex-col gap-2">
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full sm:w-auto px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm font-medium"
                            disabled={isLoading}
                        >
                            Add Task
                        </button>
                    </div>
                </form>

                {isLoading ? (
                    <div className="text-center py-8 text-neutral-500">
                        Loading...
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                        {todos.map((todo) => {
                            const dueStatus = getDueStatus(todo.due_date);
                            return (
                                <div
                                    key={todo.id}
                                    className="flex flex-col items-center sm:flex-row sm:items-center gap-3 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={todo.completed}
                                            onChange={() => toggleTodo(todo)}
                                            className="w-5 mb-0 h-5 rounded border-neutral-300"
                                        />

                                        {editingId === todo.id ? (
                                            <div className="flex-1 flex flex-col sm:flex-row gap-3">
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) =>
                                                        setEditText(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                                    autoFocus
                                                />
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) =>
                                                            setEditDate(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            saveEdit(todo)
                                                        }
                                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                                    >
                                                        Save
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <span
                                                    className={`${todo.completed ? "line-through text-neutral-400" : ""} text-sm`}
                                                >
                                                    {todo.text}
                                                </span>
                                                {todo.due_date && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-neutral-500">
                                                            {formatDate(
                                                                todo.due_date,
                                                            )}
                                                        </span>
                                                        {dueStatus && (
                                                            <span
                                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${dueStatus.color}`}
                                                            >
                                                                {dueStatus.icon}
                                                                {dueStatus.text}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-center md:justify-end gap-2 sm:ml-4">
                                        {editingId !== todo.id && (
                                            <button
                                                onClick={() => startEdit(todo)}
                                                className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteTodo(todo.id)}
                                            className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Leave Requests Section */}
            <div className="flex flex-col bg-white text-black p-6 rounded-xl">
                <h2 className="font-bold text-lg mb-4">Leave Requests</h2>

                {/* Mobile View */}
                <div className="md:hidden mt-4 max-h-60 overflow-y-auto space-y-3">
                    {Object.entries(leaveRequests).map(([status, requests]) =>
                        requests.map((request, index) => (
                            <div
                                key={`${status}-${index}`}
                                className="bg-neutral-50 flex flex-col items-center p-3 rounded-lg space-y-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                                onClick={() => handleView(request)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm">
                                            {new Date(
                                                request.start_date,
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {new Date(
                                                request.end_date,
                                            ).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {request.days_requested} days
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    Status:{" "}
                                    <span className="font-medium">
                                        {request.statuses}
                                    </span>
                                </div>
                            </div>
                        )),
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block mt-4 max-h-60 overflow-y-auto">
                    <table className="min-w-full border-collapse border border-neutral-200">
                        <thead className="bg-neutral-100 sticky top-0 text-neutral-700 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-2 border border-neutral-200 text-center">
                                    File
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Start Date
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    End Date
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Days
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200 text-black text-center">
                            {Object.entries(leaveRequests).map(
                                ([status, requests]) =>
                                    requests.map((request, index) => (
                                        <tr key={`${status}-${index}`}>
                                            <td className="p-2 border border-neutral-200">
                                                {request.file_path ? (
                                                    <a
                                                        href={`${BASE_URL}/storage/${request.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {request.file_name}
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {new Date(
                                                    request.start_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {new Date(
                                                    request.end_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {request.days_requested}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {request.statuses}
                                            </td>
                                        </tr>
                                    )),
                            )}
                        </tbody>
                    </table>
                </div>

                {/* View Modal */}
                {showModal && selectedLeave && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">
                                    Leave Request Details
                                </h3>

                                <div className="space-y-3">
                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Duration
                                        </p>
                                        <p className="text-sm">
                                            {new Date(
                                                selectedLeave.start_date,
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {new Date(
                                                selectedLeave.end_date,
                                            ).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {selectedLeave.days_requested} days
                                        </p>
                                    </div>

                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Status
                                        </p>
                                        <p className="text-sm">
                                            {selectedLeave.statuses}
                                        </p>
                                    </div>

                                    {selectedLeave.file_path && (
                                        <div className="text-left">
                                            <p className="text-sm font-semibold">
                                                Attachment
                                            </p>
                                            <a
                                                href={`${BASE_URL}/storage/${selectedLeave.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {selectedLeave.file_name}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedLeave(null);
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
            </div>
        </div>
    );
};

export default EmployeeDashboard;
