import { createBrowserRouter } from "react-router-dom";
import Login from "./views/Login.jsx";
import Register from "./views/Register.jsx";
import DefaultLayout from "./components/DefaultLayout.jsx";
import GuestLayout from "./components/GuestLayout.jsx";
import EmployeeLayout from "./components/EmployeeLayout.jsx";
import Employee_Management from "./views/Employee_Management.jsx";
import Recruitment_Management from "./views/Recruitment_Management.jsx";
import Attendace from "./views/Attendance.jsx";
import Payroll from "./views/Payroll.jsx";
import ForgotPassword from "./views/ForgotPassword.jsx";
import Employee_Dashboard from "./views/Employee_Dashboard.jsx";
import Leave_Management from "./views/Leave_Management.jsx";
import HR_Dashboard from "./views/HR_Dashboard.jsx";
import User from "./views/User.jsx";
import Onboarding from "./views/Onboarding";
import SalaryHistory from "./views/SalaryHistory.jsx";
import ApplicantPortal from "./views/ApplicantPortal.jsx";
import Home from "./views/Home.jsx";
import ResetPassword from "./views/ResetPassword.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminPositionEdit from "./views/AdminPositionEdit.jsx";
import AdminTags from "./views/AdminTags.jsx";
import Certificate from "./views/CertificateManagement.jsx";
import EmployeeList from "./views/HR_Employee_List.jsx";
import AdminDashboard from "./views/Admin_Dashboard.jsx";
import EmployeeCertificate from "./views/EmployeeCertificates";
import EmployeeAttendance from "./views/EmployeeAttendance.jsx";

const ErrorPage = () => (
    <div>
        <h1>404 Not Found</h1>
        <p>The page you are looking for does not exist.</p>
    </div>
);

const router = createBrowserRouter([
    {
        path: "/",
        element: <Recruitment_Management />,
    },
    {
        path: "dashboard",
        element: <HR_Dashboard />,
    },
    {
        path: "employee_list",
        element: <EmployeeList />,
    },
    {
        path: "recruitment_management",
        element: <Recruitment_Management />,
    },
    {
        path: "payroll",
        element: <Payroll />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "onboarding",
        element: <Onboarding />,
    },
    {
        path: "attendance",
        element: <Attendace />,
    },
    {
        path: "profile",
        element: <User />,
    },
    {
        path: "certificate",
        element: <Certificate />,
    },
    {
        path: "/applicantportal",
        element: <ApplicantPortal />,
    },
    {
        path: "/login",
        element: <Login />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/resetpassword",
        element: <ResetPassword />,
    },
    {
        path: "/",
        element: <AdminLayout />,
        children: [
            {
                path: "admin-dashboard",
                element: <AdminDashboard />,
            },
            {
                path: "profile-admin",
                element: <User />,
            },
            {
                path: "admin-position-edit",
                element: <AdminPositionEdit />,
            },
            {
                path: "admin-tags",
                element: <AdminTags />,
            },
            {
                path: "employee_management",
                element: <Employee_Management />,
            },
        ],
        errorElement: <ErrorPage />,
    },
    {
        path: "/",
        element: <DefaultLayout />,
        children: [],
        errorElement: <ErrorPage />,
    },

    {
        path: "/",
        element: <EmployeeLayout />,
        children: [
            {
                path: "employee-dashboard",
                element: <Employee_Dashboard />,
            },
            {
                path: "leave-management",
                element: <Leave_Management />,
            },
            {
                path: "salary-history",
                element: <SalaryHistory />,
            },
            {
                path: "employee-certificate",
                element: <EmployeeCertificate />,
            },
            {
                path: "employee-attendance",
                element: <EmployeeAttendance />,
            },
            {
                path: "employee-profile",
                element: <User />,
            },
        ],
        errorElement: <ErrorPage />,
    },

    {
        path: "/",
        element: <GuestLayout />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "forgot-password",
                element: <ForgotPassword />,
            },
        ],
        errorElement: <ErrorPage />,
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);

export default router;
