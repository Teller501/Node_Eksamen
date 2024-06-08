<script>
    import { onMount } from "svelte";
    import io from "socket.io-client";
    import {
        ImagePlaceholder,
        Button,
        Avatar,
        SpeedDial,
        SpeedDialButton,
        A,
        Skeleton,
        Rating,
    } from "flowbite-svelte";
    import { CaretLeftSolid, CaretRightSolid, ClapperboardPlaySolid, ClockOutline } from "flowbite-svelte-icons";
    import { navigate } from "svelte-routing";
    import { BASE_URL, SOCKET_URL } from "../../stores/generalStore";
    import { tokenStore, userStore } from "../../stores/authStore";
    import { activityStore } from "../../stores/activityStore.js";
    import Movie from "../../components/Movie.svelte";
    import ActivityList from "../../components/ActivityList.svelte";
    import SearchModal from "../../components/SearchModal.svelte";
    import { fetchGet } from "../../util/api";
    import blankProfilePic from "../../assets/blank-profile-pic.png";

    let popularMovies = null;
    let page = 1;
    let recentLogs = null;
    let followingsActivity = null;

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
        const { data } = await fetchGet(`${$BASE_URL}/api/movies/popular?limit=5&page=${page}`, $tokenStore);
        popularMovies = data;
    }

    async function fetchRecentLogs() {
        const { data } = await fetchGet(`${$BASE_URL}/api/logs/recent`, $tokenStore);
        recentLogs = data;
    }

    async function fetchFollowingsLogs() {
        const { data } = await fetchGet(`${$BASE_URL}/api/logs/followings/${user.id}`, $tokenStore);
        followingsActivity = data;
    }

    onMount(async () => {
        await Promise.all([fetchMovies(), fetchRecentLogs(), fetchFollowingsLogs()]);
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

    async function handleRandomMovie() {
        const { data } = await fetchGet(`${$BASE_URL}/api/movies/random`, $tokenStore);
        navigate(`/moviedetails/${data}`);
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

{#if followingsActivity}
    <div class="shadow bg-white rounded-lg p-4 border mt-8">
        <h2 class="text-slate-900 text-left mb-4 font-bold border-b-2 p-4">
            See what your followings have been up to!
        </h2>
        <div id="followings-activity" class="w-full flex justify-center">
            <div class="grid grid-cols-5 gap-4">
                {#if followingsActivity}
                    {#each followingsActivity as activity}
                        <div class="text-center">
                            <Movie
                                posterPath={activity.poster_path}
                                alt={activity.title}
                                movieId={activity.movie_id}
                                width={172}
                            />
                            <div class="mt-2 flex flex-col items-center">
                                <span class="text-red-500">
                                    <Rating
                                        total={5}
                                        size={20}
                                        rating={activity.rating}
                                    />
                                </span>
                                <span class="text-gray-500 text-xs flex items-center">
                                    <ClockOutline size="xs" class="mr-1" />
                                    {activity.watched_on.split("T")[0]}
                                </span>
                                <span class="text-gray-500 text-xs flex items-center mt-1">
                                    <Avatar 
                                        src={activity.profile_picture ? `${$BASE_URL}/${activity.profile_picture}` : blankProfilePic}
                                        href={`/${activity.username}`}
                                        alt="Profile Picture"
                                        size="xs"
                                        class="mr-1" 
                                    /> 
                                    <A href={`/${activity.username}`} class="text-gray-500 me-1 hover:no-underline">{activity.username}</A>
                                </span>
                            </div>
                        </div>
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
        </div>
    </div>
{/if}

<div class="shadow bg-white rounded-lg p-4 border mt-8">
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
                                src={log.profile_picture? `${$BASE_URL}/${log.profile_picture}` : blankProfilePic}
                                href={`/${log.username}`}
                                alt="Profile Picture"
                                size="xs"
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
        <SpeedDialButton name="Random Movie" on:click={handleRandomMovie}>
            <ClapperboardPlaySolid class="w-6 h-6" />
        </SpeedDialButton>
        <SearchModal mode={"log"} />
    </SpeedDial>
</div>
