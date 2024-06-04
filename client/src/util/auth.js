import { jwtDecode } from "jwt-decode";
import { navigate } from "svelte-routing";
import { refreshTokenStore, tokenStore, userStore } from "../stores/authStore";
import { fetchDelete } from "./api.js";

export function isTokenExpired(token) {
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        return decodedToken.exp < currentTime;
    } catch (error) {
        console.error("Failed to decode token:", error);
        return true;
    }
}

export async function refreshToken(refreshToken, token) {
    try {
        const response = await fetch("http://localhost:8080/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: refreshToken }),
        });

        if (response.ok) {
            const data = await response.json();
            tokenStore.set(data.token);
            return data.token;
        } else {
            logoutUser(token);
            navigate("/", { replace: true });
        }
    } catch (error) {
        console.error("Error refreshing token:", error);
        logoutUser(token);
        navigate("/", { replace: true });
    }
}

export async function logoutUser(token) {
    await fetchDelete(`http://localhost:8080/api/logout/${token}`, token);

    tokenStore.set(null);
    refreshTokenStore.set(null);
    userStore.set(null);
}
