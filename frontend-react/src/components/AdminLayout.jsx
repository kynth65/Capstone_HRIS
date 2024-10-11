import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/defaultLayout.css";

function AdminLayout() {
    const { user, token, setToken, setUser } = useStateContext();
    const refresh = useRefreshToken();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const [headerText, setHeaderText] = useState(
        localStorage.getItem("headerText") || "Admin Dashboard",
    );

    useEffect(() => {
        if (token === null || token === undefined) return;
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

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
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
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
                    className="hamburger absolute top-5 left-11 xl:hidden "
                    onClick={toggleSidebar}
                >
                    &#9776;
                </button>
                <h1 className="title text-xl">
                    GAMMACARE HRIS <br></br> {user.position}
                </h1>

                <div className="flex-col flex gap-4 w-64 px-6 h-screen ">
                    <Link
                        to="/admin-dashboard"
                        onClick={() => handleHeaderChange("Dashboard")}
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin-position-edit"
                        onClick={() => handleHeaderChange("Open positions")}
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Open positions
                    </Link>
                    <Link
                        to="/admin-tags"
                        onClick={() => handleHeaderChange("Admin Tags")}
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Admin Tags
                    </Link>
                    <Link
                        to="/admin-leave-management"
                        onClick={() => handleHeaderChange("Leave Management")}
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Leave Management
                    </Link>
                    <Link
                        to="/employee_management"
                        onClick={() =>
                            handleHeaderChange("Employee Management")
                        }
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Employee Management
                    </Link>

                    <div className=" mt-24">
                        <Link
                            to="/profile-admin"
                            onClick={() => handleHeaderChange("Profile")}
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
                {" "}
                <header className="flex justify-between">
                    <button
                        className="hamburger xl:hidden "
                        onClick={toggleSidebar}
                    >
                        &#9776;
                    </button>
                    <div className="headerText">{headerText}</div>
                    <div>
                        <a
                            href="/logout"
                            onClick={onLogout}
                            className="btn-logout hh"
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

export default AdminLayout;
