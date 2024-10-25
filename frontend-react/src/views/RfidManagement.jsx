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
            const newCards = currentAvailable.filter(
                (newCard) =>
                    !availableCards.some(
                        (existingCard) =>
                            existingCard.rfid_uid === newCard.rfid_uid,
                    ),
            );

            // If there are new cards and no modal is currently shown
            if (newCards.length > 0 && !showNewCardModal) {
                setNewCard(newCards[0]);
                setShowNewCardModal(true);
                // Optional: Play a sound or add other notification effects
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

    const NewCardModal = ({ card, onClose }) => {
        // Play sound when modal opens
        useEffect(() => {
            // Create audio element
            const audio = new Audio("/path/to/notification-sound.mp3"); // Add your notification sound
            audio.play().catch((e) => console.log("Audio play failed:", e));
        }, []);

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
                            onClick={onClose}
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
            <h2 className="text-xl font-bold mb-4 text-black">
                {type === "available"
                    ? "Available RFID Cards"
                    : "Assigned RFID Cards"}
            </h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-black">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left">ID</th>
                            <th className="border p-2 text-left">RFID UID</th>
                            <th className="border p-2 text-left">Status</th>
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
                                    colSpan="4"
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

            <div className="mb-6 border-b">
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab("available")}
                        className={`pb-2 px-4 ${
                            activeTab === "available"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500"
                        }`}
                    >
                        Available ({availableCards?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab("assigned")}
                        className={`pb-2 px-4 ${
                            activeTab === "assigned"
                                ? "border-b-2 border-blue-500 text-blue-600"
                                : "text-gray-500"
                        }`}
                    >
                        Assigned ({assignedCards?.length || 0})
                    </button>
                </div>
            </div>

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
