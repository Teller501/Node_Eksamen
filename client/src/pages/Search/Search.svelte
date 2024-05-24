<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/api";
    import Movie from "../../components/Movie.svelte";
    import { Hr } from "flowbite-svelte";

    export let params;
    const searchQuery = params.query;

    let searchResults = [];

    async function getSearchResults() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/search?q=${searchQuery}`
        );
        searchResults = data;
    }

    onMount(() => {
        getSearchResults();
    });
</script>

{#if searchResults.length > 0}
    <h2 class="text-slate-900 mb-8">Found matches for "{searchQuery}"</h2>
    <div
        id="search-results"
        class="w-full flex flex-col justify-between"
    >
        {#each searchResults as movie}
            <div class="flex flex-row">
                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    width={128}
                    movieId={movie.id}
                />
                <h3 class="text-slate-900">{movie.title}</h3>
            </div>
            {#if searchResults.length > 1}
                <Hr classHr="mb-10" />
            {/if}
        {/each}
    </div>
{:else}
    <h2 class="text-slate-900 mb-8">No matches found for "{searchQuery}"</h2>
{/if}
