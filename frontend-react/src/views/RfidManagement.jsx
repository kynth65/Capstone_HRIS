import React, { useState, useEffect, useCallback } from "react";

const RfidManagement = () => {
    const [activeTab, setActiveTab] = useState("available");
    const [availableCards, setAvailableCards] = useState([]);
    const [assignedCards, setAssignedCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showNewCardModal, setShowNewCardModal] = useState(false);
    const [newCard, setNewCard] = useState(null);

    const API_URL = `${import.meta.env.VITE_BASE_URL}/api`;

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${API_URL}/rfid-cards`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Store current available cards
            const currentAvailable = data.available || [];

            // Compare with previous available cards to find new ones
            const newUnacknowledgedCard = currentAvailable.find(
                (card) => !card.acknowledged,
            );

            if (newUnacknowledgedCard && !showNewCardModal) {
                setNewCard(newUnacknowledgedCard);
                setShowNewCardModal(true);
            }

            // Update the state with all cards
            setAvailableCards(currentAvailable);
            setAssignedCards(data.assigned || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load RFID cards. Please try again later.");
            setLoading(false);
        }
    }, [availableCards, showNewCardModal]); // Add showNewCardModal to dependencies

    useEffect(() => {
        fetchData();
        // Set up interval for periodic fetching
        const interval = setInterval(fetchData, 3000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [fetchData]);

    const acknowledgeCard = async (cardId) => {
        try {
            const response = await fetch(
                `${API_URL}/rfid-cards/${cardId}/acknowledge`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Update local state
            setAvailableCards((prevCards) =>
                prevCards.map((card) =>
                    card.id === cardId ? { ...card, acknowledged: true } : card,
                ),
            );

            setShowNewCardModal(false);
            setNewCard(null);
        } catch (error) {
            console.error("Error acknowledging card:", error);
        }
    };

    const NewCardModal = ({ card, onClose }) => {
        useEffect(() => {
            const audio = new Audio("/path/to/notification-sound.mp3");
            audio.play().catch((e) => console.log("Audio play failed:", e));
        }, []);

        const handleAcknowledge = () => {
            acknowledgeCard(card.id);
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform animate-slideIn">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-green-600">
                            <span className="inline-block animate-bounce mr-2">
                                🆕
                            </span>
                            New RFID Card Detected!
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ×
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                            <p className="text-lg font-semibold text-green-800 mb-2">
                                RFID UID: {card.rfid_uid}
                            </p>
                            <p className="text-sm text-green-600">
                                Status: {card.status}
                            </p>
                            <p className="text-sm text-green-600">
                                Added:{" "}
                                {new Date(card.created_at).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={handleAcknowledge}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors transform hover:scale-105 duration-200"
                        >
                            Acknowledge
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const RfidTable = ({ cards, type }) => (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">ID</th>
                            <th className="border p-2 text-left">RFID UID</th>
                            <th className="border p-2 text-left">Status</th>
                            <th className="border p-2 text-left">
                                Acknowledged
                            </th>
                            <th className="border p-2 text-left">Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards && cards.length > 0 ? (
                            cards.map((card) => (
                                <tr
                                    key={card.id}
                                    className={`hover:bg-gray-50 ${
                                        newCard?.id === card.id
                                            ? "bg-green-50"
                                            : ""
                                    }`}
                                >
                                    <td className="border p-2">{card.id}</td>
                                    <td className="border p-2">
                                        {card.rfid_uid}
                                    </td>
                                    <td className="border p-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${
                                                type === "available"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                                            {card.status}
                                        </span>
                                    </td>
                                    <td className="border p-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-sm ${
                                                card.acknowledged
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                            }`}
                                        >
                                            {card.acknowledged ? "Yes" : "No"}
                                        </span>
                                    </td>
                                    <td className="border p-2">
                                        {card.created_at
                                            ? new Date(
                                                  card.created_at,
                                              ).toLocaleString()
                                            : "N/A"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="border p-2 text-center text-gray-500"
                                >
                                    No RFID cards found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading && availableCards.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            {showNewCardModal && newCard && (
                <NewCardModal
                    card={newCard}
                    onClose={() => {
                        setShowNewCardModal(false);
                        setNewCard(null);
                    }}
                />
            )}

            <nav className="mb-6">
                <ul className="flex space-x-4 border-b pb-2">
                    <li>
                        <button
                            className={`navButton ${activeTab === "available" ? "active" : ""}`}
                            onClick={() => setActiveTab("available")}
                        >
                            Available RFID Cards ({availableCards?.length || 0})
                        </button>
                    </li>
                    <li>
                        <button
                            className={`navButton ${activeTab === "assigned" ? "active" : ""}`}
                            onClick={() => setActiveTab("assigned")}
                        >
                            Assigned RFID Cards ({assignedCards?.length || 0})
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="mt-4">
                {activeTab === "available" ? (
                    <RfidTable cards={availableCards} type="available" />
                ) : (
                    <RfidTable cards={assignedCards} type="assigned" />
                )}
            </div>
        </div>
    );
};

export default RfidManagement;
