import { readable } from "svelte/store";

export const BASE_URL = readable(import.meta.env.VITE_BASE_URL);
export const SOCKET_URL = readable(import.meta.env.VITE_SOCKET_URL);
