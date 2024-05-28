<script>
    import Movie from "../Movie.svelte";
    import { fetchDelete } from "../../util/api";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { userStore, tokenStore } from "../../stores/authStore";

    import toast, { Toaster } from "svelte-french-toast";

    import { CloseCircleSolid } from "flowbite-svelte-icons";

    export let watchList = [];
    export let isOwner;

    async function handleRemoveFromWatchlist(movieId, title) {
        await fetchDelete(
            `${$BASE_URL}/api/watchlists/${$userStore.id}/${movieId}`,
            $tokenStore
        );
        watchList = watchList.filter((movie) => movie.movie_id !== movieId);

        toast.success(`'${title}' removed from watchlist`);
    }
</script>

<Toaster />

<h2 class="text-slate-900 text-2xl font-bold my-4">Movies on watchlist</h2>

{#if watchList.length === 0}
    <p class="text-slate-900 text-lg text-center">No movies on watchlist...</p>
{/if}

<div class="w-full flex items-center justify-between">
    <div class="grid grid-cols-5 grid-rows-4">
        {#each watchList as movie}
            <div class="relative mx-4">
                {#if isOwner}
                    <button
                        on:click={() =>
                            handleRemoveFromWatchlist(
                                movie.movie_id,
                                movie.title
                            )}
                        class="absolute top-0.5 right-1.5 z-10 p-0"
                    >
                        <CloseCircleSolid
                            size="md"
                            class="text-red-500 hover:text-red-800 z-50"
                        />
                    </button>
                {/if}

                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    movieId={movie.movie_id}
                    width="180vw"
                />
            </div>
        {/each}
    </div>
</div>
