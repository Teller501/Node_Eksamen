<script>
    import { Hr, Rating } from "flowbite-svelte";
    import { ClockOutline } from "flowbite-svelte-icons";
    import Movie from "../Movie.svelte";

    export let reviews;
</script>

<h2 class="text-2xl font-bold text-slate-900">Recent Reviews</h2>
<div class="mt-4 space-y-4 mb-2">
    {#each reviews as review}
        <div class="flex space-x-4 relative">
            <Movie
                posterPath={review.poster_path}
                alt={review.title}
                movieId={review.movie_id}
                width={128}
            />
            <div class="w-full relative">
                <h3
                    class={`text-lg font-bold text-slate-900 ${review.title.length > 20 ? "text-sm" : "text-lg"}`}
                >
                    <span>{review.title}</span>
                    <span class="text-gray-500 text-xs font-light"
                        >({review.release_date.split("T")[0]})</span
                    >
                </h3>
                <div class="text-gray-600 text-sm">
                    Watched on {review.watched_on.split("T")[0]}
                </div>
                <Hr
                    hrClass="h-px my-2 bg-primary-300 border-0 dark:bg-primary-700"
                />
                <p class="mt-2 text-sm text-left text-gray-700">
                    {review.review}
                </p>
                {#if review.rating}
                    <div class="absolute bottom-2 right-2">
                        <Rating
                            total={5}
                            size={30}
                            rating={review.rating}
                        />
                    </div>
                {/if}
                <div class="absolute bottom-2 left-2 mb-1">
                    <span class="text-gray-700 text-xs flex items-center">
                        <ClockOutline size="xs" class="mr-1" />
                        {review.created_at.split("T")[0]}
                    </span>
                </div>
            </div>
        </div>
    {/each}
</div>
