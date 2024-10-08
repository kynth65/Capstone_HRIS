import React, { useState, useEffect } from "react";
import axiosClient from "../axiosClient";

const AdminTags = () => {
    const [selectedPosition, setSelectedPosition] = useState("");
    const [tags, setTags] = useState("");
    const [existingTags, setExistingTags] = useState([]);

    // Fetch existing tags when the selected position changes
    useEffect(() => {
        const fetchExistingTags = async () => {
            if (selectedPosition) {
                try {
                    const response = await axiosClient.get(
                        `/tags/${selectedPosition}`
                    );
                    setExistingTags(response.data.tags); // Assuming the response has a `tags` array
                } catch (error) {
                    console.error("Error fetching existing tags", error);
                }
            } else {
                setExistingTags([]);
            }
        };

        fetchExistingTags();
    }, [selectedPosition]);

    // Handle position selection
    const handlePositionChange = (e) => {
        setSelectedPosition(e.target.value);
        setTags(""); // Clear tags input when position changes
    };

    // Handle tag input (comma-separated values)
    const handleTagInput = (e) => {
        setTags(e.target.value);
    };

    // Save tags for selected position
    const saveTags = async () => {
        const tagArray = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "");

        if (selectedPosition && tagArray.length > 0) {
            try {
                await axiosClient.post("/saveTags", {
                    position: selectedPosition,
                    tags: tagArray,
                });
                alert("Tags saved successfully!");
                // Fetch existing tags again to update the displayed list
                setTags(""); // Clear the input after saving
                setExistingTags(existingTags.concat(tagArray)); // Update existing tags
            } catch (error) {
                console.error("Error saving tags", error);
            }
        } else {
            alert("Please select a position and add at least one valid tag.");
        }
    };

    return (
        <div className="bg-white overflow-auto h-full xl:w-3/4 text-sm flex xl:ml-32 xl:mt-12 flex-col items-center mx-4 px-7 pb-10 pt-4 rounded-lg">
            <div className="w-full h-fit flex justify-between">
                <h3 className="tags text-xl 2xl:pl-[300px] 2xl:text-2xl mb-3 font-bold">
                    ADD TAGS
                </h3>
            </div>

            <div className="flex flex-col w-full gap-4">
                {/* Title select input */}
                <div className="title-select flex justify-center items-center">
                    <label className="tags mr-5 font-bold">Title:</label>
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

                {/* Tags input */}
                <div className="tags-input flex justify-center items-center">
                    <label className="tags mr-5 font-bold">Tags:</label>
                    <input
                        style={{ color: "black" }}
                        type="text"
                        value={tags}
                        onChange={handleTagInput}
                        placeholder="Enter tags separated by commas"
                        className="text-black rounded-lg mb-0"
                    />
                </div>

                <button
                    onClick={saveTags}
                    className="bg-green-900 text-white rounded px-4 py-2 border-2 border-white hover:border-green-900 hover:text-green-900 hover:bg-white transition"
                >
                    Save Tags for {selectedPosition}
                </button>

                {/* Existing Tags Display */}
                {existingTags.length > 0 ? (
                    <div className="existing-tags mt-4 flex flex-col items-center gap-4">
                        <label className="tags font-bold">Existing Tags:</label>
                        <div className="border-2 w-[360px] lg:w-[650px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold p-2">
                            {existingTags.map((tag, index) => (
                                <span key={index} className="tagItem">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="existing-tags mt-4 flex flex-col items-center gap-4">
                        <label className="tags font-bold">Existing Tags:</label>
                        <div className="border-2 w-[360px] lg:w-[650px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold p-2">
                            <span className="text-gray-500">
                                No tags available for this position.
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminTags;
