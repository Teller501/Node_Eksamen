<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/api";
    import { userStore } from "../../stores/authStore";
    import { onMount } from "svelte";
    import Movie from "../../components/Movie.svelte";

    let recommendations = [];
    let movieDetails = [];

    async function fetchRecommendations() {
        const { data } = await fetchGet(`${$BASE_URL}/api/recommendations/${$userStore.id}`);
        recommendations = data;

        for (const id of recommendations) {
            const detail = await fetchMovieDetails(id);
            movieDetails = [...movieDetails, detail];
        }
    }

    async function fetchMovieDetails(id) {
        const { data } = await fetchGet(`${$BASE_URL}/api/movies/${id}`);
        return data;
    }


    onMount(async () => {
        await fetchRecommendations();
    });
</script>

<h1 class="text-slate-900 text-xl font-bold">Your recommendations are ready!</h1>

<div class="container mx-auto px-4 mt-4">
    <div class="grid grid-cols-3 gap-4">
        {#if movieDetails}
            {#each movieDetails as movie}
            <Movie
                movieId={movie?.id}
                posterPath={movie?.poster_path}
                alt={movie?.title}
                width="w-8"
            />
            {/each}
        {/if}
    </div>
</div>