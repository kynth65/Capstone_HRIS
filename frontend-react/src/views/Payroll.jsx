import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";
import "../styles/payroll.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const Payroll = () => {
    const [employees, setEmployees] = useState([]);
    const [userId, setUserId] = useState("");
    const [netSalary, setNetSalary] = useState(null);
    const [error, setError] = useState(null);
    const [deductions, setDeductions] = useState(0);
    const [hourlyRate, setHourlyRate] = useState("");
    const [tax, setTax] = useState("");
    const [workingHours, setWorkingHours] = useState(0);
    const [grossSalary, setGrossSalary] = useState(0);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await axiosClient.get("/employee-payroll");
            setEmployees(response.data);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError("Failed to fetch employees.");
        }
    };

    const calculatePayroll = async (e) => {
        e.preventDefault();
        if (!userId) {
            setError("Please select an employee.");
            return;
        }

        try {
            const response = await axiosClient.get(
                `/payroll/generate/${userId}`,
                {
                    params: {
                        hourly_rate: parseFloat(hourlyRate),
                        tax: parseFloat(tax) || 0,
                        deductions: parseFloat(deductions) || 0,
                    },
                },
            );

            const fetchedWorkingHours = response.data.working_hours || 0;
            setWorkingHours(fetchedWorkingHours);

            const calculatedGrossSalary =
                parseFloat(hourlyRate) * fetchedWorkingHours;
            setGrossSalary(calculatedGrossSalary);

            setNetSalary(parseFloat(response.data.net_salary).toFixed(2));
            setError(null);
        } catch (error) {
            console.error("Error response:", error.response);
            setError(
                error.response?.data
                    ? `Failed to calculate payroll: ${error.response.data.error}`
                    : "Failed to calculate payroll. Please try again.",
            );
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Payslip", 20, 20);
        doc.setFontSize(12);
        doc.text(`Employee ID: ${userId}`, 20, 30);

        doc.autoTable({
            startY: 40,
            head: [["Description", "Amount"]],
            body: [
                ["Hourly Rate", `${parseFloat(hourlyRate).toFixed(2)}`],
                ["Gross Salary", `${grossSalary.toFixed(2)}`],
                ["Tax", `${tax}%`],
                ["Deductions", `${parseFloat(deductions).toFixed(2)}`],
                ["Net Salary", `${parseFloat(netSalary).toFixed(2)}`],
            ],
            theme: "striped",
        });

        doc.save(`payslip_${userId}.pdf`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 animated fadeInDown">
            <h2 className="text-2xl text-white font-kodchasan mb-6">
                Compute Payroll
            </h2>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
                <form onSubmit={calculatePayroll} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Employee Selection */}
                        <div className="form-group text-black">
                            <label className="block text-sm font-medium text-black mb-2">
                                Select Employee
                            </label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                required
                                className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">-- Select Employee --</option>
                                {employees.map((employee) => (
                                    <option
                                        key={employee.user_id}
                                        value={employee.user_id}
                                    >
                                        {employee.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Hourly Rate */}
                        <div className="form-group text-black">
                            <label className="block  text-sm font-medium text-black mb-2">
                                Hourly Rate
                            </label>
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                required
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter hourly rate"
                            />
                        </div>

                        {/* Tax */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-black mb-2">
                                Tax (%)
                            </label>
                            <input
                                type="number"
                                value={tax}
                                onChange={(e) => setTax(e.target.value)}
                                className="w-full text-black p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter tax percentage"
                            />
                        </div>

                        {/* Deductions */}
                        <div className="form-group">
                            <label className="block text-sm font-medium text-black mb-2">
                                Deductions
                            </label>
                            <input
                                type="number"
                                value={deductions}
                                onChange={(e) => setDeductions(e.target.value)}
                                className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter deduction amount"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-900 text-white py-3 px-6 rounded-lg hover:bg-green-800 transition duration-300 ease-in-out font-medium"
                    >
                        Calculate Salary
                    </button>
                </form>

                {netSalary !== null && !isNaN(netSalary) && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-semibold text-green-900 mb-4">
                            Payslip Summary
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 text-black">
                                <span className="font-medium">
                                    Gross Salary:
                                </span>
                                <span>{grossSalary.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 text-black">
                                <span className="font-medium">Tax Amount:</span>
                                <span>
                                    {(grossSalary * (tax / 100)).toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-200 text-black">
                                <span className="font-medium">Deductions:</span>
                                <span>{parseFloat(deductions).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 font-bold text-lg text-black">
                                <span>Net Salary:</span>
                                <span>{parseFloat(netSalary).toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={generatePDF}
                            className="mt-6 w-full bg-green-900 text-white py-3 px-6 rounded-lg hover:bg-green-800 transition duration-300 ease-in-out font-medium flex items-center justify-center gap-2"
                        >
                            Download Payslip
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payroll;
