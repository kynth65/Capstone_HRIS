import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import useRefreshToken from "./hooks/useRefreshToken";

// Create an Axios instance
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
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

// Function to handle token refresh logic
const refreshAuthLogic = async (failedRequest) => {
    const refresh = useRefreshToken();
    const newAccessToken = await refresh();

    // Update the failed request with the new token and retry it
    failedRequest.response.config.headers.Authorization = `Bearer ${newAccessToken}`;
    return Promise.resolve();
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
