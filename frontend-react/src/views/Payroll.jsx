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

            // Assuming response data includes working_hours and net_salary
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
                ["Hourly Rate", `$${parseFloat(hourlyRate).toFixed(2)}`],
                //["Working Hours", `${workingHours || 0}`], // Use a default value if undefined
                ["Gross Salary", `$${grossSalary.toFixed(2)}`],
                ["Tax", `${tax}%`],
                ["Deductions", `$${parseFloat(deductions).toFixed(2)}`],
                ["Net Salary", `$${parseFloat(netSalary).toFixed(2)}`],
            ],
            theme: "striped",
        });

        doc.save(`payslip_${userId}.pdf`);
    };
    return (
        <div className="payroll-container animated fadeInDown">
            <h2>Compute Payroll</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={calculatePayroll}>
                <div className="form-group">
                    <label htmlFor="employee">Select Employee:</label>
                    <select
                        id="employee"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
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

                <div className="form-group">
                    <label htmlFor="hourlyRate">Hourly Rate:</label>
                    <input
                        type="number"
                        id="hourlyRate"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="Enter hourly rate"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tax">Tax (%):</label>
                    <input
                        type="number"
                        id="tax"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        placeholder="Enter tax percentage"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="deductions">Deductions:</label>
                    <input
                        type="number"
                        id="deductions"
                        value={deductions}
                        onChange={(e) => setDeductions(e.target.value)}
                        placeholder="Enter deduction amount"
                    />
                </div>

                <button
                    type="submit"
                    className="px-4 py-4 w-full text-base font-kodchasan rounded-xl border-2 border-green-900 bg-green-900 hover:bg-white hover:text-green-900 transition active:bg-green-950 active:text-white"
                >
                    Calculate Salary
                </button>
            </form>

            {netSalary !== null && !isNaN(netSalary) && (
                <div className="payslip text-black flex flex-col space-y-3">
                    <h3>Payslip</h3>
                    <p>Net Salary: ${parseFloat(netSalary).toFixed(2)}</p>
                    <button onClick={generatePDF} className="download-btn">
                        Download Payslip
                    </button>
                </div>
            )}
        </div>
    );
};

export default Payroll;
