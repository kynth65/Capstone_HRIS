import React, { useState, useEffect } from "react";
import {
    Container,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";
import Calendar from "react-calendar";
import axiosClient from "../axiosClient";
import "react-calendar/dist/Calendar.css";
import "../styles/hrDashboard.css";
import Event from "./Event";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Dashboard = () => {
    const [data, setData] = useState({
        total: 0,
        present: 0,
        leave: 0,
        attendanceRecords: [],
        employmentStatus: [],
        notifications: [],
        leaveRequests: [],
    });
    const [showSuccessPopup, setSuccessPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [highlightedDates, setHighlightedDates] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch attendance records every 5 seconds
    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            try {
                const response = await axiosClient.get("/dashboard/attendance");
                setData((prevData) => ({
                    ...prevData,
                    attendanceRecords: response.data || [],
                }));
            } catch (error) {
                console.error("Error fetching attendance records:", error);
            }
        };

        // Initial fetch
        fetchAttendanceRecords();

        const intervalId = setInterval(() => {
            fetchAttendanceRecords();
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId); // Clear interval on unmount
    }, []);

    useEffect(() => {
        axiosClient
            .get("/dashboard")
            .then((response) => {
                console.log("Dashboard data:", response.data); // Log the data to verify
                setData((prevData) => ({
                    ...prevData,
                    ...response.data,
                }));
            })
            .catch((error) => {
                console.error("Error fetching dashboard data:", error);
            });
    }, []);

    useEffect(() => {
        axiosClient
            .get("/leave-request")
            .then((response) => {
                setData((prevData) => ({
                    ...prevData,
                    leaveRequests: response.data.leaveRequests || [],
                }));
            })
            .catch((error) => {
                console.error("Error fetching leave requests:", error);
            });
    }, []);

    // Fetch expiring and expired certificates
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axiosClient.get(
                    "/expiring-certificates",
                );
                setData((prevData) => ({
                    ...prevData,
                    expiringCertificates: response.data.expiringCertificates, // Update expiring certificates
                    expiredCertificates: response.data.expiredCertificates, // Update expired certificates
                }));
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };

        fetchCertificates();
    }, []);

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
    useEffect(() => {
        axiosClient
            .get("/highlighted-dates")
            .then((response) => {
                const highlightedDates = response.data.map((item) => {
                    let stageText;
                    switch (item.recruitment_stage) {
                        case "Interview":
                            stageText = `${item.name}'s ${item.recruitment_stage} date`;
                            break;
                        case "Probationary":
                            stageText = `${item.name}'s ${item.recruitment_stage} End`;
                            break;
                        case "Orientation":
                            stageText = `${item.name}'s ${item.recruitment_stage} date`;
                            break;
                        default:
                            stageText = `${item.name}'s ${item.recruitment_stage}`;
                    }

                    return {
                        date: new Date(item.date),
                        recruitmentStage: stageText,
                    };
                });
                setHighlightedDates(highlightedDates);
                console.log("Highlighted dates:", highlightedDates);
            })
            .catch((error) => console.error("Error fetching dates:", error));
    }, []);

    // Updated Calendar Implementation
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
            const highlight = highlightedDates.find((highlightDate) => {
                const isSameDay = highlightDate.date.getDate() === date;
                const isSameMonth =
                    highlightDate.date.getMonth() === currentDate.getMonth();
                const isSameYear =
                    highlightDate.date.getFullYear() ===
                    currentDate.getFullYear();

                return isSameDay && isSameMonth && isSameYear;
            });
            return highlight ? highlight.recruitmentStage : null;
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        };

        const formatTime = (time) => {
            if (!time) return "-";
            return new Date(`2000-01-01 ${time}`).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
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

    const formatSentDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const timeDiff = Math.abs(now - date);
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) return "Sent today"; // If sent today
        if (daysDiff === 1) return "Sent yesterday"; // If sent yesterday
        return `Sent ${daysDiff} days ago`; // For any other day
    };

    const formatRelativeDate = (dateStr) => {
        const today = new Date();
        const date = new Date(dateStr);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime12Hour = (timeStr) => {
        if (!timeStr) return "-";
        const [datePart, timePart] = timeStr.split(" ");
        const [hours, minutes] = timePart.split(":");
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date
            .toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Manila",
            })
            .toLowerCase();
    };

    const getSortedRecords = (records) => {
        return [...records].sort((a, b) => {
            // Get the timestamp (either time_in or time_out)
            const timeA = new Date(a.time_in || a.time_out);
            const timeB = new Date(b.time_in || b.time_out);
            return timeB - timeA; // Most recent first
        });
    };

    const getAttendanceStatus = (record) => {
        return record.time_in ? "In" : "Out";
    };

    const getRecordTime = (record) => {
        return formatTime12Hour(record.time_in || record.time_out);
    };

    return (
        <>
            <div className="animated fadeInDown">
                <div className="grid grid-cols-3 mb-3 mr-2 md:mr-0 place-items-center bg-white sm:bg-transparent sm:gap-4 rounded-2xl">
                    <div className="flex w-24 sm:w-full p-6 md:p-4 flex-col items-center md:text-xl text-black sm:bg-white rounded-xl font-kodchasan text-center">
                        Employee:
                        <span className="font-bold">{data.total}</span>
                    </div>
                    <div className="flex w-24 sm:w-full p-6 md:p-4 flex-col items-center md:text-xl text-black sm:bg-white rounded-xl font-kodchasan text-center">
                        Present:
                        <span className="font-bold">{data.present}</span>
                    </div>
                    <div className="flex w-24 sm:w-full p-6 md:p-4 flex-col items-center md:text-xl text-black sm:bg-white rounded-xl font-kodchasan text-center">
                        Leave:
                        <span className="font-bold"> {data.leave}</span>
                    </div>
                </div>
                <div className="lg:grid lg:grid-cols-2 lg:space-x-3">
                    <div className="">
                        <div className="bg-white rounded-lg p-6 mb-4 shadow-sm">
                            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
                                Attendance Records
                            </h2>
                            <div className="relative">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                                                Name
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 hidden md:table-cell">
                                                Date
                                            </th>
                                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">
                                                Time
                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                                <div className="overflow-y-auto max-h-[272px]">
                                    <table className="w-full">
                                        <tbody className="divide-y divide-gray-200">
                                            {data.attendanceRecords.length >
                                            0 ? (
                                                getSortedRecords(
                                                    data.attendanceRecords,
                                                ).map((record) => (
                                                    <tr
                                                        key={record.id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                                            <span
                                                                className={`px-2 py-1 rounded-full text-xs ${
                                                                    getAttendanceStatus(
                                                                        record,
                                                                    ) === "In"
                                                                        ? "bg-green-100 text-green-800"
                                                                        : "bg-red-100 text-red-800"
                                                                }`}
                                                            >
                                                                {getAttendanceStatus(
                                                                    record,
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                                            {record.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell text-center">
                                                            {formatRelativeDate(
                                                                record.date,
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700 text-center">
                                                            {getRecordTime(
                                                                record,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="4"
                                                        className="px-4 py-3 text-sm text-gray-500 text-center"
                                                    >
                                                        No attendance records
                                                        found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div>{renderCalendar()}</div>
                    </div>

                    <div className="grid grid-cols-1">
                        <div className="flex flex-col md:col-span-3 bg-white text-black rounded-xl">
                            <Event />
                        </div>
                        <div className="flex space-x-8 mt-4 mr-2 sm:mr-0 justify-center items-center  xl:h-80 bg-white text-black rounded-lg">
                            <div>
                                <h1 className="py-2 font-bold text-lg">
                                    Employee Status
                                </h1>
                                <BarChart
                                    width={280}
                                    height={250}
                                    data={[
                                        {
                                            name: "Employment Status",
                                            ...data.employmentStatus,
                                        },
                                    ]}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                    />
                                    <Bar
                                        dataKey="FullTime"
                                        name="Full Time"
                                        fill="#079dde"
                                    />{" "}
                                    <Bar
                                        dataKey="PartTime"
                                        name="Part Time"
                                        fill="#82ca9d"
                                    />{" "}
                                    <Bar
                                        dataKey="Student"
                                        name="Student"
                                        fill="#FFA500"
                                    />{" "}
                                </BarChart>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
