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
                    "/employee-notifications",
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
                                          employee.date_of_birth,
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
                            <div className="font-bold mr-5">Leave Credits:</div>
                            <div className="">
                                {employee.sick_leave_balance} days
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leave Requests Section */}
            <div className="flex flex-col bg-white text-black p-6 rounded-xl">
                <h2 className="font-bold text-lg mb-4">Leave Requests</h2>
                <div className="mt-4 max-h-60 overflow-y-auto">
                    {" "}
                    {/* Set max height for scrollable table */}
                    <table className="min-w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100 sticky top-0 text-gray-700 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-2 border border-gray-200 text-center">
                                    File
                                </th>
                                <th className="p-2 border border-gray-200 text-center">
                                    Start Date
                                </th>
                                <th className="p-2 border border-gray-200 text-center">
                                    End Date
                                </th>
                                <th className="p-2 border border-gray-200 text-center">
                                    Days
                                </th>
                                <th className="p-2 border border-gray-200 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-black text-center">
                            {Object.entries(leaveRequests).map(
                                ([status, requests]) =>
                                    requests.map((request, index) => (
                                        <tr key={`${status}-${index}`}>
                                            <td className="p-2 border border-gray-200">
                                                {request.file_path ? (
                                                    <a
                                                        href={`http://localhost:8000/storage/${request.file_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {request.file_name}
                                                    </a>
                                                ) : (
                                                    "N/A"
                                                )}
                                            </td>
                                            <td className="p-2 border border-gray-200">
                                                {new Date(
                                                    request.start_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-gray-200">
                                                {new Date(
                                                    request.end_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-gray-200">
                                                {request.days_requested}
                                            </td>
                                            <td className="p-2 border border-gray-200">
                                                {request.statuses}
                                            </td>
                                        </tr>
                                    )),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;
