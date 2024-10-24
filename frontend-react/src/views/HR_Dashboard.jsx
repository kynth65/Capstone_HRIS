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

import { IoNotificationsOutline } from "react-icons/io5";

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
                const response = await axiosClient.get("/sync-attendance");
                console.log("Attendance Records Response:", response.data); // Add this line to debug the response
                setData((prevData) => ({
                    ...prevData,
                    attendanceRecords: Array.isArray(response.data)
                        ? response.data
                        : [], // Ensure it's an array
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
                        <div className="flex flex-col mb-4 mr-2 sm:mr-0 justify-center items-center w-auto lg:h-[313px] xl:h-[334px] bg-white text-black rounded-lg  overflow-auto">
                            <h1 className="font-bold text-lg py-2">
                                Attendance Records
                            </h1>
                            <div className="employee-list-container w-full h-72">
                                <table className="employee-table bg-white text-black rounded-xl w-full">
                                    <thead>
                                        <tr className="sticky top-[-10px]">
                                            <th className="hidden md:table-cell">
                                                User ID
                                            </th>
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
                                                        <td className="hidden md:table-cell">
                                                            {record.user_id}
                                                        </td>
                                                        <td>{record.name}</td>
                                                        <td>
                                                            {formatDate(
                                                                record.date,
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatToHour(
                                                                record.time_in,
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatToHour(
                                                                record.time_out,
                                                            )}
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
                        <div className="flex sm:hidden justify-center text-black  mr-2 sm:mr-0  pl-0 py-4 bg-white rounded-lg mb-4 lg:py-3 xl:py-6">
                            <div className="w-[290px] p-2">
                                <Calendar tileClassName={tileClassName} />
                            </div>
                        </div>
                        <div className="flex space-x-8 mb-4 mr-2 sm:mr-0 justify-center items-center  xl:h-80 bg-white text-black rounded-lg">
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
                            <div className="hidden sm:block lg:hidden justify-center text-black  mr-2 sm:mr-0  pl-0 py-4 bg-white rounded-lg mb-4 lg:py-3 xl:py-6">
                                <div className="w-[290px] p-2">
                                    <Calendar tileClassName={tileClassName} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="flex flex-col items-center max-h-96 mr-2 sm:mr-0 h-auto lg:h-[313px] xl:h-[333px] bg-white rounded-lg mb-4">
                            <span className="font-bold text-black text-lg mb-2 pt-3">
                                Notification
                            </span>
                            <div className="flex-grow overflow-auto md:w-fit">
                                {Array.isArray(data.notifications) &&
                                data.notifications.length > 0 ? (
                                    data.notifications
                                        .filter(
                                            (notification) =>
                                                notification.message,
                                        )
                                        .map((notification, index) => (
                                            <div
                                                className={`border-2 rounded-lg mb-2 w-auto mx-2   ${
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
                        <div className="hidden lg:flex justify-center text-black  mr-2 sm:mr-0  pl-0 py-4 bg-white rounded-lg mb-4 lg:py-3 xl:py-6">
                            <div className="w-[290px] p-2">
                                <Calendar tileClassName={tileClassName} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
