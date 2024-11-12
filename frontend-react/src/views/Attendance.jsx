import React, { useState, useEffect, useRef } from "react";
import axiosClient from "../axiosClient";

import Modal from "react-modal";

Modal.setAppElement("#root");

function Attendance() {
    const [activeButton, setActiveButton] = useState("monitoring");
    const [monitoringData, setMonitoringData] = useState([]);
    const [allEmployeesData, setAllEmployeesData] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
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
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
    const [dateRangeData, setDateRangeData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [modalFromDate, setModalFromDate] = useState("");
    const [modalToDate, setModalToDate] = useState("");
    const [modalAction, setModalAction] = useState(""); // 'preview' or 'download'
    const [showPreviewButton, setShowPreviewButton] = useState(false);
    const [reportData, setReportData] = useState(null);
  

    // Add this effect at the top of your component
    useEffect(() => {
        const fetchEmployees = async () => {
            if (activeButton === "dateRange") {
                try {
                    const response = await axiosClient.get("/employees");
                    setEmployees(response.data);
                    setFilteredEmployees(response.data); // Initialize filtered employees
                } catch (error) {
                    console.error("Error fetching employees:", error);
                }
            }
        };
    
        fetchEmployees();
    }, [activeButton]);


    // Fetch monitoring data
    const fetchMonitoringData = async () => {
        try {
            const response = await axiosClient.get("/sync-attendance");
            const filteredData = response.data.filter((employee) => {
                const empDate = new Date(employee.date);
                // Extract day and month from employee date
                const empDay = empDate.getDate();
                const empMonth = empDate.getMonth() + 1;

                // Compare with selected day and month
                return empDay === selectedDay && empMonth === selectedMonth;
            });
            setMonitoringData(filteredData);
            setFilteredMonitoringEmployees(filteredData);
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

    const handleSearch = () => {
        const searchTerm = searchRef.current?.value.trim().toLowerCase();
        if (!searchTerm) {
            // If search term is empty, reset the filtered data
            setFilteredMonitoringEmployees(monitoringData);
            setFilteredAllEmployeesData(allEmployeesData);
            setFilteredEmployees(employees); // Reset filtered employees
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
        } else if (activeButton === "dateRange") {
            const filtered = employees.filter(
                (employee) =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.user_id.toString().includes(searchTerm),
            );
            setFilteredEmployees(filtered);
        }
    };

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            handleSearch();
        }, 300);
    
        return () => clearTimeout(debounceTimeout);
    }, [
        searchRef.current?.value,
        activeButton,
        monitoringData,
        allEmployeesData,
        employees,
    ]);

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

    const formatToHour = (timestamp) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const fetchDateRangeData = async () => {
        try {
            const response = await axiosClient.get("/attendance-range", {
                params: { from_date: fromDate, to_date: toDate },
            });
            setAllEmployeesData(response.data);
            setFilteredAllEmployeesData(response.data);
        } catch (error) {
            console.error("Error fetching date range data:", error);
        }
    };

    const generateReport = async () => {
        if (!selectedEmployee || !fromDate || !toDate) return;
    
        try {
            const response = await axiosClient.get("/attendance-range", {
                params: {
                    user_id: selectedEmployee.user_id,
                    from_date: fromDate,
                    to_date: toDate,
                },
            });
            
            setDateRangeData(response.data);
            setShowPreviewButton(true); // Show the preview button after successful generation
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Error generating report. Please try again.");
        }
    };
      

    const handleGenerateReport = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
    
        fromDateObj.setHours(0, 0, 0, 0);
        toDateObj.setHours(0, 0, 0, 0);
    
        // Error checks
        if (!fromDate || !toDate) {
          alert("Please select both from and to dates");
          return;
        }
    
        if (fromDateObj > today || toDateObj > today) {
          alert("Cannot generate report for future dates");
          return;
        }
    
        if (fromDateObj > toDateObj) {
          alert("From date cannot be later than to date");
          return;
        }
    
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        if (toDateObj - fromDateObj > oneYearInMs) {
          alert("Date range cannot exceed 1 year");
          return;
        }
    
        // If all validations pass, proceed with report generation
        generateReport();
      };

      const handlePreviewIndividualReport = async () => {
        if (!selectedEmployee || !fromDate || !toDate) return;
    
        try {
            const response = await axiosClient.get("/preview-date-range-report", {  // Changed endpoint
                params: {
                    user_id: selectedEmployee.user_id,
                    from_date: fromDate,
                    to_date: toDate,
                },
            });
    
            // Open preview in new tab
            const newWindow = window.open("", "_blank");
            newWindow.document.write(response.data.html);
            newWindow.document.close();
        } catch (error) {
            console.error("Error previewing report:", error);
            alert("Error previewing report. Please try again.");
        }
    };

    const downloadMonthlyReport = async () => {
        try {
            const response = await axiosClient.get("/generate-monthly-report", {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `monthly_attendance_report_${selectedMonth}_${selectedYear}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    };

    const previewMonthlyReport = async () => {
        try {
            const response = await axiosClient.get("/preview-monthly-report", {
                params: {
                    month: selectedMonth,
                    year: selectedYear,
                },
            });

            setPreviewContent(response.data.html);
            setPreviewTitle(response.data.title);
            setIsPreviewOpen(true);

            // Open preview in new tab
            const newWindow = window.open("", "_blank");
            newWindow.document.write(response.data.html);
            newWindow.document.close();
        } catch (error) {
            console.error("Error previewing report:", error);
        }
    };

    const handlePreviewReport = () => {
        // Get current date at midnight for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Convert form dates to Date objects
        const fromDateObj = new Date(modalFromDate);
        const toDateObj = new Date(modalToDate);

        fromDateObj.setHours(0, 0, 0, 0);
        toDateObj.setHours(0, 0, 0, 0);

        // Error checks
        if (!modalFromDate || !modalToDate) {
            alert("Please select both from and to dates");
            return;
        }

        if (fromDateObj > today || toDateObj > today) {
            alert("Cannot preview report for future dates");
            return;
        }

        if (fromDateObj > toDateObj) {
            alert("From date cannot be later than to date");
            return;
        }

        // Additional validation for reasonable date range (e.g., maximum 1 year)
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        if (toDateObj - fromDateObj > oneYearInMs) {
            alert("Date range cannot exceed 1 year");
            return;
        }

        // If all validations pass, proceed with preview
        handleModalSubmit();
    };

    const handleModalSubmit = async () => {
        // Get current date at midnight for consistent comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Convert form dates to Date objects
        const fromDateObj = new Date(modalFromDate);
        const toDateObj = new Date(modalToDate);

        fromDateObj.setHours(0, 0, 0, 0);
        toDateObj.setHours(0, 0, 0, 0);

        // Error checks
        if (!modalFromDate || !modalToDate) {
            alert("Please select both from and to dates");
            return;
        }

        if (fromDateObj > today || toDateObj > today) {
            alert(`Cannot ${modalAction} report for future dates`);
            return;
        }

        if (fromDateObj > toDateObj) {
            alert("From date cannot be later than to date");
            return;
        }

        // Additional validation for reasonable date range
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        if (toDateObj - fromDateObj > oneYearInMs) {
            alert("Date range cannot exceed 1 year");
            return;
        }
        try {
            if (modalAction === "preview") {
                const response = await axiosClient.get(
                    "/preview-date-range-report",
                    {
                        params: {
                            from_date: modalFromDate,
                            to_date: modalToDate,
                        },
                    },
                );

                const newWindow = window.open("", "_blank");
                newWindow.document.write(response.data.html);
                newWindow.document.close();
            } else {
                const response = await axiosClient.get(
                    "/download-date-range-report",
                    {
                        params: {
                            from_date: modalFromDate,
                            to_date: modalToDate,
                        },
                        responseType: "blob",
                    },
                );

                const blob = new Blob([response.data], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `attendance_report_${modalFromDate}_to_${modalToDate}.xlsx`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }

            setIsDateModalOpen(false);
        } catch (error) {
            console.error("Error generating report:", error);
            alert(
                `Error ${modalAction === "preview" ? "previewing" : "downloading"} report. Please try again.`,
            );
        }
    };

    const previewDateRangeReport = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates");
            return;
        }

        try {
            const response = await axiosClient.get(
                "/preview-date-range-report",
                {
                    params: {
                        from_date: fromDate,
                        to_date: toDate,
                    },
                },
            );

            // Open preview in new tab
            const newWindow = window.open("", "_blank");
            newWindow.document.write(response.data.html);
            newWindow.document.close();
        } catch (error) {
            console.error("Error previewing report:", error);
        }
    };
    

    const downloadDateRangeExcel = async () => {
        if (!fromDate || !toDate) {
            alert("Please select both from and to dates");
            return;
        }

        try {
            const response = await axiosClient.get(
                "/download-date-range-report",
                {
                    params: {
                        from_date: fromDate,
                        to_date: toDate,
                    },
                    responseType: "blob",
                },
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `attendance_report_${fromDate}_to_${toDate}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading report:", error);
        }
    };

    const openDateRangeModal = (employee) => {
        setSelectedEmployee(employee);
        setIsDateRangeModalOpen(true);
        setDateRangeData(null);
        setFromDate("");
        setToDate("");
    };

    const closeDateRangeModal = () => {
        setIsDateRangeModalOpen(false);
        setSelectedEmployee(null);
        setDateRangeData(null);
        setFromDate("");
        setToDate("");
    };

    const openDateModal = (action) => {
        setModalAction(action);
        setModalFromDate("");
        setModalToDate("");
        setIsDateModalOpen(true);
    };

    useEffect(() => {
        if (activeButton === "monitoring") {
            fetchMonitoringData();
        }
    }, [activeButton, selectedMonth, selectedDay]);

    return (
        <div>
            <nav className="grid grid-cols-3">
                <button
                    className={`navButton ${activeButton === "monitoring" ? "active" : ""}`}
                    onClick={() => setActiveButton("monitoring")}
                >
                    Daily Attendance Monitoring
                </button>
                <button
                    className={`navButton ${activeButton === "dateRange" ? "active" : ""}`}
                    onClick={() => setActiveButton("dateRange")}
                >
                    Date Range Report
                </button>
                <button
                    className={`navButton ${activeButton === "allEmployees" ? "active" : ""}`}
                    onClick={() => setActiveButton("allEmployees")}
                >
                    Montly Attendance Data
                </button>
            </nav>

            <div className="animated fadeInDown">
                {activeButton === "monitoring" && (
                    <div className="w-full max-w-7xl mx-auto ml-[-5px] sm:ml-0 px-4 text-black">
                        {/* Search Bar */}
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
                                            setSelectedMonth(
                                                Number(e.target.value),
                                            )
                                        }
                                    >
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <option key={i + 1} value={i + 1}>
                                                {new Date(0, i).toLocaleString(
                                                    "default",
                                                    { month: "long" },
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm text-gray-600 mb-1">
                                        Select Day:
                                    </label>
                                    <select
                                        className="text-black rounded-lg border border-gray-200 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={selectedDay}
                                        onChange={(e) =>
                                            setSelectedDay(
                                                Number(e.target.value),
                                            )
                                        }
                                    >
                                        {Array.from(
                                            {
                                                length: new Date(
                                                    new Date().getFullYear(),
                                                    selectedMonth,
                                                    0,
                                                ).getDate(),
                                            },
                                            (_, i) => (
                                                <option
                                                    key={i + 1}
                                                    value={i + 1}
                                                >
                                                    {i + 1}
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

                        <div className="bg-white shadow-lg rounded-lg p-6">
                            {/* Mobile View */}
                            <div className="md:hidden max-h-[500px] overflow-y-auto">
                                {filteredMonitoringEmployees.length > 0 ? (
                                    [...filteredMonitoringEmployees]
                                        .sort((a, b) => {
                                            const aTime = new Date(
                                                a.time_out || a.time_in,
                                            );
                                            const bTime = new Date(
                                                b.time_out || b.time_in,
                                            );
                                            return bTime - aTime; // Sort in descending order
                                        })
                                        .map((employee, index) => (
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
                                        ))
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
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time In
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time Out
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredMonitoringEmployees.length >
                                            0 ? (
                                                [...filteredMonitoringEmployees]
                                                    .sort((a, b) => {
                                                        const aTime = new Date(
                                                            a.time_out ||
                                                                a.time_in,
                                                        );
                                                        const bTime = new Date(
                                                            b.time_out ||
                                                                b.time_in,
                                                        );
                                                        return bTime - aTime; // Sort in descending order
                                                    })
                                                    .map((employee, index) => (
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
                                                    ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan="5"
                                                        className="px-6 py-4 text-sm text-center text-gray-500"
                                                    >
                                                        No attendance found.
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

                {activeButton === "dateRange" && (
                    <div className="w-full max-w-7xl mx-auto ml-[-7px] sm:ml-0 px-4 text-black">
                        {/* Search Bar */}
                        <input
                            key="dateRangeSearch"
                            type="text"
                            ref={searchRef}
                            placeholder="Search by name or ID..."
                            onChange={handleSearch}
                            className="w-full max-w-md text-black px-4 py-2 mb-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />

                        <div className="bg-white shadow-lg rounded-lg">
                            {/* Mobile View */}
                            <div className="md:hidden">
    <div className="max-h-[500px] overflow-y-auto p-4">
        {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
                <div
                    key={employee.user_id}
                    className="border border-gray-200 p-4 rounded-lg mb-4 bg-gray-50"
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-medium text-black">
                                {employee.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                                ID: {employee.user_id}
                            </p>
                        </div>
                        <button
                            onClick={() => openDateRangeModal(employee)}
                            className="bg-green-800 text-white px-4 py-1.5 rounded-md text-sm hover:bg-green-900 transition-colors"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            ))
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generate Report
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                        <tr
                            key={employee.user_id}
                            className="hover:bg-gray-50"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {employee.user_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {employee.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <button
                                    onClick={() => openDateRangeModal(employee)}
                                    className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-900"
                                >
                                    Generate Report
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan="3"
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
                        <div className="flex justify-center md:justify-end py-2 pr-2 space-x-2">
                            <button
                                onClick={() => openDateModal("preview")}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Preview Report
                            </button>
                            <button
                                onClick={() => openDateModal("download")}
                                className="bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-800 transition-colors"
                            >
                                Download Excel
                            </button>
                        </div>
                    </div>
                )}

                <Modal
                    isOpen={isDateModalOpen}
                    onRequestClose={() => setIsDateModalOpen(false)}
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto text-black">
                        <h2 className="text-xl font-bold mb-4">
                            {modalAction === "preview"
                                ? "Preview Report"
                                : "Download Excel Report"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    From Date:
                                </label>
                                <input
                                    type="date"
                                    value={modalFromDate}
                                    max={new Date().toISOString().split("T")[0]} // Prevents selecting future dates
                                    onChange={(e) =>
                                        setModalFromDate(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    To Date:
                                </label>
                                <input
                                    type="date"
                                    value={modalToDate}
                                    max={new Date().toISOString().split("T")[0]} // Prevents selecting future dates
                                    onChange={(e) =>
                                        setModalToDate(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                onClick={() => setIsDateModalOpen(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={
                                    modalAction === "preview"
                                        ? handlePreviewReport
                                        : handleModalSubmit
                                }
                                disabled={!modalFromDate || !modalToDate}
                                className={`px-4 py-2 rounded transition-colors ${
                                    modalAction === "preview"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-green-800 hover:bg-green-900"
                                } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {modalAction === "preview"
                                    ? "Preview"
                                    : "Download"}
                            </button>
                        </div>
                    </div>
                </Modal>

                <Modal
    isOpen={isDateRangeModalOpen}
    onRequestClose={closeDateRangeModal}
    className="modal"
    overlayClassName="overlay"
>
    <div className="modal-content bg-white p-6 rounded-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4 text-black">
            {dateRangeData ? 'Attendance Report' : 'Generate Attendance Report'}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
                <label className="block text-sm text-gray-600 mb-1">
                    From Date:
                </label>
                <input
                    type="date"
                    value={fromDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2"
                    disabled={!!dateRangeData}
                />
            </div>
            <div>
                <label className="block text-sm text-gray-600 mb-1">
                    To Date:
                </label>
                <input
                    type="date"
                    value={toDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 p-2"
                    disabled={!!dateRangeData}
                />
            </div>
        </div>

        {dateRangeData && (
            <div className="space-y-4 text-black bg-gray-50 p-4 rounded-lg">
                <p><strong>Employee:</strong> {dateRangeData.name}</p>
                <p><strong>Total Work Hours:</strong> {dateRangeData.total_hours}</p>
                <p><strong>Days Worked:</strong> {dateRangeData.days_worked}</p>
                <p><strong>Average Hours/Day:</strong> {dateRangeData.avg_hours_per_day}</p>
                <p><strong>Average Time In:</strong> {dateRangeData.avg_time_in}</p>
                <p><strong>Average Time Out:</strong> {dateRangeData.avg_time_out}</p>
                <p><strong>Total Lates:</strong> {dateRangeData.total_lates}</p>
                
                <div className="mt-4">
                    <button
                        onClick={handlePreviewIndividualReport}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Preview Detailed Report
                    </button>
                </div>
            </div>
        )}

        <div className="flex justify-end space-x-4 mt-6">
            <button
                onClick={closeDateRangeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
                Close
            </button>
            {!dateRangeData && (
                <button
                    onClick={handleGenerateReport}
                    disabled={!fromDate || !toDate}
                    className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900 disabled:opacity-50"
                >
                    Generate Report
                </button>
            )}
        </div>
    </div>
</Modal>

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
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User ID
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Name
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Time In
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Time Out
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Average Hours/Day
                                                </th>
                                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                        <div className="mt-4 flex justify-center md:justify-end px-6 pb-4 gap-2">
                            <button
                                onClick={previewMonthlyReport}
                                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Preview Report
                            </button>
                            <button
                                onClick={downloadMonthlyReport}
                                className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-900 transition-colors"
                            >
                                Download Excel
                            </button>
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
