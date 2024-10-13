import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import useRefreshToken from "./hooks/useRefreshToken";

// Create an Axios instance
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_URL}/api`,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
});

// Add a request interceptor to attach the token to headers
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    // console.log("Token being sent:", token); // Debugging line

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const refreshToken = async () => {
    try {
        const response = await axiosClient.post(
            "/refresh",
            {},
            { withCredentials: true },
        );
        const newAccessToken = response.data.access_token;
        localStorage.setItem("access_token", newAccessToken);
        return newAccessToken;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return null;
    }
};

// Function to handle token refresh logic
const refreshAuthLogic = async (failedRequest) => {
    const newAccessToken = await refreshToken();

    if (newAccessToken) {
        failedRequest.response.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return Promise.resolve();
    } else {
        return Promise.reject(failedRequest);
    }
};
// Create and attach the refresh interceptor
createAuthRefreshInterceptor(axiosClient, refreshAuthLogic);

// Add a response interceptor to handle other errors
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response && response.status === 401) {
            localStorage.removeItem("access_token");
        }
        return Promise.reject(error);
    },
);

export default axiosClient;
