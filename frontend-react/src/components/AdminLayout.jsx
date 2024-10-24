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
    const [showModal, setShowModal] = useState(false);

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
    }, [navigate, token]);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const onLogout = (ev) => {
        ev.preventDefault();
        setUser({});
        setToken(null); // Ensure setToken updates the context correctly
        window.localStorage.removeItem("isLoggedIn");
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

    const handleViewProfile = () => {
        navigate("/profile-admin");
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
                    <div className="text-base md:text-2xl md:ml-16 xl:ml-0">
                        {headerText}
                    </div>
                    <div
                        className="flex items-center cursor-pointer font-kodchasan"
                        onClick={toggleModal}
                    >
                        <button className="btn-profile-icon ">
                            <img
                                src={
                                    user.profile
                                        ? `${import.meta.env.VITE_BASE_URL}/storage/images/${user.profile}`
                                        : defaultAvatar
                                }
                                alt="Profile"
                                className="w-10 h-10 md:mr-4 rounded-full object-cover"
                            />
                        </button>
                        <span className="hidden xl:block">{user.position}</span>
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

export default AdminLayout;
