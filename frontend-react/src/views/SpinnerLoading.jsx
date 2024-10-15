import React from "react";
import Spinner from "../assets/images/Gear_Spinner.gif";

const SpinnerLoading = ({ size = "md" }) => {
    const sizeClasses = {
        sm: "w-8 h-8",
        md: "w-16 h-16",
        lg: "w-24 h-24",
    };

    return (
        <div className="flex justify-center items-center">
            <img
                src={Spinner}
                alt="Loading..."
                className={`${sizeClasses[size]} object-contain`}
            />
        </div>
    );
};

export default SpinnerLoading;
