import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { Link, Outlet, useNavigate } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import axiosClient from "../axiosClient";
import defaultAvatar from "../assets/default-avatar.png";
import "../styles/defaultLayout.css";
import { IoNotificationsOutline } from "react-icons/io5"; // Add this import at the top

function AdminLayout() {
    const { user, token, setToken, setUser } = useStateContext();
    const refresh = useRefreshToken();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotificationDropdown, setShowNotificationDropdown] =
        useState(false);

    const [headerText, setHeaderText] = useState(
        localStorage.getItem("headerText") || "Dashboard",
    );
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (token === null || token === undefined) return;
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    // Persist the headerText in localStorage on change
    useEffect(() => {
        localStorage.setItem("headerText", headerText);
    }, [headerText]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            // If page is not reloading, reset headerText
            if (!sessionStorage.getItem("isReloading")) {
                localStorage.setItem("headerText", "Dashboard");
            }
        };

        // Set session storage flag for reloads
        const handleUnload = () => {
            sessionStorage.setItem("isReloading", "true");
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("unload", handleUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("unload", handleUnload);
        };
    }, []);

    useEffect(() => {
        // Function to fetch notifications
        const fetchNotifications = () => {
            axiosClient
                .get("/admin/notifications") // Changed from /notifications
                .then((response) => {
                    console.log("Notifications response:", response.data);
                    setNotifications(response.data);
                    const unread = response.data.filter(
                        (n) => n.isRead === false || n.isRead === 0,
                    ).length; // Modified condition
                    setUnreadCount(unread);
                })
                .catch((error) =>
                    console.error("Error fetching notifications:", error),
                );
        };

        // Function to fetch unread count
        const fetchUnreadCount = () => {
            axiosClient
                .get("/admin/notifications/unread-count") // Changed from /notifications/unread-count
                .then((response) => {
                    console.log("Unread count response:", response.data);
                    if (response.data.unreadCount !== undefined) {
                        setUnreadCount(response.data.unreadCount);
                    }
                })
                .catch((error) =>
                    console.error("Error fetching unread count:", error),
                );
        };

        fetchUnreadCount();
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const handleNotificationClick = (notification) => {
        console.log("Clicked notification:", notification);

        // Only mark this specific notification as read
        if (!notification.isRead) {
            axiosClient
                .patch(`/admin/notifications/${notification.id}/mark-as-read`) // Changed from post to patch and fixed path
                .then((response) => {
                    console.log("Mark as read response:", response.data);
                    if (
                        response.data.message === "Notification marked as read"
                    ) {
                        // Changed success check
                        // Only update this specific notification
                        setNotifications(
                            notifications.map((n) =>
                                n.id === notification.id
                                    ? { ...n, isRead: true }
                                    : n,
                            ),
                        );
                        // Update unread count only for this notification
                        setUnreadCount((prevCount) =>
                            Math.max(0, prevCount - 1),
                        );
                    }
                })
                .catch((error) => {
                    console.error("Error marking notification as read:", error);
                });
        }
    };

    const getRelativeTime = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffTime = Math.abs(now - notificationDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return "Today";
        } else if (diffDays === 1) {
            return "Yesterday";
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return notificationDate.toLocaleDateString();
        }
    };
    const toggleNotificationDropdown = () => {
        setShowNotificationDropdown(!showNotificationDropdown);
    };

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
        localStorage.setItem("headerText", "Dashboard"); // Clear from localStorage
        sessionStorage.removeItem("isReloading");
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
                        to="/employee_management"
                        onClick={() =>
                            handleHeaderChange("Employee Management")
                        }
                        className="h-10 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition flex items-center justify-center"
                    >
                        Employee Management
                    </Link>
                    <Link
                        to="/rfid_management"
                        onClick={() => handleHeaderChange("RFID Management")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            RFID Management
                        </span>
                    </Link>
                    <Link
                        to="/admin-chat"
                        onClick={() => handleHeaderChange("Chat")}
                    >
                        <span className="block h-10 pt-3 cursor-pointer text-white hover:bg-opacity-70 hover:bg-gray-600 rounded-lg transition">
                            Chat
                        </span>
                    </Link>
                </div>
            </aside>
            <div className="content">
                <header className="flex w-56 justify-between">
                    <button
                        className="text-xl md:hamburger xl:hidden "
                        onClick={toggleSidebar}
                    >
                        &#9776;
                    </button>
                    <div className="headerText">{headerText}</div>

                    <div className="flex items-center gap-4">
                        <div
                            className="relative cursor-pointer"
                            onClick={toggleNotificationDropdown}
                        >
                            <div className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
                                <IoNotificationsOutline size={24} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>

                            {showNotificationDropdown && (
                                <div className="absolute left-1/2 -translate-x-64 sm:-translate-x-72 md:right-0 md:-translate-x-96  mt-2 h-96 overflow-auto w-[400px] md:w-[510px] bg-white shadow-lg rounded-lg border border-gray-100 z-50">
                                    {notifications.length > 0 ? (
                                        Object.entries(
                                            notifications.reduce(
                                                (groups, notification) => {
                                                    const timeGroup =
                                                        getRelativeTime(
                                                            notification.created_at,
                                                        );
                                                    if (!groups[timeGroup]) {
                                                        groups[timeGroup] = [];
                                                    }
                                                    groups[timeGroup].push(
                                                        notification,
                                                    );
                                                    return groups;
                                                },
                                                {},
                                            ),
                                        ).map(
                                            ([
                                                timeGroup,
                                                groupNotifications,
                                            ]) => (
                                                <div key={timeGroup}>
                                                    <div className="px-4 py-2 text-sm font-medium text-gray-800 border-b border-gray-100">
                                                        {timeGroup}
                                                    </div>
                                                    {groupNotifications.map(
                                                        (notification) => {
                                                            const routes = {
                                                                tag_suggestion:
                                                                    {
                                                                        path: "/admin-tags",
                                                                        text: "Admin Tags",
                                                                    },
                                                                leave_request: {
                                                                    path: "/admin-leave-management",
                                                                    text: "Leave Management",
                                                                },
                                                                probationary_candidate:
                                                                    {
                                                                        // Add this new type
                                                                        path: "/employee_management", // Adjust this path to where you manage employees
                                                                        text: "Employee Management",
                                                                    },
                                                                // Add more notification types and their corresponding routes here
                                                            };

                                                            const {
                                                                path = "/admin-dashboard",
                                                                text = "Dashboard",
                                                            } =
                                                                routes[
                                                                    notification
                                                                        .type
                                                                ] || {};

                                                            return (
                                                                <Link
                                                                    key={
                                                                        notification.id
                                                                    }
                                                                    to={path}
                                                                    className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleNotificationClick(
                                                                            notification,
                                                                        );
                                                                        handleHeaderChange(
                                                                            text,
                                                                        );
                                                                        setShowNotificationDropdown(
                                                                            false,
                                                                        );
                                                                    }}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <p className="text-sm text-gray-800 leading-snug">
                                                                                {notification
                                                                                    .message
                                                                                    .length >
                                                                                90
                                                                                    ? `${notification.message.substring(0, 90)}...`
                                                                                    : notification.message}
                                                                            </p>
                                                                            <span className="text-xs text-gray-500 mt-1 block">
                                                                                {new Date(
                                                                                    notification.created_at,
                                                                                ).toLocaleTimeString(
                                                                                    [],
                                                                                    {
                                                                                        hour: "2-digit",
                                                                                        minute: "2-digit",
                                                                                    },
                                                                                )}
                                                                            </span>
                                                                        </div>
                                                                        {!notification.isRead && (
                                                                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-2 flex-shrink-0" />
                                                                        )}
                                                                    </div>
                                                                </Link>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="px-4 py-6 text-sm text-gray-500 text-center">
                                            No notifications
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div
                            className="flex items-center cursor-pointer font-kodchasan"
                            onClick={toggleModal}
                        >
                            <button className="btn-profile-icon">
                                <img
                                    src={
                                        user.profile && !imageError
                                            ? `${import.meta.env.VITE_BASE_URL}/storage/images/${user.profile}`
                                            : defaultAvatar
                                    }
                                    alt="Profile"
                                    className="w-10 h-10 mr-4 rounded-full object-cover"
                                    onError={() => {
                                        setImageError(true);
                                        console.log(
                                            "Image failed to load:",
                                            user.profile,
                                        );
                                    }}
                                />
                            </button>
                        </div>
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
