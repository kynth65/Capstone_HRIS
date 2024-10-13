import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.jsx";
import { ContextProvider } from "./contexts/ContextProvider.jsx";
import { CertificateProvider } from "./contexts/CertificateContext.jsx"; // Import CertificateProvider

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ContextProvider>
            <CertificateProvider>
                <RouterProvider router={router} />
            </CertificateProvider>
        </ContextProvider>
    </React.StrictMode>
);
