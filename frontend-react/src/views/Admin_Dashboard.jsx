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
        late: 0,
        leave: 0,
        attendanceRecords: [],
        employmentStatus: [],
        notifications: [],
    });
    const [highlightedDates, setHighlightedDates] = useState([]);

    useEffect(() => {
        axiosClient
            .get("/dashboard")
            .then((response) => {
                console.log("Dashboard data:", response.data);
                setData((prevData) => ({
                    ...prevData,
                    ...response.data,
                }));
            })
            .catch((error) => {
                console.error("Error fetching dashboard data:", error);
            });
    }, []);

    // Fetch expiring and expired certificates
    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                const response = await axiosClient.get(
                    "/expiring-certificates"
                );
                setData((prevData) => ({
                    ...prevData,
                    expiringCertificates: response.data.expiringCertificates,
                    expiredCertificates: response.data.expiredCertificates,
                }));
            } catch (error) {
                console.error("Error fetching certificates:", error);
            }
        };

        fetchCertificates();
    }, []);

    useEffect(() => {
        axiosClient("/highlighted-dates")
            .then((response) => {
                const dates = response.data.map((date) => new Date(date));
                setHighlightedDates(dates);
            })
            .catch((error) => console.error("Error fetching dates:", error));
    }, []);

    // Use tileClassName to apply a custom class to specific days
    const tileClassName = ({ date, view }) => {
        if (view === "month") {
            const isHighlighted = highlightedDates.some(
                (highlightDate) =>
                    highlightDate.toDateString() === date.toDateString()
            );

            if (isHighlighted) {
                return "highlight";
            }
        }
        return null;
    };

    const formatSentDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const timeDiff = Math.abs(now - date);
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        if (daysDiff === 0) return "Sent today";
        if (daysDiff === 1) return "Sent yesterday";
        return `Sent ${daysDiff} days ago`;
    };

    return (
        <>
            <div className="animated fadeInDown">
                <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Total Employee:
                        <span className="font-bold ">{data.total}</span>
                    </div>
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Present:
                        <span className="font-bold ">{data.present}</span>
                    </div>
                    <div className="flex w-auto flex-col p-6 lg:text-xl text-black bg-white rounded-xl font-kodchasan text-center">
                        Late:
                        <span className="font-bold ">{data.late}</span>
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
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend verticalAlign="bottom" align="center" />
                                <Bar
                                    dataKey="FullTime"
                                    name="Full Time"
                                    fill="#079dde"
                                />
                                <Bar
                                    dataKey="PartTime"
                                    name="Part Time"
                                    fill="#82ca9d"
                                />
                                <Bar
                                    dataKey="Student"
                                    name="Student"
                                    fill="#FFA500"
                                />
                            </BarChart>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-center text-black w-auto pl-0 py-4 bg-white rounded-lg mb-4 lg:py-5 xl:py-8">
                            <Calendar tileClassName={tileClassName} />
                        </div>
                        <div className="flex flex-col items-center notifications-container w-full h-auto lg:h-[290px] xl:h-80 bg-white rounded-lg mb-4 p-4">
                            <span className="font-bold text-black text-lg mb-2">
                                Notification
                            </span>
                            <div className="flex-grow overflow-auto">
                                {Array.isArray(data.notifications) &&
                                data.notifications.length > 0 ? (
                                    data.notifications.map(
                                        (notification, index) => (
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
                                                            notification.created_at
                                                        )}
                                                    />
                                                </ListItem>
                                            </div>
                                        )
                                    )
                                ) : (
                                    <ListItem>
                                        <ListItemText primary="No notifications found" />
                                    </ListItem>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
