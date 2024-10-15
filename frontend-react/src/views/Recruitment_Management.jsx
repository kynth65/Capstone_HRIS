import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/registration.css";
import "../styles/documentGenerator.css";
import "../styles/openPosition.css";
import "../styles/tagMatching.css";
import useDocument from "../hooks/useDocuments";
import { MdDelete, MdEdit } from "react-icons/md";
import { jsPDF } from "jspdf";
import HRTagSuggestion from "./HRTagSuggestion";
// Register the fonts
function Recruitment_Management() {
    const [activeButton, setActiveButton] = useState("openPosition");
    const [documentType, setDocumentType] = useState("leaveLetter");
    const [documentContent, setDocumentContent] = useState("");
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState();
    const [positions, setPositions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [newPosition, setNewPosition] = useState({
        title: "",
        type: "",
        description: "",
        qualifications: "",
        hr_tags: "",
        base_salary: "",
    });
    const [files, setFiles] = useState([]);
    const [remove, setRemove] = useState([]);
    const [hr_tags, setHrTags] = useState("");
    const [rankedResumes, setRankedResumes] = useState([]);
    const [filenames, setFilenames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [currentApplicant, setCurrentApplicant] = useState(null);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showApplicantDetailModal, setShowApplicantDetailModal] =
        useState(false);
    const errorTimeoutRef = useRef(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // State for PDF modal
    const [pdfUrl, setPdfUrl] = useState(null); // State to hold the selected PDF URL
    const [reason, setReason] = useState("");
    useEffect(() => {
        setDocumentContent(useDocument[documentType]);

        // Effect for styling adjustments
        const labels = document.querySelectorAll(".form label");
        labels.forEach((label) => {
            label.style.display = "block";
            label.style.marginBottom = "8px";
            label.style.textAlign = "left";
            label.style.color = "black";
        });

        return () => {
            labels.forEach((label) => {
                label.style.display = "";
                label.style.marginBottom = "";
                label.style.textAlign = "";
            });
            clearTimeout(errorTimeoutRef.current);
        };
    }, [documentType]);

    const handleDocumentChange = (event) => {
        setDocumentContent(event.target.value);
    };

    const handleOpenPdf = (pdfUrl) => {
        if (pdfUrl) {
            setPdfUrl(pdfUrl);
            setIsPdfModalOpen(true); // Open the PDF modal
        } else {
            alert("No PDF available for this file.");
        }
    };

    const toggleButton = (buttonName) => {
        setActiveButton(buttonName);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPosition({ ...newPosition, [name]: value });
    };

    const handleAddPosition = async () => {
        try {
            const response = await axiosClient.post("/positions", newPosition);
            setPositions([...positions, response.data.position]);
            setNewPosition({
                title: "",
                type: "",
                description: "",
                qualifications: "",
                hr_tags: "",
                base_salary: "",
            });
            setSuccessMessage("Successfully added a position");
            setTimeout(() => {
                setSuccessMessage("");
            }, 2000);
            setShowModal(false);
        } catch (error) {
            console.error("Error adding position:", error);
        }
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFilenames((prevFilenames) => [
            ...prevFilenames,
            ...newFiles.map((file) => file.name),
        ]);
    };

    const removeFile = (index) => {
        setRemove((prevFiles) => prevFiles.filter((_, i) => i !== index));
        setFilenames((prevFilenames) =>
            prevFilenames.filter((_, i) => i !== index),
        );
    };

    useEffect(() => {
        axiosClient
            .get("/open-positions")
            .then((response) => {
                setPositions(response.data);
            })
            .catch((error) => {
                console.error("Error fetching positions:", error);
            });
    }, []);

    const handleUploadAndRank = async () => {
        setLoading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            const uploadResponse = await axios.post(
                "http://127.0.0.1:5000/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            const { resume_texts, filenames } = uploadResponse.data;

            const tagsArray = hr_tags
                .split(",")
                .map((tag) => tag.trim())
                .join(" ");

            console.log("Sending data to rank endpoint:", {
                hr_tags: tagsArray,
                resumes: resume_texts,
                filenames: filenames,
            });

            const rankResponse = await axios.post(
                "http://127.0.0.1:5000/rank",
                {
                    hr_tags: tagsArray,
                    resumes: resume_texts,
                    filenames: filenames,
                },
            );

            const rankedData = rankResponse.data.ranked_resumes.map(
                (resume, index) => ({
                    number: index + 1,
                    name: filenames[resume[0]],
                    percentage: (resume[1] * 100).toFixed(2),
                }),
            );

            setRankedResumes(rankedData);
            setLoading(false);
        } catch (error) {
            console.error("Error uploading or ranking files:", error);
            setLoading(false);
        }
    };
    const handleViewApplicants = async (position) => {
        try {
            const response = await axiosClient.get(
                `/applicants/${position.position_id}`,
            );
            const applicants = response.data;
            const sortedApplicants = applicants
                .map((applicant, index) => ({
                    ...applicant,
                    rank: index + 1, // Add rank for sorting
                }))
                .sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
            setApplicants(sortedApplicants);
            setCurrentPosition(position);
            setShowApplicantsModal(true);
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    };
    const handleToOnboarding = async (candidateId) => {
        console.log("To onboarding with ID:", candidateId); // Log the candidate ID for debugging
        try {
            // Remove the onboarded candidate from the candidates and filteredCandidates state before the request
            setCandidates((prevCandidates) =>
                prevCandidates.filter(
                    (candidate) => candidate.id !== candidateId,
                ),
            );
            // Update the state to remove the approved applicant from both `applicants` and `filteredCandidates`
            setApplicants((prevApplicants) =>
                prevApplicants.filter(
                    (applicant) => applicant.id !== candidateId,
                ),
            );
            setFilteredCandidates((prevFilteredCandidates) =>
                prevFilteredCandidates.filter(
                    (candidate) => candidate.id !== candidateId,
                ),
            );

            // Send a POST request to the backend for onboarding the candidate
            await axiosClient.post(`/onboarding/${candidateId}`);

            // Set the success message and clear it after 4 seconds
            setSuccessMessage("Employee successfully onboarded and archived.");
            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);

            // Close the confirmation modal
            // setShowConfirmation(false);
        } catch (error) {
            console.error("Error onboarding employee:", error);

            // Handle any errors during the request and show an error message
            setErrorMessage({ general: ["Failed to onboard employee."] });
            errorTimeoutRef.current = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
        }
    };

    const handleDeleteApplicant = async (candidateId) => {
        console.log("Deleting applicant with ID:", candidateId); // Log the candidate ID for debugging
        try {
            // Send a DELETE request to the backend for removing the candidate
            await axiosClient.delete(`/candidate/${candidateId}`);

            // Update the state to remove the deleted applicant from both `applicants` and `filteredCandidates`
            setApplicants((prevApplicants) =>
                prevApplicants.filter(
                    (applicant) => applicant.id !== candidateId,
                ),
            );
            setFilteredCandidates((prevFilteredCandidates) =>
                prevFilteredCandidates.filter(
                    (candidate) => candidate.id !== candidateId,
                ),
            );

            // Set the success message and clear it after 4 seconds
            setSuccessMessage("Applicant successfully removed.");
            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);
        } catch (error) {
            console.error("Error removing applicant:", error);

            // Handle any errors during the request and show an error message
            setErrorMessage({ general: ["Failed to remove applicant."] });
            errorTimeoutRef.current = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
        }
    };

    const handleDeletePosition = async (positionId) => {
        console.log("Deleting position with ID:", positionId); // Log the position ID for debugging

        // Temporarily remove the position from the UI before making the request
        const previousPositions = positions;
        setPositions((prevPositions) =>
            prevPositions.filter(
                (position) => position.position_id !== positionId,
            ),
        );

        try {
            // Send a DELETE request to the backend for removing the position
            await axiosClient.delete(`/delete-position/${positionId}`);

            // Set the success message and clear it after 4 seconds
            setSuccessMessage("Position successfully deleted.");
            setTimeout(() => {
                setSuccessMessage("");
            }, 4000);
        } catch (error) {
            console.error("Error removing position:", error);

            // If the request fails, revert the UI by restoring the previous positions
            setPositions(previousPositions);

            // Show an error message and clear it after 4 seconds
            setErrorMessage({ general: ["Failed to delete position."] });
            errorTimeoutRef.current = setTimeout(() => {
                setErrorMessage(null);
            }, 4000);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedPosition(null);
        setApplicants([]);
    };

    {
        /**Suggested Tags Start Code */
    }
    useEffect(() => {
        const fetchTags = async () => {
            if (newPosition.title) {
                try {
                    const response = await axiosClient.get(
                        `/tags/${newPosition.title}`,
                    );
                    setAvailableTags(response.data.tags);
                } catch (error) {
                    console.error("Error fetching tags:", error);
                }
            } else {
                setAvailableTags([]); // Clear tags if no position is selected
            }
        };

        fetchTags();
    }, [newPosition.title]);

    const handleRemoveTag = (tagToRemove) => {
        // Update hr_tags in newPosition
        const updatedTags = newPosition.hr_tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== tagToRemove)
            .join(", ");

        // Remove the tag from selectedTags
        setNewPosition((prev) => ({ ...prev, hr_tags: updatedTags }));
        setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));

        // Add the removed tag back to availableTags
        setAvailableTags((prev) => [...prev, tagToRemove]);
    };

    const handleTagClick = (tag) => {
        // Prevent adding the tag if it's already selected
        if (!selectedTags.includes(tag)) {
            const updatedTags = newPosition.hr_tags
                ? `${newPosition.hr_tags}, ${tag}`
                : tag;

            // Update hr_tags in newPosition
            setNewPosition((prev) => ({ ...prev, hr_tags: updatedTags }));

            // Update selectedTags state
            setSelectedTags((prev) => [...prev, tag]);

            // Remove the tag from availableTags
            setAvailableTags((prev) => prev.filter((t) => t !== tag));
        }
    };

    {
        /**Suggested Tags End Code */
    }

    const handleDownloadPdf = () => {
        const doc = new jsPDF();

        // Set font style and size
        doc.setFont("times", "normal"); // or "bold" / "italic" etc.
        doc.setFontSize(12);

        // Define margins and content
        const leftMargin = 8;
        const topMargin = 10;
        const lineHeight = 5;

        // Split text into lines to handle multi-line content
        const lines = doc.splitTextToSize(documentContent, 200); // Adjust width as needed
        let verticalOffset = topMargin;

        lines.forEach((line) => {
            doc.text(line, leftMargin, verticalOffset);
            verticalOffset += lineHeight;
        });

        // Save and download the PDF
        doc.save("generated_document.pdf");
    };

    const handleViewApplicantDetails = (applicant) => {
        setCurrentApplicant(applicant);
        setShowApplicantDetailModal(true);
    };

    return (
        <div>
            <nav>
                <ul className="flex space-x-4 mb-4">
                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "openPosition" ? "active" : ""
                            }`}
                            onClick={() => toggleButton("openPosition")}
                        >
                            Open Positions
                        </button>
                    </li>

                    <li>
                        <button
                            className={`navButton ${
                                activeButton === "suggestTags" ? "active" : ""
                            }`}
                            onClick={() => toggleButton("suggestTags")}
                        >
                            Suggest Tags
                        </button>
                    </li>
                </ul>
            </nav>
            <div>
                {activeButton === "openPosition" && (
                    <div className="flex flex-col font-semibold">
                        <div className="flex justify-center">
                            {successMessage && (
                                <div className="success-message px-36 bg-green-100 text-green-700 p-2 rounded mb-4">
                                    {successMessage}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-fit text-black px-5 py-3 bg-white rounded-lg"
                        >
                            Add Position
                        </button>
                        <div className="flex flex-col gap-6 p-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {positions.map((position, index) => (
                                    <div
                                        key={index}
                                        className="bg-white w-full h-full p-6 rounded-lg shadow-md flex flex-col items-center gap-4 transition-transform transform hover:scale-105"
                                    >
                                        {" "}
                                        <button
                                            onClick={() =>
                                                handleDeletePosition(
                                                    position.position_id,
                                                )
                                            }
                                            className="w-fit fixed right-0 top-0 text-black px-5 py-3 bg-white rounded-lg"
                                        >
                                            <MdDelete size={20} />
                                        </button>
                                        <h3 className="position-title text-xl font-semibold">
                                            Position: {position.title}
                                        </h3>
                                        <span
                                            className={`position-type ${
                                                position.type === "Full-time"
                                                    ? "text-green-700"
                                                    : "text-yellow-700"
                                            } font-bold`}
                                        >
                                            {position.type}
                                        </span>
                                        <div>
                                            <strong className="text-base">
                                                Job Description:
                                            </strong>{" "}
                                            <p className="position-description border-2 border-green-700 rounded-lg p-4">
                                                {position.description}
                                            </p>
                                        </div>
                                        <p className="position-base-salary">
                                            <strong>Base Salary: </strong>{" "}
                                            {position.base_salary}
                                        </p>
                                        <button
                                            className="bg-green-900 border-2 border-green-900 font-normal text-white px-4 py-2 rounded hover:bg-white hover:text-green-900 transition"
                                            onClick={() =>
                                                handleViewApplicants(position)
                                            }
                                        >
                                            View Applicants
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {showApplicantsModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                    <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-[700px] overflow-y-scroll text-black relative">
                                        <span
                                            className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                            onClick={() =>
                                                setShowApplicantsModal(false)
                                            }
                                        >
                                            &times;
                                        </span>
                                        <h3 className="text-2xl font-semibold mb-4 text-center">
                                            Applicants for{" "}
                                            {currentPosition?.title}
                                        </h3>
                                        <p className="text-green-800 text-base mb-3">
                                            Click "View" to see details and tags
                                            for each applicant.
                                        </p>

                                        <table className="min-h-32 w-full border-collapse text-center">
                                            <thead>
                                                <tr>
                                                    <th className="text-center px-4 py-2 border-b">
                                                        Rank
                                                    </th>
                                                    <th className="text-center px-4 py-2 border-b">
                                                        File
                                                    </th>
                                                    <th className="text-center px-4 py-2 border-b">
                                                        Percentage
                                                    </th>
                                                    <th className="text-center px-4 py-2 border-b">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {applicants.map(
                                                    (applicant, index) => (
                                                        <tr
                                                            key={index}
                                                            className="applicant-row hover:bg-gray-100"
                                                        >
                                                            <td className="applicant-rank px-4 py-2 border-b">
                                                                {index + 1}
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="text-blue-500 hover:underline"
                                                                    onClick={() =>
                                                                        handleOpenPdf(
                                                                            applicant.filename,
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        applicant.filename
                                                                    }
                                                                </button>
                                                            </td>
                                                            <td className="applicant-percentage px-4 py-2 border-b">
                                                                {applicant.percentage.toFixed(
                                                                    2,
                                                                )}
                                                                %
                                                            </td>
                                                            <td className="applicant-actions px-4 py-2 border-b">
                                                                <button
                                                                    className="text-blue-500 hover:underline"
                                                                    onClick={() =>
                                                                        handleViewApplicantDetails(
                                                                            applicant,
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className="text-green-500 hover:underline ml-4"
                                                                    onClick={() =>
                                                                        handleToOnboarding(
                                                                            applicant.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    className="text-red-500 hover:underline ml-4"
                                                                    onClick={() =>
                                                                        handleDeleteApplicant(
                                                                            applicant.id,
                                                                        )
                                                                    }
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                        {showModal && (
                            <div className="modal">
                                <div className="bg-white overflow-auto h-[600px] w-fit xl:w-3/4 text-sm flex flex-col items-center mx-4 px-7 pb-10 pt-4 rounded-lg">
                                    <div className="w-full h-fit flex justify-between">
                                        <h3 className="tags text-xl 2x:pl-[400px] 2xl:text-2xl mb-3 font-bold">
                                            ADD NEW POSITION
                                        </h3>
                                        <span
                                            className="px-4 py-2 rounded-full place-self-end cursor-pointer bg-red-700 hover:bg-opacity-75 w-5 flex justify-center"
                                            onClick={() => setShowModal(false)}
                                        >
                                            &times;
                                        </span>
                                    </div>

                                    <div className="flex flex-col w-full gap-4 ">
                                        {/*Title select input*/}
                                        <div className="title-select flex justify-center items-center">
                                            <label className="tags mr-5 font-bold">
                                                Title:
                                            </label>
                                            <select
                                                className="hover:border-green-700 mb-0 text-black rounded-lg"
                                                name="title"
                                                value={newPosition.title}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">
                                                    Select Role Title
                                                </option>
                                                <option value="Accounting">
                                                    Accounting
                                                </option>
                                                <option value="Anatomical">
                                                    Anatomical
                                                </option>
                                                <option value="RMT">RMT</option>
                                                <option value="XRay Tech">
                                                    XRay Tech
                                                </option>
                                                <option value="Ultrasound">
                                                    Ultrasound
                                                </option>
                                                <option value="Medical Secretary">
                                                    Medical Secretary
                                                </option>
                                                <option value="Receptionist">
                                                    Receptionist
                                                </option>
                                                <option value="Rider">
                                                    Rider
                                                </option>
                                                <option value="Security">
                                                    Security
                                                </option>
                                                <option value="Maintenance">
                                                    Maintenance
                                                </option>
                                                <option value="Purchasing Clerk">
                                                    Purchasing Clerk
                                                </option>
                                            </select>
                                        </div>
                                        {/*Type select input*/}
                                        <div className="type-select flex justify-center items-center">
                                            <label className="tags mr-4 font-bold">
                                                Type:
                                            </label>
                                            <select
                                                className="text-black mb-0 hover:border-green-700 rounded-lg"
                                                name="type"
                                                value={newPosition.type}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">
                                                    Select Type
                                                </option>
                                                <option value="Full-time">
                                                    Full-time
                                                </option>
                                                <option value="Part-time">
                                                    Part-time
                                                </option>
                                            </select>
                                        </div>
                                        <div className="salary flex justify-center items-center">
                                            <label
                                                htmlFor="base_salary"
                                                className="text-black font-kodchasan font-bold mr-4"
                                            >
                                                Base Salary:
                                            </label>
                                            <input
                                                className="text-black rounded-lg hover:border-green-700 mb-0 mr-12"
                                                type="text"
                                                id="base_salary"
                                                name="base_salary"
                                                value={newPosition.base_salary}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="lg:flex lg:flex-col lg:gap-6 2xl:flex-row 2xl:justify-center">
                                            {/*Description select input*/}
                                            <div className="description-textarea flex flex-col items-center">
                                                <label className="tags font-bold">
                                                    Job Description:
                                                </label>
                                                <textarea
                                                    className="px-4 py-4 w-[400px] font-medium h-36 lg:h-96 lg:w-[500px] border-2 text-black hover:border-green-700 rounded-lg"
                                                    name="description"
                                                    value={
                                                        newPosition.description
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            {/*Qualification select input*/}
                                            <div className="qualifications-textarea flex flex-col items-center">
                                                <label className="tags font-bold">
                                                    Qualifications &
                                                    Requirements:
                                                </label>
                                                <textarea
                                                    className="px-4 py-4 w-[400px] font-medium h-36 lg:h-96 lg:w-[500px] border-2 text-black hover:border-green-700 rounded-lg"
                                                    name="qualifications"
                                                    value={
                                                        newPosition.qualifications
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/*Human Resource Tags select input*/}
                                        <div className="HR-Tags">
                                            {/* HR Tags Input */}

                                            <div className="2xl:flex justify-center gap-6">
                                                {/* Selected Tags */}
                                                <div className="flex flex-col items-center">
                                                    <label
                                                        htmlFor="hr_tags"
                                                        className="tags font-bold"
                                                    >
                                                        Selected Tags
                                                    </label>
                                                    <div className="selectedTags border-2 w-[360px] lg:w-[500px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-kodchasan font-semibold">
                                                        {newPosition.hr_tags
                                                            .split(",")
                                                            .map(
                                                                (tag, index) =>
                                                                    tag && (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="tagItem"
                                                                        >
                                                                            {tag.trim()}
                                                                            <span
                                                                                className="ml-1 px-2 py-1 flex justify-center hover:bg-red-500 text-black hover:text-white rounded-full"
                                                                                onClick={() =>
                                                                                    handleRemoveTag(
                                                                                        tag.trim(),
                                                                                    )
                                                                                }
                                                                            >
                                                                                &times;
                                                                            </span>
                                                                        </span>
                                                                    ),
                                                            )}
                                                    </div>
                                                </div>

                                                <div className="suggestedTags flex flex-col items-center">
                                                    <label
                                                        htmlFor="tags"
                                                        className="font-bold text-black font-kodchasan"
                                                    >
                                                        Available Tags
                                                    </label>
                                                    <div className="border-2 w-[360px] lg:w-[500px] min-h-10 max-h-56 rounded-lg text-black font-kodchasan">
                                                        {availableTags.map(
                                                            (tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    onClick={() =>
                                                                        handleTagClick(
                                                                            tag,
                                                                        )
                                                                    }
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/*Salary select input*/}
                                    </div>
                                    <button
                                        className="bg-green-900 px-10 py-2 border-2 border-white rounded-lg font-normal hover:bg-white hover:border-green-900 hover:text-green-900 transition font-kodchasan z-1001 mt-10"
                                        onClick={handleAddPosition}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeButton === "documentGenerator" && (
                    <div className="bg-neutral-300 p-4">
                        <div className="">
                            <h2 className="titles pt-5">
                                AI Letter Template Generator
                            </h2>
                            <div className="selector-container">
                                <label className="labels">
                                    Select Document Type:
                                    <select
                                        value={documentType}
                                        onChange={(e) =>
                                            setDocumentType(e.target.value)
                                        }
                                        className="select"
                                    >
                                        <option value="leaveLetter">
                                            Leave Letter
                                        </option>
                                        <option value="resignationLetter">
                                            Resignation Letter
                                        </option>
                                        <option value="appreciationLetter">
                                            Appreciation Letter
                                        </option>
                                    </select>
                                </label>
                            </div>
                        </div>
                        <p className="text-black text-base mt-8 mb-3">
                            Enter a brief description of the document you want
                            to generate:
                        </p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            cols="50"
                            placeholder="Enter the reason for the document..."
                            className="h-40 w-full rounded-lg p-9 text-black border-2 border-green-800 text-base"
                        />

                        <button
                            className="button mt-2 mb-5"
                            onClick={handleGenerate}
                        >
                            Generate Document
                        </button>
                        <p className="text-black text-base mt-8 mb-3">
                            Wait for the document to be generated.
                        </p>
                        <textarea
                            value={documentContent}
                            onChange={(e) => setDocumentContent(e.target.value)}
                            rows="10"
                            cols="50"
                            placeholder="Edit the document content here..."
                            className="h-full w-full rounded-lg p-9 text-black border-2 border-green-800 text-base"
                        />
                        <button className="button" onClick={handleDownloadPdf}>
                            Download PDF
                        </button>
                    </div>
                )}

                {/* PDF Modal */}
                {isPdfModalOpen && pdfUrl && (
                    <div
                        className="modal fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                        onClick={() => setIsPdfModalOpen(false)}
                    >
                        <div className="transparent p-6 rounded-xl w-3/4 xl:w-3/4 h-full text-black overflow-hidden flex flex-col">
                            <div className="mb-4 float-right flex justify-end">
                                <button
                                    className="bg-red-600 px-4 py-2 rounded-md text-white font-normal hover:bg-red-900 transition"
                                    onClick={() => setIsPdfModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                            <iframe
                                src={pdfUrl}
                                title="Generated Document"
                                width="100%"
                                height="750px"
                            />
                        </div>
                    </div>
                )}

                {showApplicantDetailModal && currentApplicant && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-[600px] overflow-y-scroll text-black relative">
                            <span
                                className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                onClick={() =>
                                    setShowApplicantDetailModal(false)
                                }
                            >
                                &times;
                            </span>
                            <h3 className="text-2xl font-semibold mb-4 text-center">
                                Tags and Comments for{" "}
                                {currentApplicant?.filename}
                            </h3>
                            <p className="text-base mb-3">
                                <strong>Tags:</strong>{" "}
                                {currentApplicant?.matched_words}
                            </p>
                            <p className="text-base mb-3">
                                <strong>Comments:</strong>{" "}
                                {currentApplicant?.comments}
                            </p>
                        </div>
                    </div>
                )}
                {activeButton === "suggestTags" && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <HRTagSuggestion />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Recruitment_Management;
