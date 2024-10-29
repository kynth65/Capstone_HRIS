import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import axiosClient from "../axiosClient";
import { useStateContext } from "../contexts/ContextProvider";
import "../styles/registration.css";
import "../styles/documentGenerator.css";
import "../styles/openPosition.css";
import "../styles/tagMatching.css";
import useDocument from "../hooks/useDocuments";
import { MdDelete, MdEdit, MdExpandMore, MdExpandLess } from "react-icons/md";
import { jsPDF } from "jspdf";
import HRTagSuggestion from "./HRTagSuggestion";
import { riderQuestions } from "../views/questions/RiderQuestions";
import { accountingQuestions } from "../views/questions/AccountingQuestions";
import { anatomicalQuestions } from "../views/questions/AnatomicalQuestions";
import { maintenanceQuestions } from "../views/questions/MaintenanceQuestions";
import { medicalSecretaryQuestions } from "../views/questions/MedicalSecretaryQuestions";
import { receptionistQuestions } from "../views/questions/ReceptionistQuestion";
import { rmtQuestions } from "../views/questions/RMTQuestions";
import { securityQuestions } from "../views/questions/SecurityQuestions";
import { ultrasoundQuestions } from "../views/questions/UltraSoundQuestions";
import { xrayTechQuestions } from "../views/questions/XrayTechQuestions";
import { purchasingClerkQuestions } from "../views/questions/PurchasingClerkQuestions";
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
    const [showResponseModal, setShowResponseModal] = useState(false);
    const errorTimeoutRef = useRef(null);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false); // State for PDF modal
    const [pdfUrl, setPdfUrl] = useState(null); // State to hold the selected PDF URL
    const [reason, setReason] = useState("");
    const [expandedDescriptions, setExpandedDescriptions] = useState({});
    const [tagCache, setTagCache] = useState({});
    const debounceTimer = useRef(null);
    const [applicantCounts, setApplicantCounts] = useState({});
    const [newPosition, setNewPosition] = useState({
        title: "",
        type: "",
        description: "",
        qualifications: "",
        hr_tags: "",
        base_salary: "",
    });
    const [questions, setQuestions] = useState([]);
    const getQuestionsForPosition = (positionName) => {
        switch (positionName.toLowerCase()) {
            case "rider":
                return riderQuestions;
            case "accounting":
                return accountingQuestions;
            case "receptionist":
                return receptionistQuestions; // Add if you have these
            case "medical secretary":
                return medicalSecretaryQuestions; // Add if you have these
            case "security":
                return securityQuestions; // Add if you have these
            case "maintenance":
                return maintenanceQuestions; // Add if you have these
            case "purchasing clerk":
                return purchasingClerkQuestions; // Add if you have these
            case "ultrasound":
                return ultrasoundQuestions; // Add if you have these
            case "xray tech":
                return xrayTechQuestions; // Add if you have these
            case "rmt":
                return rmtQuestions; // Add if you have these
            case "anatomical":
                return anatomicalQuestions; // Add if you have these
            default:
                console.log(
                    `No questions defined for position: ${positionName}`,
                );
                return []; // Return empty array if no questions defined
        }
    };
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
        // Check if the URL already has the backend URL prefix
        const backendBaseUrl = import.meta.env.VITE_BASE_URL;
        const fullUrl = pdfUrl.startsWith("http")
            ? pdfUrl
            : `${backendBaseUrl}/storage/${pdfUrl}`;

        if (fullUrl) {
            window.open(fullUrl, "_blank"); // Open the PDF in a new tab
        } else {
            alert("No PDF available for this file.");
        }
    };

    const toggleButton = (buttonName) => {
        setActiveButton(buttonName);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPosition((prev) => ({ ...prev, [name]: value }));

        // Only fetch tags when the title changes
        if (name === "title" && value) {
            // Clear previous timer
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Set new timer
            debounceTimer.current = setTimeout(() => {
                fetchTags(value);
            }, 300); // 300ms debounce
        }
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

    //Tag Cache
    const fetchTags = useCallback(
        async (title) => {
            // If we have cached tags for this title, use them
            if (tagCache[title]) {
                setAvailableTags(tagCache[title]);
                return;
            }

            try {
                const response = await axiosClient.get(`/tags/${title}`);
                const tags = response.data.tags;

                // Update cache
                setTagCache((prev) => ({
                    ...prev,
                    [title]: tags,
                }));
                setAvailableTags(tags);
            } catch (error) {
                console.error("Error fetching tags:", error);
                setAvailableTags([]);
            }
        },
        [tagCache],
    );

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
                    rank: index + 1,
                }))
                .sort((a, b) => b.percentage - a.percentage);

            setApplicants(sortedApplicants);
            setCurrentPosition(position);
            setShowApplicantsModal(true);

            // Update the count for this position
            setApplicantCounts((prev) => ({
                ...prev,
                [position.position_id]: applicants.length,
            }));
        } catch (error) {
            console.error("Error fetching applicants:", error);
        }
    };
    useEffect(() => {
        const fetchApplicantCounts = async () => {
            try {
                const counts = {};
                for (const position of positions) {
                    const response = await axiosClient.get(
                        `/applicants/${position.position_id}`,
                    );
                    counts[position.position_id] = response.data.length;
                }
                setApplicantCounts(counts);
            } catch (error) {
                console.error("Error fetching applicant counts:", error);
            }
        };

        if (positions.length > 0) {
            fetchApplicantCounts();
        }
    }, [positions]);

    const updateApplicantCount = async (positionId) => {
        try {
            const response = await axiosClient.get(`/applicants/${positionId}`);
            setApplicantCounts((prev) => ({
                ...prev,
                [positionId]: response.data.length,
            }));
        } catch (error) {
            console.error("Error updating applicant count:", error);
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

            // Update the count immediately
            if (currentPosition) {
                updateApplicantCount(currentPosition.position_id);
            }
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

            if (currentPosition) {
                updateApplicantCount(currentPosition.position_id);
            }

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

    const handleRemoveTag = useCallback((tagToRemove) => {
        setNewPosition((prev) => {
            const currentTags = prev.hr_tags
                .split(",")
                .map((tag) => tag.trim());
            const updatedTags = currentTags
                .filter((tag) => tag !== tagToRemove)
                .join(", ");
            return { ...prev, hr_tags: updatedTags };
        });

        setSelectedTags((prev) => prev.filter((tag) => tag !== tagToRemove));
        setAvailableTags((prev) => [...prev, tagToRemove]);
    }, []);

    const handleTagClick = useCallback(
        (tag) => {
            if (!selectedTags.includes(tag)) {
                setNewPosition((prev) => ({
                    ...prev,
                    hr_tags: prev.hr_tags ? `${prev.hr_tags}, ${tag}` : tag,
                }));

                setSelectedTags((prev) => [...prev, tag]);
                setAvailableTags((prev) => prev.filter((t) => t !== tag));
            }
        },
        [selectedTags],
    );

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

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

    const toggleDescription = (positionId) => {
        setExpandedDescriptions((prev) => ({
            ...prev,
            [positionId]: !prev[positionId],
        }));
    };

    const truncateDescription = (text, maxLength = 100) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + "...";
    };

    const handleViewResponses = (applicant) => {
        // Get questions for the position
        const positionQuestions = getQuestionsForPosition(
            applicant.position_name,
        );
        console.log("Position:", applicant.position_name); // Debug log
        console.log("Questions:", positionQuestions); // Debug log

        // Map questions with responses from the applicant
        const questionsWithResponses = positionQuestions.map(
            (question, index) => ({
                text: question,
                response:
                    applicant[`question${index + 1}_response`] ||
                    "No response provided",
            }),
        );

        setQuestions(questionsWithResponses);
        setShowResponseModal(true);
    };

    const fetchResponsesForApplicant = async (applicantId) => {
        try {
            const response = await axiosClient.get(
                `/get-responses/${applicantId}`,
            );

            // Make sure response.data.questions is an array
            if (
                response.data.questions &&
                Array.isArray(response.data.questions)
            ) {
                setQuestions(response.data.questions);
            } else {
                setQuestions([]); // Fallback in case no questions are returned
            }

            setShowResponseModal(true); // Show modal after data is fetched
        } catch (error) {
            console.error("Error fetching responses:", error);
        }
    };

    return (
        <div>
            <nav className="grid grid-cols-2 space-x-4 mb-4">
                <button
                    className={`navButton ${
                        activeButton === "openPosition" ? "active" : ""
                    }`}
                    onClick={() => toggleButton("openPosition")}
                >
                    Open Positions
                </button>

                <button
                    className={`navButton ${
                        activeButton === "suggestTags" ? "active" : ""
                    }`}
                    onClick={() => toggleButton("suggestTags")}
                >
                    Suggest Tags
                </button>
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
                                        className="bg-white w-full h-full mt-6 p-6 rounded-lg shadow-md flex flex-col items-center gap-4 transition-transform transform hover:scale-105 font-kodchasan"
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
                                            <MdDelete
                                                size={23}
                                                className="text-red-700"
                                            />
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
                                            <p className="text-black border-2 text-wrap text-sm  border-green-700 rounded-lg p-4">
                                                {expandedDescriptions[
                                                    position.position_id
                                                ]
                                                    ? position.description
                                                    : truncateDescription(
                                                          position.description,
                                                      )}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    toggleDescription(
                                                        position.position_id,
                                                    )
                                                }
                                                className="text-green-700 hover:underline mt-2 flex items-center"
                                            >
                                                {expandedDescriptions[
                                                    position.position_id
                                                ] ? (
                                                    <>
                                                        <MdExpandLess className="mr-1" />{" "}
                                                        Read Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <MdExpandMore className="mr-1" />{" "}
                                                        Read More
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="position-base-salary">
                                            <strong>Base Salary: </strong>{" "}
                                            {position.base_salary}
                                        </p>
                                        <div className="relative">
                                            <button
                                                className="bg-green-900 border-2 border-green-900 font-normal text-white px-4 py-2 rounded hover:bg-white hover:text-green-900 transition"
                                                onClick={() =>
                                                    handleViewApplicants(
                                                        position,
                                                    )
                                                }
                                            >
                                                View Applicants
                                                {applicantCounts[
                                                    position.position_id
                                                ] > 0 && (
                                                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {
                                                            applicantCounts[
                                                                position
                                                                    .position_id
                                                            ]
                                                        }
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {showApplicantsModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
                                    <div className="bg-white rounded-lg shadow-lg w-full md:w-3/4 h-[500px] md:h-[700px] overflow-y-auto text-black relative">
                                        {/* Header Section */}
                                        <div className="sticky top-0 bg-white p-4 md:p-6 border-b">
                                            <span
                                                className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900 h-8 w-8 flex items-center justify-center"
                                                onClick={() =>
                                                    setShowApplicantsModal(
                                                        false,
                                                    )
                                                }
                                            >
                                                &times;
                                            </span>
                                            <h3 className="text-lg md:text-2xl font-semibold text-center pr-8">
                                                Applicants for{" "}
                                                {currentPosition?.title}
                                            </h3>
                                            <p className="text-green-800 text-sm md:text-base mt-2 text-center">
                                                Click "View" to see details and
                                                tags for each applicant.
                                            </p>
                                        </div>

                                        {/* Desktop View */}
                                        <div className="hidden md:block p-4 md:p-6">
                                            <table className="min-h-32 w-full border-collapse text-center">
                                                <thead>
                                                    <tr>
                                                        <th className="text-center px-4 py-2 border-b">
                                                            Rank
                                                        </th>
                                                        <th className="text-center px-4 py-2 border-b">
                                                            Name
                                                        </th>
                                                        <th className="text-center px-4 py-2 border-b">
                                                            File
                                                        </th>
                                                        <th className="text-center px-4 py-2 border-b">
                                                            Percentage
                                                        </th>
                                                        <th className="text-center px-4 py-2 border-b">
                                                            Questions Response
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
                                                                className="hover:bg-gray-100"
                                                            >
                                                                <td className="px-4 py-2 border-b">
                                                                    {index + 1}
                                                                </td>
                                                                <td className="px-4 py-2 border-b">
                                                                    {
                                                                        applicant.name
                                                                    }
                                                                </td>
                                                                <td className="px-4 py-2 border-b">
                                                                    <button
                                                                        className="text-blue-500 hover:underline"
                                                                        onClick={() =>
                                                                            handleOpenPdf(
                                                                                applicant.file_path,
                                                                            )
                                                                        }
                                                                    >
                                                                        {
                                                                            applicant.filename
                                                                        }
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-2 border-b">
                                                                    {applicant.percentage.toFixed(
                                                                        2,
                                                                    )}
                                                                    %
                                                                </td>
                                                                <td className="px-4 py-2 border-b">
                                                                    <button
                                                                        className="text-blue-500 hover:underline"
                                                                        onClick={() =>
                                                                            handleViewResponses(
                                                                                applicant,
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                        response
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-2 border-b">
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

                                        {/* Mobile View */}
                                        <div className="md:hidden p-4">
                                            {applicants.map(
                                                (applicant, index) => (
                                                    <div
                                                        key={index}
                                                        className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold">
                                                                Rank:{" "}
                                                                {index + 1}
                                                            </span>
                                                            <span className="text-sm">
                                                                {applicant.percentage.toFixed(
                                                                    2,
                                                                )}
                                                                %
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col space-y-2">
                                                            <button
                                                                className="text-blue-500 hover:underline text-left"
                                                                onClick={() =>
                                                                    handleOpenPdf(
                                                                        applicant.file_path,
                                                                    )
                                                                }
                                                            >
                                                                {
                                                                    applicant.filename
                                                                }
                                                            </button>

                                                            <button
                                                                className="text-blue-500 hover:underline text-left"
                                                                onClick={() =>
                                                                    handleViewResponses(
                                                                        applicant,
                                                                    )
                                                                }
                                                            >
                                                                View Response
                                                            </button>
                                                        </div>

                                                        <div className="flex justify-between items-center pt-2 border-t">
                                                            <button
                                                                className="text-blue-500 px-3 py-1 rounded-full border border-blue-500"
                                                                onClick={() =>
                                                                    handleViewApplicantDetails(
                                                                        applicant,
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>
                                                            <button
                                                                className="text-green-500 px-3 py-1 rounded-full border border-green-500"
                                                                onClick={() =>
                                                                    handleToOnboarding(
                                                                        applicant.id,
                                                                    )
                                                                }
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="text-red-500 px-3 py-1 rounded-full border border-red-500"
                                                                onClick={() =>
                                                                    handleDeleteApplicant(
                                                                        applicant.id,
                                                                    )
                                                                }
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {showResponseModal && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 h-[700px] md:h-auto overflow-y-auto text-black relative">
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowResponseModal(false)
                                        }
                                    >
                                        &times;
                                    </span>
                                    <h3 className="text-lg font-semibold mb-4 text-center">
                                        Applicant Responses
                                    </h3>

                                    <div className="text-sm mb-4">
                                        {questions.length > 0 ? (
                                            questions.map((question, index) => {
                                                // Function to decode HTML entities and replace &apos; with '
                                                const decodeText = (text) => {
                                                    return text
                                                        .replace(/&apos;/g, "'")
                                                        .replace(/&#39;/g, "'")
                                                        .replace(/&quot;/g, '"')
                                                        .replace(/&amp;/g, "&");
                                                };

                                                return (
                                                    <div
                                                        key={index}
                                                        className="mb-3"
                                                    >
                                                        <strong>{`Question ${index + 1}:`}</strong>{" "}
                                                        {decodeText(
                                                            question.text,
                                                        )}
                                                        <p className="ml-6 mt-4 text-green-700">
                                                            Response:{" "}
                                                            {question.response
                                                                ? decodeText(
                                                                      question.response,
                                                                  )
                                                                : "No response provided"}
                                                        </p>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p>
                                                No questions available for this
                                                position.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {showModal && (
                            <div className="modal text-black">
                                <div className="bg-white overflow-auto h-[600px] w-full md:w-fit xl:w-3/4 text-sm flex flex-col items-center mx-2 md:mx-4 px-4 md:px-7 pb-6 md:pb-10 pt-4 rounded-lg">
                                    {/* Header */}
                                    <div className="w-full h-fit flex justify-between items-center mb-4">
                                        <h3 className="text-lg md:text-xl 2xl:text-2xl font-bold">
                                            ADD NEW POSITION
                                        </h3>
                                        <span
                                            className="p-2 md:px-4 md:py-2 rounded-full cursor-pointer bg-red-700 hover:bg-opacity-75 w-8 md:w-10 h-8 md:h-10 flex items-center justify-center text-white"
                                            onClick={() => setShowModal(false)}
                                        >
                                            &times;
                                        </span>
                                    </div>

                                    <div className="flex flex-col w-full gap-4">
                                        {/* Mobile View Form Fields */}
                                        <div className="flex flex-col md:hidden space-y-4 w-full">
                                            {/* Title */}
                                            <div className="flex flex-col gap-2">
                                                <label className="font-bold">
                                                    Title:
                                                </label>
                                                <select
                                                    className="w-full hover:border-green-700 text-black rounded-lg p-2 border-2"
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
                                                    <option value="RMT">
                                                        RMT
                                                    </option>
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

                                            {/* Type */}
                                            <div className="flex flex-col gap-2">
                                                <label className="font-bold">
                                                    Type:
                                                </label>
                                                <select
                                                    className="w-full text-black hover:border-green-700 rounded-lg p-2 border-2"
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

                                            {/* Salary */}
                                            <div className="flex flex-col gap-2">
                                                <label className="font-bold">
                                                    Base Salary:
                                                </label>
                                                <input
                                                    className="w-full text-black rounded-lg hover:border-green-700 p-2 border-2"
                                                    type="text"
                                                    name="base_salary"
                                                    value={
                                                        newPosition.base_salary
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Desktop View Form Fields */}
                                        <div className="hidden md:flex flex-col gap-4 w-full">
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
                                                    <option value="RMT">
                                                        RMT
                                                    </option>
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
                                                <label className="text-black font-bold mr-4">
                                                    Base Salary:
                                                </label>
                                                <input
                                                    className="text-black rounded-lg hover:border-green-700 mb-0 mr-12"
                                                    type="text"
                                                    name="base_salary"
                                                    value={
                                                        newPosition.base_salary
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Description and Qualifications - Responsive for both views */}
                                        <div className="flex flex-col lg:flex-col 2xl:flex-row gap-4 2xl:gap-6 2xl:justify-center w-full">
                                            <div className="description-textarea flex flex-col items-center w-full 2xl:w-auto">
                                                <label className="font-bold mb-2">
                                                    Job Description:
                                                </label>
                                                <textarea
                                                    className="px-4 py-4 w-full 2xl:w-[500px] font-medium h-36 lg:h-96 border-2 text-black hover:border-green-700 rounded-lg"
                                                    name="description"
                                                    value={
                                                        newPosition.description
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                            <div className="qualifications-textarea flex flex-col items-center w-full 2xl:w-auto">
                                                <label className="font-bold mb-2">
                                                    Qualifications &
                                                    Requirements:
                                                </label>
                                                <textarea
                                                    className="px-4 py-4 w-full 2xl:w-[500px] font-medium h-36 lg:h-96 border-2 text-black hover:border-green-700 rounded-lg"
                                                    name="qualifications"
                                                    value={
                                                        newPosition.qualifications
                                                    }
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Tags Section - Responsive for both views */}
                                        <div className="HR-Tags w-full">
                                            <div className="flex flex-col 2xl:flex-row justify-center gap-4 2xl:gap-6">
                                                <div className="flex flex-col items-center w-full 2xl:w-auto">
                                                    <label className="font-bold mb-2">
                                                        Selected Tags
                                                    </label>
                                                    <div className="selectedTags border-2 w-full 2xl:w-[500px] min-h-10 max-h-56 rounded-lg overflow-auto text-black font-semibold p-2">
                                                        {newPosition.hr_tags
                                                            .split(",")
                                                            .map(
                                                                (tag, index) =>
                                                                    tag && (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="tagItem inline-flex items-center m-1 px-3 py-1 bg-gray-100 rounded-full"
                                                                        >
                                                                            {tag.trim()}
                                                                            <span
                                                                                className="ml-2 hover:bg-red-500 hover:text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
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

                                                <div className="flex flex-col items-center w-full 2xl:w-auto">
                                                    <label className="font-bold mb-2">
                                                        Available Tags
                                                    </label>
                                                    <div className="border-2 w-full 2xl:w-[500px] min-h-10 max-h-56 rounded-lg text-black p-2">
                                                        {availableTags.map(
                                                            (tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    onClick={() =>
                                                                        handleTagClick(
                                                                            tag,
                                                                        )
                                                                    }
                                                                    className="cursor-pointer hover:bg-gray-100 px-3 py-1 m-1 inline-block rounded-full"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <button
                                        className="bg-green-900 px-10 py-2 border-2 border-white rounded-lg font-normal hover:bg-white hover:border-green-900 hover:text-green-900 transition mt-10 text-white"
                                        onClick={handleAddPosition}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
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

                            <h3 className="text-base font-semibold mb-4 text-center">
                                Tags and Comments for {currentApplicant?.name}
                            </h3>
                            <p className="text-base flex flex-col gap-4 mb-3">
                                <strong>Matched Tags:</strong>{" "}
                                {currentApplicant?.matched_words}
                            </p>
                            <p className="text-base flex flex-col gap-4 mt-14 items-center mb-3">
                                <strong>Comments:</strong>{" "}
                                {currentApplicant?.comments}
                            </p>
                        </div>
                    </div>
                )}
                {activeButton === "suggestTags" && <HRTagSuggestion />}
            </div>
        </div>
    );
}

export default Recruitment_Management;
