<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/api";
    import { BASE_URL } from "../../stores/generalStore";
    import Movie from "../../components/Movie.svelte";
    import { ImagePlaceholder, Button } from "flowbite-svelte";
    import { CaretLeftSolid, CaretRightSolid } from "flowbite-svelte-icons";

    let popularMovies = null;
    let page = 1;

    async function fetchMovies() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/popular?limit=5&page=${page}`
        );
        popularMovies = data;
    }

    onMount(() => {
        fetchMovies();
    });

    function handleNextPopularMoviePage() {
        popularMovies = null;
        page++;
        fetchMovies();
    }

    function handlePreviousPopularMoviePage() {
        if (page === 1) return;
        popularMovies = null;
        page--;
        fetchMovies();
    }
</script>

<h1 class="text-slate-900 absolute inset-x-0 top-32">Home</h1>

<h2 class="text-slate-900 text-left ml-10 mb-4 font-bold">Popular Movies</h2>
<div id="popular-movies" class="w-full flex items-center justify-between">
    <Button
        class="bg-transparent border-none p-0 inline-flex justify-center items-center hover:bg-transparent focus:outline-none focus-within:ring-0"
        on:click={handlePreviousPopularMoviePage}
    >
        <CaretLeftSolid
            class="w-8 h-8 text-slate-900 hover:text-slate-800 cursor-pointer"
        />
    </Button>
    <div class="grid grid-cols-5">
        {#if popularMovies}
            {#each popularMovies as movie}
                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    width={128}
                    movieId={movie.id}
                />
            {/each}
        {:else}
            {#each Array(5).fill() as _}
                <div class="w-full h-48">
                    <ImagePlaceholder
                        imgOnly
                        class="w-32 rounded-sm mx-2 drop-shadow-md"
                    />
                </div>
            {/each}
        {/if}
    </div>
    <Button
        class="bg-transparent border-none p-0 inline-flex justify-center items-center hover:bg-transparent focus:outline-none focus-within:ring-0"
        on:click={handleNextPopularMoviePage}
    >
        <CaretRightSolid
            class="w-8 h-8 text-slate-900 hover:text-slate-800 cursor-pointer"
        />
    </Button>
</div>
