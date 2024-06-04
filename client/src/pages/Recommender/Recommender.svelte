<script>
    import { Card, ImagePlaceholder, TextPlaceholder } from "flowbite-svelte";
    import Recommendation from "../../components/Recommendation.svelte";
    import { fetchGet, fetchPost } from "../../util/api";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore, tokenStore } from "../../stores/authStore";
    import { recommendationStore } from "../../stores/recommendationStore";

    import { onMount } from "svelte";

    let movie = null;
    let page = 1;
    let isOnWatchlist = false;

    async function getRecommendationMovie() {
        movie = null;
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/recommender?page=${page}`,
            $tokenStore
        );
        movie = data[0];
        checkIfMovieOnWatchlist(movie.id);
    }

    function handleRateMovie(rating) {
        const tmdb_id = parseInt(movie.id);

        recommendationStore.update((store) => {
            return {
                ...store,
                user_ratings: [...store.user_ratings, { tmdb_id, rating }],
            };
        });

        const ratings = $recommendationStore.user_ratings;
        const random = Math.floor(Math.random() * 10) + 10;

        if (ratings.length >= random) {
            postRecommendations();
            return;
        }

        page++;
        getRecommendationMovie();
    }

    async function postRecommendations() {
        const payload = {
            user_id: $recommendationStore.user_id,
            user_ratings: $recommendationStore.user_ratings,
    };

        const { status } = await fetchPost(
            `${$BASE_URL}/api/recommendations`,
            payload,
            $tokenStore
        );

        if (status === 200) {
            window.location.href = "/recommendations";
        }
    }

    function handleSkipMovie() {
        page++;
        getRecommendationMovie();
    }

    async function handleAddToWatchlist() {
        await fetchPost(
            `${$BASE_URL}/api/watchlists/${$userStore.id}`,
            { movieId: movie.id },
            $tokenStore
        );
        getRecommendationMovie();
    }

    async function checkIfMovieOnWatchlist(movieId) {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/watchlists/${$userStore.id}/${movieId}`,
            $tokenStore
        );

        isOnWatchlist = data
            ? data.some((movie) => movie.movie_id === movieId)
            : false;
    }

    onMount(async () => {
        recommendationStore.update((store) => ({
            ...store,
            user_id: parseInt($userStore.id),
        }));

        await getRecommendationMovie();
    });
</script>

<div class="flex flex-col items-center">
    <h1 class="text-slate-900 mb-1 mt-8">CineMatch Recommender</h1>
    <p class="text-slate-900 mb-4">
        Please rate a few movies, so we can get to know you, and recommend you
        your next favorite!
    </p>

    {#if movie}
        <Recommendation
            {movie}
            onRateMovie={handleRateMovie}
            onSkipMovie={handleSkipMovie}
            onAddToWatchlist={handleAddToWatchlist}
            {isOnWatchlist}
        />
    {:else}
        <Card size="sm">
            <div class="flex flex-col items-center">
                <ImagePlaceholder imgOnly class="w-36"/>
                <TextPlaceholder size="md" class="mt-8" />
            </div>
        </Card>
    {/if}
</div>
