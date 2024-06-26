<script>
    import {
        Rating,
        Card,
        Button,
        AccordionItem,
        Accordion,
        Img,
        Spinner,
        ImagePlaceholder,
        Skeleton,
    } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore, tokenStore } from "../../stores/authStore";
    import { fetchGet, fetchPost, fetchDelete } from "../../util/api";
    import toast, { Toaster } from "svelte-french-toast";
    import LogMovie from "../../components/LogMovie.svelte";
    import Reviews from "../../components/Reviews.svelte";
    import Movie from "../../components/Movie.svelte";
    import { ClockOutline, EyeOutline } from "flowbite-svelte-icons";
    import tmdbLogo from "../../assets/tmdb-logo.png";
    import cinematchLogo from "../../assets/CineMatch.png";

    const movieId = window.location.pathname.split("/").pop();
    let movieDetails;
    let reviews;
    let movieStats;
    let similarMovies;
    let isOnWatchlist = false;
    let loadingSimilarMovies = true;
    let logMovieModal = false;

    async function fetchMovie() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/${movieId}`,
            $tokenStore
        );
        movieDetails = data;
        const showOnlyYear = movieDetails.release_date;
        movieDetails.release_date = showOnlyYear.slice(0, 4);
    }

    async function fetchReview(movieId) {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/reviews/${movieId}`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        reviews = data;
    }

    async function fetchStats(movieId) {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/logs/movie/${movieId}/aggregated`,
            $tokenStore
        );
        movieStats = data;
    }

    async function fetchSimilarMovies(movieId) {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/${movieId}/similar`,
            $tokenStore
        );
        similarMovies = data;
        loadingSimilarMovies = false;
    }

    async function toggleMovieOnWatchlist() {
        if (isOnWatchlist) {
            const { status } = await fetchDelete(
                `${$BASE_URL}/api/watchlists/${$userStore.id}/${movieId}`,
                $tokenStore
            );
            if (status === 200) {
                isOnWatchlist = false;
            }
        } else {
            const response = await fetchPost(
                `${$BASE_URL}/api/watchlists/${$userStore.id}`,
                { movieId: movieId },
                $tokenStore
            );

            if (response.status === 201) {
                isOnWatchlist = true;
                toast.success("Movie added to watchlist!", { duration: 3000 });
            }
        }
    }

    async function checkIfMovieOnWatchlist() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/watchlists/${$userStore.id}/${movieId}`,
            $tokenStore
        );

        isOnWatchlist = data
            ? data.some((movie) => movie.movie_id === movieId)
            : false;
    }

    function handleLogMovie() {
        checkIfMovieOnWatchlist();
    }

    onMount(async () => {
        await Promise.all([
            fetchMovie(),
            fetchReview(movieId),
            fetchStats(movieId),
            fetchSimilarMovies(movieId),
            checkIfMovieOnWatchlist(),
        ]);
    });
</script>

<Toaster />

<Img
    src={`https://image.tmdb.org/t/p/original${movieDetails?.backdrop_path}`}
    alt="Movie backdrop"
    class="w-full absolute z-[-1] inset-0 blur-sm"
