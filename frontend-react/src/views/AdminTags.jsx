import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";

const AdminTags = () => {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [newTag, setNewTag] = useState("");
    const [existingTags, setExistingTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);

    useEffect(() => {
        const fetchExistingTags = async () => {
            if (selectedPosition) {
                try {
                    const response = await axiosClient.get(
                        `/tags/${selectedPosition}`,
                    );
                    setExistingTags(response.data.tags);
                } catch (error) {
                    console.error("Error fetching existing tags", error);
                }
            } else {
                setExistingTags([]);
            }
        };

        fetchExistingTags();
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
            }
        } else {
            setExistingTags([]);
        }
    };

    useEffect(() => {
        fetchSuggestedTags();
    }, []);

    useEffect(() => {
        fetchExistingTags();
    }, [selectedPosition]);

    const fetchSuggestedTags = async () => {
        try {
            const response = await axiosClient.get("/getSuggestedTags");
            setSuggestedTags(response.data.suggestedTags);
        } catch (error) {
            console.error("Error fetching suggested tags", error);
        }
    };

    const reviewSuggestedTag = async (id, action) => {
        try {
            await axiosClient.post("/reviewSuggestedTag", { id, action });
            fetchSuggestedTags();
            if (action === "approve") {
                fetchExistingTags();
            }
        } catch (error) {
            console.error("Error reviewing suggested tag", error);
        }
    };

    const handlePositionChange = (e) => {
        setSelectedPosition(e.target.value);
        setNewTag("");
    };

    const handleTagInput = (e) => {
        setNewTag(e.target.value);
    };

    const addTag = async () => {
        if (selectedPosition && newTag.trim() !== "") {
            try {
                const response = await axiosClient.post("/storeTag", {
                    position: selectedPosition,
                    tag: newTag.trim(),
                });
                setExistingTags(response.data.tags);
                setNewTag("");
            } catch (error) {
                console.error("Error adding tag", error);
            }
        } else {
            alert("Please select a position and enter a valid tag.");
        }
    };

    const deleteTag = async (tagToDelete) => {
        if (selectedPosition) {
            // Optimistically update UI
            setExistingTags((prevTags) =>
                prevTags.filter((tag) => tag !== tagToDelete),
            );

            try {
                const response = await axiosClient.post("/deleteTag", {
                    position: selectedPosition,
                    tag: tagToDelete,
                });

                // If there's an error, revert the change
                if (!response.data.success) {
                    setExistingTags((prevTags) => [...prevTags, tagToDelete]);
                    console.error("Error deleting tag", response.data.message);
                }
            } catch (error) {
                // If there's an error, revert the change
                setExistingTags((prevTags) => [...prevTags, tagToDelete]);
                console.error("Error deleting tag", error);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            addTag();
        }
    };

    return (
        <div className="bg-white overflow-auto h-full xl:w-3/4 text-sm flex xl:ml-32 xl:mt-12 flex-col items-center md:mx-7 md:px-7 p-2 pb-10 pt-4 rounded-lg">
            <div>
                <h3 className="tags text-xl text-center 2xl:pl-[300px] 2xl:text-2xl mb-3 font-bold ">
                    ADD TAGS
                </h3>
            </div>

            <div className="flex flex-col w-full gap-4">
                <div className="title-select flex flex-col gap-2 justify-center items-center">
                    <label className="tags font-bold">Title:</label>
                    <select
                        className="hover:border-green-700 mb-0 text-black rounded-lg"
                        name="title"
                        value={selectedPosition}
                        onChange={handlePositionChange}
                    >
                        <option value="">Select Role Title</option>
                        <option value="Accounting">Accounting</option>
                        <option value="Anatomical">Anatomical</option>
                        <option value="RMT">RMT</option>
                        <option value="XRay Tech">XRay Tech</option>
                        <option value="Ultrasound">Ultrasound</option>
                        <option value="Medical Secretary">
                            Medical Secretary
                        </option>
                        <option value="Receptionist">Receptionist</option>
                        <option value="Rider">Rider</option>
                        <option value="Security">Security</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Purchasing Clerk">
                            Purchasing Clerk
                        </option>
                    </select>
                </div>

                <div className="tags-input flex flex-col gap-2 justify-center items-center">
                    <label className="tags font-bold">New Tag:</label>
                    <input
                        style={{ color: "black" }}
                        type="text"
                        value={newTag}
                        onChange={handleTagInput}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter a new tag"
                        className="text-black rounded-lg mb-0"
                    />
                    <button
                        onClick={addTag}
                        className="ml-2 bg-green-900 text-white rounded-lg px-4 py-2 border-2 border-white hover:border-green-900 hover:text-green-900 hover:bg-white transition"
                    >
                        Add Tag
                    </button>
                </div>

                {existingTags.length > 0 ? (
                    <div className="existing-tags mt-4 flex flex-col items-center gap-4">
                        <label className="tags font-bold">Existing Tags:</label>
                        <div className="border-2 md:w-[360px] lg:w-[650px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold p-2">
                            {existingTags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="tagItem mr-2 mb-2 inline-block bg-gray-200 rounded-full px-3 py-1"
                                >
                                    {tag}
                                    <button
                                        onClick={() => deleteTag(tag)}
                                        className="ml-2 text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="existing-tags mt-4 flex flex-col items-center gap-4">
                        <label className="tags font-bold">Existing Tags:</label>
                        <div className="border-2 w-[200px] md:w-[360px] lg:w-[650px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold p-2">
                            <span className="text-gray-500">
                                No tags available for this position.
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-black">
                    Suggested Tags
                </h3>
                {suggestedTags.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-black">
                                <thead className="bg-gray-200 sticky top-0">
                                    <tr>
                                        <th className="px-1 sm:px-4 py-2 sm:py-4 text-center">
                                            Position
                                        </th>
                                        <th className="px-1 sm:px-4 py-2 sm:py-4 text-center">
                                            Tag
                                        </th>
                                        <th className="px-1 sm:px-4 py-2 sm:py-4 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {suggestedTags.map((suggestedTag) => (
                                        <tr
                                            key={suggestedTag.id}
                                            className="border-t"
                                        >
                                            <td className="px-1 sm:px-4 py-2 sm:py-4">
                                                {suggestedTag.position}
                                            </td>
                                            <td className="px-1 sm:px-4 py-2 sm:py-4">
                                                {suggestedTag.tag}
                                            </td>
                                            <td className="px-1 sm:px-4 py-2 sm:py-4 grid gap-2 sm:flex text-center">
                                                <button
                                                    onClick={() =>
                                                        reviewSuggestedTag(
                                                            suggestedTag.id,
                                                            "approve",
                                                        )
                                                    }
                                                    className="bg-green-800 text-white px-3 py-3 rounded hover:bg-green-900 text-sm"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        reviewSuggestedTag(
                                                            suggestedTag.id,
                                                            "decline",
                                                        )
                                                    }
                                                    className="bg-red-700 text-white px-3 py-3 rounded hover:bg-red-900 text-sm"
                                                >
                                                    Decline
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500">
                        No suggested tags to review.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdminTags;
