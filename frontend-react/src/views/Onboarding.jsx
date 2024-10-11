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
    const [showCreateCandidateModal, setShowCreateCandidateModal] =
        useState(false);
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

        axiosClient
            .post(`/trigger-onboarding/${candidateId}`, {
                date: newCandidate.date,
                time: newCandidate.time,
                hr_name: newCandidate.hr_name,
                position: newCandidate.position,
            })
            .then((response) => {
                setSuccess("Email sent successfully!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                fetchCandidates(); // refresh list of candidates
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
            });
    };

    const handleInterviewPassed = (id) => {
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
            );
    };
    const handleInterviewDeclined = (id) => {
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
            );
    };
    const handleFinalInterview = (event, candidateId) => {
        event.preventDefault(); // Prevent default form submission
        axiosClient
            .post(`/final-interview/${candidateId}/`, newCandidate)
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
                setShowSchedule(false);
            })
            .catch((error) => {
                console.error("Error updating candidate:", error);
            });
    };
    const handleCreateCandidate = (e) => {
        e.preventDefault();
        axiosClient
            .post("/candidate", newCandidate)
            .then((response) => {
                setSuccess("Candidate created!");
                setTimeout(() => {
                    setSuccess("");
                }, 3000);
                setNewCandidate({
                    name: "",
                    email: "",
                    time: "",
                    date: "",
                    job_position: "",
                });
                setShowCreateCandidateModal(false);
                fetchCandidates();
            })
            .catch((error) =>
                console.error("Error creating candidate:", error),
            );
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
            );
    };
    const handleRegular = (id) => {
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
            );
    };

    const handleStepClick = (selectedStep) => {
        setStep(selectedStep); // Set the clicked step as the current step
    };
    return (
        <>
            <div className="flex  w-full transition-all mb-8">
                <span
                    onClick={() => handleStepClick(1)} // Set step to 1 on click
                    className={`flex-grow px-2 py-4 cursor-pointer rounded-l-xl ${
                        step === 1
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Application
                </span>
                <span
                    onClick={() => handleStepClick(2)} // Set step to 2 on click
                    className={`flex-grow px-2 py-4 cursor-pointer ${
                        step === 2
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Interview
                </span>
                <span
                    onClick={() => handleStepClick(3)} // Set step to 3 on click
                    className={`flex-grow px-2 py-4 cursor-pointer ${
                        step === 3
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Exam
                </span>
                <span
                    onClick={() => handleStepClick(4)} // Set step to 4 on click
                    className={`flex-grow px-2 py-4 cursor-pointer ${
                        step === 4
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Orientation
                </span>
                <span
                    onClick={() => handleStepClick(5)} // Set step to 5 on click
                    className={`flex-grow px-2 py-4 cursor-pointer ${
                        step === 5
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Probationary
                </span>
                <span
                    onClick={() => handleStepClick(6)} // Set step to 6 on click
                    className={`flex-grow px-2 py-4 cursor-pointer rounded-r-xl ${
                        step === 6
                            ? "bg-green-800 text-white px-8"
                            : "bg-neutral-300 text-gray-600"
                    }`}
                >
                    Finish
                </span>
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
                                <h2 className="flex-1 pl-10 text-2xl font-bold text-gray-800">
                                    Candidates
                                </h2>
                            </div>

                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
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
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        <button
                                                            className="bg-green-600 px-5 py-2 rounded-md text-white font-medium hover:bg-green-700 transition-all"
                                                            onClick={() =>
                                                                handleSendEmail(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Send Email
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showSendEmail && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
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

                                    {/* Close Icon */}
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() => setShowSendEmail(false)}
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

                    {/* Step 2: Interview Candidates */}
                    {step === 2 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Interview
                            </h2>

                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead className="">
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Job Position
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Interview Schedule
                                        </th>

                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white ">
                                    {Array.isArray(candidates) &&
                                    candidates.length > 0 ? (
                                        candidates
                                            .filter(
                                                (candidate) =>
                                                    candidate.recruitment_stage ===
                                                    "Interview",
                                            )
                                            .map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    className="hover:bg-gray-50 transition-colors "
                                                >
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
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

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm  space-x-2">
                                                        <div className="flex space-x-1">
                                                            <button
                                                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                                                                onClick={() =>
                                                                    handleSchedule(
                                                                        candidate.id,
                                                                    )
                                                                }
                                                            >
                                                                Final Interview
                                                            </button>
                                                            <button
                                                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md text-sm"
                                                                onClick={() =>
                                                                    handleInterviewPassed(
                                                                        candidate.id,
                                                                    )
                                                                }
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md text-sm"
                                                                onClick={() =>
                                                                    handleInterviewDeclined(
                                                                        candidate.id,
                                                                    )
                                                                }
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
                                            Job Position
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300 text-center">
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
                                            .map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
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
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-all"
                                                            onClick={() =>
                                                                handleExamSchedule(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Schedule for Exam
                                                        </button>
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-all"
                                                            onClick={() =>
                                                                handleProceedSchedule(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Passed
                                                        </button>
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md font-medium transition-all"
                                                            onClick={() =>
                                                                handleExamFailed(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Failed
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
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

                                    {/* Close Icon */}
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowExamSchedule(false)
                                        }
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

                                    {/* Close Icon */}
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowProceedSchedule(false)
                                        }
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

                                    {/* Close Icon */}
                                    <span
                                        className="absolute top-2 right-2 cursor-pointer text-xl font-bold text-gray-600 hover:text-gray-900"
                                        onClick={() =>
                                            setShowProceedSchedule(false)
                                        }
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

                    {step === 4 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Orientation
                            </h2>
                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Email
                                        </th>

                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Job Position
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
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
                                            .map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
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
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                                                            onClick={() =>
                                                                handleProbationary(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Proceed
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {step === 5 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Probationary
                            </h2>
                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Email
                                        </th>

                                        <th className="px-6 py-3 border-b-2 border-gray-300">
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
                                            .map((candidate) => (
                                                <tr
                                                    key={candidate.id}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.name}
                                                    </td>
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                                                            onClick={() =>
                                                                handleRegular(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Send Email
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {step === 6 && (
                        <div className="bg-white rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                Candidates for Regular
                            </h2>
                            <table className="w-full h-[380px] table-auto text-black bg-white shadow-md rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-gray-200 text-gray-700 text-left">
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Candidate
                                        </th>
                                        <th className="px-6 py-3 border-b-2 border-gray-300">
                                            Email
                                        </th>

                                        <th className="px-6 py-3 border-b-2 border-gray-300">
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
                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.email}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        {candidate.job_position}
                                                    </td>

                                                    <td className="px-6 py-4 border-b border-gray-200 text-sm">
                                                        <button
                                                            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm"
                                                            onClick={() =>
                                                                handleTriggerOnboarding(
                                                                    candidate.id,
                                                                )
                                                            }
                                                        >
                                                            Send Email
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                No candidates available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="flex justify-between w-full ">
                    {step > 1 && (
                        <button
                            className="px-10 py-4 bg-green-800 font-kodchasan hover:bg-green-900 rounded-r-lg"
                            onClick={prevStep}
                        >
                            Back
                        </button>
                    )}
                    {step == 1 && <span></span>}
                    {step < 6 && (
                        <button
                            className="right-[100px] px-10 py-4 bg-green-800 font-kodchasan hover:bg-green-900 rounded-l-lg"
                            onClick={nextStep}
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default Onboarding;
