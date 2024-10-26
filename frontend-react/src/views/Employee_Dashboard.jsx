import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/profile.css";
import defaultAvatar from "../assets/default-avatar.png";
import axiosClient from "../axiosClient";
import { parseISO, differenceInYears } from "date-fns";
import EmployeeEvent from "./employee_event";
import { Eye } from "lucide-react";

const EmployeeDashboard = () => {
    const { user } = useStateContext();
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [showModal, setShowModal] = useState(false);
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

    const handleView = (request) => {
        setSelectedLeave(request);
        setShowModal(true);
    };
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

    const BASE_URL = import.meta.env.VITE_BASE_URL; // Access VITE_BASE_URL

    return (
        <div className="animated fadeInDown">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div className="flex flex-col md:col-span-2 bg-white text-black p-6 rounded-xl">
                    <h2 className="font-bold text-lg mb-4">Personal Details</h2>
                    <div className="hidden md:flex justify-center">
                        <img
                            src={
                                employee.profile
                                    ? `${BASE_URL}/storage/images/${employee.profile}`
                                    : defaultAvatar
                            }
                            alt="Profile"
                            className="p-2 w-40 h-40 mb-4 transition-all"
                        />
                    </div>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                        <div className="space-y-1">
                            <div className="text-sm text-neutral-600">Name</div>
                            <div className="text-base font-semibold">
                                {employee.name}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-neutral-600">
                                Email
                            </div>
                            <div className="text-base font-semibold">
                                {employee.email}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-neutral-600">
                                Date of Birth
                            </div>
                            <div className="text-base font-semibold">
                                {employee.date_of_birth
                                    ? new Date(
                                          employee.date_of_birth,
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-neutral-600">Age</div>
                            <div className="text-base font-semibold">
                                {calculateAge(employee.date_of_birth)}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-sm text-neutral-600">
                                Leave Credits
                            </div>
                            <div className="text-base font-semibold">
                                {employee.sick_leave_balance} days
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block profile-details text-base font-kodchasan">
                        <div className="flex py-2 items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5 w-32">Name:</div>
                            <div>{employee.name}</div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        <div className="flex py-2 items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5 w-32">Email:</div>
                            <div>{employee.email}</div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        <div className="flex py-2 items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5 w-32">
                                Date of Birth:
                            </div>
                            <div>
                                {employee.date_of_birth
                                    ? new Date(
                                          employee.date_of_birth,
                                      ).toLocaleDateString()
                                    : "N/A"}
                            </div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        <div className="flex py-2 items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5 w-32">Age:</div>
                            <div>{calculateAge(employee.date_of_birth)}</div>
                        </div>
                        <div className="border-b-2 border-green-900 mb-2"></div>

                        <div className="flex py-2 items-center font-semibold text-black text-start">
                            <div className="font-bold mr-5 w-32">
                                Leave Credits:
                            </div>
                            <div>{employee.sick_leave_balance} days</div>
                        </div>
                    </div>
                </div>

                <div
                    className="flex flex-col md:col-span-3 items-center bg-white text-black
                p-6 rounded-xl"
                >
                    <EmployeeEvent />
                </div>
            </div>

            {/* Leave Requests Section */}
            <div className="flex flex-col bg-white text-black p-6 rounded-xl">
                <h2 className="font-bold text-lg mb-4">Leave Requests</h2>

                {/* Mobile View */}
                <div className="md:hidden mt-4 max-h-60 overflow-y-auto space-y-3">
                    {Object.entries(leaveRequests).map(([status, requests]) =>
                        requests.map((request, index) => (
                            <div
                                key={`${status}-${index}`}
                                className="bg-neutral-50 flex flex-col items-center p-3 rounded-lg space-y-2 cursor-pointer hover:bg-neutral-100 transition-colors"
                                onClick={() => handleView(request)}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="text-sm">
                                            {new Date(
                                                request.start_date,
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {new Date(
                                                request.end_date,
                                            ).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm font-medium">
                                            {request.days_requested} days
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm">
                                    Status:{" "}
                                    <span className="font-medium">
                                        {request.statuses}
                                    </span>
                                </div>
                            </div>
                        )),
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block mt-4 max-h-60 overflow-y-auto">
                    <table className="min-w-full border-collapse border border-neutral-200">
                        <thead className="bg-neutral-100 sticky top-0 text-neutral-700 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="p-2 border border-neutral-200 text-center">
                                    File
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Start Date
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    End Date
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Days
                                </th>
                                <th className="p-2 border border-neutral-200 text-center">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-200 text-black text-center">
                            {Object.entries(leaveRequests).map(
                                ([status, requests]) =>
                                    requests.map((request, index) => (
                                        <tr key={`${status}-${index}`}>
                                            <td className="p-2 border border-neutral-200">
                                                {request.file_path ? (
                                                    <a
                                                        href={`${BASE_URL}/storage/${request.file_path}`}
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
                                            <td className="p-2 border border-neutral-200">
                                                {new Date(
                                                    request.start_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {new Date(
                                                    request.end_date,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {request.days_requested}
                                            </td>
                                            <td className="p-2 border border-neutral-200">
                                                {request.statuses}
                                            </td>
                                        </tr>
                                    )),
                            )}
                        </tbody>
                    </table>
                </div>

                {/* View Modal */}
                {showModal && selectedLeave && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold">
                                    Leave Request Details
                                </h3>

                                <div className="space-y-3">
                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Duration
                                        </p>
                                        <p className="text-sm">
                                            {new Date(
                                                selectedLeave.start_date,
                                            ).toLocaleDateString()}{" "}
                                            -{" "}
                                            {new Date(
                                                selectedLeave.end_date,
                                            ).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-neutral-600">
                                            {selectedLeave.days_requested} days
                                        </p>
                                    </div>

                                    <div className="text-left">
                                        <p className="text-sm font-semibold">
                                            Status
                                        </p>
                                        <p className="text-sm">
                                            {selectedLeave.statuses}
                                        </p>
                                    </div>

                                    {selectedLeave.file_path && (
                                        <div className="text-left">
                                            <p className="text-sm font-semibold">
                                                Attachment
                                            </p>
                                            <a
                                                href={`${BASE_URL}/storage/${selectedLeave.file_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                {selectedLeave.file_name}
                                            </a>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            setSelectedLeave(null);
                                        }}
                                        className="px-4 py-2 bg-neutral-100 text-neutral-800 rounded-lg hover:bg-neutral-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
