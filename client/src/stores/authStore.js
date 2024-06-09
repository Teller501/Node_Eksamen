import { writable } from "svelte/store";

function createPersistedStore(key, startValue) {
    const { subscribe, set, update } = writable(startValue, () => {
        const json = localStorage.getItem(key);
        if (json !== null && json !== "undefined") {
            try {
                set(JSON.parse(json));
            } catch (e) {
                console.error(
                    `Error parsing JSON from localStorage for key "${key}":`,
                    e
                );
            }
        }

        return () => localStorage.removeItem(key);
    });

    return {
        subscribe,
        set: (value) => {
            localStorage.setItem(key, JSON.stringify(value));
            set(value);
        },
        update,
    };
}

export const tokenStore = createPersistedStore("token", null);
export const refreshTokenStore = createPersistedStore("refreshToken", null);
export const userStore = createPersistedStore("user", null);
