import { writable } from 'svelte/store';

function createPersistedStore(key, startValue) {
    const { subscribe, set, update } = writable(startValue, () => {
        const json = localStorage.getItem(key);
        if (json) {
            set(JSON.parse(json));
        }

        return () => localStorage.removeItem(key);
    });

    return {
        subscribe,
        set: (value) => {
            localStorage.setItem(key, JSON.stringify(value));
            set(value);
        },
        update
    };
}

export const tokenStore = createPersistedStore('token', null);
export const refreshTokenStore = createPersistedStore('refreshToken', null);
export const userStore = createPersistedStore('user', null);
