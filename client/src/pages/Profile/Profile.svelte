<script>
    import { onMount, onDestroy } from "svelte";
    import { Tabs, TabItem } from "flowbite-svelte";
    import Profile from "../../components/Profile/Profile.svelte";
    import Watched from "../../components/Profile/Watched.svelte";
    import WatchList from "../../components/Profile/WatchList.svelte";
    import List from "../../components/Profile/List.svelte";
    import Reviews from "../../components/Reviews.svelte";
    import ProfileHeader from "../../components/Profile/ProfileHeader.svelte";
    import { userStore, tokenStore } from "../../stores/authStore";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { listsStore } from "../../stores/listsStore.js";
    import { favoritesStore } from "../../stores/favoritesStore.js";
    import { activeTab } from "../../stores/tabStore.js";
    import { fetchGet } from "../../util/api.js";
    import blankProfilePic from "../../assets/blank-profile-pic.png";

    export let params;
    const username = params.username;

    let user = $userStore;
    let userData;
    let lastFourMovies = [];
    let reviews = [];
    let favorites = [];
    let watchedMovies = [];
    let watchList = [];
    let lists = [];
    let followersList = [];
    let followingsList = [];
    let followersCount;
    let followingsCount;
    let isOwner = false;
    let following = false;
    let profilePicturePath;
    let stats;

    $: isOwner = username === $userStore.username;

    listsStore.subscribe((value) => {
        lists = value;
    });

    onMount(async () => {
        await fetchUser();

        await Promise.all([
            fetchUserData(),
            fetchUserReviews(),
            fetchUserFavorites(),
            fetchWatchedMovies(),
            fetchWatchList(),
            fetchLists(),
            checkIfFollowing(),
            fetchFollowers(),
            fetchFollowings(),
            fetchStats(),
        ]);

        profilePicturePath = user.profile_picture? `${$BASE_URL}/${user.profile_picture}` : blankProfilePic;
    });

    onDestroy(() => {
        activeTab.set("Profile");
    });

    async function fetchUser() {
        if (!isOwner) {
            const { data, status } = await fetchGet(
                `${$BASE_URL}/api/users/${username}`,
                $tokenStore
            );

            if (status === 404) {
                window.location.href = "/404";
                return;
            }

            user = data;
        } else {
            const { data } = await fetchGet(`${$BASE_URL}/api/users/${user.username}`, $tokenStore);

            user = data;
            userStore.set(user);
        }
    }

    async function fetchUserData() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}`,
            $tokenStore
        );

        userData = data;
        lastFourMovies = userData.last_four;
    }

    async function fetchUserReviews() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}/reviews`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        reviews = data;
    }

    async function fetchUserFavorites() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/favorites/${user.id}`,
            $tokenStore
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
            `${$BASE_URL}/api/logs/user/${user.id}/watched`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        watchedMovies = data;
    }

    async function fetchWatchList() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/watchlists/${user.id}`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        watchList = data;
    }

    async function fetchLists() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/lists/${user.id}`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        lists = data;

        listsStore.set(lists);
    }

    async function checkIfFollowing() {
        if (isOwner) {
            return;
        }

        const { data } = await fetchGet(
            `${$BASE_URL}/api/follows/${$userStore.id}/${user.id}`,
            $tokenStore
        );

        following = data;
    }

    async function fetchFollowers() {
        const { data } = await fetchGet(`${$BASE_URL}/api/follows/${user.id}/followers`, $tokenStore);
        followersList = data;
        followersCount = followersList ? followersList.length : 0;
    }

    async function fetchFollowings() {
        const { data } = await fetchGet(`${$BASE_URL}/api/follows/${user.id}/following`, $tokenStore);
        followingsList = data;
        followingsCount = followingsList ? followingsList.length : 0;
    }

    async function fetchStats() {
        const { data } = await fetchGet(`${$BASE_URL}/api/users/${user.id}/statistics`, $tokenStore);

        stats = data;
    }
</script>

<ProfileHeader
    {user}
    {isOwner}
    {following}
    profilePicturePath={profilePicturePath}
    {userData}
    followers={followersList}
    {followersCount}
    followings={followingsList}
    {followingsCount}
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
                {stats}
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
            title="Lists"
            on:click={() => activeTab.set("List")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <List {lists} {isOwner} />
        </TabItem>
    </Tabs>
</div>
