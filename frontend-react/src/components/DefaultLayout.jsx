import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import { jwtDecode } from "jwt-decode";
import useRefreshToken from "../hooks/useRefreshToken";
import { useStateContext } from "../contexts/ContextProvider";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/defaultLayout.css";

function DefaultLayout() {
    const { user, token, setToken, setUser } = useStateContext();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const refresh = useRefreshToken();
    const [headerText, setHeaderText] = useState("Dashboard");
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (token === null || token === undefined) return;
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

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
        const storedHeaderText = localStorage.getItem("headerText");
        if (storedHeaderText) {
            setHeaderText(storedHeaderText);
        }
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axiosClient.get("/user");
                setUser(data);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    try {
                        await refresh();
                        const { data } = await axiosClient.get("/user");
                        setUser(data);
                    } catch (refreshError) {
                        navigate("/login");
                    }
                } else {
                    navigate("/login");
                }
            }
        };

        fetchUser();
    }, [navigate, refresh, setUser]);

    const onLogout = async (ev) => {
        ev.preventDefault();
        setUser({});
        setToken(null);
        navigate("/");
        localStorage.removeItem("headerText");
        window.localStorage.removeItem("isLoggedIn");
    };

    const handleHeaderChange = (text) => {
        setHeaderText(text);
        localStorage.setItem("headerText", text);
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const handleViewProfile = () => {
        navigate("/profile");
        setShowModal(false);
    };

    const toggleModal = () => setShowModal(!showModal);
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

                <div className="flex-col flex gap-4 w-64 px-6 h-screen font-kodchasan">
                    <Link
                        to="/dashboard"
                        onClick={() => handleHeaderChange("Dashboard")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            {" "}
                            Dashboard
                        </span>
                    </Link>

                    <Link
                        to="/employee_list"
                        onClick={() => handleHeaderChange("Employee List")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Employee List
                        </span>
                    </Link>
                    <Link
                        to="/hr-leave-management"
                        onClick={() => handleHeaderChange("Leave Management")}
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Leave Management
                    </Link>
                    <Link
                        to="/recruitment_management"
                        onClick={() =>
                            handleHeaderChange("Recruitment Management")
                        }
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Recruitment Management
                        </span>
                    </Link>
                    <Link
                        to="/payroll"
                        onClick={() => handleHeaderChange("Payroll")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Payroll
                        </span>
                    </Link>
                    <Link
                        to="/onboarding"
                        onClick={() => handleHeaderChange("Onboarding")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Onboarding
                        </span>
                    </Link>
                    <Link
                        to="/attendance"
                        onClick={() => handleHeaderChange("Attendance")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Attendance
                        </span>
                    </Link>
                    <Link
                        to="/incident-management"
                        onClick={() =>
                            handleHeaderChange("Incident Management")
                        }
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Incident Management
                        </span>
                    </Link>
                    <Link
                        to="/certificate"
                        onClick={() =>
                            handleHeaderChange("Certificate Management")
                        }
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Certificate Management
                        </span>
                    </Link>
                </div>
            </aside>
            <div className="content">
                {" "}
                <header className="flex justify-between">
                    <button
                        className="text-xl md:hamburger xl:hidden "
                        onClick={toggleSidebar}
                    >
                        &#9776;
                    </button>
                    <div className="headerText">{headerText}</div>
                    <div
                        className="flex items-center cursor-pointer font-kodchasan"
                        onClick={toggleModal}
                    >
                        <button className="btn-profile-icon ">
                            <img
                                src={
                                    user.profile
                                        ? `http://127.0.0.1:8000/storage/images/${user.profile}`
                                        : defaultAvatar
                                }
                                alt="Profile"
                                className="w-10 h-10 md:mr-4 rounded-full object-cover"
                            />
                        </button>
                        <span className="hidden md:block">{user.position}</span>
                    </div>
                </header>
                <main>
                    <Outlet />
                </main>
            </div>
            {showModal && (
                <div
                    className="modal fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setShowModal(false)}
                >
                    <div className="bg-white p-6 rounded-2xl shadow-md text-center text-black">
                        <h2 className="text-lg mb-4">Profile Options</h2>
                        <div className="flex  justify-between space-x-4 rounded-xl">
                            <button
                                onClick={handleViewProfile}
                                className="btn-modal px-4 bg-green-900 py-4 border-2 border-green-900 rounded-xl font-kodchasan text-white hover:bg-white hover:text-green-900 transition"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={onLogout}
                                className="btn-modal px-4 bg-green-900 py-4 border-2 border-green-900 rounded-xl font-kodchasan text-white hover:bg-white hover:text-green-900 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DefaultLayout;
