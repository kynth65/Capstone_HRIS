import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Modal from "react-modal";
import { IoIosArrowRoundBack } from "react-icons/io";
import countryCodes from "../hooks/useCountryCodes";
import Terms from "../views/Terms";
import Conditions from "../views/Conditions";

import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import {
    validateEmail,
    validatePhoneNumber,
    validateFileUpload,
    validateAdditionalQuestions,
} from "../hooks/useValidationUtil";
import axiosClient from "../axiosClient";
import MedicalSecretaryQuestions from "../views/questions/MedicalSecretaryQuestions";
import AccountingQuestions from "../views/questions/AccountingQuestions";
import AnatomicalQuestions from "../views/questions/AnatomicalQuestions";
import MaintenanceQuestions from "../views/questions/MaintenanceQuestions";
import RiderQuestions from "../views/questions/RiderQuestions";
import RMTQuestions from "../views/questions/RMTQuestions";
import SecurityQuestions from "../views/questions/SecurityQuestions";

Modal.setAppElement("#root");

const ApplicantPortal = () => {
    const [positions, setPositions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [hrTags, setHrTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const fileInputRef = useRef(null);
    const [userData, setUserData] = useState(null);
    const [attemptMessage, setAttemptMessage] = useState(false);
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [isConditionsOpen, setIsConditionsOpen] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [step, setStep] = useState(1);
    const [contactInfo, setContactInfo] = useState({
        email: "",
        phoneCountryCode: "+63",
        mobileNumber: "",
    });
    const [resume, setResume] = useState(null);
    const [questions, setQuestions] = useState({
        question1: "",
        question2: "",
        question3: "",
        question4: "",
        question5: "",
        question6: "",
        question7: "",
        question8: "",
        question9: "",
        question10: "",
    });
    const [errors, setErrors] = useState({
        email: "",
        mobileNumber: "",
        file: "",
    });

    const openTermsModal = () => setIsTermsOpen(true);
    const closeTermsModal = () => setIsTermsOpen(false);
    const openConditionsModal = () => setIsConditionsOpen(true);
    const closeConditionsModal = () => setIsConditionsOpen(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);

    const closeViewAllModal = () => {
        setIsViewAllModalOpen(false);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedFiles([]);
        setQuestions({
            question1: "",
            question2: "",
            question3: "",
            question4: "",
            question5: "",
            question6: "",
            question7: "",
            question8: "",
            question9: "",
            question10: "",
        });
        setErrorMessage("");
        setContactInfo({
            email: "",
            phoneCountryCode: "+63",
            mobileNumber: "",
        });
    };

    const handleNextStep = () => {
        let validationErrors = {};

        if (step === 1) {
            if (!validateEmail(contactInfo.email)) {
                validationErrors.email = "Please enter a valid email address.";
            }
            if (!validatePhoneNumber(contactInfo.mobileNumber)) {
                validationErrors.mobileNumber = "Enter a valid phone number.";
            }
        }

        if (step === 2) {
            const fileError = validateFileUpload(resume);
            if (fileError) {
                validationErrors.file = fileError;
            }
        }

        if (step === 3) {
            const questionErrors = validateAdditionalQuestions(
                questions,
                selectedPosition?.title,
            );
            validationErrors = { ...validationErrors, ...questionErrors };
        }

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setStep(step + 1);
        }
    };

    const handlePrevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setResume(event.target.files[0]);
    };

    const extractTextFromPdf = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(" ");
        }
        return text;
    };

    const extractEmail = (text) => {
        // Split text into lines and process each line
        const lines = text.split("\n");

        // Common email labels that might precede the address
        const emailLabels = ["email", "e-mail", "mail", "contact", "address"];

        // More comprehensive email pattern
        const emailPattern =
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;

        for (const line of lines) {
            // Skip empty lines
            if (!line.trim()) continue;

            // First try to find email in lines that contain email labels
            const lowerLine = line.toLowerCase();
            if (emailLabels.some((label) => lowerLine.includes(label))) {
                const match = line.match(emailPattern);
                if (match) return match[0];
            }

            // If no labeled email found, look for email pattern in the line
            const match = line.match(emailPattern);
            if (match) {
                // Additional validation to avoid false positives
                const email = match[0];

                // Skip common false positives
                if (email.includes("example.com")) continue;
                if (email.includes("domain.com")) continue;

                // Basic validation
                if (
                    email.length > 5 && // Minimum length check
                    email.length < 255 && // Maximum length check
                    email.includes("@") && // Must contain @
                    email.split("@")[0].length > 0 && // Local part must not be empty
                    email.split("@")[1].length > 3 // Domain must be reasonable length
                ) {
                    return email;
                }
            }
        }

        // If no email found in the regular text, try looking for encoded characters
        const encodedMatch = text.match(
            /[A-Za-z0-9._%+-]+\s*[@\[at\]]\s*[A-Za-z0-9.-]+\s*\.[A-Z|a-z]{2,}/,
        );
        if (encodedMatch) {
            return encodedMatch[0].replace(/\s+/g, "").replace(/\[at\]/i, "@");
        }

        return null;
    };

    const extractNameWithAI = async (text, apiKey) => {
        try {
            const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "gpt-4",
                        messages: [
                            {
                                role: "system",
                                content:
                                    'You are a precise name extractor. Extract only the full name of the applicant from the given text. Return ONLY the name, nothing else. The name should be in proper case (e.g., "John Smith" or "Mary Jane Doe"). Do not include titles, degrees, or other text.',
                            },
                            {
                                role: "user",
                                content: `Extract only the applicant's name from this text: ${text}`,
                            },
                        ],
                        max_tokens: 50,
                        temperature: 0.1, // Low temperature for more deterministic output
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Failed to extract name using AI");
            }

            const data = await response.json();
            const extractedName = data.choices[0].message.content.trim();

            // Basic validation to ensure we got a name
            if (
                extractedName &&
                /^[A-Z][a-z]+(?:\s+(?:[A-Z][a-z]+|[A-Z]\.)){1,3}$/.test(
                    extractedName,
                )
            ) {
                return extractedName;
            }
            return null;
        } catch (error) {
            console.error("Error extracting name with AI:", error);
            return null;
        }
    };

    const isValidNameWithInitials = (name) => {
        if (!name) return false;
        if (name.length < 2) return false;

        const words = name.trim().split(/\s+/);
        if (words.length < 2 || words.length > 4) return false;

        // Common non-name words to check against
        const nonNameWords = [
            "USA",
            "PROFESSIONAL",
            "RESUME",
            "CURRICULUM",
            "VITAE",
            "CV",
            "NAME",
            "MAIN",
            "STREET",
            "ROAD",
            "AVENUE",
            "DRIVE",
            "LANE",
            "COURT",
            "CIRCLE",
            "SUMMARY",
            "PROFILE",
            "CONTACT",
            "EMAIL",
            "PHONE",
            "ADDRESS",
            "LOCATION",
        ];

        for (const word of words) {
            // Skip checking format for initials
            if (/^[A-Z]\.?$/.test(word)) continue;

            // Check if it's a non-name word
            if (nonNameWords.includes(word.toUpperCase())) {
                return false;
            }

            // Check format for regular name words
            if (!/^[A-Z][a-zA-Z]+$/.test(word)) {
                return false;
            }
        }

        return true;
    };

    // Modified handleUpload function
    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !isChecked) {
            setErrorMessage(
                "Please select a file and agree to the terms before submitting.",
            );
            return;
        }

        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setErrorMessage("");
        setLoading(true);

        const formData = new FormData();
        const file = selectedFiles[0];
        formData.append("files", file);
        formData.append("position_id", selectedPosition.position_id);

        try {
            // Extract text from PDF
            const text = await extractTextFromPdf(file);
            const cleanedText = text
                .replace(/\s+/g, " ")
                .replace(/\s*-\s*/g, "")
                .replace(/\s*\|\s*/g, "|")
                .trim();

            // Use AI to extract name
            const apiKey = import.meta.env.VITE_APP_OPENAI_API_KEY; // Make sure to set this in your environment
            const extractedName = await extractNameWithAI(cleanedText, apiKey);
            const email = extractEmail(text);

            if (!extractedName) {
                throw new Error("Could not extract name from resume");
            }

            formData.append("filename", file.name);
            formData.append("email", email || contactInfo.email);
            formData.append("position_name", selectedPosition.title);
            formData.append("name", extractedName);
            formData.append("mobileNumber", contactInfo.mobileNumber);
            formData.append("question1_response", questions.question1 || "");
            formData.append("question2_response", questions.question2 || "");
            formData.append("question3_response", questions.question3 || "");
            formData.append("question4_response", questions.question4 || "");
            formData.append("question5_response", questions.question5 || "");
            formData.append("question6_response", questions.question6 || "");
            formData.append("question7_response", questions.question7 || "");
            formData.append("question8_response", questions.question8 || "");
            formData.append("question9_response", questions.question9 || "");
            formData.append("question10_response", questions.question10 || "");
            formData.append("resume_text", cleanedText);
            formData.append("hr_tags", selectedPosition.hr_tags);
            formData.append("google_id", userData?.sub); // Add Google ID to form data

            const uploadResponse = await axiosClient.post(
                "/applicants/upload-and-rank",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            // Show success popup
            setShowSuccessPopup("You successfully submitted your resume!");
            setTimeout(() => setShowSuccessPopup(""), 4000);

            // Clear form fields
            setContactInfo({
                email: "",
                phoneCountryCode: "",
                mobileNumber: "",
            });
            setQuestions({
                question1: "",
                question2: "",
                question3: "",
                question4: "",
                question5: "",
                question6: "",
                question7: "",
                question8: "",
                question9: "",
                question10: "",
            });
            setSelectedPosition(null);
            setIsChecked(false);
            setResume(null);
            // Close modals after submission
            closeModal();
            closeViewAllModal();

            // Show success message
            setShowSuccessMessage("Application submitted successfully!");
            setTimeout(() => setShowSuccessMessage(""), 5000);
        } catch (error) {
            console.error("Error uploading resume:", error);
            setErrorMessage(
                error.response?.data?.error || "Failed to submit your resume",
            );
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSuccess = (response) => {
        const token = response.credential;
        const decodedData = jwtDecode(token);
        localStorage.setItem("googleToken", token);
        localStorage.setItem("googleUserData", JSON.stringify(decodedData));

        setLoggedIn(true);
        setUserData(decodedData);
    };

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
    };

    const handleLogout = () => {
        localStorage.removeItem("googleToken");
        localStorage.removeItem("googleUserData");
        setLoggedIn(false);
        setUserData(null);
    };

    useEffect(() => {
        const storedToken = localStorage.getItem("googleToken");
        const storedUserData = localStorage.getItem("googleUserData");

        if (storedToken && storedUserData) {
            setLoggedIn(true);
            setUserData(JSON.parse(storedUserData));
        }
    }, []);

    const openModal = async (position) => {
        setSelectedPosition(position);
        setIsModalOpen(true);
    };
    const openViewAllModal = (position) => {
        setSelectedPosition(position);
        setIsViewAllModalOpen(true);
    };

    const fetchPositions = async () => {
        try {
            const response = await axiosClient.get("/open-positions");
            const data = response.data;
            // Check if data is an array; if not, default to an empty array
            setPositions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching positions:", error);
            setPositions([]); // Set to an empty array on error
        }
    };

    useEffect(() => {
        if (loggedIn) {
            fetchPositions();
        }
    }, [loggedIn]);

    const handleLoginError = (error) => {
        console.error("Google login error:", error);
        setErrorMessage("Failed to log in with Google. Please try again.");
        setTimeout(() => setErrorMessage(""), 4000); // Optional: Clear the message after a few seconds
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        // If the name exists in contactInfo, update that part of the state
        if (contactInfo.hasOwnProperty(name)) {
            setContactInfo((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        } else {
            // Otherwise, it updates the questions state
            setQuestions((prevState) => ({
                ...prevState,
                [name]: value,
            }));
        }
    };

    const PositionsList = ({ positions, openModal, openViewAllModal }) => (
        <div className="position-container px-2 py-2 flex flex-col gap-4 items-center md:grid md:grid-cols-2 md:place-items-center">
            {positions.length > 0 ? (
                positions.map((position) => (
                    <PositionCard
                        key={position.position_id}
                        position={position}
                        openModal={openModal}
                        openViewAllModal={openViewAllModal}
                    />
                ))
            ) : (
                <p>No open positions available.</p>
            )}
        </div>
    );
    //Position Card
    const PositionCard = ({ position, openModal, openViewAllModal }) => {
        return (
            <>
                <div
                    className="bg-white w-full h-full py-4 px-4  rounded-lg flex flex-col items-start gap-3 cursor-pointer hover:shadow-inner hover:shadow-green-900 hover:bg-neutral-100 transition"
                    onClick={() => openViewAllModal(position)}
                >
                    <div>
                        <h3 className="position-title uppercase mb-4">
                            <span className="font-bold  text-black text-2xl">
                                {position.title}{" "}
                            </span>
                        </h3>
                    </div>
                    <div className="w-full flex justify-start gap-3">
                        <span className="text-black bg-slate-200 px-3 py-2 rounded-md font-semibold">
                            Base salaray: {position.base_salary}
                        </span>
                        <span className="text-black bg-slate-200 px-3 py-2 rounded-md font-semibold">
                            {position.type}
                        </span>
                    </div>
                    <strong className="text-base font-semibold">
                        Job Criteria:{" "}
                    </strong>
                    <div className="h-full flex flex-col items-start w-full text-black">
                        {position.hr_tags.split(", ").map((tag, index) => (
                            <div className="font-normal" key={index}>
                                - {tag}
                            </div>
                        ))}
                    </div>

                    <div className="position-actions">
                        <button
                            className="bg-green-900 mt-3 px-8 py-2 rounded-md sm:hidden"
                            onClick={() => openViewAllModal(position)}
                        >
                            View All
                        </button>
                    </div>
                </div>
            </>
        );
    };

    return (
        <GoogleOAuthProvider clientId="912434838916-ps2f2pjs1q5k31lkbecjvd8sc4gi93ss.apps.googleusercontent.com">
            <div className="applicantPortal font-poppins">
                <div className="sticky top-0 h-16 w-full flex items-center bg-[#1d2e28]">
                    <div className="">
                        <Link to={"/"}>
                            <IoIosArrowRoundBack className="ml-3 size-14" />
                        </Link>
                    </div>
                    <div className="w-full md:pl-16 justify-center">
                        <h1 className="font-poppins text-4xl">Open Jobs</h1>
                    </div>

                    {loggedIn ? (
                        <a
                            className="cursor-pointer px-4 py-2 rounded-lg bg-transparent border-2 hover:bg-gray-50 hover:bg-opacity-25 mr-3 text-white"
                            onClick={handleLogout}
                        >
                            Sign Out
                        </a>
                    ) : (
                        <div className="w-40"></div>
                    )}
                </div>

                {showSuccessMessage && (
                    <div className="success-message bg-green-100 text-green-700 p-4 rounded mb-4 text-center">
                        {showSuccessMessage}
                    </div>
                )}

                {!loggedIn && (
                    <div className="h-[600px] w-full flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <p className="font-poppins text-3xl mb-4 ">
                                Sign Up
                            </p>
                            <p className="font-poppins mb-6">
                                Sign up now to explore available job openings
                                and apply for exciting career opportunities!
                            </p>
                            <GoogleLogin
                                buttonText="SIGN IN WITH GOOGLE"
                                id="google"
                                onSuccess={handleLoginSuccess}
                                onFailure={handleLoginError}
                                cookiePolicy={"single_host_origin"}
                                prompt="remove_account"
                            />
                        </div>
                    </div>
                )}

                {loggedIn && (
                    <>
                        <div className="">
                            <h3 className="hidden">
                                Welcome, {userData?.name}!
                            </h3>
                            <p className="hidden">Email: {userData?.email}</p>
                        </div>
                        <PositionsList
                            positions={positions}
                            openModal={openModal}
                            openViewAllModal={openViewAllModal}
                        />
                    </>
                )}

                <Modal
                    isOpen={isViewAllModalOpen}
                    onRequestClose={closeViewAllModal}
                    contentLabel="View Position Details"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="h-[700px] overflow-auto bg-white px-3 py-3 mx-2 rounded-lg">
                        <span
                            className="py-[6px] px-3 cursor-pointer float-right bg-red-700 hover:opacity-80 hover:text-white transition rounded-full"
                            onClick={closeViewAllModal}
                        >
                            &times;
                        </span>

                        {selectedPosition && (
                            <>
                                <div className="overflow-auto text-base flex flex-col items-center pl-5 gap-5 font-semibold text-black">
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
                                        <span className="mb-2">
                                            Job Criteria:
                                        </span>
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
                                        <div className="border-2 h-fit w-fit md:w-[550px] lg:w-[900px] overflow-auto border-green-900 px-4 py-4 rounded-lg">
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
                                        <strong>Qualifications</strong>
                                        <div className="border-2 h-fit w-auto md:w-[550px] lg:w-[900px] overflow-auto border-green-900 px-4 py-4 rounded-lg">
                                            <p
                                                style={{
                                                    whiteSpace: "pre-wrap",
                                                }}
                                                className="font-poppins font-normal"
                                            >
                                                {
                                                    selectedPosition.qualifications
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        className="px-10 py-4 text-white font-normal bg-green-800 rounded-lg border-2 hover:border-green-900 hover:bg-white hover:text-green-800 transition"
                                        onClick={() => {
                                            openModal(selectedPosition);
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>

                <Modal
                    isOpen={isModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Application Modal"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="modalContent h-fit flex flex-col gap-4 ">
                        <div className="flex justify-end">
                            <span
                                className="flex items-center justify-center bg-red-700 text-white w-8 h-8 rounded-full cursor-pointer hover:bg-opacity-85 transition"
                                onClick={closeModal}
                            >
                                &times;
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 h-1">
                            <div
                                className={`h-full bg-blue-600 transition-all duration-300`}
                                style={{ width: `${(step - 1) * 33}%` }}
                            ></div>
                        </div>

                        {/* Step 1: Contact Info */}
                        {step === 1 && (
                            <div>
                                <h2 className="font-semibold text-xl">
                                    Contact Info
                                </h2>
                                <div className="mt-4 space-y-6">
                                    {/* Email Field */}
                                    <div className="flex flex-col space-y-1">
                                        {errors.email && (
                                            <span className="text-red-500">
                                                {errors.email}
                                            </span>
                                        )}
                                        <label
                                            htmlFor="email"
                                            className="font-medium"
                                        >
                                            Email
                                        </label>
                                        <select
                                            id="email"
                                            className="input-field"
                                            name="email"
                                            value={contactInfo.email}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">
                                                {userData?.email
                                                    ? "Select an option"
                                                    : "Enter your email"}
                                            </option>
                                            {userData?.email && (
                                                <option value={userData.email}>
                                                    {userData.email}
                                                </option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Country Code Field */}
                                    <div className="flex flex-col space-y-1">
                                        <label
                                            htmlFor="phoneCountryCode"
                                            className="font-medium"
                                        >
                                            Country Code
                                        </label>
                                        <select
                                            id="phoneCountryCode"
                                            className="input-field"
                                            name="phoneCountryCode"
                                            value={contactInfo.phoneCountryCode}
                                            onChange={handleInputChange}
                                        >
                                            {countryCodes.map((country) => (
                                                <option
                                                    key={country.code}
                                                    value={country.code}
                                                >
                                                    {country.name} (
                                                    {country.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mobile Number Field */}
                                    <div className="flex flex-col space-y-1">
                                        {errors.mobileNumber && (
                                            <span className="text-red-500">
                                                {errors.mobileNumber}
                                            </span>
                                        )}
                                        <label
                                            htmlFor="mobileNumber"
                                            className="font-medium"
                                        >
                                            Mobile Number
                                        </label>
                                        <input
                                            type="text"
                                            id="mobileNumber"
                                            name="mobileNumber"
                                            className="input-field"
                                            placeholder="Mobile phone number"
                                            value={contactInfo.mobileNumber}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Resume Upload */}
                        {step === 2 && (
                            <div>
                                <h2 className="font-semibold text-xl">
                                    Upload Resume
                                </h2>
                                <div className="mt-4">
                                    <input
                                        type="file"
                                        id="fileInput"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {resume ? (
                                        <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
                                            <span>{resume.name}</span>
                                            <button
                                                className="text-red-700"
                                                onClick={() => setResume(null)}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="fileInput"
                                            className="cursor-pointer text-center block border border-gray-400 rounded-lg py-2 px-4"
                                        >
                                            Choose File
                                        </label>
                                    )}
                                    {errors.file && (
                                        <span className="text-red-500">
                                            {errors.file}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="max-h-[400px] overflow-y-auto">
                                <h2 className="font-semibold text-xl">
                                    Additional Questions
                                </h2>
                                <div className="mt-4 space-y-4">
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "accounting" && (
                                            <AccountingQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                // errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "maintenance" && (
                                            <MaintenanceQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "rmt" && (
                                            <RMTQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "rider" && (
                                            <RiderQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "xray tech" && (
                                            <XrayTechQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "security" && (
                                            <SecurityQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "anatomical" && (
                                            <AnatomicalQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}
                                    {selectedPosition &&
                                        selectedPosition.title.toLowerCase() ===
                                            "medical secretary" && (
                                            <MedicalSecretaryQuestions
                                                questions={questions}
                                                setQuestions={setQuestions}
                                                errors={errors}
                                            />
                                        )}

                                    {/* Error handling */}
                                    {errors &&
                                        Object.keys(errors).length > 0 && (
                                            <div className="text-red-500">
                                                {Object.values(errors).map(
                                                    (error, index) => (
                                                        <p key={index}>
                                                            {error}
                                                        </p>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                {showSuccessPopup && (
                                    <div className="success-message bg-green-100 text-green-700 p-2 rounded mb-4">
                                        {showSuccessPopup}
                                    </div>
                                )}
                                {errorMessage && (
                                    <div className="error-message bg-red-100 text-red-700 p-2 rounded mb-4">
                                        {errorMessage}
                                    </div>
                                )}
                                {attemptMessage && (
                                    <div className="error-message bg-red-100 text-red-700 p-2 rounded mb-4">
                                        {attemptMessage}
                                    </div>
                                )}
                                <h2 className="font-semibold text-xl">
                                    Review Your Application
                                </h2>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h3 className="font-semibold">
                                            Contact Info
                                        </h3>
                                        <p>{contactInfo.email}</p>
                                        <p>
                                            {contactInfo.phoneCountryCode}{" "}
                                            {contactInfo.mobileNumber}
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">
                                            Resume
                                        </h3>
                                        <p>
                                            {resume
                                                ? resume.name
                                                : "No file uploaded"}
                                        </p>
                                    </div>

                                    {/* Dynamically Render Additional Questions Based on Position Title */}
                                    {selectedPosition && (
                                        <div>
                                            <h3 className="font-semibold">
                                                {selectedPosition.title}{" "}
                                                Specific Questions
                                            </h3>
                                            {selectedPosition.title.toLowerCase() ===
                                                "accounting" && (
                                                <>
                                                    <p>
                                                        Bachelor's Degree:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Willing to undergo a
                                                        background check:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Comfortable commuting:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>

                                                    <p>
                                                        Willing to work
                                                        Saturdays:{" "}
                                                        <strong>
                                                            {questions.question4 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Accountancy Graduate:{" "}
                                                        <strong>
                                                            {questions.question5 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        English Proficiency:{" "}
                                                        <strong>
                                                            {questions.question6 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Accounting Experience:{" "}
                                                        <strong>
                                                            {questions.question7 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Experience with
                                                        Accounting Software:{" "}
                                                        <strong>
                                                            {questions.question8 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Experience with Business
                                                        Process:{" "}
                                                        <strong>
                                                            {questions.question9 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "maintenance" && (
                                                <>
                                                    <p>
                                                        Comfortable performing
                                                        minor repair work:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Willing to work on a
                                                        flexible schedule:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience in
                                                        maintenance work:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "rmt" && (
                                                <>
                                                    <p>
                                                        Licensed to practice as
                                                        a Registered Massage
                                                        Therapist:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Willing to work evenings
                                                        or weekends:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience as
                                                        an RMT:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "rider" && (
                                                <>
                                                    <p>
                                                        Valid driver's license:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Comfortable driving in
                                                        various weather
                                                        conditions:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience as a
                                                        rider:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "x-ray technician" && (
                                                <>
                                                    <p>
                                                        Certification as an
                                                        X-Ray Technician:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Comfortable working with
                                                        radiation:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Certified in CPR:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience as
                                                        an X-Ray Technician:{" "}
                                                        <strong>
                                                            {questions.question4 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "security" && (
                                                <>
                                                    <p>
                                                        License for security
                                                        services:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Willing to work night
                                                        shifts:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience in
                                                        the security industry:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "anatomical" && (
                                                <>
                                                    <p>
                                                        Degree in a related
                                                        field:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Familiar with anatomical
                                                        dissection techniques:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Experience with human
                                                        cadaver specimens:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience in a
                                                        biological laboratory:{" "}
                                                        <strong>
                                                            {questions.question4 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Proficiency in
                                                        identifying anatomical
                                                        structures:{" "}
                                                        <strong>
                                                            {questions.question5 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "ultrasound technician" && (
                                                <>
                                                    <p>
                                                        Certification in
                                                        Diagnostic Medical
                                                        Sonography:{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Comfortable working with
                                                        patients:{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Years of experience
                                                        conducting ultrasounds:{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            {selectedPosition.title.toLowerCase() ===
                                                "medical secretary" && (
                                                <>
                                                    <p>
                                                        Do you have experience
                                                        with medical scheduling
                                                        software?{" "}
                                                        <strong>
                                                            {questions.question1 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        Are you proficient in
                                                        medical terminology?{" "}
                                                        <strong>
                                                            {questions.question2 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                    <p>
                                                        How comfortable are you
                                                        with patient
                                                        interaction?*{" "}
                                                        <strong>
                                                            {questions.question3 ||
                                                                "Not answered"}
                                                        </strong>
                                                    </p>
                                                </>
                                            )}
                                            <div className="flex items-center pt-10">
                                                {" "}
                                                <label
                                                    htmlFor="terms"
                                                    className="ml-2 pt-10"
                                                ></label>
                                                <input
                                                    type="checkbox"
                                                    id="terms"
                                                    checked={isChecked}
                                                    onChange={
                                                        handleCheckboxChange
                                                    }
                                                    className="w-10 mt-4"
                                                />
                                                <p className="text-nowrap">
                                                    I have read and agree to the
                                                </p>
                                                <button
                                                    onClick={openTermsModal}
                                                    className="underline text-blue-500 ml-1 mt-1 mr-1"
                                                >
                                                    Terms
                                                </button>
                                                <span className="mt-1">
                                                    and
                                                </span>
                                                <button
                                                    onClick={
                                                        openConditionsModal
                                                    }
                                                    className="underline text-blue-500 ml-1 mt-1"
                                                >
                                                    Conditions
                                                </button>
                                            </div>

                                            {/* Terms Modal */}
                                            {isTermsOpen && (
                                                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <div className="bg-white max-w-[1200px] max-h-[600px] overflow-auto text-base p-4 rounded w-full">
                                                        <button
                                                            onClick={
                                                                closeTermsModal
                                                            }
                                                            className="text-gray-500 hover:text-gray-700 float-right"
                                                        >
                                                            Close
                                                        </button>
                                                        <Terms />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Conditions Modal */}
                                            {isConditionsOpen && (
                                                <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                                    <div className="bg-white max-w-[1200px] max-h-[600px] overflow-auto text-base p-4 rounded w-full">
                                                        <button
                                                            onClick={
                                                                closeConditionsModal
                                                            }
                                                            className="text-gray-500 hover:text-gray-700 float-right"
                                                        >
                                                            Close
                                                        </button>
                                                        <Conditions />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between">
                            {step > 1 && (
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded-lg"
                                    onClick={handlePrevStep}
                                >
                                    Back
                                </button>
                            )}
                            {step < 4 ? (
                                <button
                                    className="font-poppins font-normal text-base px-10 py-3 bg-green-900 text-white border-2 border-white rounded-lg hover:bg-white hover:text-green-900 hover:border-green-900 transition"
                                    onClick={handleNextStep}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    className={`px-4 py-2 rounded-lg text-white flex items-center justify-center ${loading ? "bg-gray-400" : "bg-green-600"}`}
                                    onClick={handleUpload}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg
                                                className="animate-spin h-5 w-5 mr-3 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8v8H4z"
                                                ></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
        </GoogleOAuthProvider>
    );
};

export default ApplicantPortal;
