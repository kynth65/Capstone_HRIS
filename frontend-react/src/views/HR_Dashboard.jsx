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

    // Fetch attendance records every 5 seconds
    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            try {
                const response = await axiosClient.get("/record-attendance");
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

    useEffect(() => {
        axiosClient
            .get("/highlighted-dates")
            .then((response) => {
                const dates = response.data.map((date) => new Date(date)); // Convert to JS Date objects
                setHighlightedDates(dates);
                console.log("Fetched and converted dates:", dates); // Log to verify dates
            })
            .catch((error) => console.error("Error fetching dates:", error));
    }, []);

    // Function to apply a custom class to specific days in the calendar
    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            // Only highlight in the 'month' view
            const isHighlighted = highlightedDates.some((highlightDate) => {
                console.log(
                    "Comparing:",
                    highlightDate.toDateString(),
                    "with",
                    date.toDateString(),
                );
                return highlightDate.toDateString() === date.toDateString();
            });
            if (isHighlighted) {
                return "highlight"; // Return custom class for highlighted days
            }
        }
        return null; // Return null for other days
    };

    const handleApprove = (requestId) => {
        axiosClient
            .post(`/leave-requests/${requestId}/approve`)
            .then((response) => {
                setSuccessPopup(response.data.message);
                setTimeout(() => {
                    setSuccessPopup(false);
                }, 4000);
                setData((prevData) => ({
                    ...prevData,
                    leaveRequests: prevData.leaveRequests.map((request) =>
                        request.id === requestId
                            ? { ...request, statuses: "approved" }
                            : request,
                    ),
                    //disable the decline button when the statuses value is aprrove
                }));
            })
            .catch((error) => {
                console.error("Error approving leave request:", error);
                setErrorMessage("Error approving request");
            });
    };

    const handleDecline = (requestId) => {
        axiosClient
            .post(`/leave-requests/${requestId}/decline`)
            .then((response) => {
                setSuccessPopup(response.data.message);
                setTimeout(() => {
                    setSuccessPopup(false);
                }, 4000);
                setData((prevData) => ({
                    ...prevData,
                    leaveRequests: prevData.leaveRequests.map((request) =>
                        request.id === requestId
                            ? { ...request, statuses: "declined" }
                            : request,
                    ),
                    //disable the approve button when statuses value is decline
                }));
            })
            .catch((error) => {
                console.error("Error declining leave request:", error);
                setErrorMessage("Error declining request");
            });
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

    return (
        <>
            <div className="animated fadeInDown">
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Total Employee:
                        <span className="font-bold ">{data.total}</span>
                    </div>
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Present:
                        <span className="font-bold ">{data.present}</span>
                    </div>
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Leave:
                        <span className="font-bold "> {data.leave}</span>
                    </div>
                </div>
                <div className="lg:grid lg:grid-cols-2">
                    <div className="mr-2">
                        <div className="flex flex-col justify-center items-center w-auto xl:h-80 bg-white text-black rounded-lg mb-4 overflow-auto">
                            <h1 className="py-2 font-bold text-lg">
                                Attendance Records
                            </h1>
                            <div className="employee-list-container w-full h-60">
                                <table className="employee-table bg-white text-black rounded-xl overflow-hidden w-full">
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
                                        {data.attendanceRecords.length > 0 ? (
                                            data.attendanceRecords.map(
                                                (record) => (
                                                    <tr key={record.id}>
                                                        <td>
                                                            {record.user_id}
                                                        </td>
                                                        <td>{record.name}</td>
                                                        <td>{record.date}</td>
                                                        <td>
                                                            {record.time_in}
                                                        </td>
                                                        <td>
                                                            {record.time_out}
                                                        </td>
                                                    </tr>
                                                ),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center"
                                                >
                                                    No attendance records found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center w-auto xl:h-80 bg-white text-black rounded-lg mb-4 ">
                            <h1 className="py-2 font-bold text-lg">
                                Employee Status
                            </h1>
                            <BarChart
                                width={400}
                                height={250}
                                data={[
                                    {
                                        name: "Employment Status",
                                        ...data.employmentStatus,
                                    },
                                ]} // Wrap data to create a single object for BarChart
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                                {/* Separate bars for each employment type */}
                                <Bar
                                    dataKey="FullTime"
                                    name="Full Time"
                                    fill="#079dde"
                                />{" "}
                                {/* Green */}
                                <Bar
                                    dataKey="PartTime"
                                    name="Part Time"
                                    fill="#82ca9d"
                                />{" "}
                                {/* Blue */}
                                <Bar
                                    dataKey="Student"
                                    name="Student"
                                    fill="#FFA500"
                                />{" "}
                                {/* Orange */}
                            </BarChart>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-center text-black w-auto pl-0 py-4 bg-white rounded-lg mb-4 lg:py-5 xl:py-8">
                            <Calendar
                                tileClassName={tileClassName} // Apply the custom class for highlighted dates
                            />
                        </div>
                        <div className="flex flex-col items-center notifications-container w-full max-h-96 h-auto lg:h-[290px] xl:h-80 bg-white rounded-lg mb-4 p-4">
                            <span className="font-bold text-black text-lg mb-2">
                                Notification
                            </span>
                            <div className="flex-grow overflow-auto">
                                {Array.isArray(data.notifications) &&
                                data.notifications.length > 0 ? (
                                    data.notifications
                                        .filter(
                                            (notification) =>
                                                notification.message,
                                        ) // Filter out any notifications without a message
                                        .map((notification, index) => (
                                            <div
                                                className={`border-2 rounded-lg mb-2 w-full ${
                                                    notification.type ===
                                                    "expired"
                                                        ? "bg-red-100 text-red-900 border-red-500"
                                                        : "bg-white text-green-900 border-green-900"
                                                }`}
                                                key={index}
                                            >
                                                <ListItem>
                                                    <ListItemText
                                                        primary={
                                                            notification.message
                                                        }
                                                        secondary={formatSentDate(
                                                            notification.created_at,
                                                        )}
                                                    />
                                                </ListItem>
                                            </div>
                                        ))
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No notifications found" />
                                    </ListItem>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="max-h-[400px] overflow-y-auto rounded-lg">
                        <table className="table-auto w-full bg-white text-black border-collapse">
                            <thead className="sticky top-0 bg-white">
                                <tr>
                                    <th
                                        className="font-bold text-black text-lg px-20 py-2 text-left bg-white"
                                        colSpan="4"
                                    >
                                        Leave Requests
                                    </th>
                                </tr>
                                <tr className="bg-neutral-300">
                                    <th className="px-16 py-2">
                                        Employee Name
                                    </th>
                                    <th className="px-16 py-2">File</th>
                                    <th className="hidden sm:table-cell px-16 py-2">
                                        Status
                                    </th>
                                    <th className="px-16 py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(data.leaveRequests) &&
                                data.leaveRequests.length > 0 ? (
                                    data.leaveRequests.map((request) => (
                                        <tr
                                            key={request.id}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="px-16 py-2">
                                                {request.user_name}
                                            </td>
                                            <td className="px-16 py-2">
                                                <a
                                                    href={`/${request.file_path}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {request.file_name}
                                                </a>
                                            </td>
                                            <td className="hidden sm:table-cell px-16 py-2">
                                                {request.statuses}
                                            </td>
                                            <td className="px-16 py-2">
                                                <div className="flex space-x-2">
                                                    <button
                                                        className={`px-3 py-1 rounded ${
                                                            request.statuses ===
                                                                "declined" ||
                                                            request.statuses ===
                                                                "approved"
                                                                ? "bg-gray-300 cursor-not-allowed"
                                                                : "bg-green-500 hover:bg-green-600 text-white"
                                                        }`}
                                                        onClick={() =>
                                                            handleApprove(
                                                                request.id,
                                                            )
                                                        }
                                                        disabled={
                                                            request.statuses ===
                                                                "declined" ||
                                                            request.statuses ===
                                                                "approved"
                                                        }
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={`px-3 py-1 rounded ${
                                                            request.statuses ===
                                                                "approved" ||
                                                            request.statuses ===
                                                                "declined"
                                                                ? "bg-gray-300 cursor-not-allowed"
                                                                : "bg-red-500 hover:bg-red-600 text-white"
                                                        }`}
                                                        onClick={() =>
                                                            handleDecline(
                                                                request.id,
                                                            )
                                                        }
                                                        disabled={
                                                            request.statuses ===
                                                                "approved" ||
                                                            request.statuses ===
                                                                "declined"
                                                        }
                                                    >
                                                        Decline
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-16 py-2 text-center"
                                        >
                                            No leave requests found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
