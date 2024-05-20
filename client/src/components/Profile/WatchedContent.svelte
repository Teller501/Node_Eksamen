<script>
    import Movie from "../Movie.svelte";
    import { ImagePlaceholder } from "flowbite-svelte";

    export let watchedMovies = [];
</script>

<h2 class="text-slate-900 text-2xl font-bold my-4">Watched Movies</h2>
<div id="popular-movies" class="w-full flex items-center justify-between">
    <div class="grid grid-cols-5 grid-rows-4">
        {#if watchedMovies}
            {#each watchedMovies as movie}
                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    width={128}
                    movieId={movie.id}
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