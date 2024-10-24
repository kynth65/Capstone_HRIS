import React, { useState, useEffect } from "react";
import "../styles/onboarding.css";
import axiosClient from "../axiosClient";

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const [candidates, setCandidates] = useState([]);
    const [success, setSuccess] = useState("");
    const [candidateId, setCandidateId] = useState(null);
    const [showSchedule, setShowSchedule] = useState();
    const [showExamSchedule, setShowExamSchedule] = useState();
    const [showOrientationSchedule, setShowOrientationSchedule] = useState();
    const [showSendEmail, setShowSendEmail] = useState();
    const [showProceedSchedule, setShowProceedSchedule] = useState();
    const [showCandidateModal, setShowCandidateModal] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sentEmails, setSentEmails] = useState([]);
    const [showInterviewCandidateModal, setShowInterviewCandidateModal] =
        useState(false);
    const [selectedInterviewCandidate, setSelectedInterviewCandidate] =
        useState(null);
    const [showCreateCandidateModal, setShowCreateCandidateModal] =
        useState(false);
    const [showExamCandidateModal, setShowExamCandidateModal] = useState(false);
    const [selectedExamCandidate, setSelectedExamCandidate] = useState(null);
    const [showOrientationCandidateModal, setShowOrientationCandidateModal] =
        useState(false);
    const [selectedOrientationCandidate, setSelectedOrientationCandidate] =
        useState(null);
    const [showProbationaryCandidateModal, setShowProbationaryCandidateModal] =
        useState(false);
    const [selectedProbationaryCandidate, setSelectedProbationaryCandidate] =
        useState(null);
    const [showRegularCandidateModal, setShowRegularCandidateModal] =
        useState(false);
    const [selectedRegularCandidate, setSelectedRegularCandidate] =
        useState(null);
    const [newCandidate, setNewCandidate] = useState({
        name: "",
        email: "",
        job_position: "",
        time: "",
        date: "",
        hr_name: "",
        position: "",
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = () => {
        axiosClient
            .post("/candidates")
            .then((response) => {
                // Check if response data is an array
                if (Array.isArray(response.data)) {
                    setCandidates(response.data);
                } else {
                    console.error(
                        "Fetched data is not an array:",
                        response.data,
                    );
                }
            })
            .catch((error) =>
                console.error("Error fetching candidates:", error),
            );
    };
    const handleCloseModal = () => {
        setShowCreateCandidateModal(false);
    };
    const handleCreateCandidates = () => {
        setShowCreateCandidateModal(true);
    };
    const handleSchedule = (candidate_id) => {
        setCandidateId(candidate_id);
        setShowSchedule(true);
    };
    const handleSendEmail = (candidate_id) => {
        setCandidateId(candidate_id);
        setShowSendEmail(true);
    };
    const handleExamSchedule = (candidate_id) => {
        setCandidateId(candidate_id);
        setShowExamSchedule(true);
    };

    const handleProceedSchedule = (candidate_id) => {
        setCandidateId(candidate_id);
        setShowProceedSchedule(true);
    };

    const handleTriggerOnboarding = (event, candidateId) => {
        event.preventDefault();
        setLoading(true);
        axiosClient
            .post(`/trigger-onboarding/${candidateId}`, {
                date: newCandidate.date,
                time: newCandidate.time,
                hr_name: newCandidate.hr_name,
                position: newCandidate.position,
            })
            .then((response) => {
                setSuccess("Email sent successfully!");
                const updatedSentEmails = [...sentEmails, candidateId];
                setSentEmails(updatedSentEmails);
                localStorage.setItem(
                    "sentEmails",
                    JSON.stringify(updatedSentEmails),
                );
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates(); // Refresh list of candidates
                setShowCandidateModal(false);
                setShowSendEmail(false);
                // Clear newCandidate fields after submission
                setNewCandidate({
                    date: "",
                    time: "",
                    hr_name: "",
                    position: "",
                });
            })
            .catch((error) => {
                console.error("Error triggering onboarding:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleInterviewPassed = (id) => {
        setLoading(true);
        axiosClient
            .post(`/interview-passed/${id}`)
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error triggering onboarding:", error),
            )
            .finally(() => setLoading(false)); // Reset loading state
    };

    const handleInterviewDeclined = (id) => {
        setLoading(true);
        axiosClient
            .post(`/interview-declined/${id}`)
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error triggering onboarding:", error),
            )
            .finally(() => setLoading(false));
    };

    const handleFinalInterview = (event, candidateId) => {
        event.preventDefault();
        setLoading(true);
        axiosClient
            .post(`/final-interview/${candidateId}/`, newCandidate)
            .then((response) => {
                setSuccess(
                    "Email sent for final interview schedule successfully!",
                );
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                setNewCandidate({ ...newCandidate, time: "", date: "" });
                fetchCandidates();
                setShowSchedule(false);
            })
            .catch((error) => console.error("Error updating candidate:", error))
            .finally(() => setLoading(false));
    };

    const handleExam = (event, candidateId) => {
        event.preventDefault();
        axiosClient
            .post(`/exam/${candidateId}/`, newCandidate)
            .then((response) => {
                setSuccess(
                    "Email sent for final interview schedule is successfully!",
                );
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                setNewCandidate({
                    ...newCandidate,
                    time: "",
                    date: "",
                });
                fetchCandidates();
                setShowExamSchedule(false);
            })
            .catch((error) => {
                console.error("Error updating candidate:", error);
            });
    };

    const handleExamPassed = (event, candidateId) => {
        event.preventDefault(); // Prevent default form submission
        axiosClient
            .post(`/exam-passed/${candidateId}/`, newCandidate)
            .then((response) => {
                setSuccess(
                    "Email sent for orientation schedule is successfully!",
                );
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                setNewCandidate({
                    ...newCandidate,
                    time: "",
                    date: "",
                });
                setShowProceedSchedule(false);
                fetchCandidates();
            })
            .catch((error) => {
                console.error("Error updating candidate:", error);
            });
    };
    const handleExamFailed = (id) => {
        axiosClient
            .post(`/exam-failed/${id}`)
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error triggering onboarding:", error),
            );
    };
    const handleProbationary = (id) => {
        setLoading(true);
        axiosClient
            .post(`/orientation/${id}`)
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error triggering onboarding:", error),
            )
            .finally(() => setLoading(false)); // Reset loading state
    };

    const handleRegular = (id) => {
        setLoading(true);
        axiosClient
            .post(`/probationary/${id}`)
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error triggering onboarding:", error),
            )
            .finally(() => setLoading(false)); // Reset loading state
    };
    const handleRegularEmployee = async (candidateId) => {
        setLoading(true);
        try {
            const response = await axiosClient.post(
                `/candidates/${candidateId}/notify-regular`,
            );
            setSuccess(response.data.message);
            setTimeout(() => {
                setSuccess("");
            }, 2000);
        } catch (error) {
            console.error("There was an error sending the email:", error);
            alert("Failed to send the notification email.");
        } finally {
            setLoading(false);
        }
    };

    const handleStepClick = (selectedStep) => {
        setStep(selectedStep); // Set the clicked step as the current step
    };

    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setShowCandidateModal(true);
    };

    const handleViewInterviewCandidate = (candidate) => {
        setSelectedInterviewCandidate(candidate);
        setShowInterviewCandidateModal(true);
    };

    const handleViewExamCandidate = (candidate) => {
        setSelectedExamCandidate(candidate);
        setShowExamCandidateModal(true);
    };

    const handleViewOrientationCandidate = (candidate) => {
        setSelectedOrientationCandidate(candidate);
        setShowOrientationCandidateModal(true);
    };

    const handleViewProbationaryCandidate = (candidate) => {
        setSelectedProbationaryCandidate(candidate);
        setShowProbationaryCandidateModal(true);
    };

    const handleViewRegularCandidate = (candidate) => {
        setSelectedRegularCandidate(candidate);
        setShowRegularCandidateModal(true);
    };

    useEffect(() => {
        const savedSentEmails =
            JSON.parse(localStorage.getItem("sentEmails")) || [];
        setSentEmails(savedSentEmails);
    }, []);
    return (
        <>
            <div className="text-start">
                <nav className="mb-6 grid grid-cols-2 md:grid-cols-2 xl:grid-cols-6 gap-2">
                    <button
                        className={`navButton ${step === 1 ? "active" : ""}`}
                        onClick={() => handleStepClick(1)}
                    >
                        Application
                    </button>
                    <button
                        className={`navButton ${step === 2 ? "active" : ""}`}
                        onClick={() => handleStepClick(2)}
                    >
                        Interview
                    </button>
                    <button
                        className={`navButton ${step === 3 ? "active" : ""}`}
                        onClick={() => handleStepClick(3)}
                    >
                        Exam
                    </button>
                    <button
                        className={`navButton ${step === 4 ? "active" : ""}`}
                        onClick={() => handleStepClick(4)}
                    >
                        Orientation
                    </button>
                    <button
                        className={`navButton ${step === 5 ? "active" : ""}`}
                        onClick={() => handleStepClick(5)}
                    >
                        Probationary
                    </button>
                    <button
                        className={`navButton ${step === 6 ? "active" : ""}`}
                        onClick={() => handleStepClick(6)}
                    >
                        Regular
                    </button>
                </nav>
            </div>
            <div className="h-[600px] bg-white rounded-2xl">
                <div>
                    {success && (
                        <div className="successMessageDiv">
                            <p>{success}</p>
                        </div>
                    )}
                    {/* Step 1: Employee Overview */}
                    {step === 1 && (
                        <div className="bg-white rounded-lg p-6 mb-2">
                            <div className="flex justify-between items-center ">
                                <h2 className="flex-1 text-2xl font-bold text-gray-800">
                                    Candidates
                                </h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg">
                                    <thead className="bg-gray-200 text-gray-700 text-left">
                                        <tr>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Application",
                                                )
                                                .map((candidate) => (
                                                    <tr
                                                        key={candidate.id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                            {candidate.name}
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                            {candidate.email}
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                            {
                                                                candidate.job_position
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                            <div className="flex justify-center  space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                                <button
                                                                    className=" w-full md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                    onClick={() =>
                                                                        handleViewCandidate(
                                                                            candidate,
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className={`hidden md:block px-4 py-2 rounded text-white font-medium transition-all ${
                                                                        sentEmails.includes(
                                                                            candidate.id,
                                                                        )
                                                                            ? "bg-gray-400 cursor-not-allowed"
                                                                            : "bg-green-600 hover:bg-green-700"
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleSendEmail(
                                                                            candidate.id,
                                                                        )
                                                                    }
                                                                    disabled={sentEmails.includes(
                                                                        candidate.id,
                                                                    )} // Disable button if email is sent
                                                                >
                                                                    {sentEmails.includes(
                                                                        candidate.id,
                                                                    )
                                                                        ? "Email Sent"
                                                                        : "Send Email"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center py-4"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showCandidateModal && selectedCandidate && (
                        <div
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                            onClick={() => setShowCandidateModal(false)}
                        >
                            <div
                                className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mt-3 text-center text-base">
                                    <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                        Candidate Details
                                    </h3>
                                    <div className="mt-2 px-7 py-3 text-left">
                                        <p className="text-gray-700">
                                            <strong>Name:</strong>{" "}
                                            {selectedCandidate.name}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Email:</strong>{" "}
                                            {selectedCandidate.email}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Job Position:</strong>{" "}
                                            {selectedCandidate.job_position}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 space-x-4 mt-4">
                                        <button
                                            className="bg-green-600 px-4 py-2 rounded text-white font-medium hover:bg-green-700 transition-all"
                                            onClick={() =>
                                                handleSendEmail(
                                                    selectedCandidate.id,
                                                )
                                            }
                                        >
                                            Send Email
                                        </button>
                                        <button
                                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                setShowCandidateModal(false)
                                            }
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showSendEmail && (
                        <div className="modal fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black relative">
                                <form
                                    onSubmit={(event) =>
                                        handleTriggerOnboarding(
                                            event,
                                            candidateId,
                                        )
                                    }
                                    className="space-y-4"
                                >
                                    <h3 className="text-2xl font-semibold mb-4 text-center">
                                        Set Schedule for Invitation
                                    </h3>

                                    {/* Date Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCandidate.date}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>

                                    {/* Time Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newCandidate.time}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    time: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    {/* Time Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Email Sender Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newCandidate.hr_name}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    hr_name: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    {/* Time Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Sender's Position
                                        </label>
                                        <input
                                            type="text"
                                            value={newCandidate.position}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    position: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>

                                    {/* Save/Send Button */}
                                    <div className="flex justify-center space-x-4">
                                        <button
                                            type="submit"
                                            className="bg-green-900 hover:bg-white text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                                            disabled={loading}
                                        >
                                            {sentEmails.includes(candidateId)
                                                ? "Email Sent"
                                                : loading
                                                  ? "Sending..."
                                                  : "Save / Send email"}
                                        </button>
                                        <button
                                            className="bg-red-700 hover:bg-white text-white py-2 px-4 rounded border-2 border-red-700 transition hover:text-red-700"
                                            onClick={() =>
                                                setShowSendEmail(false)
                                            }
                                            disabled={loading}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Interview Candidates */}
                    {step === 2 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Interview
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg">
                                    <thead className="bg-gray-200 text-gray-700 text-left">
                                        <tr>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Interview Schedule
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Interview",
                                                )
                                                .map((candidate) => {
                                                    // Combine date and time into a single Date object
                                                    const interviewDateTime =
                                                        new Date(
                                                            `${candidate.date}T${candidate.time}`,
                                                        );
                                                    const currentTime =
                                                        new Date(); // Get the current date and time

                                                    // Disable buttons if the interview date and time is in the future
                                                    const isFutureInterview =
                                                        interviewDateTime >
                                                        currentTime;

                                                    return (
                                                        <tr
                                                            key={candidate.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {candidate.name}
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {
                                                                    candidate.email
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {
                                                                    candidate.job_position
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                <div>
                                                                    <div>
                                                                        Date:{" "}
                                                                        {new Date(
                                                                            candidate.date,
                                                                        ).toLocaleDateString(
                                                                            "en-US",
                                                                            {
                                                                                month: "long",
                                                                                day: "2-digit",
                                                                                year: "numeric",
                                                                            },
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        Time:{" "}
                                                                        {new Date(
                                                                            "1970-01-01T" +
                                                                                candidate.time,
                                                                        ).toLocaleTimeString(
                                                                            "en-US",
                                                                            {
                                                                                hour: "numeric",
                                                                                minute: "2-digit",
                                                                                hour12: true,
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm space-x-2">
                                                                <div className="flex space-x-1">
                                                                    <button
                                                                        className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                        onClick={() =>
                                                                            handleViewInterviewCandidate(
                                                                                candidate,
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${isFutureInterview ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                                                                        onClick={() =>
                                                                            handleSchedule(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading ||
                                                                            isFutureInterview
                                                                        }
                                                                    >
                                                                        {loading
                                                                            ? "Loading..."
                                                                            : "Final Interview"}
                                                                    </button>

                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${isFutureInterview ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                                                                        onClick={() =>
                                                                            handleInterviewPassed(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading ||
                                                                            isFutureInterview
                                                                        }
                                                                    >
                                                                        {loading
                                                                            ? "Processing..."
                                                                            : "Accept"}
                                                                    </button>

                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${isFutureInterview ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                                                                        onClick={() =>
                                                                            handleInterviewDeclined(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading ||
                                                                            isFutureInterview
                                                                        }
                                                                    >
                                                                        {loading
                                                                            ? "Processing..."
                                                                            : "Decline"}
                                                                    </button>
                                                                </div>
                                                                {isFutureInterview && (
                                                                    <div className="text-sm text-yellow-500 mt-2">
                                                                        Status:
                                                                        Pending
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Interview Candidate Details Modal */}
                    {showInterviewCandidateModal &&
                        selectedInterviewCandidate && (
                            <div
                                className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                                onClick={() =>
                                    setShowInterviewCandidateModal(false)
                                }
                            >
                                <div
                                    className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                            Candidate Details
                                        </h3>
                                        <div className="mt-2 px-7 py-3 text-left">
                                            <p className="text-gray-700">
                                                <strong>Name:</strong>{" "}
                                                {
                                                    selectedInterviewCandidate.name
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Email:</strong>{" "}
                                                {
                                                    selectedInterviewCandidate.email
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Job Position:</strong>{" "}
                                                {
                                                    selectedInterviewCandidate.job_position
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Interview Date:</strong>{" "}
                                                {new Date(
                                                    selectedInterviewCandidate.date,
                                                ).toLocaleDateString("en-US", {
                                                    month: "long",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Interview Time:</strong>{" "}
                                                {new Date(
                                                    "1970-01-01T" +
                                                        selectedInterviewCandidate.time,
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "numeric",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex justify-center space-x-4 mt-4">
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                                onClick={() =>
                                                    handleSchedule(
                                                        selectedInterviewCandidate.id,
                                                    )
                                                }
                                            >
                                                Final Interview
                                            </button>
                                            <button
                                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                                                onClick={() =>
                                                    handleInterviewPassed(
                                                        selectedInterviewCandidate.id,
                                                    )
                                                }
                                            >
                                                Accept
                                            </button>
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                                onClick={() =>
                                                    handleInterviewDeclined(
                                                        selectedInterviewCandidate.id,
                                                    )
                                                }
                                            >
                                                Decline
                                            </button>
                                        </div>
                                        <button
                                            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                            onClick={() =>
                                                setShowInterviewCandidateModal(
                                                    false,
                                                )
                                            }
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    {showSchedule && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black relative">
                                <form
                                    onSubmit={(event) =>
                                        handleFinalInterview(event, candidateId)
                                    }
                                    className="space-y-4"
                                >
                                    <h3 className="text-2xl font-semibold mb-4 text-center">
                                        Set Schedule for Final Interview
                                    </h3>

                                    {/* Close Icon */}
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() => setShowSchedule(false)}
                                    >
                                        &times;
                                    </span>

                                    {/* Date Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCandidate.date}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>

                                    {/* Time Input */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newCandidate.time}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    time: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>

                                    {/* Save/Send Button */}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-green-900 hover:bg-white text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                                        >
                                            Save / Send email
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Exam
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-left">
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center hidden md:table-cell">
                                                Exam Schedule
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Exam",
                                                )
                                                .map((candidate) => {
                                                    const examDateTime =
                                                        new Date(
                                                            `${candidate.date}T${candidate.time}`,
                                                        );
                                                    const currentTime =
                                                        new Date();
                                                    const isFutureExam =
                                                        examDateTime >
                                                        currentTime;

                                                    return (
                                                        <tr
                                                            key={candidate.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {candidate.name}
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.email
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.job_position
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                <div>
                                                                    <div>
                                                                        Date:{" "}
                                                                        {candidate.date
                                                                            ? new Date(
                                                                                  candidate.date,
                                                                              ).toLocaleDateString(
                                                                                  "en-US",
                                                                                  {
                                                                                      month: "long",
                                                                                      day: "2-digit",
                                                                                      year: "numeric",
                                                                                  },
                                                                              )
                                                                            : "Set Date"}
                                                                    </div>
                                                                    <div>
                                                                        Time:{" "}
                                                                        {candidate.time
                                                                            ? new Date(
                                                                                  "1970-01-01T" +
                                                                                      candidate.time,
                                                                              ).toLocaleTimeString(
                                                                                  "en-US",
                                                                                  {
                                                                                      hour: "numeric",
                                                                                      minute: "2-digit",
                                                                                      hour12: true,
                                                                                  },
                                                                              )
                                                                            : "Set Time"}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 space-x-2 border-b border-gray-200 text-sm">
                                                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                                    <button
                                                                        className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                        onClick={() =>
                                                                            handleViewExamCandidate(
                                                                                candidate,
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${isFutureExam ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                                                                        onClick={() =>
                                                                            handleExamSchedule(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isFutureExam
                                                                        }
                                                                    >
                                                                        Schedule
                                                                        for Exam
                                                                    </button>
                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${
                                                                            isFutureExam ||
                                                                            !candidate.date ||
                                                                            !candidate.time
                                                                                ? "bg-green-300 cursor-not-allowed"
                                                                                : "bg-green-500 hover:bg-green-600"
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleProceedSchedule(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isFutureExam ||
                                                                            !candidate.date ||
                                                                            !candidate.time
                                                                        }
                                                                    >
                                                                        Passed
                                                                    </button>
                                                                    <button
                                                                        className={`py-1 px-3 rounded-md text-sm text-white ${
                                                                            isFutureExam ||
                                                                            !candidate.date ||
                                                                            !candidate.time
                                                                                ? "bg-red-300 cursor-not-allowed"
                                                                                : "bg-red-500 hover:bg-red-600"
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleExamFailed(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isFutureExam ||
                                                                            !candidate.date ||
                                                                            !candidate.time
                                                                        }
                                                                    >
                                                                        Failed
                                                                    </button>
                                                                </div>
                                                                {isFutureExam && (
                                                                    <div className="text-sm text-yellow-500 mt-2">
                                                                        Status:
                                                                        Pending
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center py-4"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showExamCandidateModal && selectedExamCandidate && (
                        <div
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                            onClick={() => setShowExamCandidateModal(false)}
                        >
                            <div
                                className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mt-3 text-center">
                                    <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                        Candidate Details
                                    </h3>
                                    <div className="mt-2 px-7 py-3 text-left text-base">
                                        <p className="text-gray-700">
                                            <strong>Name:</strong>{" "}
                                            {selectedExamCandidate.name}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Email:</strong>{" "}
                                            {selectedExamCandidate.email}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Job Position:</strong>{" "}
                                            {selectedExamCandidate.job_position}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Exam Date:</strong>{" "}
                                            {selectedExamCandidate.date
                                                ? new Date(
                                                      selectedExamCandidate.date,
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          month: "long",
                                                          day: "2-digit",
                                                          year: "numeric",
                                                      },
                                                  )
                                                : "Not set"}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Exam Time:</strong>{" "}
                                            {selectedExamCandidate.time
                                                ? new Date(
                                                      "1970-01-01T" +
                                                          selectedExamCandidate.time,
                                                  ).toLocaleTimeString(
                                                      "en-US",
                                                      {
                                                          hour: "numeric",
                                                          minute: "2-digit",
                                                          hour12: true,
                                                      },
                                                  )
                                                : "Not set"}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3  mt-4">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                handleExamSchedule(
                                                    selectedExamCandidate.id,
                                                )
                                            }
                                        >
                                            Schedule for Exam
                                        </button>
                                        <button
                                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                handleProceedSchedule(
                                                    selectedExamCandidate.id,
                                                )
                                            }
                                        >
                                            Passed
                                        </button>
                                        <button
                                            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                handleExamFailed(
                                                    selectedExamCandidate.id,
                                                )
                                            }
                                        >
                                            Failed
                                        </button>
                                        <button
                                            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                setShowExamCandidateModal(false)
                                            }
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showExamSchedule && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black relative">
                                <form
                                    onSubmit={(event) =>
                                        handleExam(event, candidateId)
                                    }
                                    className="space-y-4"
                                >
                                    <h3 className="text-2xl font-semibold mb-4 text-center">
                                        Set Schedule for Final Interview
                                    </h3>
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowExamSchedule(false)
                                        }
                                    >
                                        &times;
                                    </span>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCandidate.date}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newCandidate.time}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    time: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-green-900 hover:bg-white text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Sending..."
                                                : "Save / Send email"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {showProceedSchedule && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-black relative">
                                <form
                                    onSubmit={(event) =>
                                        handleExamPassed(event, candidateId)
                                    }
                                    className="space-y-4"
                                >
                                    <h3 className="text-2xl font-semibold mb-4 text-center">
                                        Set Schedule for Orientation
                                    </h3>
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowProceedSchedule(false)
                                        }
                                    >
                                        &times;
                                    </span>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newCandidate.date}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    date: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">
                                            Select Time
                                        </label>
                                        <input
                                            type="time"
                                            value={newCandidate.time}
                                            onChange={(e) =>
                                                setNewCandidate({
                                                    ...newCandidate,
                                                    time: e.target.value,
                                                })
                                            }
                                            required
                                            className="w-full p-2 border border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="bg-green-900 hover:bg-white text-white py-2 px-4 rounded border-2 border-green-900 transition hover:text-green-900"
                                            disabled={loading}
                                        >
                                            {loading
                                                ? "Sending..."
                                                : "Save / Send email"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Orientation
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-left">
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Orientation Schedule
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Orientation",
                                                )
                                                .map((candidate) => {
                                                    const orientationDateTime =
                                                        new Date(
                                                            `${candidate.date}T${candidate.time}`,
                                                        );
                                                    const currentTime =
                                                        new Date();
                                                    const isFutureOrientation =
                                                        orientationDateTime >
                                                        currentTime;

                                                    return (
                                                        <tr
                                                            key={candidate.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {candidate.name}
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.email
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.job_position
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                <div>
                                                                    <div>
                                                                        Date:{" "}
                                                                        {candidate.date
                                                                            ? new Date(
                                                                                  candidate.date,
                                                                              ).toLocaleDateString(
                                                                                  "en-US",
                                                                                  {
                                                                                      month: "long",
                                                                                      day: "2-digit",
                                                                                      year: "numeric",
                                                                                  },
                                                                              )
                                                                            : "Set Date"}
                                                                    </div>
                                                                    <div>
                                                                        Time:{" "}
                                                                        {candidate.time
                                                                            ? new Date(
                                                                                  "1970-01-01T" +
                                                                                      candidate.time,
                                                                              ).toLocaleTimeString(
                                                                                  "en-US",
                                                                                  {
                                                                                      hour: "numeric",
                                                                                      minute: "2-digit",
                                                                                      hour12: true,
                                                                                  },
                                                                              )
                                                                            : "Set Time"}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                                    <button
                                                                        className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                        onClick={() =>
                                                                            handleViewOrientationCandidate(
                                                                                candidate,
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        className={`hidden md:block bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm ${
                                                                            isFutureOrientation ||
                                                                            loading
                                                                                ? "cursor-not-allowed bg-blue-300"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleProbationary(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isFutureOrientation ||
                                                                            loading
                                                                        }
                                                                    >
                                                                        {loading
                                                                            ? "Processing..."
                                                                            : "Proceed"}
                                                                    </button>
                                                                </div>
                                                                {isFutureOrientation && (
                                                                    <div className="text-sm text-yellow-500 mt-2">
                                                                        Status:
                                                                        Pending
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="text-center py-4"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Orientation Candidate Details Modal */}
                    {showOrientationCandidateModal &&
                        selectedOrientationCandidate && (
                            <div
                                className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                                onClick={() =>
                                    setShowOrientationCandidateModal(false)
                                }
                            >
                                <div
                                    className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                            Candidate Details
                                        </h3>
                                        <div className="mt-2 px-7 py-3 text-left text-base">
                                            <p className="text-gray-700">
                                                <strong>Name:</strong>{" "}
                                                {
                                                    selectedOrientationCandidate.name
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Email:</strong>{" "}
                                                {
                                                    selectedOrientationCandidate.email
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Job Position:</strong>{" "}
                                                {
                                                    selectedOrientationCandidate.job_position
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>
                                                    Orientation Date:
                                                </strong>{" "}
                                                {selectedOrientationCandidate.date
                                                    ? new Date(
                                                          selectedOrientationCandidate.date,
                                                      ).toLocaleDateString(
                                                          "en-US",
                                                          {
                                                              month: "long",
                                                              day: "2-digit",
                                                              year: "numeric",
                                                          },
                                                      )
                                                    : "Not set"}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>
                                                    Orientation Time:
                                                </strong>{" "}
                                                {selectedOrientationCandidate.time
                                                    ? new Date(
                                                          "1970-01-01T" +
                                                              selectedOrientationCandidate.time,
                                                      ).toLocaleTimeString(
                                                          "en-US",
                                                          {
                                                              hour: "numeric",
                                                              minute: "2-digit",
                                                              hour12: true,
                                                          },
                                                      )
                                                    : "Not set"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 space-x-4 mt-4">
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                                onClick={() =>
                                                    handleProbationary(
                                                        selectedOrientationCandidate.id,
                                                    )
                                                }
                                            >
                                                Proceed
                                            </button>
                                            <button
                                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                                onClick={() =>
                                                    setShowOrientationCandidateModal(
                                                        false,
                                                    )
                                                }
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {step === 5 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Probationary
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-left">
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Probationary",
                                                )
                                                .map((candidate) => {
                                                    const probationaryDateTime =
                                                        new Date(
                                                            `${candidate.date}T${candidate.time}`,
                                                        );
                                                    const currentTime =
                                                        new Date();
                                                    const isFutureProbationary =
                                                        probationaryDateTime >
                                                        currentTime;

                                                    return (
                                                        <tr
                                                            key={candidate.id}
                                                            className="hover:bg-gray-50 transition-colors"
                                                        >
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                {candidate.name}
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.email
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                                {
                                                                    candidate.job_position
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                                    <button
                                                                        className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                        onClick={() =>
                                                                            handleViewProbationaryCandidate(
                                                                                candidate,
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                    </button>
                                                                    <button
                                                                        className={`hidden md:block bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm ${
                                                                            isFutureProbationary ||
                                                                            loading
                                                                                ? "cursor-not-allowed bg-blue-300"
                                                                                : ""
                                                                        }`}
                                                                        onClick={() =>
                                                                            handleRegular(
                                                                                candidate.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isFutureProbationary ||
                                                                            loading
                                                                        }
                                                                    >
                                                                        {loading
                                                                            ? "Sending..."
                                                                            : "Send Email"}
                                                                    </button>
                                                                </div>
                                                                {isFutureProbationary && (
                                                                    <div className="text-sm text-yellow-500 mt-2">
                                                                        Status:
                                                                        Pending
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center py-4"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Probationary Candidate Details Modal */}
                    {showProbationaryCandidateModal &&
                        selectedProbationaryCandidate && (
                            <div
                                className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                                onClick={() =>
                                    setShowProbationaryCandidateModal(false)
                                }
                            >
                                <div
                                    className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="mt-3 text-center">
                                        <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                            Candidate Details
                                        </h3>
                                        <div className="mt-2 px-7 py-3 text-left text-base">
                                            <p className="text-gray-700">
                                                <strong>Name:</strong>{" "}
                                                {
                                                    selectedProbationaryCandidate.name
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Email:</strong>{" "}
                                                {
                                                    selectedProbationaryCandidate.email
                                                }
                                            </p>
                                            <p className="text-gray-700">
                                                <strong>Job Position:</strong>{" "}
                                                {
                                                    selectedProbationaryCandidate.job_position
                                                }
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 space-x-4 mt-4">
                                            <button
                                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                                onClick={() =>
                                                    handleRegular(
                                                        selectedProbationaryCandidate.id,
                                                    )
                                                }
                                            >
                                                Send Email
                                            </button>
                                            <button
                                                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                                onClick={() =>
                                                    setShowProbationaryCandidateModal(
                                                        false,
                                                    )
                                                }
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    {step === 6 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Regular
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="employee-table w-full table-auto text-black bg-white rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-200 text-gray-700 text-left">
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Candidate
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300 hidden md:table-cell">
                                                Job Position
                                            </th>
                                            <th className="px-6 py-3 border-b-2 border-gray-300">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {Array.isArray(candidates) &&
                                        candidates.length > 0 ? (
                                            candidates
                                                .filter(
                                                    (candidate) =>
                                                        candidate.recruitment_stage ===
                                                        "Regular",
                                                )
                                                .map((candidate) => (
                                                    <tr
                                                        key={candidate.id}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                            {candidate.name}
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                            {candidate.email}
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm hidden md:table-cell">
                                                            {
                                                                candidate.job_position
                                                            }
                                                        </td>
                                                        <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                                                <button
                                                                    className="md:hidden bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                                                    onClick={() =>
                                                                        handleViewRegularCandidate(
                                                                            candidate,
                                                                        )
                                                                    }
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className={`hidden md:block bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm ${loading ? "cursor-not-allowed bg-blue-300" : ""}`}
                                                                    onClick={() =>
                                                                        handleRegularEmployee(
                                                                            candidate.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    {loading
                                                                        ? "Sending..."
                                                                        : "Send Email"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="4"
                                                    className="text-center py-4"
                                                >
                                                    No candidates available.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Regular Candidate Details Modal */}
                    {showRegularCandidateModal && selectedRegularCandidate && (
                        <div
                            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
                            onClick={() => setShowRegularCandidateModal(false)}
                        >
                            <div
                                className="relative top-20 mx-auto p-5 border w-11/12 sm:w-96 shadow-lg rounded-md bg-white"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="mt-3 text-center">
                                    <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-2">
                                        Candidate Details
                                    </h3>
                                    <div className="mt-2 px-7 py-3 text-left text-base">
                                        <p className="text-gray-700">
                                            <strong>Name:</strong>{" "}
                                            {selectedRegularCandidate.name}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Email:</strong>{" "}
                                            {selectedRegularCandidate.email}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Job Position:</strong>{" "}
                                            {
                                                selectedRegularCandidate.job_position
                                            }
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 space-x-4 mt-4">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                                            onClick={() =>
                                                handleTriggerOnboarding(
                                                    selectedRegularCandidate.id,
                                                )
                                            }
                                        >
                                            Send Email
                                        </button>
                                        <button
                                            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                                            onClick={() =>
                                                setShowRegularCandidateModal(
                                                    false,
                                                )
                                            }
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Onboarding;
