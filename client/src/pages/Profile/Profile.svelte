<script>
    import { Tabs, TabItem, Avatar } from "flowbite-svelte";
    import { MapPinSolid } from "flowbite-svelte-icons";
    import EditProfile from "../../components/EditProfile.svelte";
    import ProfileContent from "../../components/Profile/ProfileContent.svelte";
    import WatchedContent from "../../components/Profile/WatchedContent.svelte";
    import { onMount } from "svelte";
    import { userStore } from "../../stores/authStore";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { fetchGet } from "../../util/api.js";
    import { favoritesStore } from "../../stores/favoritesStore.js";

    export let params;
    const username = params.username;

    let user = $userStore;
    let userData;
    let lastFourMovies = [];
    let reviews = [];
    let favorites = [];
    let watchedMovies = [];
    let profilePicturePath;

    let isOwner = false;

    $: isOwner = username === $userStore.username;

    onMount(async () => {
        if (!isOwner) {
            await fetchUser();
        }
        await fetchUserData();
        await fetchUserReviews();
        await fetchUserFavorites();
        await fetchWatchedMovies();
        profilePicturePath = `${$BASE_URL}/${user.profile_picture}`;
    });

    async function fetchUser() {
        const { data } = await fetchGet(`${$BASE_URL}/api/users/${username}`);
        user = data;
    }

    async function fetchUserData() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}`
        );
        if (status === 404) {
            return;
        }
        userData = data;
        lastFourMovies = userData.last_four;
    }

    async function fetchUserReviews() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}/reviews?limit=2`
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
</script>

<div class="container mx-auto p-4">
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <Avatar
                src={profilePicturePath ??
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                alt="Profile Picture"
                class="w-20 h-20"
                border
            />
            <div>
                <h1 class="text-3xl font-bold text-slate-900 text-left">
                    {user.username}
                </h1>
                <span
                    class="text-slate-900 text-left text-xs flex items-center"
                >
                    <MapPinSolid
                        size="xs"
                        class="mr-1 fill-primary-600"
                    />{user.location}
                </span>
                <div class="text-gray-600">
                    <span>3 followers</span> • <span>8 following</span> •
                    <span>{userData?.unique_movies_watched} movies watched</span
                    >
                </div>
            </div>
        </div>
        {#if isOwner}
            <EditProfile />
        {/if}
    </div>
</div>

<div class="container mx-auto px-4 mt-4">
    <Tabs tabStyle="pill">
        <TabItem
            open
            title="Profile"
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <ProfileContent {lastFourMovies} {reviews} {favorites} {user} {isOwner}/>
        </TabItem>
        <TabItem
            title="Watched"
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <WatchedContent {watchedMovies} />
        </TabItem>
        <TabItem
            title="Watchlist"
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Users:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
        <TabItem
            title="Reviews"
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Dashboard:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
        <TabItem
            title="List"
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
