<script>
    import { Button, Spinner } from "flowbite-svelte";
    import { fetchGet } from "../../util/api.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { tokenStore } from "../../stores/authStore.js";
    import Reviews from "../../components/Reviews.svelte";
    import { onMount } from "svelte";

    let recentLogs = [];
    let offset = 0;
    const limit = 15;
    let totalPages = 1;
    let currentPage = 0;
    let loading = false;

    onMount(async () => {
        await fetchRecentLogs();
    });

    async function fetchRecentLogs() {
        loading = true;
        const response = await fetchGet(
            `${$BASE_URL}/api/logs/reviews/recent?limit=${limit}&offset=${offset}`,
            $tokenStore
        );
        const { data, pagination, status } = response;
        
        if (status === 200) {
            recentLogs = [...recentLogs, ...data];
            totalPages = pagination.totalPages;
            currentPage = pagination.currentPage;
            loading = false;
        }
    }

    async function loadMore() {
        offset += limit;
        await fetchRecentLogs();
    }
</script>

<Reviews reviews={recentLogs} showUsername showUserAvatar showReleaseDate marginX="0" />
{#if currentPage < totalPages}
    <Button on:click={loadMore} disabled={loading}>
        {#if loading}
            <Spinner class="me-3" size="4" color="white" />
            Loading ...
        {:else}
            Load More
        {/if}
    </Button>
{/if}
