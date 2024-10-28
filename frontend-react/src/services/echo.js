import Pusher from "pusher-js";

class PusherService {
    constructor() {
        this.pusher = null;
        this.initializePusher();
    }

    initializePusher() {
        // Enable Pusher logging only in development
        Pusher.logToConsole = import.meta.env.DEV;

        const options = {
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            forceTLS: true,
            enabledTransports: ["ws", "wss"],
            authEndpoint: "/broadcasting/auth", // Changed to relative path
            auth: {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute("content"),
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    "X-Requested-With": "XMLHttpRequest",
                },
            },
            wsHost: import.meta.env.VITE_PUSHER_APP_HOST,
            wsPort: import.meta.env.VITE_PUSHER_APP_PORT || 443,
            encrypted: true,
        };

        try {
            this.pusher = new Pusher(
                import.meta.env.VITE_PUSHER_APP_KEY,
                options,
            );
            this.setupEventListeners();
        } catch (error) {
            console.error("Failed to initialize Pusher:", error);
        }
    }

    setupEventListeners() {
        if (!this.pusher) return;

        this.pusher.connection.bind("connecting", () => {
            console.log("Connecting to Pusher...", {
                key: import.meta.env.VITE_PUSHER_APP_KEY,
                cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
            });
        });

        this.pusher.connection.bind("connected", () => {
            console.log(
                "Connected to Pusher",
                "Socket ID:",
                this.pusher.connection.socket_id,
            );
        });

        this.pusher.connection.bind("failed", () => {
            console.error("Failed to connect to Pusher");
            this.handleConnectionFailure();
        });

        this.pusher.connection.bind("error", (error) => {
            console.error("Pusher connection error:", error);
            if (error.error?.type === "AuthError") {
                this.refreshAuthToken();
            }
        });
    }

    async refreshAuthToken() {
        try {
            const response = await fetch("/api/refresh", {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem("access_token", data.access_token);
                this.updateAuth();
                this.reconnect();
            }
        } catch (error) {
            console.error("Failed to refresh token:", error);
            window.location.href = "/login";
        }
    }

    handleConnectionFailure() {
        if (!localStorage.getItem("access_token")) {
            window.location.href = "/login";
            return;
        }
        setTimeout(() => this.reconnect(), 3000);
    }

    updateAuth() {
        if (!this.pusher) return;

        this.pusher.config.auth.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    }

    reconnect() {
        if (this.pusher) {
            this.pusher.disconnect();
        }
        this.initializePusher();
    }

    subscribe(channelName) {
        if (!this.pusher) return null;

        try {
            const channel = this.pusher.subscribe(channelName);
            channel.bind("pusher:subscription_error", (status) => {
                console.error("Subscription error:", status);
                if (status === 403) {
                    this.refreshAuthToken();
                }
            });
            return channel;
        } catch (error) {
            console.error(`Failed to subscribe to ${channelName}:`, error);
            return null;
        }
    }

    unsubscribe(channelName) {
        if (!this.pusher) return;
        try {
            this.pusher.unsubscribe(channelName);
        } catch (error) {
            console.error(`Failed to unsubscribe from ${channelName}:`, error);
        }
    }
}

const pusherService = new PusherService();
export default pusherService;
