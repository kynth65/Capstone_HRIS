import React, { useState, useEffect, useRef } from "react";
import pusherService from "../services/echo";
import axiosClient from "../axiosClient";

export default function ChatBox() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileView, setIsMobileView] = useState(false);
    const [showChatList, setShowChatList] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [unreadCounts, setUnreadCounts] = useState({});
    const [chatInfo, setChatInfo] = useState({});
    const messagesEndRef = useRef(null);
    const pusherRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const messagesContainerRef = useRef(null);

    // Update the initializePusher function with better channel handling
    const initializePusher = () => {
        if (!currentUser?.user_id) return;

        try {
            if (pusherRef.current) {
                pusherService.unsubscribe(
                    `private-chat.${currentUser.user_id}`,
                );
            }

            const channelName = `private-chat.${currentUser.user_id}`;
            const channel = pusherService.subscribe(channelName);
            pusherRef.current = channel;

            if (channel) {
                channel.bind("MessageSent", handleNewMessage);
            }
        } catch (error) {
            console.error("Pusher initialization error:", error);
        }
    };

    const handleNewMessage = (data) => {
        const message = data.message || data.data?.message;
        if (!message) {
            console.warn("No message data in event");
            return;
        }

        // Update messages if current chat is open
        setMessages((prev) => {
            if (
                selectedUser &&
                ((message.sender_id === selectedUser.user_id &&
                    message.receiver_id === currentUser.user_id) ||
                    (message.sender_id === currentUser.user_id &&
                        message.receiver_id === selectedUser.user_id))
            ) {
                setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({
                        behavior: "smooth",
                    });
                }, 100);
                return [...prev, message];
            }
            return prev;
        });

        // Update users list immediately when receiving a message
        if (message.receiver_id === currentUser?.user_id) {
            setUsers((prev) => {
                const updatedUsers = prev.map((user) => {
                    if (user.user_id === message.sender_id) {
                        return {
                            ...user,
                            last_message: message,
                            unread_count:
                                selectedUser?.user_id === message.sender_id
                                    ? 0
                                    : (user.unread_count || 0) + 1,
                        };
                    }
                    return user;
                });

                return updatedUsers.sort((a, b) => {
                    const aTime = a.last_message?.created_at || "0";
                    const bTime = b.last_message?.created_at || "0";
                    return new Date(bTime) - new Date(aTime);
                });
            });

            // Update unread counts and chat info
            const senderId = message.sender_id;
            setUnreadCounts((prev) => ({
                ...prev,
                [senderId]:
                    selectedUser?.user_id === senderId
                        ? 0
                        : (prev[senderId] || 0) + 1,
            }));

            setChatInfo((prev) => ({
                ...prev,
                [senderId]: {
                    lastMessage: message.message,
                    lastMessageTime: message.created_at,
                },
            }));
        }

        // Update chat info for sender's messages
        if (message.sender_id === currentUser?.user_id) {
            const receiverId = message.receiver_id;
            setChatInfo((prev) => ({
                ...prev,
                [receiverId]: {
                    lastMessage: message.message,
                    lastMessageTime: message.created_at,
                },
            }));

            setUsers((prev) => {
                const updatedUsers = prev.map((user) => {
                    if (user.user_id === receiverId) {
                        return {
                            ...user,
                            last_message: message,
                        };
                    }
                    return user;
                });

                return updatedUsers.sort((a, b) => {
                    const aTime = a.last_message?.created_at || "0";
                    const bTime = b.last_message?.created_at || "0";
                    return new Date(bTime) - new Date(aTime);
                });
            });
        }
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth < 768);
        };

        handleResize(); // Initial check
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Update mobile view when selected user changes
    useEffect(() => {
        if (isMobileView) {
            setShowChatList(!selectedUser);
        }
    }, [isMobileView, selectedUser]);

    // API calls
    // Update fetchCurrentUser to handle auth errors silently
    const fetchCurrentUser = async () => {
        try {
            const response = await axiosClient.get("/user");
            setCurrentUser(response.data);
        } catch (error) {
            console.error("Error fetching current user:", error);
            // Only redirect if we get a 401 and we're not already on login page
            if (
                error.response?.status === 401 &&
                window.location.pathname !== "/login"
            ) {
                window.location.href = "/login";
            }
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosClient.get("/chat/users");

            setUsers((prevUsers) => {
                const newUsers = response.data.map((newUser) => {
                    // Find existing user to preserve local state if needed
                    const existingUser = prevUsers.find(
                        (u) => u.user_id === newUser.user_id,
                    );
                    return {
                        ...newUser,
                        // Preserve selected state if it exists
                        isSelected: existingUser?.isSelected || false,
                    };
                });

                // Sort users by last message time
                return newUsers.sort((a, b) => {
                    const aTime = a.last_message?.created_at || "0";
                    const bTime = b.last_message?.created_at || "0";
                    return new Date(bTime) - new Date(aTime);
                });
            });

            // Update unread counts and chat info
            const unreadCountsData = {};
            const chatInfoData = {};

            response.data.forEach((user) => {
                unreadCountsData[user.user_id] = user.unread_count || 0;
                chatInfoData[user.user_id] = {
                    lastMessage: user.last_message?.message || "",
                    lastMessageTime: user.last_message?.created_at || null,
                };
            });

            setUnreadCounts(unreadCountsData);
            setChatInfo(chatInfoData);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const getSortedUsers = () => {
        const filteredUsers = users.filter((user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );

        return filteredUsers.sort((a, b) => {
            const aTime = a.last_message?.created_at || "0";
            const bTime = b.last_message?.created_at || "0";

            // Sort by last message time first
            const timeCompare = new Date(bTime) - new Date(aTime);
            if (timeCompare !== 0) return timeCompare;

            // If times are equal, sort by unread count
            const unreadCompare =
                (unreadCounts[b.user_id] || 0) - (unreadCounts[a.user_id] || 0);
            if (unreadCompare !== 0) return unreadCompare;

            // If unread counts are equal, sort by name
            return a.name.localeCompare(b.name);
        });
    };

    // Update the fetchMessages function
    const fetchMessages = async () => {
        if (!selectedUser) return;

        try {
            const response = await axiosClient.get(
                `/chat/messages/${selectedUser.user_id}`,
            );

            setMessages((prevMessages) => {
                // If length is different or last message is different
                if (
                    prevMessages.length !== response.data.length ||
                    (prevMessages.length > 0 &&
                        response.data.length > 0 &&
                        prevMessages[prevMessages.length - 1].id !==
                            response.data[response.data.length - 1].id)
                ) {
                    // Only scroll if we should auto scroll
                    if (shouldAutoScroll) {
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({
                                behavior: "auto", // Changed from smooth to auto
                            });
                        }, 0);
                    }
                    return response.data;
                }
                return prevMessages;
            });

            // Mark messages as read when there are unread messages
            if (unreadCounts[selectedUser.user_id] > 0) {
                await markMessagesAsRead();
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const markMessagesAsRead = async () => {
        if (!selectedUser?.user_id) return;

        try {
            await axiosClient.post(
                `/chat/mark-as-read/${selectedUser.user_id}`,
            );
            setUnreadCounts((prev) => ({
                ...prev,
                [selectedUser.user_id]: 0,
            }));
        } catch (error) {
            console.error("Error marking messages as read:", error);
        }
    };

    // Update handleSubmit to add the new message immediately
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !selectedUser || !currentUser) return;

        // Create a temporary message object
        const tempMessage = {
            id: `temp-${Date.now()}`, // Temporary ID
            message: newMessage,
            sender_id: currentUser.user_id,
            receiver_id: selectedUser.user_id,
            created_at: new Date().toISOString(),
            status: "sending", // Add status to track message state
        };

        // Optimistically add message to the UI
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage(""); // Clear input immediately

        // Scroll to bottom instantly
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: "auto",
            });
        }, 0);

        try {
            const response = await axiosClient.post("/chat/send", {
                sender_id: currentUser.user_id,
                receiver_id: selectedUser.user_id,
                message: newMessage,
            });

            // Replace temporary message with real one
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempMessage.id ? response.data : msg,
                ),
            );

            // Update chat info
            setChatInfo((prev) => ({
                ...prev,
                [selectedUser.user_id]: {
                    lastMessage: response.data.message,
                    lastMessageTime: response.data.created_at,
                },
            }));

            // Update users list
            setUsers((prev) => {
                const updatedUsers = prev.map((user) => {
                    if (user.user_id === selectedUser.user_id) {
                        return {
                            ...user,
                            last_message: response.data,
                        };
                    }
                    return user;
                });

                return updatedUsers.sort((a, b) => {
                    const aTime = a.last_message?.created_at || "0";
                    const bTime = b.last_message?.created_at || "0";
                    return new Date(bTime) - new Date(aTime);
                });
            });
        } catch (error) {
            console.error("Error sending message:", error);
            // Mark the message as failed
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempMessage.id
                        ? { ...msg, status: "failed" }
                        : msg,
                ),
            );
        }
    };

    // Simplify initial useEffect
    useEffect(() => {
        const initChat = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/user");
                setCurrentUser(response.data);

                if (response.data?.user_id) {
                    await Promise.all([fetchUsers(), initializePusher()]);
                }
            } catch (error) {
                console.error("Error initializing chat:", error);
                if (error.response?.status === 401) {
                    window.location.href = "/login";
                }
            } finally {
                setLoading(false);
            }
        };

        initChat();

        return () => {
            if (pusherRef.current) {
                pusherRef.current.unbind_all();
                pusherRef.current.unsubscribe(
                    `private-chat.${currentUser?.user_id}`,
                );
            }
        };
    }, []);

    // Update the original currentUser effect to remove fetchMessages
    useEffect(() => {
        if (currentUser) {
            initializePusher();
            fetchUsers();
        } else {
            setMessages([]);
        }

        return () => {
            if (pusherRef.current) {
                pusherRef.current.unbind_all();
                pusherRef.current.unsubscribe(
                    `private-chat.${currentUser?.user_id}`,
                );
            }
        };
    }, [currentUser]);

    // Components
    const MessageBubble = ({ message }) => {
        const isCurrentUser =
            parseInt(message.sender_id) === parseInt(currentUser?.user_id);

        return (
            <div
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
                <div
                    className={`max-w-[75%] p-2 rounded-lg ${
                        isCurrentUser
                            ? "bg-green-600 text-white mr-2"
                            : "bg-white text-gray-800 shadow-sm ml-2"
                    }`}
                >
                    <p className="break-words text-sm">
                        {message.message || message.data?.message?.message}
                    </p>
                    <div className="flex items-center justify-end gap-1">
                        <p
                            className={`text-xs ${isCurrentUser ? "text-green-100" : "text-gray-400"}`}
                        >
                            {new Date(
                                message.created_at ||
                                    message.data?.message?.created_at,
                            ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        {isCurrentUser && message.status === "sending" && (
                            <span className="text-xs text-green-100">
                                Sending...
                            </span>
                        )}
                        {isCurrentUser && message.status === "failed" && (
                            <span className="text-xs text-red-300">
                                Failed to send - Tap to retry
                            </span>
                        )}
                    </div>
                </div>
            </div>
        );
    };
    // Add this function to check if user is near bottom
    const isNearBottom = () => {
        if (!messagesContainerRef.current) return true;

        const container = messagesContainerRef.current;
        const threshold = 100; // pixels from bottom
        return (
            container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
            threshold
        );
    };

    // Add scroll event listener to messages container
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setShouldAutoScroll(isNearBottom());
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        let usersInterval;

        if (currentUser) {
            // Initial fetch
            fetchUsers();

            // Set up polling interval for users list
            usersInterval = setInterval(fetchUsers, 10000); // Update every 10 seconds
        }

        return () => {
            if (usersInterval) {
                clearInterval(usersInterval);
            }
        };
    }, [currentUser]);

    useEffect(() => {
        if (selectedUser) {
            // Clear existing messages immediately to show loading state
            setMessages([]);
            // Fetch messages right away
            fetchMessages();
        }
    }, [selectedUser?.user_id]); // Only depend on the user ID

    // Update the polling effect to separate it from user selection
    useEffect(() => {
        let interval;

        if (selectedUser) {
            // Set up polling interval for updates
            interval = setInterval(fetchMessages, 3000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [selectedUser?.user_id]);

    return (
        <div className="flex h-[80vh] text-black bg-gray-100 mx-auto max-w-7xl">
            {/* User List */}
            <div
                className={`${
                    isMobileView ? (showChatList ? "w-full" : "hidden") : "w-80"
                } border-r bg-white`}
            >
                <div className="p-3 border-b">
                    <h2 className="text-lg font-semibold mb-2">Chat</h2>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-100 rounded-full text-sm focus:outline-none"
                    />
                </div>
                <div className="overflow-y-auto h-[calc(100%-4rem)]">
                    {getSortedUsers().length === 0 ? (
                        <div className="p-4 text-gray-500">
                            {searchTerm
                                ? "No matching users"
                                : "No users found"}
                        </div>
                    ) : (
                        getSortedUsers().map((user) => (
                            <div
                                key={user.user_id}
                                className={`flex items-center p-3 cursor-pointer transition-colors duration-200
                                    ${
                                        selectedUser?.user_id === user.user_id
                                            ? "bg-green-100 hover:bg-green-200"
                                            : unreadCounts[user.user_id] > 0
                                              ? "bg-emerald-50 hover:bg-emerald-100"
                                              : "hover:bg-gray-50"
                                    }`}
                                onClick={() => {
                                    setSelectedUser(user);
                                    if (isMobileView) {
                                        setShowChatList(false);
                                    }
                                }}
                            >
                                <div className="w-10 h-10 bg-green-600 text-white rounded-full mr-3 flex items-center justify-center">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <span className="font-semibold text-gray-900 truncate max-w-[120px]">
                                            {user.name}
                                        </span>
                                        <span className="text-xs text-gray-400 shrink-0 ml-1">
                                            {chatInfo[user.user_id]
                                                ?.lastMessageTime &&
                                                new Date(
                                                    chatInfo[
                                                        user.user_id
                                                    ].lastMessageTime,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 truncate max-w-[140px]">
                                            {chatInfo[user.user_id]
                                                ?.lastMessage ||
                                                "No messages yet"}
                                        </span>
                                        {unreadCounts[user.user_id] > 0 && (
                                            <span className="ml-2 bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
                                                {unreadCounts[user.user_id]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div
                className={`flex-1 flex flex-col ${
                    isMobileView && !selectedUser ? "hidden" : ""
                }`}
            >
                {selectedUser ? (
                    <div className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="flex items-center px-4 py-2 border-b bg-white shadow-sm">
                            {isMobileView && (
                                <button
                                    onClick={() => {
                                        setShowChatList(true);
                                        setSelectedUser(null);
                                    }}
                                    className="mr-2 p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                            )}
                            <div className="w-8 h-8 bg-green-600 text-white rounded-full mr-3 flex items-center justify-center shrink-0">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="font-semibold text-gray-900 truncate">
                                    {selectedUser.name}
                                </h2>
                                <p className="text-xs text-gray-500 truncate">
                                    {selectedUser.position ||
                                        selectedUser.department ||
                                        ""}
                                </p>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div
                            ref={messagesContainerRef}
                            className="flex-1 overflow-y-auto bg-gray-50 p-3"
                            style={{ scrollBehavior: "auto" }} // Changed from smooth to auto
                            onClick={() => {
                                // Scroll to bottom when clicking anywhere in the messages container
                                messagesEndRef.current?.scrollIntoView({
                                    behavior: "auto",
                                });
                            }}
                        >
                            <div className="flex flex-col space-y-3">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <span className="text-gray-500">
                                            Loading messages...
                                        </span>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No messages yet. Start a conversation!
                                    </div>
                                ) : (
                                    messages.map((message, index) => (
                                        <MessageBubble
                                            key={message.id || index}
                                            message={message}
                                        />
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="p-2 bg-white border-t">
                            <form
                                onSubmit={handleSubmit}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    className="flex-1 text-black px-3 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 text-white text-sm bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Select a user to start chatting
                    </div>
                )}
            </div>
        </div>
    );
}
