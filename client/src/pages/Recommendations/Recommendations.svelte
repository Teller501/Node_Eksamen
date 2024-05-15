<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/api";
    import { userStore } from "../../stores/authStore";
    import { onMount } from "svelte";

    let recommendations = [];
    let movieDetails = [];

    async function fetchRecommendations() {
        const { data } = await fetchGet(`${$BASE_URL}/api/recommendations/${$userStore.id}`);
        recommendations = data;

        for (const id of recommendations) {
            const detail = await fetchMovieDetails(id);
            movieDetails.push(detail);
        }
    }

    async function fetchMovieDetails(id) {
        const { data } = await fetchGet(`${$BASE_URL}/api/movies/${id}`);
        return data;
    }


    onMount(async () => {
        await fetchRecommendations();
        console.log(movieDetails);
    });
</script>