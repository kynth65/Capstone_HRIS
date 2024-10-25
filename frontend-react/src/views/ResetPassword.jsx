import React, { useState } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import "../styles/applicantPortal.css";
import "../styles/openPosition.css";
import { IoIosArrowRoundBack } from "react-icons/io";

function ResetPassword() {
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { token } = useParams();
    const personalEmail = new URLSearchParams(window.location.search).get(
        "personal_email",
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post("/reset-password", {
                token,
                personal_email: personalEmail,
                password,
                password_confirmation: passwordConfirmation,
            });
            setMessage(response.data.message);
            setTimeout(() => {
                setMessage("");
            }, 2000);
        } catch (error) {
            setError(error.response.data.message);
            setTimeout(() => {
                setError("");
            }, 2000);
        }
    };

    return (
        <div className="h-screen">
            <div className="relative flex justify-center items-center h-full">
                {/* Back Arrow */}
                <div className="absolute left-2 top-4">
                    <Link to="/login">
                        <IoIosArrowRoundBack className="ml-3 size-14" />
                    </Link>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center bg-white rounded-xl w-full h-fit py-20 max-w-md">
                    {/* Header */}
                    <h2 className="text-black text-2xl font-semibold uppercase pb-5">
                        Reset Password
                    </h2>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col items-center"
                    >
                        <label className="text-black font-semibold font-kodchasan text-lg">
                            Personal Email:
                        </label>
                        <input
                            className="w-72 h-12 rounded-lg font-semibold text-black lg:h-12"
                            type="email"
                            value={personalEmail}
                            readOnly
                        />

                        <label className="text-black font-semibold font-kodchasan text-lg mt-4">
                            New Password:
                        </label>
                        <input
                            className="w-72 h-12 rounded-lg text-black lg:h-12"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <label className="text-black font-semibold font-kodchasan text-lg mt-4">
                            Confirm New Password:
                        </label>
                        <input
                            className="w-72 h-12 rounded-lg text-black lg:h-12"
                            type="password"
                            value={passwordConfirmation}
                            onChange={(e) =>
                                setPasswordConfirmation(e.target.value)
                            }
                            required
                        />

                        <button
                            className="bg-green-900 w-40 py-3 rounded-lg text-base text-white border-2 border-white hover:bg-white hover:text-green-950 hover:border-2 hover:border-green-700 transition mt-6 active:bg-green-700 active:text-white"
                            type="submit"
                        >
                            Reset Password
                        </button>

                        <p className="message mt-4">
                            <Link to="/login">Login</Link>
                        </p>
                    </form>

                    {/* Error and Success Messages */}
                    {error && <div className="errorPopup mt-4">{error}</div>}
                    {message && (
                        <div className="successMessageDiv mt-4">
                            <p>{message}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
