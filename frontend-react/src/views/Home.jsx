import React, { useState } from "react";
import AboutImage from "../assets/images/AboutImage.gif";
import AboutSlide1 from "../assets/images/about-us-1.jpg";
import AboutSlide2 from "../assets/images/about-us-2.jpg";
import AboutSlide3 from "../assets/images/about-us-3.jpg";
import AboutSlide4 from "../assets/images/about-us-4.jpg";
import AboutSlide5 from "../assets/images/about-us-5.jpg";
import LogoSlide1 from "../assets/images/loop image 1 medicare updated.jpg";
import LogoSlide2 from "../assets/images/loop image 2 phil british updated.jpeg";
import LogoSlide3 from "../assets/images/loop image 3 pacific cross.png";
import LogoSlide4 from "../assets/images/loop image 4 phil care.jpg";
import LogoSlide5 from "../assets/images/loop image 5 etiqa.png";
import LogoSlide6 from "../assets/images/loop image 6 medasia.png";
import LogoSlide7 from "../assets/images/loop image 7 cocolife.png";
import LogoSlide8 from "../assets/images/loop image 8 inlife.png";
import LicensedLogo1 from "../assets/images/doh_logo-updated.png";
import LicensedLogo2 from "../assets/images/FDA logo updated.png";
import LicensedLogo3 from "../assets/images/acredited image tuv.png";
import HeroImage from "../assets/images/HeroImage.gif";
import LogoImage from "../assets/images/GMSI Logo.png";
import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";
import "../styles/homePage.css";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaFacebookSquare, FaForward } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { FaFacebookMessenger } from "react-icons/fa";
import { IoCallSharp } from "react-icons/io5";
import { FaClinicMedical } from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
    const slides = [
        AboutSlide1,
        AboutSlide2,
        AboutSlide3,
        AboutSlide4,
        AboutSlide5,
    ];

    const services = [
        {
            title: "2d Echo w/ Doppler",
            description:
                "A 2D Echo with Doppler is a non-invasive test that uses ultrasound to visualize the heart and measure blood flow.",
        },
        {
            title: "12-Lead ECG",
            description:
                "A 12-Lead ECG records the electrical activity of the heart from twelve different angles to diagnose heart conditions.",
        },
        {
            title: "Covid-19 Tests",
            description:
                "Covid-19 tests detect the presence of the virus through various methods, including nasal swabs and antibody tests.",
        },
        {
            title: "Doctor's Clinic",
            description:
                "A doctor's clinic is a healthcare facility where patients can receive medical consultations and treatment from physicians.",
        },
        {
            title: "Laboratory Tests",
            description:
                "Laboratory tests are medical tests conducted in a lab to analyze blood, urine, or other samples for diagnosis.",
        },
        {
            title: "Minor Surgery",
            description:
                "Minor surgery refers to small, low-risk surgical procedures performed on an outpatient basis.",
        },
        {
            title: "Pharmacy",
            description:
                "A pharmacy is a place where medications are dispensed and healthcare advice is provided by licensed pharmacists.",
        },
        {
            title: "Ultrasound",
            description:
                "An ultrasound is a diagnostic tool that uses sound waves to create images of internal organs, tissues, and the fetus during pregnancy.",
        },
        {
            title: "X-Ray",
            description:
                "An X-ray is a type of imaging test that uses radiation to create images of bones and other internal structures.",
        },
        {
            title: "Drug Testing",
            description:
                "Drug testing is a medical procedure that analyzes biological samples to detect the presence of drugs or their metabolites.",
        },
    ];

    const itemsPerGroup = 4;
    const [currentGroup, setCurrentGroup] = useState(0);
    const totalGroups = Math.ceil(services.length / itemsPerGroup);
    const [showNavigator, setShowNavigator] = useState(false);

    const nextGroup = () => {
        setCurrentGroup((prev) => (prev === totalGroups - 1 ? 0 : prev + 1));
    };

    const prevGroup = () => {
        setCurrentGroup((prev) => (prev === 0 ? totalGroups - 1 : prev - 1));
    };

    // Get current group of services
    const getCurrentGroup = () => {
        const start = currentGroup * itemsPerGroup;
        return services.slice(start, start + itemsPerGroup);
    };

    const [slideNumber, setSlideNumber] = useState(0);

    const nextSlide = () => {
        setSlideNumber((prevState) =>
            prevState === slides.length - 1 ? 0 : prevState + 1,
        );
    };

    const prevSlide = () => {
        setSlideNumber((prevState) =>
            prevState === 0 ? slides.length - 1 : prevState - 1,
        );
    };

    return (
        <>
            <div className="absolute w-screen h-screen bg-white left-0">
                {/* Navigation bar */}
                <section className="font-poppins">
                    <div className="nav fixed z-10 w-screen bg-white h-14 bg-transparent text-black ">
                        <ul className=" flex h-full px-2 text-base justify-around items-center gap-4 md:justify-between md:px-24 lg:px-40">
                            <a
                                href={"/"}
                                className="flex md:static absolute left-6"
                            >
                                <img
                                    src={LogoImage}
                                    alt="logo"
                                    className="h-12 flex"
                                    style={{
                                        filter: "hue-rotate(90deg) saturate(100%) brightness(50%)",
                                    }}
                                />
                            </a>
                            <a
                                href={"/"}
                                className="text-xs flex flex-col sm:text-sm sm:flex-row md:hidden lg:flex lg:flex-col lg:text-start lg:justify-center lg:absolute lg:left-56"
                            >
                                <span className="mr-1"> GammaCare </span>
                                <span> Medical Services Inc. </span>
                            </a>
                            {/* Hamburger menu for small screens */}
                            <div className="md:hidden absolute right-10">
                                <GiHamburgerMenu
                                    className="cursor-pointer"
                                    size={24}
                                    onClick={() =>
                                        setShowNavigator(!showNavigator)
                                    }
                                />
                            </div>

                            {/* Menu bar navigator */}
                            <div
                                className={`${
                                    showNavigator ? "block" : "hidden"
                                } md:flex md:flex-row md:h-auto md:static md:justify-around md:items-center md:gap-8 md:rounded-none md:shadow-none md:text-gray-500 md:w-auto
                            fixed flex flex-col items-center justify-center right-3 top-16 h-auto w-60 rounded-md bg-white shadow-lg`}
                            >
                                <a
                                    href="#about"
                                    className="w-full text-center py-2 hover:bg-gray-100 md:hover:bg-transparent md:hover:underline hover:text-green-800 cursor-pointer"
                                    onClick={() =>
                                        setShowNavigator(!showNavigator)
                                    }
                                >
                                    About
                                </a>
                                <a
                                    href="#contacts"
                                    className="w-full text-center py-2 hover:bg-gray-100 md:hover:bg-transparent md:hover:underline hover:text-green-800 cursor-pointer"
                                    onClick={() =>
                                        setShowNavigator(!showNavigator)
                                    }
                                >
                                    Contacts
                                </a>
                                <a
                                    href="#services"
                                    className="w-full text-center py-2 hover:bg-gray-100 md:hover:bg-transparent md:hover:underline hover:text-green-800 cursor-pointer"
                                    onClick={() =>
                                        setShowNavigator(!showNavigator)
                                    }
                                >
                                    Services
                                </a>
                                <a
                                    href="/applicantPortal"
                                    className="w-full text-center py-2 hover:bg-gray-100 md:hover:bg-transparent md:hover:underline hover:text-green-800 cursor-pointer"
                                    onClick={() =>
                                        setShowNavigator(!showNavigator)
                                    }
                                >
                                    Apply
                                </a>

                                <div className="w-full block text-center bg-green-800 sm:border-2 sm:border-white hover:bg-white hover:text-green-950 hover:border-2 hover:border-green-950 md:hover:opacity-100 transition text-white rounded-md hover:opacity-80 active:opacity-60 cursor-pointer">
                                    <Link
                                        className="block px-4 py-2"
                                        to={"/login"}
                                    >
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </ul>
                    </div>
                </section>
                {/* Hero section */}
                <section className="hero w-screen h-auto bg-white rounded-sm">
                    <div className=" flex flex-col items-center max-w-screen lg:flex-row lg:items-center xl:justify-around">
                        <div className="w-full mt-14">
                            <img
                                src={HeroImage}
                                className="w-5/6 inline-block"
                                alt="hero"
                            />
                        </div>
                        <div className="hero-content px-10 py-10 m-6 border-2 border-green-800 rounded-xl flex flex-col items-center lg:px-0 lg:py-0 lg:border-0 lg:items-start lg:text-start mt-12 lg:w-3/4 hover:shadow-md hover:shadow-green-900 lg:hover:shadow-none">
                            <h1 className="font-poppins text-4xl md:text-5xl xl:text-7xl font-bold text-green-950">
                                Your Path to Better Health
                            </h1>
                            <p className=" text-green-800 sm:text-sm font-poppins xl:pr-5 opacity-90 mt-4 xl:text-2xl lg:block">
                                At GammaCare, your well-being is our top
                                priority. Our dedicated team offers medical
                                services to ensure you receive the best care
                                possible.
                            </p>
                            <a
                                href="#contacts"
                                className=" mt-4 px-4 py-2 bg-green-950 text-bold rounded-lg w-fit cursor-pointer hover:bg-transparent border-2 hover:border-2 hover:text-green-900 hover:font-bold hover:border-green-900 transition active:opacity-80 sm:text-sm xl:px-12 xl:py-4 xl:text-xl lg:block"
                            >
                                Contact us
                            </a>
                        </div>
                    </div>
                </section>
                <section className="w-full bg-white">
                    <div className="text-center mb-8">
                        <h2
                            id="services"
                            className="text-black text-3xl sm:text-4xl pt-14 font-poppins font-bold hover:text-green-950 transition"
                        >
                            SERVICES OFFERED
                        </h2>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex md:hidden justify-center mt-8 gap-2">
                        {[...Array(totalGroups)].map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentGroup(index)}
                                className={`h-1 rounded-full transition-all duration-300 ${
                                    index === currentGroup
                                        ? "bg-green-800 w-8"
                                        : "bg-gray-300 w-4 hover:bg-gray-400"
                                }`}
                                aria-label={`Go to service group ${index + 1}`}
                            />
                        ))}
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {/* Navigation Arrows */}
                        <button
                            onClick={prevGroup}
                            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 hidden md:block"
                            aria-label="Previous services"
                        >
                            <MdArrowBackIos
                                color="darkgreen"
                                className="cursor-pointer size-8"
                            />
                        </button>

                        <button
                            onClick={nextGroup}
                            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 hidden md:block"
                            aria-label="Next services"
                        >
                            <MdArrowForwardIos
                                color="darkgreen"
                                className="cursor-pointer size-8"
                            />
                        </button>

                        {/* Services Container */}
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{
                                    transform: `translateX(-${currentGroup * 100}%)`,
                                }}
                            >
                                {/* Create groups of 4 services */}
                                {Array.from({
                                    length: Math.ceil(
                                        services.length / itemsPerGroup,
                                    ),
                                }).map((_, groupIndex) => (
                                    <div
                                        key={groupIndex}
                                        className="flex min-w-full flex-wrap md:flex-nowrap"
                                    >
                                        {services
                                            .slice(
                                                groupIndex * itemsPerGroup,
                                                (groupIndex + 1) *
                                                    itemsPerGroup,
                                            )
                                            .map((service, index) => (
                                                <div
                                                    key={index}
                                                    className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4 flex-shrink-0"
                                                >
                                                    <div
                                                        className="bg-white text-green-700 rounded-lg h-full p-6 border-2 border-green-800 
                                          hover:shadow-lg hover:shadow-green-900/20 transition-all duration-300"
                                                    >
                                                        <h3
                                                            className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 
                                             hover:text-green-800 hover:underline transition-colors"
                                                        >
                                                            {service.title}
                                                        </h3>
                                                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                                                            {
                                                                service.description
                                                            }
                                                        </p>
                                                        <button
                                                            className="mt-4 px-4 py-2 border-2 border-green-800 text-green-800 rounded 
                                                 hover:bg-green-800 hover:text-white transition-colors duration-300"
                                                        >
                                                            READ MORE
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation Dots */}
                        <div className="flex justify-center mt-8 gap-2">
                            {[...Array(totalGroups)].map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentGroup(index)}
                                    className={`h-1 rounded-full transition-all duration-300 ${
                                        index === currentGroup
                                            ? "bg-green-800 w-8"
                                            : "bg-gray-300 w-4 hover:bg-gray-400"
                                    }`}
                                    aria-label={`Go to service group ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </section>
                <section className="w-screen">
                    <div className="">
                        <h2
                            id="about"
                            className="text-black pt-16 text-4xl font-poppins font-bold hover:text-green-950 transition"
                        >
                            ABOUT US
                        </h2>
                    </div>
                    <div className=" flex flex-col items-center py-8 pt-0 lg:px-20 lg:py-10 lg:flex-row-reverse lg:items-center xl:justify-around">
                        <div className="pl-2">
                            <MdArrowForwardIos
                                color="darkgreen"
                                className="cursor-pointer size-8 hidden lg:block"
                                onClick={prevSlide}
                            />
                        </div>
                        <div
                            className="w-full h-[300px] lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] xl:h-[400px] 2xl:h-[500px] lg:rounded-2xl bg-center bg-cover  duration-500 relative"
                            style={{
                                backgroundImage: `url(${slides[slideNumber]})`,
                            }}
                        ></div>
                        <div className="flex mt-3 h-3 lg:mt-0 lg:h-0 lg:pb-10">
                            <MdArrowBackIos
                                color="darkgreen"
                                className="cursor-pointer size-8 "
                                onClick={prevSlide}
                            />
                            <MdArrowForwardIos
                                color="darkgreen"
                                className="cursor-pointer size-8 lg:hidden"
                                onClick={nextSlide}
                            />
                        </div>

                        <div className="hero-content px-10 py-10 m-6 mt-12 border-2 border-green-800 rounded-xl flex flex-col items-center lg:px-0 lg:py-0 lg:border-0 lg:items-end lg:text-center lg:w-3/4 hover:shadow-md hover:shadow-green-900 lg:hover:shadow-none">
                            <p className=" text-green-800 text-base  lg:text-base font-poppins xl:pr-5 opacity-90 xl:text-xl 2xl:text-2xl lg:block">
                                Welcome to GammaCare Medical Services Inc., a
                                corporation where precision and care meet
                                innovation in diagnostics and health services.
                                Established in 2017, our accredited facility has
                                been at the forefront of providing accurate and
                                timely medical testing services. We are
                                dedicated to enhancing patient care through
                                advanced technology and a team of expert
                                professionals. Our commitment to quality and
                                reliability makes us a trusted partner in health
                                and wellness. Join us as we continue to expand
                                our services and contribute to a healthier
                                community.
                            </p>
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className="text-black pt-16 text-4xl font-poppins font-bold hover:text-green-950 transition uppercase">
                        Accredited HMO's
                    </h2>
                    <div
                        className="logo-slide w-[95%] relative h-[120px] overflow-hidden mt-10 mb-24"
                        style={{ marginInline: "auto" }}
                    >
                        <Link
                            to={"https://medicareplusinc.com/"}
                            className="item logo1 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide1}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.philbritish.com/"}
                            className="item logo2 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide2}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={
                                "https://www.pacificcross.com.ph/contact-form/?gclid=Cj0KCQjwxsm3BhDrARIsAMtVz6PvjjHsEqxbzObv26YEa1UPdshBjo4tExeJ8aUMtSJ5ZwAzY71AfDEaAiqREALw_wcB"
                            }
                            className="item logo3 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide3}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.philcare.com.ph/"}
                            className="item logo4 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide4}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.etiqa.com.ph/"}
                            className="item logo5 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide5}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.medasiaphils.com/"}
                            className="item logo6 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide6}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.cocolife.com/"}
                            className="item logo7 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide7}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                        <Link
                            to={"https://www.insularlife.com.ph/"}
                            className="item logo8 w-[210px] h-[120px] rounded-lg absolute top-0"
                        >
                            <img
                                src={LogoSlide8}
                                alt="logo"
                                className="object-contain h-full w-full"
                            />
                        </Link>
                    </div>
                    <div className="w-full ">
                        <div className="flex flex-col bg-gray-200 py-4">
                            <h2 className="text-black pt-16 text-4xl font-poppins font-bold hover:text-green-950 transition uppercase">
                                licensed and accredited by
                            </h2>
                            <div className="flex flex-col gap-10 items-center lg:flex-row lg:justify-evenly">
                                <img
                                    src={LicensedLogo1}
                                    alt="DOH logo"
                                    className="bg-transparent object-contain w-[300px]"
                                />
                                <img
                                    src={LicensedLogo2}
                                    alt="DOH logo"
                                    className="bg-transparent object-contain w-[300px]"
                                />
                                <img
                                    src={LicensedLogo3}
                                    alt="DOH logo"
                                    className="bg-transparent object-contain w-[300px]"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <footer id="contacts">
                    <div className=" px-5 pb-10 py-5 font-poppins grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 text-start text-base gap-10 2xl:pl-[160px] bg-neutral-300 text-gray-900">
                        <div>
                            <h1 className="font-poppins text-2xl font-bold text-black">
                                Quick Links
                            </h1>
                            <div className="grid-cols-1 grid  gap-4 pt-2 ">
                                <a
                                    href="/"
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Home
                                </a>

                                <a
                                    href="#services"
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Services
                                </a>
                                <a
                                    href="#about"
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    About
                                </a>
                                <a
                                    href="/applicantPortal"
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Apply
                                </a>
                            </div>
                        </div>
                        <div>
                            <h1 className="font-poppins text-2xl font-bold text-black">
                                Diagnostic Services
                            </h1>
                            <div className="grid-cols-1 grid gap-4 pt-2 ">
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Clinical Laboratory
                                </a>
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Anatomical Laboratory
                                </a>
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Drug Testing
                                </a>
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    X-Ray
                                </a>
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    2D-Echo w/ Doppler
                                </a>
                                <a
                                    href=""
                                    className="w-fit hover:text-black hover:underline transition-all"
                                >
                                    <MdArrowForwardIos className="size-6 inline-block mr-1" />
                                    Ultrasound
                                </a>
                            </div>
                        </div>
                        <div className="">
                            <h1 className="font-poppins text-2xl font-bold text-black">
                                Contact Us
                            </h1>
                            <div className="grid grid-cols-1  gap-4 pt-2 ">
                                <span>
                                    <IoCallSharp className="size-6 inline-block mr-2" />
                                    Trunkline: (02) 8961-3664 Loc. 101 to 108
                                </span>
                                <span>
                                    {" "}
                                    <IoCallSharp className="size-6 inline-block mr-2" />
                                    Reception: +63917-6321372
                                </span>
                                <span>
                                    {" "}
                                    <IoCallSharp className="size-6 inline-block mr-2" />
                                    Diagnostics: +63917-6256689
                                </span>
                                <div className="flex ">
                                    <FaClinicMedical className="size-6 h-full w-fit mr-2 ab" />
                                    <span>
                                        Address: 635 Binayuyo cor. Malanating
                                        Sts., Amparo Subdivision, Barangay 179,
                                        Novaliches, Caloocan City
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h1 className="font-poppins text-2xl font-bold text-black">
                                Follow Us
                            </h1>
                            <div className="grid grid-cols-1  gap-4 pt-2 ">
                                <a
                                    href="https://www.facebook.com/gammacaremsi/"
                                    target="blank"
                                    className="w-fit hover:text-blue-800 transition"
                                >
                                    <FaFacebookSquare className="inline size-8 mr-1" />{" "}
                                    Facebook
                                </a>
                                <a
                                    href="https://www.instagram.com/gammacaremsi/"
                                    target="blank"
                                    className="w-fit hover:text-red-700 transition"
                                >
                                    <FaSquareInstagram className="inline size-8 mr-1 " />{" "}
                                    Instagram
                                </a>
                                <a
                                    href="https://www.messenger.com/t/425861477487886/?messaging_source=source%3Apages%3Amessage_shortlink&source_id=1441792&recurring_notification=0"
                                    target="blank"
                                    className="w-fit hover:text-blue-800 transition"
                                >
                                    <FaFacebookMessenger className="inline size-8 mr-2" />
                                    Messenger
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Home;
