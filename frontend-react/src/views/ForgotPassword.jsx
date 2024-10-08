import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // for redirecting
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import { IoIosArrowRoundBack } from "react-icons/io";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosClient.post("/forgot-password", {
                email,
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
        <>
            <div className="h-screen">
                <div className="relative flex justify-center items-center h-full">
                    {/* Back Arrow */}
                    <div className="absolute left-2 top-4">
                        <Link to="/login">
                            <IoIosArrowRoundBack className="ml-3 size-14" />
                        </Link>
                    </div>

                    {/* Main Content */}
                    <div className="flex flex-col items-center bg-white rounded-xl  w-full h-fit py-20 max-w-md">
                        {/* Header */}
                        <h2 className="text-black text-2xl font-semibold uppercase pb-5">
                            Forgot Password
                        </h2>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col items-center"
                        >
                            <label className="text-black font-kodchasan font-semibold text-base">
                                Email:
                            </label>
                            <input
                                className="userEmail w-72 h-12 rounded-lg font-kodchasan text-black lg:h-12"
                                type="email"
                                placeholder="Type your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <button
                                className="bg-green-900 w-32 py-3 font-kodchasan rounded-lg text-base text-white border-2 border-white hover:bg-white hover:text-green-950 hover:border-2 hover:border-green-700 transition active:bg-green-700 active:text-white"
                                type="submit"
                            >
                                Verify Email
                            </button>
                        </form>

                        {/* Error and Success Messages */}
                        {error && (
                            <div className="errorPopup mt-4">{error}</div>
                        )}
                        {message && (
                            <div className="successMessageDiv mt-4">
                                <p>{message}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default ForgotPassword;
