import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";

import Modal from "react-modal";

Modal.setAppElement("#root");

function Attendance() {
    const [activeButton, setActiveButton] = useState("monitoring");
    const [monitoringData, setMonitoringData] = useState([]);
    const [allEmployeesData, setAllEmployeesData] = useState([]);
    const [filteredMonitoringEmployees, setFilteredMonitoringEmployees] =
        useState([]);
    const [filteredAllEmployeesData, setFilteredAllEmployeesData] = useState(
        [],
    );
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().getMonth() + 1,
    );
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const searchRef = useRef();

    // Fetch monitoring data
    const fetchMonitoringData = async () => {
        try {
            const response = await axiosClient.get("/sync-attendance");
            setMonitoringData(response.data);
            setFilteredMonitoringEmployees(response.data); // Reset filtered employees for monitoring
        } catch (error) {
            console.error("Error fetching monitoring data:", error);
        }
    };

    // Fetch all employees data based on selected month and year
    const fetchAllEmployeesData = async (month, year) => {
        try {
            const response = await axiosClient.get("/monthly-attendance", {
                params: { month, year },
            });
            setAllEmployeesData(response.data);
            setFilteredAllEmployeesData(response.data); // Reset filtered employees for all employees data
        } catch (error) {
            console.error("Error fetching all employees data:", error);
        }
    };

    // Handle data fetching based on active button
    useEffect(() => {
        if (activeButton === "monitoring") {
            fetchMonitoringData();
        } else if (activeButton === "allEmployees") {
            fetchAllEmployeesData(selectedMonth, selectedYear);
        }
    }, [activeButton, selectedMonth, selectedYear]);

    // Polling for real-time updates in monitoring
    useEffect(() => {
        if (activeButton === "monitoring") {
            const intervalId = setInterval(() => {
                fetchMonitoringData();
            }, 5000); // Poll every 5 seconds
            return () => clearInterval(intervalId);
        }
    }, [activeButton]);

    const handleSearch = () => {
        const searchTerm = searchRef.current.value.trim().toLowerCase();
        if (activeButton === "monitoring") {
            const filtered = monitoringData.filter(
                (employee) =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.user_id.toString().includes(searchTerm),
            );
            setFilteredMonitoringEmployees(filtered);
        } else if (activeButton === "allEmployees") {
            const filtered = allEmployeesData.filter(
                (employee) =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.user_id.toString().includes(searchTerm),
            );
            setFilteredAllEmployeesData(filtered);
        }
    };

    const formatToHour = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.getHours().toString().padStart(2, "0") + ":00";
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const options = { month: "long", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
    };

    const openModal = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedEmployee(null);
        setIsModalOpen(false);
    };
    return (
        <div>
            <nav className="grid grid-cols-2">
                <button
                    className={`navButton ${activeButton === "monitoring" ? "active" : ""}`}
                    onClick={() => setActiveButton("monitoring")}
                >
                    Monitoring
                </button>
                <button
                    className={`navButton ${activeButton === "allEmployees" ? "active" : ""}`}
                    onClick={() => setActiveButton("allEmployees")}
                >
                    All Employees Data
                </button>
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
                                        <th className="hidden md:table-cell">
                                            User ID
                                        </th>
                                        <th>Name</th>
                                        <th>Date</th>
                                        <th className="hidden md:table-cell">
                                            Time In
                                        </th>
                                        <th className="hidden md:table-cell">
                                            Time Out
                                        </th>
                                        <th className="md:hidden">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMonitoringEmployees.length > 0 ? (
                                        filteredMonitoringEmployees.map(
                                            (employee) => (
                                                <tr
                                                    key={`${employee.user_id}-${employee.date}`}
                                                >
                                                    <td className="hidden md:table-cell">
                                                        {employee.user_id}
                                                    </td>
                                                    <td>{employee.name}</td>
                                                    <td>
                                                        {formatDate(
                                                            employee.date,
                                                        )}
                                                    </td>
                                                    <td className="hidden md:table-cell">
                                                        {formatToHour(
                                                            employee.time_in,
                                                        )}
                                                    </td>
                                                    <td className="hidden md:table-cell">
                                                        {formatToHour(
                                                            employee.time_out,
                                                        )}
                                                    </td>
                                                    <td className="md:hidden">
                                                        <button
                                                            className="view-btn bg-green-800 w-full py-2 px-4 rounded-md text-white hover:bg-green-900"
                                                            onClick={() =>
                                                                openModal(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>
                                                    </td>
                                                </tr>
                                            ),
                                        )
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

                {activeButton === "allEmployees" && (
                    <div className="all-employees-data">
                        <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:justify-between  mt-5">
                            <div className="flex flex-col items-center gap-1">
                                <label>Select Month:</label>
                                <select
                                    className="text-black mb-0 rounded-lg"
                                    value={selectedMonth}
                                    onChange={(e) =>
                                        setSelectedMonth(e.target.value)
                                    }
                                >
                                    {[...Array(12).keys()].map((m) => (
                                        <option key={m + 1} value={m + 1}>
                                            {new Date(0, m).toLocaleString(
                                                "default",
                                                {
                                                    month: "long",
                                                },
                                            )}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <label>Select Year:</label>
                                <select
                                    className="text-black mb-0 rounded-lg"
                                    value={selectedYear}
                                    onChange={(e) =>
                                        setSelectedYear(e.target.value)
                                    }
                                >
                                    {[2023, 2024, 2025, 2026].map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <label className="md:mr-2   md:mt-0">
                                    Search:
                                </label>
                                <input
                                    type="text"
                                    ref={searchRef}
                                    placeholder="Search by name or ID..."
                                    onChange={handleSearch}
                                    className="rounded-lg mt-2 md:mt-0 mb-0 text-black"
                                />
                            </div>
                        </div>

                        <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-3/4">
                            <thead>
                                <tr>
                                    <th className="hidden md:table-cell">
                                        User ID
                                    </th>
                                    <th>Name</th>
                                    <th className="hidden md:table-cell">
                                        Average Time In
                                    </th>
                                    <th className="hidden md:table-cell">
                                        Average Time Out
                                    </th>
                                    <th className="hidden md:table-cell">
                                        Average Hours Per Day
                                    </th>
                                    <th>Total Hours This Month</th>
                                    <th className="md:hidden">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAllEmployeesData.length > 0 ? (
                                    filteredAllEmployeesData.map((employee) => (
                                        <tr key={employee.user_id}>
                                            <td className="hidden md:table-cell">
                                                {employee.user_id}
                                            </td>
                                            <td>{employee.name}</td>
                                            <td className="hidden md:table-cell">
                                                {employee.avg_time_in || "N/A"}
                                            </td>
                                            <td className="hidden md:table-cell">
                                                {employee.avg_time_out || "N/A"}
                                            </td>
                                            <td className="hidden md:table-cell">
                                                {employee.avg_hours || "N/A"}
                                            </td>
                                            <td>
                                                {employee.total_hours ||
                                                    "0 minutes"}
                                            </td>
                                            <td className="md:hidden">
                                                <button
                                                    className="view-btn bg-green-800 w-full py-2 px-4 rounded-md text-white hover:bg-green-900"
                                                    onClick={() =>
                                                        openModal(employee)
                                                    }
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">
                                            No employees data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Employee Details"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="modal-content bg-white p-4 rounded-lg">
                        {selectedEmployee && (
                            <div className="employee-details text-sm md:text-lg space-y-4 text-black">
                                <h2 className="text-xl font-bold mb-4">
                                    Employee Details
                                </h2>
                                <p>
                                    <strong>User ID:</strong>{" "}
                                    {selectedEmployee.user_id}
                                </p>
                                <p>
                                    <strong>Name:</strong>{" "}
                                    {selectedEmployee.name}
                                </p>
                                <p>
                                    <strong>Average Time In:</strong>{" "}
                                    {selectedEmployee.avg_time_in || "N/A"}
                                </p>
                                <p>
                                    <strong>Average Time Out:</strong>{" "}
                                    {selectedEmployee.avg_time_out || "N/A"}
                                </p>
                                <p>
                                    <strong>Average Hours Per Day:</strong>{" "}
                                    {selectedEmployee.avg_hours || "N/A"}
                                </p>
                                <p>
                                    <strong>Total Hours This Month:</strong>{" "}
                                    {selectedEmployee.total_hours ||
                                        "0 minutes"}
                                </p>
                                <button
                                    className="close-btn bg-red-800 text-white w-full py-2 mt-3"
                                    onClick={closeModal}
                                >
                                    close
                                </button>
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default Attendance;
