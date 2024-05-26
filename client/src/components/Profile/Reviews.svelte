<script>
    import { Hr, Rating, Button, Avatar } from "flowbite-svelte";
    import { ClockOutline, ThumbsUpSolid } from "flowbite-svelte-icons";
    import { userStore } from "../../stores/authStore.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import Movie from "../Movie.svelte";
    import { fetchGet, fetchPost, fetchDelete } from "../../util/api.js";

    export let reviews;
    export let showMoviePoster = true;
    export let showMovieTitle = true;
    export let showReleaseDate = true;
    export let showUsername = false;
    export let showUserAvatar = false;
    export let marginX = "60";

    async function checkIfLiked(userId, reviewId) {
        const { data } = await fetchGet(`${$BASE_URL}/api/likes/${userId}/${reviewId}`);
        return data;
    }

    async function handleLikeReview(userId, reviewId) {
        const body = {
            userId: userId,
            reviewId: reviewId,
        };

        const { status } = await fetchPost(`${$BASE_URL}/api/likes`, body);
        if (status === 200) {
            reviews = reviews.map(review => {
                if (review.id === reviewId) {
                    return { ...review, liked: true, total_likes: Number(review.total_likes) + 1 };
                }
                return review;
            });
        }
    }

    async function handleUnlikeReview(userId, reviewId) {
        const { status } = await fetchDelete(`${$BASE_URL}/api/likes/${userId}/${reviewId}`);
        if (status === 200) {
            reviews = reviews.map(review => {
                if (review.id === reviewId) {
                    return { ...review, liked: false, total_likes: Number(review.total_likes) - 1 };
                }
                return review;
            });
        }
    }
</script>

<h2 class="text-2xl font-bold text-slate-900">Recent Reviews</h2>
<div class="mt-4 space-y-4 mb-2">
    {#each reviews as review}
        <div class="flex space-x-4 mx-{marginX}">
            {#if showMoviePoster}
                <Movie
                    posterPath={review.poster_path}
                    alt={review.title}
                    movieId={review.movie_id}
                    width={128}
                />
            {/if}
            <div class="w-full mb-6">
                {#if showMovieTitle}
                    <h3
                        class={`text-lg font-bold text-slate-900 ${review.title.length > 20 ? "text-sm" : "text-lg"}`}
                    >
                        <span>{review.title}</span>
                        {#if showReleaseDate}
                            <span class="text-gray-500 text-xs font-light"
                                >({review.release_date?.split("T")[0]})</span
                            >
                        {/if}
                    </h3>
                {/if}
                <div class="flex items-center justify-between">
                    <div class="text-gray-600 text-sm mr-2">
                        Watched on {review.watched_on.split("T")[0]}
                    </div>
                    {#if showUsername || showUserAvatar}
                        <div class="flex items-center">
                            {#if showUserAvatar}
                                <Avatar
                                    src={`${$BASE_URL}/${review.profile_picture}`}
                                    size="xs"
                                    class="mr-2"
                                />
                            {/if}
                            {#if showUsername}
                                <span class="text-gray-600 text-sm">by {review.username}</span>
                            {/if}
                        </div>
                    {/if}
                </div>
                
                <Hr
                    hrClass="h-px my-2 bg-primary-300 border-0 dark:bg-primary-700"
                />
                <p class="mt-2 text-sm text-left text-gray-700">
                    {review.review}
                </p>
                <div class="flex justify-between items-center mt-4">
                    <div class="flex flex-col space-y-1">
                        <span
                            class="text-gray-700 text-xs flex items-center mb-2"
                        >
                            <ClockOutline size="xs" class="mr-1" />
                            {review.created_at.split("T")[0]}
                        </span>
                        {#if review.user_id !== $userStore.id}
                            {#await checkIfLiked($userStore.id, review.id) then liked}
                                {#if liked}
                                    <span class="text-gray-700 text-xs flex items-center">
                                        <Button
                                            class="bg-transparent text-primary-700 hover:bg-transparent hover:text-white-700 focus:ring-0 p-1"
                                            on:click={() => handleUnlikeReview($userStore.id, review.id)}
                                            ><ThumbsUpSolid size="md" class="mr-1" /> Liked</Button
                                        >
                                        {#if review.total_likes > 0}
                                            {review.total_likes} likes
                                        {/if}
                                    </span>
                                {:else}
                                    <span class="text-gray-700 text-xs flex items-center">
                                        <Button
                                            class="bg-transparent text-slate-950 hover:bg-transparent hover:text-primary-700 focus:ring-0 p-1"
                                            on:click={() => handleLikeReview($userStore.id, review.id)}
                                            ><ThumbsUpSolid size="md" class="mr-1" /> Like Review</Button
                                        >
                                        {#if review.total_likes > 0}
                                            {review.total_likes} likes
                                        {/if}
                                    </span>
                                {/if}
                            {/await}
                        {:else}
                            {#if review.total_likes > 0}
                                <span class="text-gray-700 text-xs flex items-center">
                                    <ThumbsUpSolid size="md" class="mr-1" />
                                    {review.total_likes} likes
                                </span>
                            {/if}
                        {/if}

                    </div>
                    {#if review.rating}
                        <Rating total={5} size={30} rating={review.rating} />
                    {/if}
                </div>
            </div>
        </div>
    {/each}
</div>