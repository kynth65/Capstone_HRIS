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
                record.date.toLowerCase().includes(searchTerm) ||
                (record.time_in &&
                    record.time_in.toLowerCase().includes(searchTerm)) ||
                (record.time_out &&
                    record.time_out.toLowerCase().includes(searchTerm)),
        );
        setFilteredRecords(filtered);
    };

    return (
        <div className="employee-attendance-wrapper flex flex-col items-center">
            <nav className="mb-4">
                <ul className="flex space-x-4">
                    <li>
                        <button
                            className={`navButton ${activeButton === "monitoring" ? "active" : ""}`}
                            onClick={() => setActiveButton("monitoring")}
                        >
                            My Attendance
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${activeButton === "averages" ? "active" : ""}`}
                            onClick={() => setActiveButton("averages")}
                        >
                            My Averages
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="content-section animated fadeInDown w-full flex flex-col items-center">
                {activeButton === "monitoring" && (
                    <div className="attendance-section w-3/4">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by date or time..."
                            onChange={handleSearch}
                            className="search-bar mt-4 mb-4 p-2 border rounded w-full text-black"
                        />
                        <div className="attendance-container w-full overflow-x-auto">
                            <table className="attendance-table bg-white text-black rounded-xl w-full">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Time In</th>
                                        <th className="p-2">Time Out</th>
                                        <th className="p-2">Hours Worked</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.length > 0 ? (
                                        filteredRecords.map((record) => (
                                            <tr key={record.id} className="-b">
                                                <td className="p-2">
                                                    {record.date}
                                                </td>
                                                <td className="p-2">
                                                    {record.time_in || "N/A"}
                                                </td>
                                                <td className="p-2">
                                                    {record.time_out || "N/A"}
                                                </td>
                                                <td className="p-2">
                                                    {record.accumulated_time ||
                                                        "0 hours"}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="p-4 text-center"
                                            >
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeButton === "averages" && (
                    <div className="average-section w-3/4 mt-6">
                        <table className="average-table bg-white text-black rounded-xl w-full">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="p-2">Average Time In</th>
                                    <th className="p-2">Average Time Out</th>
                                    <th className="p-2">
                                        Average Hours Worked
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2">
                                        {averageData.avg_time_in || "N/A"}
                                    </td>
                                    <td className="p-2">
                                        {averageData.avg_time_out || "N/A"}
                                    </td>
                                    <td className="p-2">
                                        {averageData.avg_hours || "0 hours"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EmployeeAttendance;
