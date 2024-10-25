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
                    <div className="w-full max-w-7xl mx-auto px-4">
                        <input
                            key={activeButton} // Key based on the active tab to reset state properly
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name or ID..."
                            onChange={handleSearch}
                            className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                        <div className="relative rounded-xl overflow-hidden">
                            {/* Table container with fixed height and scroll */}
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full bg-white text-black">
                                    {/* Fixed header */}
                                    <thead className="sticky top-0 bg-white shadow-sm">
                                        <tr>
                                            <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold border-b">
                                                User ID
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm font-semibold border-b">
                                                Date
                                            </th>
                                            <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold border-b">
                                                Time In
                                            </th>
                                            <th className="hidden md:table-cell px-6 py-3 text-center text-sm font-semibold border-b">
                                                Time Out
                                            </th>
                                            <th className="md:hidden px-6 py-3 text-center text-sm font-semibold border-b">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    {/* Scrollable body */}
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredMonitoringEmployees.length >
                                        0 ? (
                                            filteredMonitoringEmployees.map(
                                                (employee, index) => (
                                                    <tr
                                                        key={`${employee.user_id}-${employee.date}-${index}`} // Add `index` to ensure uniqueness
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="hidden md:table-cell px-6 py-4 text-sm">
                                                            {employee.user_id}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium">
                                                            {employee.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {formatDate(
                                                                employee.date,
                                                            )}
                                                        </td>
                                                        <td className="hidden md:table-cell px-6 py-4 text-sm">
                                                            {formatToHour(
                                                                employee.time_in,
                                                            )}
                                                        </td>
                                                        <td className="hidden md:table-cell px-6 py-4 text-sm">
                                                            {formatToHour(
                                                                employee.time_out,
                                                            )}
                                                        </td>
                                                        <td className="md:hidden px-6 py-4">
                                                            <button
                                                                className="w-full py-2 px-4 rounded-md text-white bg-green-800 hover:bg-green-900 transition-colors"
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
                )}

                {activeButton === "allEmployees" && (
                    <div className="w-full max-w-7xl mx-auto px-4">
                        <div className="flex flex-col gap-2 md:grid md:grid-cols-3 md:justify-between mt-5">
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
                                <label className="md:mr-2 md:mt-0">
                                    Search:
                                </label>
                                <input
                                    type="text"
                                    ref={searchRef}
                                    placeholder="Search by name or ID..."
                                    onChange={handleSearch}
                                    className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>

                        <div className="relative rounded-xl overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full bg-white text-black">
                                    <thead className="sticky top-0 bg-white shadow-sm">
                                        <tr>
                                            <th className="hidden md:table-cell px-6 py-3 text-center text-sm  border-b">
                                                User ID
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm  border-b">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm  border-b">
                                                Average Time In
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm  border-b">
                                                Average Time Out
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm  border-b">
                                                Average Hours Per Day
                                            </th>
                                            <th className="px-6 py-3 text-center text-sm  border-b">
                                                Total Hours This Month
                                            </th>
                                            <th className="md:hidden px-6 py-3 text-center text-sm  border-b">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-200">
                                        {filteredAllEmployeesData.length > 0 ? (
                                            filteredAllEmployeesData.map(
                                                (employee) => (
                                                    <tr
                                                        key={employee.user_id}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="hidden md:table-cell px-6 py-4 text-sm">
                                                            {employee.user_id}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium">
                                                            {employee.name}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {employee.avg_time_in ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {employee.avg_time_out ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {employee.avg_hours ||
                                                                "N/A"}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            {employee.total_hours ||
                                                                "0 minutes"}
                                                        </td>
                                                        <td className="md:hidden px-6 py-4">
                                                            <button
                                                                className="w-full py-2 px-4 rounded-md text-white bg-green-800 hover:bg-green-900 transition-colors"
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
                                                <td
                                                    colSpan="7"
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
