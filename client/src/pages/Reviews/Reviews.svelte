<script>
    import { Button, Spinner } from "flowbite-svelte";
    import { fetchGet } from "../../util/api.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { tokenStore } from "../../stores/authStore.js";
    import Reviews from "../../components/Reviews.svelte";
    import { onMount } from "svelte";

    export let params = {};

    let recentLogs = [];
    let movie = null;
    let offset = 0;
    const limit = 15;
    let totalPages = 1;
    let currentPage = 0;
    let loading = false;

    $: movieId = params.movieId;

    onMount(async () => {
        await Promise.all([fetchRecentLogs(), fetchMovie()]);
    });

    async function fetchRecentLogs() {
        loading = true;
        const url = movieId 
            ? `${$BASE_URL}/api/logs/reviews/${movieId}?limit=${limit}&offset=${offset}`
            : `${$BASE_URL}/api/logs/reviews/recent?limit=${limit}&offset=${offset}`;
        
        const response = await fetchGet(url, $tokenStore);
        const { data, pagination, status } = response;
        
        if (status === 200) {
            if (Array.isArray(data)) {
                recentLogs = [...recentLogs, ...data];
            }
            if (pagination) {
                totalPages = pagination.total_pages;
                currentPage = pagination.current_page;
            }
        }
        loading = false;
    }

    async function fetchMovie() {
        const url = `${$BASE_URL}/api/movies/${movieId}`;
        const response = await fetchGet(url, $tokenStore);
        const { data, status } = response;
        if (status === 200) {
            movie = data;
        }
    }

    async function loadMore() {
        offset += limit;
        await fetchRecentLogs();
    }
</script>

{#if movieId}
    {#if !loading}
        <Reviews reviews={recentLogs} heading={`Reviews for ${movie?.title}`} showUsername showMovieTitle={false} showMoviePoster={false} showUserAvatar showReleaseDate marginX="0" />
    {/if}
{:else}
    <Reviews reviews={recentLogs} showUsername showUserAvatar showReleaseDate marginX="0" />
{/if}
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
