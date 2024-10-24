import React, { createContext, useState } from "react";
import axiosClient from "../axiosClient";

export const CertificateContext = createContext();

export const CertificateProvider = ({ children }) => {
    const [certificates, setCertificates] = useState([]);
    const [user, setUser] = useState(null); // Ensure user is available here

    // Fetch certificates for a specific user
    const fetchCertificates = async (userId) => {
        try {
            if (userId) {
                const response = await axiosClient.get(
                    `/certificates/${userId}`,
                );
                setCertificates(response.data); // Set certificates for the logged-in user
            }
        } catch (error) {
            console.error("Error fetching certificates:", error);
        }
    };

    return (
        <CertificateContext.Provider
            value={{ certificates, fetchCertificates, user, setUser }} // Provide user here
        >
            {children}
        </CertificateContext.Provider>
    );
};
