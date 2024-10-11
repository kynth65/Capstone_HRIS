import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/profile.css";
import defaultAvatar from "../assets/default-avatar.png";
import axiosClient from "../axiosClient";
import { parseISO, differenceInYears } from "date-fns";

const EmployeeDashboard = () => {
    const { user } = useStateContext();
    const [employee, setEmployee] = useState({
        name: user.name || "",
        email: user.email || "",
        contact_number: user.contact_number || "",
        address: user.address || "",
        gender: user.gender || "",
        employee_type: user.employee_type || "",
        profile: null,
        date_of_birth: null, // Added date_of_birth field
        leave: 0,
    });

    const [leaveRequests, setLeaveRequests] = useState({
        approved: [],
        declined: [],
        pending: [],
    });

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            try {
                const response = await axiosClient.get("/user");
                setEmployee(response.data);
            } catch (error) {
                console.error("Error fetching employee data:", error);
            }
        };

        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const fetchLeaveRequestStatus = async () => {
            try {
                const response = await axiosClient.get("/leave-request-status");
                const {
                    approvedLeaveRequests,
                    declinedLeaveRequests,
                    pendingLeaveRequests,
                } = response.data;

                setLeaveRequests({
                    approved: Object.values(approvedLeaveRequests),
                    declined: Object.values(declinedLeaveRequests),
                    pending: Object.values(pendingLeaveRequests),
                });
            } catch (error) {
                console.error("Error fetching leave request status:", error);
            }
        };

        fetchLeaveRequestStatus();
    }, []);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axiosClient.get(
                    "/employee-notifications"
                );
                setNotifications(response.data);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    function calculateAge(date_of_birth) {
        if (!date_of_birth) return "N/A";
        const birthDate = parseISO(date_of_birth);
        const today = new Date();
        return differenceInYears(today, birthDate);
    }

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
        <div className="animated fadeInDown">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Employee Profile Section */}
                <div className="flex flex-col items-center bg-white text-black p-6 rounded-xl">
                    <img
                        src={
                            employee.profile
                                ? `http://127.0.0.1:8000/storage/images/${employee.profile}`
                                : defaultAvatar
                        }
                        alt="Profile"
                        className="p-2 w-52 h-52 mb-4 hover:w-56 hover:h-56 transition-all"
                    />
                    <h1 className="font-bold text-xl mb-2">{employee.name}</h1>
                    <p className="text-gray-500 text-base">
                        Position: {employee.position}
                    </p>
                </div>
                {/* Employee Personal Details Section */}
                <div className="flex flex-col bg-white text-black p-6 rounded-xl">
                    <h2 className="font-bold text-lg mb-4">Personal Details</h2>
                    <div className="profile-details text-base font-kodchasan">
                        {/* Name */}
                        <div className="flex py-2 lg items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5">Name:</div>
                            <div className="">{employee.name}</div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        {/* Email */}
                        <div className="flex py-2 lg items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5">Email:</div>
                            <div className="">{employee.email}</div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        {/* Date of Birth */}
                        <div className="flex py-2 lg items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5">Date of Birth:</div>
                            <div className="">
                                {employee.date_of_birth
                                    ? new Date(
                                          employee.date_of_birth
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        {/* Age */}
                        <div className="flex py-2 lg items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5">Age:</div>
                            <div className="">
                                {calculateAge(employee.date_of_birth)}
                            </div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        {/* Leave Balance */}
                        <div className="flex py-2 lg items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5">Leave Balance:</div>
                            <div className="">
                                {employee.sick_leave_balance} days
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Section */}
            <div className="flex flex-col bg-white text-black p-6 rounded-xl mb-4">
                <h2 className="font-bold text-lg mb-4">Notifications</h2>
                <div className="max-h-40 overflow-y-auto">
                    {Array.isArray(notifications) &&
                    notifications.length > 0 ? (
                        notifications.map((notification, index) => (
                            <div
                                className={`border-2 rounded-lg p-2 mb-2 w-full ${
                                    notification.type === "expired"
                                        ? "bg-red-100 text-red-900 border-red-500"
                                        : "bg-white text-green-900 border-green-900"
                                }`}
                                key={index}
                            >
                                <p>{notification.message}</p>
                                <span className="text-sm text-gray-500">
                                    {formatSentDate(notification.created_at)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>No notifications found.</p>
                    )}
                </div>
            </div>

            {/* Leave Requests Section */}
            <div className="flex flex-col bg-white text-black p-6 rounded-xl">
                <h2 className="font-bold text-lg mb-4">Leave Requests</h2>
                <div className="mt-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        File
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Days
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-black">
                                {Object.entries(leaveRequests).map(
                                    ([status, requests]) =>
                                        requests.map((request, index) => (
                                            <tr key={`${status}-${index}`}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <a
                                                        href={`/${request.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {request.file_name}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(
                                                        request.start_date
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {new Date(
                                                        request.end_date
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {request.days_requested}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {request.statuses}
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
