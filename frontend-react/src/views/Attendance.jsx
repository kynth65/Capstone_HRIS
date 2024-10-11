import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";

function Attendance() {
    const [activeButton, setActiveButton] = useState("monitoring");
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [allEmployeesData, setAllEmployeesData] = useState([]);
    const searchRef = useRef();

    // Fetch employee data from the test table in attendance_system
    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/sync-attendance");
            setEmployees(response.data);
            setFilteredEmployees(response.data); // Reset filtered employees
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    // Fetch all employees' averages from tracking_attendance
    const fetchAllEmployeesData = async () => {
        try {
            const response = await axiosClient.get("/attendance/averages");
            setAllEmployeesData(response.data);
        } catch (error) {
            console.error("Error fetching all employees' data:", error);
        }
    };

    // Polling data every 5 seconds for monitoring
    useEffect(() => {
        if (activeButton === "monitoring") {
            fetchEmployees();

            const intervalId = setInterval(() => {
                fetchEmployees();
            }, 5000); // Fetch every 5 seconds

            return () => clearInterval(intervalId);
        } else if (activeButton === "allEmployees") {
            fetchAllEmployeesData();
        }
    }, [activeButton]);

    const handleSearch = () => {
        const searchTerm = searchRef.current.value.trim().toLowerCase();
        const filtered = employees.filter(
            (employee) =>
                employee.name.toLowerCase().includes(searchTerm) ||
                employee.user_id.toString().includes(searchTerm),
        );
        setFilteredEmployees(filtered);
    };

    return (
        <div>
            <nav>
                <ul>
                    <li>
                        <button
                            className={`navButton ${activeButton === "monitoring" ? "active" : ""}`}
                            onClick={() => setActiveButton("monitoring")}
                        >
                            Monitoring
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${activeButton === "totalHours" ? "active" : ""}`}
                            onClick={() => setActiveButton("totalHours")}
                        >
                            Accumulated Total Time
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${activeButton === "allEmployees" ? "active" : ""}`}
                            onClick={() => setActiveButton("allEmployees")}
                        >
                            All Employees Data
                        </button>
                    </li>
                </ul>
            </nav>
            <div className="animated fadeInDown">
                {activeButton === "monitoring" && (
                    <div className="employee-list">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name or ID..."
                            onChange={handleSearch}
                            className="search-bar mt-10 text-black"
                        />
                        <div className="employee-list-container">
                            <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th>Time In</th>
                                        <th>Time Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((employee) => (
                                            <tr key={employee.id}>
                                                <td>{employee.user_id}</td>
                                                <td>{employee.name}</td>
                                                <td>{employee.date}</td>
                                                <td>{employee.time_in}</td>
                                                <td>{employee.time_out}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">
                                                No employees found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeButton === "totalHours" && (
                    <div className="employee-accumulated-hours">
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name or ID..."
                            onChange={handleSearch}
                            className="search-bar mt-10 text-black"
                        />
                        <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Accumulated Total Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((employee) => (
                                        <tr key={employee.user_id}>
                                            <td>{employee.user_id}</td>
                                            <td>{employee.name}</td>
                                            <td>
                                                {employee.accumulated_time ||
                                                    "0 minutes"}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3">No employees found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {activeButton === "allEmployees" && (
                    <div className="all-employees-data">
                        <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4">
                            <thead>
                                <tr>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Average Time In</th>
                                    <th>Average Time Out</th>
                                    <th>Average Hours Per Day</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allEmployeesData.length > 0 ? (
                                    allEmployeesData.map((employee) => (
                                        <tr key={employee.user_id}>
                                            <td>{employee.user_id}</td>
                                            <td>{employee.name}</td>
                                            <td>{employee.avg_time_in}</td>
                                            <td>{employee.avg_time_out}</td>
                                            <td>{employee.avg_hours}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">
                                            No employees data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Attendance;
