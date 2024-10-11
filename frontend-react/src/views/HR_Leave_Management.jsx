import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";

const HR_Leave_Management = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        // Fetch leave requests when the component mounts
        axiosClient
            .get("/leave-request") // Adjust endpoint as necessary
            .then((response) => {
                setLeaveRequests(response.data.leaveRequests || []);
            })
            .catch((error) => {
                console.error("Error fetching leave requests:", error);
                setErrorMessage("Failed to fetch leave requests.");
            });
    }, []);

    const handleApprove = async (requestId) => {
        try {
            const response = await axiosClient.post(`/leave-requests/${requestId}/approve`);
            setSuccessMessage(response.data.message);
            setLeaveRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === requestId ? { ...request, statuses: "approved" } : request
                )
            );
            setTimeout(() => setSuccessMessage(""), 4000); // Clear success message after 4 seconds
        } catch (error) {
            console.error("Error approving leave request:", error);
            setErrorMessage("Error approving request.");
        }
    };

    const handleDecline = async (requestId) => {
        try {
            const response = await axiosClient.post(`/leave-requests/${requestId}/decline`);
            setSuccessMessage(response.data.message);
            setLeaveRequests((prevRequests) =>
                prevRequests.map((request) =>
                    request.id === requestId ? { ...request, statuses: "declined" } : request
                )
            );
            setTimeout(() => setSuccessMessage(""), 4000); // Clear success message after 4 seconds
        } catch (error) {
            console.error("Error declining leave request:", error);
            setErrorMessage("Error declining request.");
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>
            {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
            {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}
            <table className="table-auto w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100 text-black">
                    <tr>
                        <th className="p-2 border border-gray-300">Employee Name</th>
                        <th className="p-2 border border-gray-300">Start Date</th>
                        <th className="p-2 border border-gray-300">End Date</th>
                        <th className="p-2 border border-gray-300">Days Requested</th>
                        <th className="p-2 border border-gray-300">Status</th>
                        <th className="p-2 border border-gray-300">File</th>
                        <th className="p-2 border border-gray-300">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests.length > 0 ? (
                        leaveRequests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50 text-black">
                                <td className="p-2 border border-gray-300">{request.user_name}</td>
                                <td className="p-2 border border-gray-300">{request.start_date}</td>
                                <td className="p-2 border border-gray-300">{request.end_date}</td>
                                <td className="p-2 border border-gray-300">{request.days_requested}</td>
                                <td className="p-2 border border-gray-300">{request.statuses}</td>
                                <td className="p-2 border border-gray-300">
                                    <a
                                        href={`/${request.file_path}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        View PDF
                                    </a>
                                </td>
                                <td className="p-2 border border-gray-300">
                                    <button
                                        className={`px-3 py-1 rounded ${request.statuses === "approved" || request.statuses === "declined" ? "bg-gray-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"}`}
                                        onClick={() => handleApprove(request.id)}
                                        disabled={request.statuses === "approved" || request.statuses === "declined"}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className={`ml-2 px-3 py-1 rounded ${request.statuses === "declined" || request.statuses === "approved" ? "bg-gray-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"}`}
                                        onClick={() => handleDecline(request.id)}
                                        disabled={request.statuses === "declined" || request.statuses === "approved"}
                                    >
                                        Decline
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center p-4">
                                No leave requests found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default HR_Leave_Management;
