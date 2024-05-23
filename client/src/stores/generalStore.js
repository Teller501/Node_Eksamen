import { readable } from "svelte/store";

export const BASE_URL = readable("http://localhost:8080");
export const SOCKET_URL = readable("localhost:8080");
