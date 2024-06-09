<script>
    import Movie from "../Movie.svelte";
    import { ImagePlaceholder } from "flowbite-svelte";

    export let watchedMovies = [];
</script>

<h2 class="text-slate-900 text-2xl font-bold my-4">Watched Movies</h2>
<div
    id="popular-movies"
    class="w-full flex flex-col items-center justify-between"
>
    <div
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 grid-rows-4 gap-4"
    >
        {#if watchedMovies}
            {#each watchedMovies as movie}
                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    width="220vw"
                    movieId={movie.movie_id}
                />
            {/each}
        {:else}
            {#each Array(watchedMovies.length).fill() as _}
                <div class="w-full h-48 mb-2">
                    <ImagePlaceholder
                        imgOnly
                        class="w-32 rounded-sm mx-2 drop-shadow-md mb-2"
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>
