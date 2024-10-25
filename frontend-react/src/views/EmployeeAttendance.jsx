import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";

function EmployeeAttendance() {
    const [activeButton, setActiveButton] = useState("monitoring");
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [averageData, setAverageData] = useState({});
    const [filteredRecords, setFilteredRecords] = useState([]);
    const searchRef = useRef();

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
        const searchTerm = searchRef.current.value.trim().toLowerCase();
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
                    <div className="w-full max-w-7xl mx-auto px-4">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by date or time..."
                            onChange={handleSearch}
                            className="w-full max-w-md px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-black"
                        />

                        <div className="relative rounded-xl overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full bg-white text-black">
                                    <thead className="sticky top-0 bg-white shadow-sm">
                                        <tr>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Time In
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Time Out
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Hours Worked
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredRecords.length > 0 ? (
                                            filteredRecords.map((record) => (
                                                <tr
                                                    key={record.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-6 py-4 text-sm">
                                                        {formatDate(
                                                            record.date,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {formatTime(
                                                            record.time_in,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        {formatTime(
                                                            record.time_out,
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
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
                                                    className="px-6 py-4 text-sm text-center text-gray-500"
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
                    <div className="w-full max-w-7xl mx-auto px-4">
                        <div className="relative rounded-xl overflow-hidden">
                            <table className="w-full bg-white text-black">
                                <thead className="bg-white shadow-sm">
                                    <tr>
                                        <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                            Average Time In
                                        </th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                            Average Time Out
                                        </th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                            Average Hours Worked
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm">
                                            {formatTime(
                                                averageData.avg_time_in,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {formatTime(
                                                averageData.avg_time_out,
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
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
