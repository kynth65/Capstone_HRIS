import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import axiosClient from "../axiosClient";
import "../styles/onboarding.css";

const PersonalDetails = () => {
    const [candidate, setCandidate] = useState(null);
    const [personalDetails, setPersonalDetails] = useState({
        phone: "", // Initialize phone with an empty string
        address: "", // Initialize address with an empty string
    });

    // Get the token from the query parameter
    const query = new URLSearchParams(useLocation().search);
    const token = query.get("token"); // Grabs token from the URL

    useEffect(() => {
        axiosClient
            .get(`/onboarding/auth/${token}`)
            .then((response) => {
                setCandidate(response.data);
            })
            .catch((error) =>
                console.error("Error fetching candidate:", error),
            );
    }, [token]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (candidate) {
            axiosClient
                .post(
                    `/onboarding/${candidate.id}/personal-details`,
                    personalDetails,
                )
                .then((response) => {
                    alert("Personal details submitted!");
                    // Move to next step
                })
                .catch((error) =>
                    console.error("Error submitting personal details:", error),
                );
        }
    };

    if (!candidate) return <div>Loading...</div>;

    return (
        <div className="container">
            <h2>
                Welcome, {candidate.name}! Please fill in your personal details.
            </h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={personalDetails.phone} // This is now controlled
                        onChange={(e) =>
                            setPersonalDetails({
                                ...personalDetails,
                                phone: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Address"
                        value={personalDetails.address} // This is now controlled
                        onChange={(e) =>
                            setPersonalDetails({
                                ...personalDetails,
                                address: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <button type="submit" className="btn btn-success">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default PersonalDetails;
