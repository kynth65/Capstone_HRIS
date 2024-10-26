import React, { useEffect, useState } from "react";
import axiosClient from "../axiosClient";

const SalaryHistory = () => {
    const [payrolls, setPayrolls] = useState([]);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const response = await axiosClient.get("/salary-history");
                setPayrolls(response.data);
            } catch (error) {
                console.error("Error fetching payrolls:", error);
            }
        };

        fetchPayrolls();
    }, []);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                Salary History
            </h2>

            {/* Mobile View */}
            <div className="md:hidden max-h-[400px] overflow-y-auto rounded-lg">
                {payrolls.length > 0 ? (
                    payrolls.map((payroll, index) => (
                        <div
                            key={index}
                            className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50"
                        >
                            <p className="text-gray-700">
                                <strong>Hourly Rate:</strong> $
                                {payroll.hourly_rate}
                            </p>
                            <p className="text-gray-700">
                                <strong>Working Hours:</strong>{" "}
                                {payroll.working_hours}
                            </p>
                            <p className="text-gray-700">
                                <strong>Gross Salary:</strong> $
                                {payroll.gross_salary}
                            </p>
                            <p className="text-gray-700">
                                <strong>Net Salary:</strong> $
                                {payroll.net_salary}
                            </p>
                            <p className="text-gray-700">
                                <strong>Tax:</strong> ${payroll.tax}
                            </p>
                            <p className="text-gray-700">
                                <strong>Deductions:</strong> $
                                {payroll.deductions}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        No salary history found.
                    </div>
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <table className="w-full bg-white border-collapse overflow-x-auto">
                    <thead className="bg-gray-100 sticky top-0">
                        <tr className="text-left text-sm font-semibold text-gray-700">
                            <th className="px-4 py-2">Hourly Rate</th>
                            <th className="px-4 py-2">Working Hours</th>
                            <th className="px-4 py-2">Gross Salary</th>
                            <th className="px-4 py-2">Net Salary</th>
                            <th className="px-4 py-2">Tax</th>
                            <th className="px-4 py-2">Deductions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-900">
                        {payrolls.length > 0 ? (
                            payrolls.map((payroll) => (
                                <tr
                                    key={payroll.id}
                                    className="hover:bg-gray-100 transition-colors"
                                >
                                    <td className="px-4 py-4">
                                        ${payroll.hourly_rate}
                                    </td>
                                    <td className="px-4 py-4">
                                        {payroll.working_hours}
                                    </td>
                                    <td className="px-4 py-4">
                                        ${payroll.gross_salary}
                                    </td>
                                    <td className="px-4 py-4">
                                        ${payroll.net_salary}
                                    </td>
                                    <td className="px-4 py-4">
                                        ${payroll.tax}
                                    </td>
                                    <td className="px-4 py-4">
                                        ${payroll.deductions}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="6"
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
    );
};

export default SalaryHistory;
