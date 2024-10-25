import React, { useState, useEffect } from "react";

const RfidManagement = () => {
    const [activeTab, setActiveTab] = useState("available");
    const [availableCards, setAvailableCards] = useState([]);
    const [assignedCards, setAssignedCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = `${import.meta.env.VITE_BASE_URL}/api`;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_URL}/rfid-cards`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched data:", data); // For debugging

            setAvailableCards(data.available || []);
            setAssignedCards(data.assigned || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to load RFID cards. Please try again later.");
        } finally {
            setLoading(false);
        }
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
                                <tr key={card.id} className="hover:bg-gray-50">
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
                                              ).toLocaleDateString()
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

    if (loading) {
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
