import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";

function EmployeeAttendance() {
    const [activeButton, setActiveButton] = useState("monitoring");
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [averageData, setAverageData] = useState({});
    const [filteredRecords, setFilteredRecords] = useState([]);
    const inputRef = useRef(null);

    const { user } = useStateContext();
    const rfid = user?.rfid;

    // Format date to "Month Day, Year" (e.g., "October 25, 2024")
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    // Format time to 12-hour format with AM/PM
    const formatTime = (timeString) => {
        if (!timeString) return "N/A";
        try {
            // If timeString is a full datetime, extract just the time part
            const time = timeString.includes("T")
                ? timeString.split("T")[1]
                : timeString;

            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";

            // Convert to 12-hour format
            hour = hour % 12;
            hour = hour ? hour : 12; // Convert 0 to 12

            return `${hour}:${minutes} ${ampm}`;
        } catch (error) {
            console.error("Error formatting time:", error);
            return timeString || "N/A";
        }
    };

    const formatHoursWorked = (timeString) => {
        if (!timeString) return "0 minutes";

        // Convert the string to a number
        const time = parseFloat(timeString);

        // If the time format includes "minutes" in the string
        if (timeString.includes("minutes")) {
            // Convert minutes to hours and minutes
            const hours = Math.floor(time / 60);
            const minutes = Math.round(time % 60);

            if (hours === 0) {
                return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
            }
            if (minutes === 0) {
                return `${hours} hour${hours !== 1 ? "s" : ""}`;
            }
            return `${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""}`;
        }

        // If the time is in hours format
        const hours = Math.floor(time);
        const minutes = Math.round((time - hours) * 60);

        if (hours === 0) {
            return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
        }
        if (minutes === 0) {
            return `${hours} hour${hours !== 1 ? "s" : ""}`;
        }
        return `${hours} hour${hours !== 1 ? "s" : ""} and ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    };

    const fetchAttendanceData = async () => {
        if (!rfid) return;
        try {
            const response = await axiosClient.get(
                `/employee/attendance/${rfid}`,
            );
            setAttendanceRecords(response.data.records);
            setFilteredRecords(response.data.records);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
        }
    };

    const fetchAverageData = async () => {
        if (!rfid) return;
        try {
            const response = await axiosClient.get(
                `/employee/attendance/average/${rfid}`,
            );
            setAverageData(response.data);
        } catch (error) {
            console.error("Error fetching average attendance data:", error);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
        fetchAverageData();
    }, [rfid]);

    const handleSearch = () => {
        const searchTerm = inputRef.current.value.trim().toLowerCase();
        const filtered = attendanceRecords.filter(
            (record) =>
                formatDate(record.date).toLowerCase().includes(searchTerm) ||
                (record.time_in &&
                    formatTime(record.time_in)
                        .toLowerCase()
                        .includes(searchTerm)) ||
                (record.time_out &&
                    formatTime(record.time_out)
                        .toLowerCase()
                        .includes(searchTerm)),
        );
        setFilteredRecords(filtered);
    };
    const handleIconClick = () => {
        inputRef.current?.focus();
    };

    return (
        <div>
            <nav className="mb-4 grid grid-cols-2">
                <button
                    className={`navButton ${activeButton === "monitoring" ? "active" : ""}`}
                    onClick={() => setActiveButton("monitoring")}
                >
                    My Attendance
                </button>
                <button
                    className={`navButton ${activeButton === "averages" ? "active" : ""}`}
                    onClick={() => setActiveButton("averages")}
                >
                    My Averages
                </button>
            </nav>

            <div className="animated fadeInDown">
                {activeButton === "monitoring" && (
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Search Bar */}
                        <div className="relative mb-6 mr-4">
                            <input
                                type="text"
                                ref={inputRef}
                                placeholder="Search by date or time..."
                                onChange={handleSearch}
                                className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-200 focus:ring-1 focus:border-gray-300 outline-none text-black"
                            />
                            <button
                                onClick={handleIconClick}
                                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                aria-label="Focus search"
                            >
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4 mr-4">
                            {filteredRecords.length > 0 ? (
                                filteredRecords.map((record) => (
                                    <div
                                        key={record.id}
                                        className="p-4 bg-white rounded-lg border border-gray-100"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-black/60 mb-1">
                                                    Date
                                                </div>
                                                <div className="text-black">
                                                    {formatDate(record.date)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-black/60 mb-1">
                                                    Hours Worked
                                                </div>
                                                <div className="text-black">
                                                    {formatHoursWorked(
                                                        record.accumulated_time,
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-black/60 mb-1">
                                                    Time In
                                                </div>
                                                <div className="text-black">
                                                    {formatTime(record.time_in)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-black/60 mb-1">
                                                    Time Out
                                                </div>
                                                <div className="text-black">
                                                    {formatTime(
                                                        record.time_out,
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-black/60 bg-white rounded-lg border border-gray-100">
                                    No attendance records found.
                                </div>
                            )}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden md:block bg-white rounded-lg border border-gray-200">
                            <div className="max-h-[600px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                                Time In
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                                Time Out
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                                Hours Worked
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredRecords.length > 0 ? (
                                            filteredRecords.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 text-black">
                                                        {formatDate(
                                                            record.date,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-black">
                                                        {formatTime(
                                                            record.time_in,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-black">
                                                        {formatTime(
                                                            record.time_out,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-black">
                                                        {formatHoursWorked(
                                                            record.accumulated_time,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="px-6 py-8 text-center text-black/60"
                                                >
                                                    No attendance records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeButton === "averages" && (
                    <div className="w-full max-w-7xl mx-auto">
                        {/* Mobile View for Averages */}
                        <div className="md:hidden bg-white rounded-lg border mr-4 border-gray-200">
                            <div className="divide-y divide-gray-100">
                                <div className="p-4">
                                    <div className="text-sm font-medium text-black/60 mb-1">
                                        Average Time In
                                    </div>
                                    <div className="text-lg text-black">
                                        {formatTime(averageData.avg_time_in)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-sm font-medium text-black/60 mb-1">
                                        Average Time Out
                                    </div>
                                    <div className="text-lg text-black">
                                        {formatTime(averageData.avg_time_out)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="text-sm font-medium text-black/60 mb-1">
                                        Average Hours Worked
                                    </div>
                                    <div className="text-lg text-black">
                                        {formatHoursWorked(
                                            averageData.avg_hours,
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop View for Averages */}
                        <div className="hidden md:block bg-white rounded-lg border border-gray-200">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                            Average Time In
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                            Average Time Out
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-black border-b border-gray-200">
                                            Average Hours Worked
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-black">
                                            {formatTime(
                                                averageData.avg_time_in,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                            {formatTime(
                                                averageData.avg_time_out,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-black">
                                            {formatHoursWorked(
                                                averageData.avg_hours,
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeAttendance;
