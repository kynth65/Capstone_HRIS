import React, { useState } from "react";
import axiosClient from "../axiosClient";
import jsPDF from "jspdf";
import "jspdf-autotable";

const SalaryHistory = () => {
    const [userId, setUserId] = useState("");
    const [payrolls, setPayrolls] = useState([]);
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchPayrolls = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.post(
                "/salary-history",
                {
                    password: password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            setPayrolls(response.data);
            setIsAuthenticated(true);
            setError("");
        } catch (error) {
            setError(
                error.response?.data?.error ||
                    "Incorrect password. Please try again.",
            );
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };
    const generatePDF = (payroll) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Payslip", 20, 20);
        doc.setFontSize(12);
        doc.text(`Employee ID: ${userId}`, 20, 30);

        doc.autoTable({
            startY: 40,
            head: [["Description", "Amount"]],
            body: [
                ["Hourly Rate", `${parseFloat(payroll.hourlyRate).toFixed(2)}`],
                [
                    "Gross Salary",
                    `${parseFloat(payroll.grossSalary).toFixed(2)}`,
                ],
                ["Tax", `${payroll.tax}%`],
                ["Deductions", `${parseFloat(payroll.deductions).toFixed(2)}`],
                ["Net Salary", `${parseFloat(payroll.net_salary).toFixed(2)}`],
            ],
            theme: "striped",
        });

        doc.save(`payslip_${userId}`.pdf);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!password.trim()) {
            setError("Password is required");
            return;
        }
        fetchPayrolls();
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            {!isAuthenticated ? (
                <form onSubmit={handlePasswordSubmit} className="mb-6">
                    <label className="block text-gray-700 mb-2">
                        Enter Password to View Salary History
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 p-2 rounded w-full mb-4 text-black"
                        placeholder="Enter your password"
                        required
                    />

                    <button
                        type="submit"
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Submit"}
                    </button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </form>
            ) : (
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Salary History
                    </h2>

                    {/* Mobile View */}
                    <div className="md:hidden max-h-[400px] overflow-y-auto rounded-lg">
                        {payrolls.length > 0 ? (
                            payrolls.map((payroll, index) => {
                                // Convert created_at to a date object
                                const createdAtDate = new Date(
                                    payroll.created_at,
                                );
                                // Format the date to "Month Day, Year"
                                const options = {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                };
                                const formattedDate =
                                    createdAtDate.toLocaleDateString(
                                        "en-US",
                                        options,
                                    );

                                return (
                                    <div
                                        key={index}
                                        className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50"
                                    >
                                        <p className="text-gray-700">
                                            <strong>Month: </strong>{" "}
                                            {formattedDate}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Net Salary: </strong>
                                            {payroll.net_salary}
                                        </p>
                                        <p className="px-4 py-4">
                                            <button
                                                onClick={generatePDF}
                                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                Download Payslip
                                            </button>
                                        </p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-700">
                                No payroll records available.
                            </p>
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <table className="w-full bg-white border-collapse overflow-x-auto">
                            <thead className="bg-gray-100 sticky top-0">
                                <tr className="text-left text-sm font-semibold text-gray-700">
                                    <th className="px-4 py-2">Month</th>
                                    <th className="px-4 py-2">Net Salary</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-900">
                                {payrolls.length > 0 ? (
                                    payrolls.map((payroll) => {
                                        // Convert created_at to a date object
                                        const createdAtDate = new Date(
                                            payroll.created_at,
                                        );
                                        // Format the date to "Month Day, Year"
                                        const options = {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        };
                                        const formattedDate =
                                            createdAtDate.toLocaleDateString(
                                                "en-US",
                                                options,
                                            );

                                        return (
                                            <tr
                                                key={payroll.id}
                                                className="hover:bg-gray-100 transition-colors"
                                            >
                                                <td className="px-4 py-4">
                                                    {formattedDate}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {payroll.net_salary}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <button
                                                        onClick={() =>
                                                            generatePDF(payroll)
                                                        }
                                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                                                    >
                                                        Download Payslip
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="3"
                                            className="text-center py-8 text-gray-500"
                                        >
                                            No salary history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaryHistory;
