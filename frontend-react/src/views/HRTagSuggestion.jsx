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
        } else {
            setExistingTags([]);
        }
        fetchSuggestedTags();
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
            setSuggestedTags(response.data.suggestedTags);
        } catch (error) {
            console.error("Error fetching suggested tags", error);
            setErrorMessage("Error fetching suggested tags");
        }
    };

    const handlePositionChange = (e) => {
        setSelectedPosition(e.target.value);
        setNewTag("");
        setErrorMessage("");
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
                fetchSuggestedTags();
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
        <>
            <div className="">
                <div className="bg-white p-6 rounded-lg text-black">
                    <h2 className="text-2xl font-bold mb-4">Suggest New Tag</h2>
                    <div className="flex flex-col md:grid md:grid-cols-2">
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
                                <option value="Medical Secretary">
                                    Medical Secretary
                                </option>
                                <option value="Receptionist">
                                    Receptionist
                                </option>
                                <option value="Rider">Rider</option>
                                <option value="Security">Security</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Purchasing Clerk">
                                    Purchasing Clerk
                                </option>
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
                    </div>

                    <button
                        onClick={suggestTag}
                        className="bg-green-700 text-white px-14 py-2 rounded hover:bg-green-900"
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

                    {selectedPosition && (
                        <div className="existing-tags mt-8 flex flex-col items-center gap-4">
                            <h3 className="text-xl font-bold mb-2">
                                Existing Tags for {selectedPosition}
                            </h3>
                            <div className="border-2 w-full lg:w-[650px] min-h-32 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold p-2">
                                {existingTags.length > 0 ? (
                                    existingTags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="tagItem mr-2 mb-2 inline-block bg-gray-200 rounded-full px-3 py-1"
                                        >
                                            {tag}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">
                                        No tags available for this position.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-2">
                            All Pending Suggested Tags
                        </h3>
                        {suggestedTags.length > 0 ? (
                            <div className="overflow-x-auto max-h-60 overflow-auto ">
                                <table className="w-full border-collapse">
                                    <thead className="sticky top-[-1px]">
                                        <tr className="bg-gray-200">
                                            <th className="border p-2">
                                                Position
                                            </th>
                                            <th className="border p-2">
                                                Suggested Tag
                                            </th>
                                            <th className="border p-2">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {suggestedTags.map((tag, index) => (
                                            <tr
                                                key={index}
                                                className="odd:bg-gray-100"
                                            >
                                                <td className="border p-2">
                                                    {tag.position}
                                                </td>
                                                <td className="border p-2">
                                                    {tag.tag}
                                                </td>
                                                <td className="border p-2">
                                                    {tag.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">
                                No pending suggested tags.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HRTagSuggestion;
