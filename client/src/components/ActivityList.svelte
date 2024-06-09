<script>
    import { activityStore } from "../stores/activityStore.js";
    import { tokenStore } from "../stores/authStore.js";
    import { fetchGet } from "../util/api.js";
    import { BASE_URL } from "../stores/generalStore.js";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let activities = [];

    activityStore.subscribe((value) => {
        activities = value;
    });

    async function fetchInitialActivities() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/activities/recent`,
            $tokenStore
        );

        activityStore.set(data);
    }

    onMount(async () => {
        await fetchInitialActivities();
    });
</script>

<h1 class="text-slate-900 mt-8 mb-2 text-xl font-bold">
    See what your fellow CineMatchers have been up to!
</h1>

<div
    class="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-4 bg-white shadow-md mb-8"
>
    {#each activities as activity (activity._id)}
        <div
            class="mb-2 p-2 border-b border-gray-200 last:border-0"
            in:fly={{ y: 20, duration: 300 }}
        >
            {#if activity.activityType === "watchlist"}
                <p class="text-slate-700 text-xs">
                    <span class="font-semibold">{activity.username}</span> just
                    added <span class="font-semibold">{activity.title}</span> to
                    their watchlist!
                </p>
            {:else if activity.activityType === "watched"}
                <p class="text-slate-700 text-xs">
                    <span class="font-semibold">{activity.username}</span> just
                    watched <span class="font-semibold">{activity.title}</span>!
                </p>
            {/if}
        </div>
    {/each}
</div>
