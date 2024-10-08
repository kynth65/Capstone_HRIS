import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/defaultLayout.css";

function EmployeeLayout() {
    const { user, token, setToken, setUser } = useStateContext();
    const refresh = useRefreshToken();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    const [headerText, setHeaderText] = useState(
        localStorage.getItem("headerText") || "Employee Dashboard",
    );
    const navigate = useNavigate();

    // Effect to handle initial header text and navigation on token change
    useEffect(() => {
        localStorage.setItem("headerText", headerText);
    }, [headerText]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.removeItem("headerText");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
    useEffect(() => {
        if (!token) {
            if (token === null || token === undefined) return;
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axiosClient.get("/user");
                setUser(data);
                // console.log("User fetched successfully:", data); // Debugging line
            } catch (error) {
                // console.error("Error fetching user:", error.response); // Debugging line
                if (error.response && error.response.status === 401) {
                    try {
                        await refresh();
                        const { data } = await axiosClient.get("/user");
                        setUser(data);
                        //   console.log("User fetched after refresh:", data); // Debugging line
                    } catch (refreshError) {
                        //    console.error("Error refreshing token:", refreshError); // Debugging line
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            }
        };

        fetchUser();
    }, [navigate, refresh, setUser]);

    const onLogout = (ev) => {
        ev.preventDefault();
        setUser({});
        setToken(null); // Ensure setToken updates the context correctly
        window.localStorage.removeIteme("isLoggedIn");
        localStorage.removeItem("headerText");
        navigate("/");
    };

    const handleHeaderChange = (text) => {
        setHeaderText(text);
    };
    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div id="defaultLayout">
            <div className="bg-transparent xl:w-72 relative"></div>
            <aside
                className={`${isSidebarVisible ? "block" : "hidden"} 
                xl:flex xl:flex-col bg-[#1d2e28] pt-16 fixed z-30
            `}
            >
                <button
                    className="hamburger absolute top-5 left-11 xl:hidden"
                    onClick={toggleSidebar}
                >
                    &#9776;
                </button>
                <h1 className="title text-xl">
                    GAMMACARE HRIS <br /> {user.position}
                </h1>

                <div className="flex-col flex gap-4 w-64 px-6 h-screen">
                    <Link
                        to="/employee-dashboard"
                        onClick={() => handleHeaderChange("Employee Dashboard")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Dashboard
                        </span>
                    </Link>

                    <Link
                        to="/leave-management"
                        onClick={() => handleHeaderChange("Leave Management")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Leave Management
                        </span>
                    </Link>

                    <Link
                        to="/salary-history"
                        onClick={() => handleHeaderChange("Salary History")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Salary History
                        </span>
                    </Link>
                    <Link
                        to="/employee-certificate"
                        onClick={() =>
                            handleHeaderChange("Employee Certificate")
                        }
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Certificate
                        </span>
                    </Link>
                    <Link
                        to="/employee-attendance"
                        onClick={() =>
                            handleHeaderChange("Employee Attendance")
                        }
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Attendance
                        </span>
                    </Link>

                    <div className="mt-24">
                        <Link
                            to="/employee-profile"
                            onClick={() => handleHeaderChange("Profile")}
                            className="profile-link"
                        >
                            <div className="flex items-center px-5 bg-transparent h-16 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                                <img
                                    src={
                                        user.profile
                                            ? `http://127.0.0.1:8000/storage/images/${user.profile}`
                                            : defaultAvatar
                                    }
                                    alt="Profile"
                                    className="w-10 h-10 mr-4 rounded-full object-cover"
                                />
                                <div>
                                    {user?.name} <br />
                                    {user?.position}
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </aside>
            <div className="content">
                <header className="flex justify-between">
                    <button
                        className="hamburger xl:hidden"
                        onClick={toggleSidebar}
                    >
                        &#9776;
                    </button>
                    <div className="headerText">{headerText}</div>
                    <div>
                        <a
                            href="/login"
                            onClick={onLogout}
                            className="btn-logout"
                        >
                            Logout
                        </a>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default EmployeeLayout;
