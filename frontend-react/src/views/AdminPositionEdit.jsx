import React, { useState, useEffect } from "react";
import axios from "axios";
import axiosClient from "../axiosClient";
import Modal from "react-modal";
import "../styles/applicantPortal.css";
import "../styles/openPosition.css";

const Admin_Position_Edit = () => {
    const [positions, setPositions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [hrTags, setHrTags] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editPositionData, setEditPositionData] = useState({
        title: "",
        description: "",
        base_salary: "",
        qualifications: "",
        hr_tags: "",
        type: "",
    });

    const openModal = async (position) => {
        setSelectedPosition(position);
        const tags = await fetchHrTags(position.position_id);
        setHrTags(tags);
        setIsModalOpen(true);
    };

    const openViewAllModal = (position) => {
        setSelectedPosition(position);
        setIsViewAllModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFiles([]);
        isEditModalOpen(false);
        setErrorMessage("");
    };

    const closeViewAllModal = () => {
        setIsViewAllModalOpen(false);
    };

    const fetchPositions = async () => {
        try {
            const response = await axiosClient.get("/open-positions");
            setPositions(response.data);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const fetchHrTags = async (positionId) => {
        try {
            const response = await axiosClient.get(`/hr-tags/${positionId}`);
            return response.data.hr_tags;
        } catch (error) {
            console.error("Error fetching HR tags:", error);
            return "";
        }
    };
    useEffect(() => {
        fetchPositions();
    }, []); // Adding an empty array here will prevent the component from fetching positions on every render

    const openEditModal = (position) => {
        setEditPositionData({
            title: position.title,
            description: position.description,
            base_salary: position.base_salary,
            hr_tags: position.hr_tags,
            qualifications: position.qualifications,
            type: position.type,
            position_id: position.position_id, // Ensure position_id is included
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    // Handle input changes for the form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditPositionData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Function to update position in the backend
    const updatePosition = async () => {
        try {
            await axiosClient.put(
                `/positions/${editPositionData.position_id}`,
                editPositionData,
            );
            setShowSuccessPopup("Job position updated successfully!");
            setTimeout(() => {
                setShowSuccessPopup("");
            }, 2000);
            closeEditModal();
            fetchPositions(); // Fetch updated positions
        } catch (error) {
            setErrorMessage("Failed to update the position.");
        }
    };

    return (
        <div className="applicantPortal">
            <>
                <PositionsList
                    positions={positions}
                    openModal={openModal}
                    openViewAllModal={openViewAllModal}
                    openEditModal={openEditModal}
                />
            </>

            {showSuccessPopup && (
                <div className="successPopup">{showSuccessPopup}</div>
            )}

            {errorMessage && <div className="errorPopup">{errorMessage}</div>}

            <Modal
                isOpen={isViewAllModalOpen}
                onRequestClose={closeViewAllModal}
                contentLabel="View Position Details"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="h-[700px] overflow-auto bg-white px-3 py-3 mx-2 rounded-lg">
                    <span
                        className="py-[6px] px-3 cursor-pointer float-right bg-red-700  hover:opacity-80 hover:text-white transition rounded-full"
                        onClick={closeViewAllModal}
                    >
                        &times;
                    </span>

                    {selectedPosition && (
                        <>
                            <div className="overflow-auto flex flex-col items-center pl-5 gap-5  text-black font-kodchasan font-semibold text-base">
                                <h2 className="font-bold text-2xl uppercase">
                                    {selectedPosition.title}
                                </h2>
                                <div className="flex flex-col justify-start w-full">
                                    <div className="flex gap-4">
                                        <strong>Type:</strong>
                                        <p className="font-poppins font-normal">
                                            {selectedPosition.type}
                                        </p>
                                    </div>
                                    <div className="flex gap-4">
                                        <strong>Base Salary:</strong>
                                        <p className="font-poppins font-normal">
                                            {selectedPosition.base_salary}
                                        </p>
                                    </div>
                                </div>

                                <div className="border border-green-800 w-full" />
                                <div className="h-full flex flex-col items-start w-full">
                                    Skills:
                                    {selectedPosition.hr_tags
                                        .split(", ")
                                        .map((tag, index) => (
                                            <div
                                                className="font-poppins font-normal"
                                                key={index}
                                            >
                                                - {tag}
                                            </div>
                                        ))}
                                </div>

                                <div className="border border-green-800 w-full" />

                                <div className="flex flex-col gap-4 items-center">
                                    <strong>Job Description</strong>
                                    <div className="border-2 h-fit w-56 md:w-[550px] lg:w-[900px] overflow-auto border-green-900 px-4 py-4 rounded-lg">
                                        <p
                                            style={{
                                                whiteSpace: "pre-wrap",
                                            }}
                                            className="font-poppins font-normal"
                                        >
                                            {selectedPosition.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 items-center">
                                    <strong>
                                        Qualification & Requirements
                                    </strong>
                                    <div className="border-2 h-fit w-56 md:w-[550px] lg:w-[900px] overflow-auto border-green-900 px-4 py-4 rounded-lg">
                                        <p
                                            style={{
                                                whiteSpace: "pre-wrap",
                                            }}
                                            className="font-poppins font-normal"
                                        >
                                            {selectedPosition.qualifications}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    className="bg-green-900 mt-3 px-8 py-2 rounded-md font-kodchasan font-semibold text-base text-white border-2 border-white hover:text-green-900 hover:bg-white hover:border-green-900 transition "
                                    onClick={() =>
                                        openEditModal(selectedPosition)
                                    }
                                >
                                    Edit
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onRequestClose={closeEditModal}
                contentLabel="Edit Position"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="bg-white overflow-auto h-[800px] w-fit xl:w-3/4 text-sm flex flex-col items-center mx-4 px-7 pb-20 pt-10 mt-10 rounded-lg">
                    <div className="w-full h-fit flex justify-between">
                        <h2 className="tags text-xl 2x:pl-[400px] 2xl:text-2xl mb-3 font-bold">
                            Edit Position
                        </h2>
                        <span
                            className="px-4 py-2 rounded-full place-self-end cursor-pointer bg-red-700 hover:bg-opacity-75 w-5 flex justify-center"
                            onClick={closeEditModal}
                        >
                            &times;
                        </span>
                    </div>

                    <div className="flex flex-col w-full gap-4 ">
                        {/*Title select input*/}
                        <div className="title-select flex justify-center items-center">
                            <label className="tags text-base mr-5 font-bold">
                                Title:
                            </label>
                            <select
                                className="hover:border-green-700 mb-0 text-black rounded-lg"
                                name="title"
                                value={editPositionData.title}
                                onChange={handleInputChange}
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
                        {/*Type select input*/}
                        <div className="type-select flex justify-center items-center">
                            <label className="tags mr-4 text-base font-bold">
                                Type:
                            </label>
                            <select
                                className="text-black mb-0 hover:border-green-700 rounded-lg"
                                name="type"
                                value={editPositionData.type}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Type</option>
                                <option value="Full-time">Full-Time</option>
                                <option value="Constant">Part-Time</option>
                            </select>
                        </div>
                        <div className="salary flex justify-center items-center">
                            <label
                                htmlFor="base_salary"
                                className="text-black text-base font-kodchasan font-bold mr-4"
                            >
                                Base Salary:
                            </label>
                            <input
                                className="text-black rounded-lg mb-0 mr-12"
                                type="number"
                                id="base_salary"
                                name="base_salary"
                                value={editPositionData.base_salary}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="lg:flex lg:flex-col lg:gap-6 2xl:flex-row 2xl:justify-center">
                            {/*Description select input*/}
                            <div className="description-textarea flex flex-col items-center">
                                <label className="tags text-base font-bold">
                                    Job Description:
                                </label>
                                <textarea
                                    className="px-4 py-4 w-[400px] font-medium h-36 lg:h-96 lg:w-[500px] border-2 text-black hover:border-green-700 rounded-lg"
                                    name="description"
                                    value={editPositionData.description}
                                    onChange={handleInputChange}
                                />
                            </div>
                            {/*Qualification select input*/}
                            <div className="qualifications-textarea flex flex-col items-center">
                                <label className="tags text-base font-bold">
                                    Qualifications & Requirements:
                                </label>
                                <textarea
                                    className="px-4 py-4 w-[400px] font-medium h-36 lg:h-96 lg:w-[500px] border-2 text-black hover:border-green-700 rounded-lg"
                                    name="qualifications"
                                    value={editPositionData.qualifications}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/*Human Resource Tags select input*/}
                        <div className="HR-Tags">
                            {/* HR Tags Input */}
                            <div className="flex flex-col items-center text-black">
                                <label
                                    htmlFor="hr_tags"
                                    className="tags text-base font-bold"
                                >
                                    HR Tags (separated by comma):
                                </label>
                                <input
                                    className="rounded-lg bg-neutral-300 font-semibold"
                                    type="text"
                                    id="hr_tags"
                                    name="hr_tags"
                                    value={editPositionData.hr_tags} // Updates based on editPositionData.hr_tags
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>
                    <button
                        className="bg-green-900 text-base px-10 py-2 border-2 border-white rounded-lg font-normal hover:bg-white hover:border-green-900 hover:text-green-900 transition font-kodchasan z-1001 mt-10"
                        onClick={updatePosition}
                    >
                        Update
                    </button>
                </div>
            </Modal>
        </div>
    );
};

const PositionsList = ({
    positions,
    openModal,
    openViewAllModal,
    openEditModal,
}) => {
    return (
        <div className="position-container px-2 py-2 flex flex-col gap-4 items-center md:grid md:grid-cols-2 md:place-items-center  ">
            {positions.length > 0 ? (
                positions.map((position) => (
                    <PositionCard
                        key={position.position_id}
                        position={position}
                        openModal={openModal}
                        openViewAllModal={openViewAllModal}
                        openEditModal={openEditModal} // Pass it to each PositionCard
                    />
                ))
            ) : (
                <p>No open positions available.</p>
            )}
        </div>
    );
};

const PositionCard = ({ position, openViewAllModal, openEditModal }) => {
    return (
        <div className="bg-white w-full h-full py-4 px-4  rounded-lg flex flex-col items-start gap-3 cursor-pointer hover:shadow-inner hover:shadow-green-900 hover:bg-neutral-100 transition">
            <div>
                <h3 className="position-title uppercase mb-4">
                    <span className="font-bold  text-black font-kodchasan  text-2xl">
                        {position.title}{" "}
                    </span>
                </h3>
            </div>
            <div className="w-full flex justify-start gap-3">
                <span className="text-black font-kodchasan font-semibold text-base bg-slate-200 px-3 py-2 rounded-md">
                    Base salaray: {position.base_salary}
                </span>
                <span className="text-black font-kodchasan font-semibold text-base bg-slate-200 px-3 py-2 rounded-md">
                    {position.type}
                </span>
            </div>
            <strong className="text-base font-semibold">Skills: </strong>
            <div className="h-full flex flex-col items-start w-full text-black font-kodchasan font-semibold">
                {position.hr_tags.split(", ").map((tag, index) => (
                    <div className="font-semibold" key={index}>
                        - {tag}
                    </div>
                ))}
            </div>

            <div className="position-actions flex gap-4">
                <button
                    className="bg-green-900 mt-3 px-8 py-2 rounded-md font-kodchasan font-semibold text-base text-white border-2 border-white hover:text-green-900 hover:bg-white hover:border-green-900 transition "
                    onClick={() => openViewAllModal(position)}
                >
                    View All
                </button>
                <button
                    className="bg-green-900 mt-3 px-8 py-2 rounded-md font-kodchasan font-semibold text-base text-white border-2 border-white hover:text-green-900 hover:bg-white hover:border-green-900 transition "
                    onClick={() => openEditModal(position)}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

export default Admin_Position_Edit;
