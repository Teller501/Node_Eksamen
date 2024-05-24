<script>
    import { Tabs, TabItem } from "flowbite-svelte";
    import Profile from "../../components/Profile/Profile.svelte";
    import Watched from "../../components/Profile/Watched.svelte";
    import WatchList from "../../components/Profile/WatchList.svelte";
    import Reviews from "../../components/Profile/Reviews.svelte";
    import ProfileHeader from "../../components/Profile/ProfileHeader.svelte";
    import { onMount, onDestroy } from "svelte";
    import { userStore } from "../../stores/authStore";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { fetchGet, fetchPost, fetchDelete } from "../../util/api.js";
    import { favoritesStore } from "../../stores/favoritesStore.js";
    import { activeTab } from "../../stores/tabStore.js";

    export let params;
    const username = params.username;

    let user = $userStore;
    let userData;
    let lastFourMovies = [];
    let reviews = [];
    let favorites = [];
    let watchedMovies = [];
    let watchList = [];
    let profilePicturePath;

    let isOwner = false;
    let following = false;

    $: isOwner = username === $userStore.username;

    onMount(async () => {
        await fetchUser();
        await Promise.all([
            fetchUserData(),
            fetchUserReviews(),
            fetchUserFavorites(),
            fetchWatchedMovies(),
            fetchWatchList(),
            checkIfFollowing(),
        ]);
        profilePicturePath = `${$BASE_URL}/${user.profile_picture}`;
    });

    onDestroy(() => {
        activeTab.set("Profile");
    });

    async function fetchUser() {
        if (!isOwner) {
            const { data, status } = await fetchGet(
                `${$BASE_URL}/api/users/${username}`
            );

            if (status === 404) {
                window.location.href = "/404";
                return;
            }

            user = data;
        } else {
            const { data } = await fetchGet(`${$BASE_URL}/api/users/${user.username}`);

            user = data;
            userStore.set(user);
        }
    }

    async function fetchUserData() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}`
        );

        userData = data;
        lastFourMovies = userData.last_four;
    }

    async function fetchUserReviews() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}/reviews`
        );
        if (status === 404) {
            return;
        }
        reviews = data;
    }

    async function fetchUserFavorites() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/favorites/${user.id}`
        );
        if (status === 404) {
            return;
        }
        favoritesStore.set(data);
    }

    favoritesStore.subscribe((value) => {
        favorites = value;
    });

    async function fetchWatchedMovies() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}/watched`
        );
        if (status === 404) {
            return;
        }
        watchedMovies = data;
    }

    async function fetchWatchList() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/watchlist/${user.id}`
        );
        if (status === 404) {
            return;
        }
        watchList = data;
    }

    async function checkIfFollowing() {
        if (isOwner) {
            return;
        }

        const { data } = await fetchGet(
            `${$BASE_URL}/api/follows/${$userStore.id}/${user.id}`
        );

        following = data;
    }
</script>

<ProfileHeader
    {user}
    {isOwner}
    {following}
    {profilePicturePath}
    {userData}
/>

<div class="container mx-auto px-4 mt-4">
    <Tabs tabStyle="pill">
        <TabItem
            open={$activeTab === "Profile"}
            title="Profile"
            on:click={() => activeTab.set("Profile")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <Profile
                {lastFourMovies}
                {reviews}
                {favorites}
                {user}
                {isOwner}
                {watchList}
            />
        </TabItem>
        <TabItem
            open={$activeTab === "Watched"}
            title="Watched"
            on:click={() => activeTab.set("Watched")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <Watched {watchedMovies} />
        </TabItem>
        <TabItem
            open={$activeTab === "Watchlist"}
            title="Watchlist"
            on:click={() => activeTab.set("Watchlist")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <WatchList {watchList} {isOwner} />
        </TabItem>
        <TabItem
            open={$activeTab === "Reviews"}
            title="Reviews"
            on:click={() => activeTab.set("Reviews")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <Reviews {reviews} />
        </TabItem>
        <TabItem
            open={$activeTab === "List"}
            title="List"
            on:click={() => activeTab.set("List")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Dashboard:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
    </Tabs>
</div>