/>
<div class="container mx-auto mt-20 text-left">
    <Card size="md">
        {#if movieDetails}
            <Img
                src={`https://image.tmdb.org/t/p/original${movieDetails?.poster_path}`}
                alt="Movie poster"
                class="w-48 h-72 rounded shadow-lg"
            />
            <h5
                class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
                {movieDetails?.title}
                <span class="text-gray-600 font-light text-lg"
                    >{movieDetails?.original_title !== movieDetails?.title
                        ? `(${movieDetails?.original_title})`
                        : ""}</span
                >
            </h5>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
                {movieDetails?.release_date} - {movieDetails?.runtime} minutes
            </p>
            <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">
                {movieDetails?.genres}
            </p>
            <hr class="my-4 border-gray-200 dark:border-gray-700" />
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {movieDetails?.overview}
            </p>
            <Rating count rating={movieDetails?.vote_average}>
                <span class="font-normal text-black">/10</span>
                <span
                    class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"
                />
                <p
                    class="text-sm font-medium text-gray-900 dark:text-white mr-2"
                >
                    out of {movieDetails?.vote_count} ratings
                </p>
                <Img
                    src={tmdbLogo}
                    alt="TMDB logo"
                    class="w-6 h-6 border rounded p-1 shadow"
                />
            </Rating>

            <Rating count rating={movieStats?.average_rating ?? 0}>
                <span class="font-normal text-black">/5</span>
                <span
                    class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400"
                />
                <p
                    class="text-sm font-medium text-gray-900 dark:text-white mr-2"
                >
                    out of {movieStats?.total_ratings !== null
                        ? movieStats?.total_ratings
                        : 0} ratings
                </p>
                <Img src={cinematchLogo} alt="Cinematch logo" class="w-6 h-6" />
            </Rating>

            <p class="text-gray-700 inline-flex items-center">
                {movieStats?.total_logs}
                <EyeOutline />
            </p>

            <p class="text-gray-700 inline-flex items-center">
                {movieStats?.total_watchlist_users}
                <ClockOutline />
            </p>

            <hr class="my-4 border-gray-200 dark:border-gray-700" />
        {:else}
            <ImagePlaceholder
                imgOnly
                imgHeight="72"
                class="w-48 h-72 rounded shadow-lg"
            />
            <Skeleton size="md" class="my-8" />
            <hr class="my-4 border-gray-200 dark:border-gray-700" />
            <Skeleton size="md" class="my-8" />
            <hr class="my-4 border-gray-200 dark:border-gray-700" />
        {/if}

        <div class="justify-center flex items-center">
            <LogMovie
                bind:open={logMovieModal}
                posterPath={movieDetails?.poster_path}
                title={movieDetails?.title}
                movieId={movieDetails?.id}
                showButton={true}
                on:logMovie={handleLogMovie}
            />
            <Button class="ms-10" on:click={toggleMovieOnWatchlist}>
                {#if isOnWatchlist}
                    Remove from watchlist
                {:else}
                    Add to watchlist
                {/if}
                <ClockOutline />
            </Button>
        </div>

        <Accordion flush class="mt-8">
            <AccordionItem class="bg-slate-200 mb-2">
                <span slot="header">Reviews</span>
                <div id="review-section">
                    {#if reviews && Array.isArray(reviews)}
                        <Reviews
                            reviews={reviews.slice(0, 4)}
                            showMoviePoster={false}
                            showMovieTitle={false}
                            showReleaseDate={false}
                            showUsername={true}
                            showUserAvatar={true}
                            marginX={"0"}
                        />
                        <div class="flex justify-end">
                            <Button
                                class="mt-2 hover:text-white"
                                href={`/reviews/${movieDetails.id}`}
                                >View all reviews</Button
                            >
                        </div>
                    {:else}
                        <p class="text-gray-500 dark:text-gray-400">
                            No reviews yet.
                        </p>
                    {/if}
                </div>
            </AccordionItem>
            <AccordionItem class="bg-slate-200 mb-2">
                <span slot="header">Cast</span>
                <p class="mb-2 text-gray-500 dark:text-gray-400">
                    {#if movieDetails?.cast_list && Array.isArray(movieDetails?.cast_list)}
                        {#each movieDetails?.cast_list as cast}
                            <span class="font-bold">{cast?.name}, </span>
                            playing as
                            <span class="font-bold">{cast?.character}</span>
                            <br />
                        {/each}
                    {/if}
                </p>
            </AccordionItem>
            <AccordionItem class="bg-slate-200 mb-2">
                <span slot="header">Similar movies</span>
                <div class="grid grid-cols-2">
                    {#if loadingSimilarMovies}
                        <p>Loading similar movies... <Spinner size={4} /></p>
                    {:else if similarMovies && Array.isArray(similarMovies)}
                        {#each similarMovies.slice(0, 8) as movie}
                            <div class="flex flex-col items-center mt-5">
                                <Movie
                                    posterPath={movie.poster_path}
                                    alt={movie.title}
                                    width={128}
                                    movieId={movie.id}
                                />
                                <p class="text-gray-800 text-center font-bold">
                                    {movie.title} - {movie?.release_date.slice(
                                        0,
                                        4
                                    )}
                                </p>
                            </div>
                        {/each}
                    {/if}
                </div>
            </AccordionItem>
        </Accordion>
    </Card>
</div>
