import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import "../styles/login.css";
import { useStateContext } from "../contexts/ContextProvider";
import { IoIosArrowRoundBack } from "react-icons/io";
import wideBackground from "../assets/images/gammacare short front background.jpeg";
import LogoImage from "../assets/images/GMSI Logo.png";
import CompleteProfileModal from "./CompleteProfileModal";
function Login() {
    const { setUser, setToken } = useStateContext(); // Use setUser and setToken from context
    const loggedIn = window.localStorage.getItem("isLoggedIn");
    const emailRef = useRef();
    const passwordRef = useRef();
    const [errors, setError] = useState(null);
    const navigate = useNavigate();
    const errorTimeoutRef = useRef(null);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const [tempToken, setTempToken] = useState(null);
    const [tempUser, setTempUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            setUser(storedUser); // Restore user from localStorage
            setToken(token); // Set token from localStorage
            navigateBasedOnRole(storedUser); // Navigate based on the user's position
        }
    }, [setUser, setToken, navigate]);

    const navigateBasedOnRole = (user) => {
        const hrPositions = [
            "Human Resource Manager",
            "Human Resource Assistant",
        ];

        const adminPositions = ["Admin"];

        if (hrPositions.includes(user.position)) {
            navigate("/dashboard");
        } else if (adminPositions.includes(user.position)) {
            navigate("/admin-dashboard");
        } else {
            navigate("/employee-dashboard");
        }
    };

    const checkMissingFields = (user) => {
        const requiredFields = [
            "date_of_birth",
            "marital_status",
            "nationality",
            "mothers_maiden_name",
            "fathers_name",
            "address",
            "city",
            "province",
            "postal_code",
            "country",
            // "personal_email",
            // "work_email",
            "home_phone",
            "emergency_contact_name",
            "emergency_contact_relationship",
            "emergency_contact_phone",
            "work_location",
            "highest_degree_earned",
            "field_of_study",
            "institution_name",
            "graduation_year",
            "work_history",
            "health_insurance_plan",
            "completed_training_programs",
            // "profile",
            "notes",
        ];

        const missingFields = requiredFields.filter(
            (field) =>
                user[field] === null ||
                user[field] === undefined ||
                user[field] === "",
        );
        console.log("Missing fields:", missingFields); // Log the missing fields to verify

        return missingFields.length > 0;
    };

    const onSubmit = (event) => {
        event.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        axiosClient
            .post("/login", payload)
            .then(({ data }) => {
                console.log("Login response user data:", data.user); // Log response to check
                if (checkMissingFields(data.user)) {
                    setTempUser(data.user); // Store user temporarily for profile completion
                    setShowCompleteProfile(true); // Show the modal
                } else {
                    handleLoginSuccess(data.token, data.user); // Log in directly if profile is complete
                }
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    setError(
                        response.data.errors || {
                            email: [response.data.message],
                        },
                    );
                    errorTimeoutRef.current = setTimeout(
                        () => setError(null),
                        4000,
                    );
                }
            });
    };

    const handleLoginSuccess = (token, user) => {
        setToken(token);
        setUser(user);
        localStorage.setItem("access_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", true);
        navigateBasedOnRole(user); // Navigate to the correct dashboard immediately
    };

    return (
        <div className="fadeInDown">
            <div className="absolute left-2 top-4">
                <Link to={"/"}>
                    <IoIosArrowRoundBack className="ml-3 size-14" />
                </Link>
            </div>
            <div className="pt-20 flex md:mt-10 2xl:mt-14 flex-col items-center sm:w-auto xl:flex-row xl:justify-center xl:gap-28">
                <div className="flex flex-col md:flex-row items-center justify-center xl:flex-col xl:items-center">
                    <img
                        src="../images/GammaCareLogo.png"
                        alt="Logo"
                        className="logo h-32 w-fit pl-4 xl:h-[400px]"
                    />
                    <img
                        src="../images/GammaCareName.png"
                        alt="Logo"
                        className="logoName mt-1 pr-1 xl:pr-0 xl:mt-0 xl:w-[400px] "
                    />
                </div>
                <div className="sm:w-110 md:bg-tranparent mt-6 rounded-lg bg-white w-[300px] flex justify-center transition-all">
                    <form onSubmit={onSubmit}>
                        {errors && (
                            <div className="alert">
                                {Object.keys(errors).map((key) => (
                                    <p key={key}>{errors[key][0]}</p>
                                ))}
                            </div>
                        )}
                        <div className="pt-9">
                            <h2 className="text-black text-2xl font-semibold uppercase pb-5">
                                Login
                            </h2>
                            <label htmlFor="email" className="text-start">
                                <p className="text-black font-bold text-base mb-2">
                                    Email:
                                </p>
                            </label>
                            <input
                                ref={emailRef}
                                type="email"
                                placeholder="Type your email"
                                id="email"
                                name="email"
                                className="userEmail w-72 h-12 rounded-lg text-black lg:h-12"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="text-start">
                                <p className="text-black font-bold text-base mb-2">
                                    Password:
                                </p>
                            </label>
                            <input
                                ref={passwordRef}
                                type="password"
                                placeholder="Type your password"
                                id="password"
                                name="password"
                                className="pass w-72 h-12 rounded-lg text-black lg:h-12"
                            />
                        </div>
                        <button className="bg-green-900 w-32 py-3 rounded-lg text-base text-white border-2 border-white hover:bg-white hover:text-green-950 hover:border-2 hover:border-green-700 transition active:bg-green-700 active:text-white">
                            <p>Login</p>
                        </button>
                        <p className="message text-black py-4">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </p>
                    </form>
                </div>
            </div>
            <CompleteProfileModal
                show={showCompleteProfile}
                onClose={() => setShowCompleteProfile(false)}
                onComplete={(token, user) => handleLoginSuccess(token, user)}
                tempUser={tempUser}
            />
        </div>
    );
}

export default Login;
