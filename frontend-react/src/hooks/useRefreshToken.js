import { useContext } from "react";
import axiosClient from "../axiosClient";

import { useStateContext } from "../contexts/ContextProvider";

const useRefreshToken = () => {
    const { setToken } = useStateContext();

    const refresh = async () => {
        try {
            const response = await axios.post(
                "/refresh",
                {},
                {
                    withCredentials: true,
                }
            );
            setToken(response.data.accessToken);
            localStorage.setItem("ACCESS_TOKEN", response.data.accessToken);
            return response.data.accessToken;
        } catch (error) {
            console.error("Error refreshing token:", error);
            throw error;
        }
    };

    return refresh;
};

export default useRefreshToken;
