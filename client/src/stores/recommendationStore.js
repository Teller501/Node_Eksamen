import { writable } from "svelte/store";

export const recommendationStore = writable({
    user_id: null,
    user_ratings: []
});