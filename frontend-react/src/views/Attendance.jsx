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
        const searchTerm = searchRef.current?.value.trim().toLowerCase();
        if (!searchTerm) {
            // If search term is empty, reset the filtered data
            setFilteredMonitoringEmployees(monitoringData);
            setFilteredAllEmployeesData(allEmployeesData);
            return;
        }

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

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            handleSearch();
        }, 300); // Wait for 300ms before running the search

        return () => clearTimeout(debounceTimeout); // Cleanup on each render
    }, [
        searchRef.current?.value,
        activeButton,
        monitoringData,
        allEmployeesData,
    ]);

    const formatToHour = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        return `${hours}:${minutes}`; // Format as "HH:MM"
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

    const formatTime = (timeStr) => {
        if (!timeStr || timeStr === "Pending") return "Pending";
        return timeStr; // Time is already formatted as HH:mm from backend
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
                    <div className="w-full max-w-7xl mx-auto ml-[-5px] sm:ml-0 px-4 text-black">
                        {/* Search Bar */}
                        <input
                            key={activeButton}
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name or ID..."
                            onChange={handleSearch}
                            className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />

                        <div className="bg-white shadow-lg rounded-lg p-6">
                            {/* Mobile View */}
                            <div className="md:hidden max-h-[500px] overflow-y-auto">
                                {filteredMonitoringEmployees.length > 0 ? (
                                    filteredMonitoringEmployees.map(
                                        (employee, index) => (
                                            <div
                                                key={`${employee.user_id}-${employee.date}-${index}`}
                                                className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50 space-y-2"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-black">
                                                        {employee.name}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        ID: {employee.user_id}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500 text-xs">
                                                            Date
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatDate(
                                                                employee.date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">
                                                            Time In
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatToHour(
                                                                employee.time_in,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-xs">
                                                            Time Out
                                                        </p>
                                                        <p className="font-medium">
                                                            {formatToHour(
                                                                employee.time_out,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-end justify-end">
                                                        <button
                                                            onClick={() =>
                                                                openModal(
                                                                    employee,
                                                                )
                                                            }
                                                            className="bg-green-800 text-white px-4 py-1 rounded-md text-sm hover:bg-green-900 transition-colors"
                                                        >
                                                            Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No employees found.
                                    </div>
                                )}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <div className="max-h-[500px] overflow-y-auto rounded-lg">
                                    <table className="w-full bg-white">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time In
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time Out
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMonitoringEmployees.length >
                                            0 ? (
                                                filteredMonitoringEmployees.map(
                                                    (employee, index) => (
                                                        <tr
                                                            key={`${employee.user_id}-${employee.date}-${index}`}
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() =>
                                                                openModal(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {
                                                                    employee.user_id
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {employee.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatDate(
                                                                    employee.date,
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatToHour(
                                                                    employee.time_in,
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatToHour(
                                                                    employee.time_out,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="px-6 py-4 text-sm text-center text-gray-500"
                                                    >
                                                        No employees found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeButton === "allEmployees" && (
                    <div className="w-full max-w-7xl mx-auto ml-[-7px] sm:ml-0 px-4 text-black">
                        {/* Filters Section */}
                        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">
                                        Select Month:
                                    </label>
                                    <select
                                        className="text-black rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(e.target.value)
                                        }
                                    >
                                        {[...Array(12).keys()].map((m) => (
                                            <option key={m + 1} value={m + 1}>
                                                {new Date(0, m).toLocaleString(
                                                    "default",
                                                    { month: "long" },
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">
                                        Select Year:
                                    </label>
                                    <select
                                        className="text-black rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={selectedYear}
                                        onChange={(e) =>
                                            setSelectedYear(e.target.value)
                                        }
                                    >
                                        {[2023, 2024, 2025, 2026].map(
                                            (year) => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">
                                        Search:
                                    </label>
                                    <input
                                        type="text"
                                        ref={searchRef}
                                        placeholder="Search by name or ID..."
                                        onChange={handleSearch}
                                        className="text-black rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white shadow-lg rounded-lg">
                            {/* Mobile View */}
                            <div className="md:hidden">
                                <div className="max-h-[500px] overflow-y-auto p-4">
                                    {filteredAllEmployeesData.length > 0 ? (
                                        filteredAllEmployeesData.map(
                                            (employee) => (
                                                <div
                                                    key={employee.user_id}
                                                    className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                                                >
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div>
                                                            <h3 className="font-medium text-black">
                                                                {employee.name}
                                                            </h3>
                                                            <p className="text-xs text-gray-500">
                                                                ID:{" "}
                                                                {
                                                                    employee.user_id
                                                                }
                                                            </p>
                                                        </div>
                                                        <button
                                                            className="bg-green-800 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-900 transition-colors"
                                                            onClick={() =>
                                                                openModal(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            Details
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Average Time In
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {employee.avg_time_in ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Average Time Out
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {employee.avg_time_out ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Average
                                                                Hours/Day
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {employee.avg_hours ||
                                                                    "N/A"}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500">
                                                                Total Hours This
                                                                Month
                                                            </p>
                                                            <p className="text-sm font-medium">
                                                                {employee.total_hours ||
                                                                    "0 minutes"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            No employees found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <div className="max-h-[500px] overflow-y-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Time In
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Time Out
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Hours/Day
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total Hours
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredAllEmployeesData.length >
                                            0 ? (
                                                filteredAllEmployeesData.map(
                                                    (employee) => (
                                                        <tr
                                                            key={
                                                                employee.user_id
                                                            }
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() =>
                                                                openModal(
                                                                    employee,
                                                                )
                                                            }
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {
                                                                    employee.user_id
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                {employee.name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {employee.avg_time_in ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {employee.avg_time_out ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {employee.avg_hours ||
                                                                    "N/A"}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {employee.total_hours ||
                                                                    "0 minutes"}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="6"
                                                        className="px-6 py-4 text-sm text-center text-gray-500"
                                                    >
                                                        No employees found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
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
                                    className="close-btn bg-gray-400 text-white w-full py-2 mt-3 hover:bg-gray-600 transition"
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
