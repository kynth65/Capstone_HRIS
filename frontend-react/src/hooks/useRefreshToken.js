import { useStateContext } from "../contexts/ContextProvider";
import axiosClient from "../axiosClient";

const useRefreshToken = () => {
    const { setToken, setUser } = useStateContext();

    const refresh = async () => {
        try {
            const response = await axiosClient.post(
                "/refresh",
                {},
                {
                    withCredentials: true,
                },
            );

            if (response.data.access_token && response.data.user) {
                setToken(response.data.access_token);
                setUser(response.data.user);

                // Update localStorage
                localStorage.setItem(
                    "access_token",
                    response.data.access_token,
                );
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.data.user),
                );

                return response.data.access_token;
            }
            throw new Error("Invalid refresh token response");
        } catch (error) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            setToken(null);
            setUser(null);
            throw error;
        }
    };

    return refresh;
};

export default useRefreshToken;
