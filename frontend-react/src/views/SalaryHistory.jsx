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
        <div className="max-h-[400px] overflow-y-auto rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Salary History</h2>
            <table className="employee-table bg-white text-black w-full xl:w-full">
                <thead className="sticky top-0 bg-gray-200 border-b-2">
                    <tr className="text-base font-kodchasan">
                        <th className="px-4 py-2">Hourly Rate</th>
                        <th className="px-4 py-2">Working Hours</th>
                        <th className="px-4 py-2">Gross Salary</th>
                        <th className="px-4 py-2">Net Salary</th>
                        <th className="px-4 py-2">Tax</th>
                        <th className="px-4 py-2">Deductions</th>
                    </tr>
                </thead>
                <tbody>
                    {payrolls.length > 0 ? (
                        payrolls.map((payroll) => (
                            <tr
                                key={payroll.id}
                                className="font-medium hover:bg-gray-100"
                            >
                                <td className="px-4 py-6">
                                    {payroll.hourly_rate}
                                </td>
                                <td className="px-4 py-6">
                                    {payroll.working_hours}
                                </td>
                                <td className="px-4 py-6">
                                    {payroll.gross_salary}
                                </td>
                                <td className="px-4 py-6">
                                    {payroll.net_salary}
                                </td>
                                <td className="px-4 py-6">{payroll.tax}</td>
                                <td className="px-4 py-6">
                                    {payroll.deductions}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-20">
                                No salary history found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default SalaryHistory;
