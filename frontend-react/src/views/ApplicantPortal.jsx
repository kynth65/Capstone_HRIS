import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import Modal from "react-modal";
import "../styles/applicantPortal.css";
import "../styles/openPosition.css";
import jwtDecode from "jwt-decode";
import { IoIosArrowRoundBack } from "react-icons/io";
import countryCodes from "../hooks/useCountryCodes";
import AccountingQuestions from "../views/questions/AccountingQuestions";
import MaintenanceQuestions from "../views/questions/MaintenanceQuestions";
import RMTQuestions from "../views/questions/RMTQuestions";
import RiderQuestions from "../views/questions/RiderQuestions";
import XrayTechQuestions from "../views/questions/XrayTechQuestions";
import SecurityQuestions from "../views/questions/SecurityQuestions";
import AnatomicalQuestions from "../views/questions/AnatomicalQuestions";
import MedicalSecretaryQuestions from "../views/questions/MedicalSecretaryQuestions";
import Terms from "../views/Terms";
import Conditions from "../views/Conditions";
import {
    validateEmail,
    validatePhoneNumber,
    validateFileUpload,
    validateAdditionalQuestions,
} from "../hooks/useValidationUtil";
Modal.setAppElement("#root");

const ApplicantPortal = () => {
    const [positions, setPositions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [hrTags, setHrTags] = useState("");
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
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

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setErrorMessage(
                "Please choose at least one file before submitting.",
            );
            if (!isChecked) {
                setErrorMessage(
                    "You must agree to the Terms and Conditions before submitting.",
                );
                return;
            }
            setTimeout(() => setErrorMessage(""), 4000);
            return;
        }

        // Clear previous files and error messages
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setErrorMessage("");
        setLoading(true);

        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        formData.append("position_id", selectedPosition.position_id);

        try {
            const uploadResponse = await axios.post(
                "https://api.gammacareservices.com:5000/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            // Now call the rank endpoint with the responses from the upload
            const rankResponse = await axios.post(
                "https://api.gammacareservices.com:5000/rank",
                {
                    position_id: selectedPosition.position_id,
                    resumes: uploadResponse.data.resume_texts,
                    filenames: uploadResponse.data.filenames,
                    question1: questions.question1,
                    question2: questions.question2,
                    question3: questions.question3,
                    question4: questions.question4,
                    question5: questions.question5,
                    question6: questions.question6,
                    question7: questions.question7,
                    question8: questions.question8,
                    question9: questions.question9,
                    question10: questions.question10,
                    mobileNumber: contactInfo.mobileNumber,
                },
            );

            console.log("Ranked resumes:", rankResponse.data.ranked_resumes);
            setShowSuccessPopup("You successfully submitted your resume!");

            // Clear success message after a timeout
            setTimeout(() => {
                setShowSuccessPopup("");
            }, 4000);

            // Update the upload status
            await axios.post(
                "https://api.gammacareservices.com:5000/update-upload-status",
                {
                    google_id: userData?.sub,
                    google_name: userData?.name,
                    google_email: userData?.email,
                    has_uploaded: true,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*",
                    },
                },
            );
        } catch (error) {
            console.error("Error uploading or ranking files:", error);
            setErrorMessage("Failed to submit your resume!");
            setTimeout(() => {
                setErrorMessage("");
            }, 2000);
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
        const tags = await fetchHrTags(position.position_id);
        setHrTags(tags);
        setIsModalOpen(true);
    };

    const fetchPositions = async () => {
        try {
            const response = await axios.get("/open-positions");
            setPositions(response.data);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const fetchHrTags = async (positionId) => {
        try {
            const response = await axios.get(`/hr-tags/${positionId}`);
            return response.data.hr_tags;
        } catch (error) {
            console.error("Error fetching HR tags:", error);
            return "";
        }
    };

    useEffect(() => {
        if (loggedIn) {
            fetchPositions();
        }
    }, [loggedIn]);

    //Position Container
    const PositionsList = ({ positions, openModal, openViewAllModal }) => {
        return (
            <div className="position-container px-2 py-2 flex flex-col gap-4 items-center md:grid md:grid-cols-2 md:place-items-center  ">
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
    };

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
                        Skills:{" "}
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
                                        <strong>Qualifications</strong>
                                        <div className="border-2 h-fit w-56 md:w-[550px] lg:w-[900px] overflow-auto border-green-900 px-4 py-4 rounded-lg">
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
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                    onClick={handleUpload}
                                >
                                    Submit Application
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
