import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";

const HRTagSuggestion = () => {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [newTag, setNewTag] = useState("");
    const [existingTags, setExistingTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (selectedPosition) {
            fetchExistingTags();
            fetchSuggestedTags();
        } else {
            setExistingTags([]);
        }
    }, [selectedPosition]);

    const fetchExistingTags = async () => {
        if (selectedPosition) {
            try {
                const response = await axiosClient.get(
                    `/tags/${selectedPosition}`,
                );
                setExistingTags(response.data.tags);
            } catch (error) {
                console.error("Error fetching existing tags", error);
                setErrorMessage("Error fetching existing tags");
            }
        }
    };

    const fetchSuggestedTags = async () => {
        try {
            const response = await axiosClient.get("/getSuggestedTags");
            const filteredTags = response.data.suggestedTags.filter(
                (tag) => tag.position === selectedPosition,
            );
            setSuggestedTags(filteredTags);
        } catch (error) {
            console.error("Error fetching suggested tags", error);
            setErrorMessage("Error fetching suggested tags");
        }
    };

    const handlePositionChange = (e) => {
        setSelectedPosition(e.target.value);
        setNewTag("");
        setErrorMessage(""); // Clear any previous error messages
    };

    const handleTagInput = (e) => {
        setNewTag(e.target.value);
    };

    const suggestTag = async () => {
        if (selectedPosition && newTag.trim() !== "") {
            try {
                await axiosClient.post("/suggestTag", {
                    position: selectedPosition,
                    tag: newTag.trim(),
                });
                setSuccessMessage("Tag suggestion submitted successfully");
                setNewTag("");
                fetchSuggestedTags(); // Refresh the suggested tags list
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                console.error("Error suggesting tag", error);
                setErrorMessage("Error suggesting tag");
            }
        } else {
            setErrorMessage("Please select a position and enter a valid tag.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg text-black">
            <h2 className="text-2xl font-bold mb-4">Suggest New Tag</h2>
            <div className="mb-4">
                <label className="block mb-2">Position:</label>
                <select
                    value={selectedPosition}
                    onChange={handlePositionChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Select a position</option>
                    <option value="Accounting">Accounting</option>
                    <option value="Anatomical">Anatomical</option>
                    <option value="RMT">RMT</option>
                    <option value="XRay Tech">XRay Tech</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Medical Secretary">Medical Secretary</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Rider">Rider</option>
                    <option value="Security">Security</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Purchasing Clerk">Purchasing Clerk</option>
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-2">New Tag:</label>
                <input
                    type="text"
                    value={newTag}
                    onChange={handleTagInput}
                    className="w-full p-2 border rounded"
                    placeholder="Enter a new tag"
                />
            </div>
            <button
                onClick={suggestTag}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Suggest Tag
            </button>

            {successMessage && (
                <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                    {errorMessage}
                </div>
            )}

            {selectedPosition && suggestedTags.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-2">
                        Pending Suggested Tags for {selectedPosition}
                    </h3>
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="border p-2">Suggested Tag</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestedTags.map((tag, index) => (
                                <tr key={index} className="odd:bg-gray-100">
                                    <td className="border p-2">{tag.tag}</td>
                                    <td className="border p-2">{tag.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HRTagSuggestion;
