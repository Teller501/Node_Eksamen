<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/api";
    import { BASE_URL, SOCKET_URL } from "../../stores/generalStore";
    import Movie from "../../components/Movie.svelte";
    import {
        ImagePlaceholder,
        Button,
        Avatar,
        SpeedDial,
        A,
        Skeleton,
    } from "flowbite-svelte";
    import { CaretLeftSolid, CaretRightSolid } from "flowbite-svelte-icons";
    import { tokenStore, userStore } from "../../stores/authStore";
    import { activityStore } from "../../stores/activityStore.js";
    import io from "socket.io-client";
    import ActivityList from "../../components/ActivityList.svelte";
    import SearchModal from "../../components/SearchModal.svelte";
    import blankProfilePic from "../../assets/blank-profile-pic.png";
    import { getProfilePicture } from "../../util/profilePicture.js";

    let popularMovies = null;
    let page = 1;
    let recentLogs = null;

    const user = $userStore;

    const socket = io($SOCKET_URL);

    socket.on("activityLogUpdate", (data) => {
        const activity = data.data;

        activityStore.update((activityListArray) => {
            activityListArray = [activity, ...activityListArray];
            return activityListArray;
        });
    });

    async function fetchMovies() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/popular?limit=5&page=${page}`,
            $tokenStore
        );
        popularMovies = data;
    }

    async function fetchRecentLogs() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/logs/recent`,
            $tokenStore
        );
        recentLogs = data;
    }

    onMount(async () => {
        await Promise.all([fetchMovies(), fetchRecentLogs()]);
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

    $: {
        if (Array.isArray(recentLogs)) {
            recentLogs.forEach((log) => {
                getProfilePicture(
                    `${$BASE_URL}/${log.profile_picture}`,
                    blankProfilePic
                )
                    .then((imgUrl) => {
                        log.imgUrl = imgUrl;
                    })
                    .catch((error) => {
                        console.error("Failed to load profile picture:", error);
                    });
            });
        }
    }
</script>

<h1 class="text-slate-900 text-3xl font-bold">
    Welcome back to CineMatch, {user.username}!
</h1>
<p class="text-slate-900 font-light mb-16">
    Here are some of the latest goods within the wonderful movie world, enjoy!
</p>

<div class="shadow bg-white rounded-lg p-4 border">
    <h2 class="text-slate-900 text-left mb-4 font-bold border-b-2 p-4">
        Popular Movies
    </h2>
    <div id="popular-movies" class="w-full flex items-center justify-between">
        <Button
            class="bg-transparent border-none p-0 inline-flex justify-center items-center hover:bg-transparent focus:outline-none focus-within:ring-0"
            on:click={handlePreviousPopularMoviePage}
        >
            <CaretLeftSolid
                class="w-8 h-8 text-slate-900 hover:text-slate-400 cursor-pointer"
            />
        </Button>
        <div class="grid grid-cols-5">
            {#if popularMovies}
                {#each popularMovies as movie}
                    <Movie
                        posterPath={movie.poster_path}
                        alt={movie.title}
                        width={172}
                        movieId={movie.id}
                    />
                {/each}
            {:else}
                {#each Array(5).fill() as _}
                    <ImagePlaceholder
                        imgOnly
                        class="w-36 rounded-sm mx-2 drop-shadow-md"
                    />
                {/each}
            {/if}
        </div>
        <Button
            class="bg-transparent border-none p-0 inline-flex justify-center items-center hover:bg-transparent focus:outline-none focus-within:ring-0"
            on:click={handleNextPopularMoviePage}
        >
            <CaretRightSolid
                class="w-8 h-8 text-slate-900 hover:text-slate-400 cursor-pointer"
            />
        </Button>
    </div>
</div>

<div class="shadow bg-white rounded-lg p-4 border mt-4">
    <h2 class="text-slate-900 text-left mb-4 font-bold border-b-2 p-4">
        Recent Reviews
    </h2>

    <div class="grid grid-cols-4 gap-4">
        {#if recentLogs}
            {#each recentLogs.slice(0, 4) as log}
                <div class="flex space-x-4">
                    <div class="w-full">
                        <div class="flex items-center w-full">
                            <A
                                href={`/${log.username}`}
                                class="text-slate-900 font-bold me-1 hover:no-underline"
                            >
                                {log.username}
                            </A>
                            <Avatar
                                src={log.imgUrl}
                                href={`/${log.username}`}
                                alt="Profile Picture"
                                class="w-4 h-4"
                            />
                        </div>
                        <div class="text-gray-600 text-sm">
                            {log.created_at.split("T")[0]}
                        </div>
                        <hr
                            class="h-px m-2 bg-primary-300 border-0 dark:bg-primary-700"
                        />
                        <p class="mt-2 text-sm text-left text-gray-700">
                            {log.movie_title} - {log.rating}★
                        </p>
                        <p class="mt-2 text-sm text-left text-gray-700">
                            {log.review}
                        </p>
                    </div>
                </div>
            {/each}
        {:else}
            {#each Array(4).fill() as _}
                <div class="w-full">
                    <Skeleton size="sm" />
                </div>
            {/each}
        {/if}
    </div>
</div>

<ActivityList />

<div class="fixed bottom-0 right-0 z-50 p-4">
    <SpeedDial defaultClass="absolute end-8 bottom-32">
        <SearchModal mode={"log"} />
    </SpeedDial>
</div>
