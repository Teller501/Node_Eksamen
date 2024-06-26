<script>
    import { Img, Rating, Hr, Button, List, Li } from "flowbite-svelte";
    import { EyeOutline, EditSolid, StarSolid } from "flowbite-svelte-icons";
    import Movie from "../Movie.svelte";
    import Favorites from "../Favorites.svelte";
    import posterPlaceholder from "../../assets/poster-placeholder.png";
    import { activeTab } from "../../stores/tabStore.js";
    import CompareStats from "../CompareStats.svelte";

    export let lastFourMovies = [];
    export let reviews = [];
    export let favorites = [];
    export let user;
    export let isOwner;
    export let watchList = [];
    export let stats;

    function goToTab(tabName) {
        activeTab.set(tabName);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
</script>

<div
    class="container mx-auto px-4 mt-8 mb-12 grid grid-cols-1 lg:grid-cols-3 gap-4"
>
    <div class="lg:col-span-2">
        <div>
            <div class="flex items-center">
                <h3 class="text-lg font-bold text-slate-900 me-1">
                    Last watched
                </h3>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {#each lastFourMovies as movie}
                    <div class="text-center">
                        <Movie
                            posterPath={movie.poster_path}
                            alt={movie.title}
                            movieId={movie.movie_id}
                            width="w-4"
                        />
                        <div class="mt-2 d-flex align-items-center">
                            <span class="text-red-500 me-2">
                                {#if movie.rating}
                                    <Rating
                                        total={5}
                                        size={20}
                                        rating={movie.rating}
                                    />
                                {/if}
                            </span>
                            <span
                                class="text-gray-500 text-xs flex items-center {movie.rating
                                    ? ''
                                    : 'mt-5'}"
                            >
                                <EyeOutline size="xs" class="mr-1" />
                                {movie.watched_on.split("T")[0]}
                            </span>
                        </div>
                    </div>
                {/each}
            </div>
            <Button class="mt-4" on:click={() => goToTab("Watched")}
                >View more</Button
            >
        </div>
        <div class="mt-8">
            <div class="flex items-center">
                <h3 class="text-lg font-bold text-slate-900 me-1">
                    Recent Reviews
                </h3>
                <EditSolid />
            </div>
            <div class="mt-4 space-y-4 mb-2">
                {#each reviews.slice(0, 2) as review}
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
                                    >({review.release_date.split("-")[0]})</span
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
                            <p>
                                {#if review.rating}
                                    <Rating
                                        total={5}
                                        size={30}
                                        rating={review.rating}
                                        class="absolute bottom-0 right-0 mb-2 mr-2"
                                    />
                                {/if}
                            </p>
                        </div>
                    </div>
                {/each}
                <Button class="mt-4" on:click={() => goToTab("Reviews")}
                    >View more</Button
                >
            </div>
        </div>
    </div>
    <div class="lg:col-span-1 space-y-4">
        <div class="bg-white p-4 rounded-md shadow-md">
            <h3 class="text-lg font-bold text-slate-900">
                About {user?.username}
            </h3>
            <p class="text-gray-700 mt-2">
                {user?.bio ?? ""}
            </p>
        </div>
        <div class="bg-white p-4 rounded-md shadow-md mt-4">
            <div class="relative flex items-center">
                <h3 class="text-lg font-bold text-slate-900 ms-16">
                    Favorites
                </h3>
                <Favorites {user} {isOwner} />
            </div>
            <div class="flex justify-center space-x-2 mt-2">
                {#each favorites as favorite, i (favorite.movie_id)}
                    <Movie
                        posterPath={favorite.poster_path}
                        width={68}
                        alt={`Favorite ${i + 1}, (${favorite.title})`}
                        movieId={favorite.movie_id}
                    />
                {/each}

                {#each Array(4 - favorites.length) as _}
                    <Img
                        src={posterPlaceholder}
                        alt="Placeholder"
                        class="w-14 h-20"
                    />
                {/each}
            </div>
        </div>
        <div class="bg-white p-4 rounded-md shadow-md mt-4">
            <div class="flex items-center">
                <h3 class="text-lg font-bold text-slate-900 ms-16 me-1">
                    Watchlist
                </h3>
            </div>
            <div class="flex space-x-2 mt-2">
                {#each watchList.slice(0, 3) as movie}
                    <Movie
                        posterPath={movie.poster_path}
                        width={64}
                        alt={movie.title}
                        movieId={movie.movie_id}
                    />
                {/each}
                {#if watchList.length > 3}
                    <Button
                        type="button"
                        class="w-10 h-20 text-xs p-1 bg-primary-400 hover:bg-primary-200"
                        on:click={() => goToTab("Watchlist")}
                        >+{watchList.length - 3} more</Button
                    >
                {/if}

                {#if watchList.length === 0}
                    <p class="text-gray-500">No movies in watchlist..</p>
                {/if}
            </div>
        </div>
        <div class="bg-white p-4 rounded-md shadow-md mt-4">
            <div class="relative flex items-center">
                <h3 class="text-lg font-bold text-slate-900 ms-16 me-1">
                    Stats
                </h3>
                <CompareStats {user} {isOwner} userStats={stats} />
            </div>
            <div class="flex flex-col items-center space-x-2 mt-2 w-full">
                {#if stats}
                    <List list="none" class="flex flex-col items-center w-full">
                        <Li class="text-slate-950 font-light"
                            >Total movies watched: {stats.total_movies_watched}</Li
                        >
                        <Li class="text-slate-950 font-light"
                            >Movies watched this year: {stats.movies_watched_this_year}</Li
                        >
                        <Li class="text-slate-950 font-light"
                            >Most movies in a month: {stats.most_movies_in_a_month}</Li
                        >
                        <Li class="text-slate-950 font-light"
                            >Most movies in a day: {stats.most_movies_in_a_day}</Li
                        >
                        <Li class="text-slate-950 flex items-center font-light">
                            Average rating: {stats.average_rating}
                            <StarSolid
                                class="ml-1 fill-current text-primary-700"
                            />
                        </Li>
                        <Li class="text-slate-950 font-light"
                            >Most watched genre: {stats.most_watched_genre}</Li
                        >
                    </List>
                {/if}
            </div>
        </div>
    </div>
</div>
