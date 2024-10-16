import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import "../styles/login.css";
import { useStateContext } from "../contexts/ContextProvider";
import { IoIosArrowRoundBack } from "react-icons/io";
import wideBackground from "../assets/images/gammacare short front background.jpeg";
import LogoImage from "../assets/images/GMSI Logo.png";

function Login() {
    const { setUser, setToken } = useStateContext(); // Use setUser and setToken from context
    const loggedIn = window.localStorage.getItem("isLoggedIn");
    const emailRef = useRef();
    const passwordRef = useRef();
    const [errors, setError] = useState(null);
    const navigate = useNavigate();
    const errorTimeoutRef = useRef(null);

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

    const onSubmit = (event) => {
        event.preventDefault();
        const payload = {
            email: emailRef.current.value,
            password: passwordRef.current.value,
        };

        axiosClient
            .post("/login", payload)
            .then(({ data }) => {
                setToken(data.token);
                setUser(data.user);

                // Store token and user data in localStorage
                localStorage.setItem("access_token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                localStorage.setItem("isLoggedIn", true);

                navigateBasedOnRole(data.user); // Navigate based on role
                clearTimeout(errorTimeoutRef.current);
            })
            .catch((err) => {
                const response = err.response;
                if (response && response.status === 422) {
                    if (response.data.errors) {
                        setError(response.data.errors);
                        errorTimeoutRef.current = setTimeout(() => {
                            setError(null);
                        }, 4000);
                    } else {
                        setError({ email: [response.data.message] });
                        errorTimeoutRef.current = setTimeout(() => {
                            setError(null);
                        }, 4000);
                    }
                }
            });
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
        </div>
    );
}

export default Login;
