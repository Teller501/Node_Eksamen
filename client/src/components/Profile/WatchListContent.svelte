<script>
    import Movie from "../Movie.svelte";

    export let watchList = [];

</script>

<h2 class="text-slate-900 text-2xl font-bold my-4">Movies on watchlist</h2>
<div id="popular-movies" class="w-full flex items-center justify-between">
    <div class="grid grid-cols-5 grid-rows-4">
        {#each watchList as movie}
            <Movie
                posterPath={movie.poster_path}
                alt={movie.title}
                movieId={movie.movie_id}
                width={128}
            />
        {/each}
    </div>
</div>