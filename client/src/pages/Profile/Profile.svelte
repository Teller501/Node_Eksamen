<script>
    import { Tabs, TabItem, Avatar, Button } from "flowbite-svelte";
    import { MapPinSolid } from "flowbite-svelte-icons";
    import EditProfile from "../../components/EditProfile.svelte";
    import ProfileContent from "../../components/Profile/ProfileContent.svelte";
    import WatchedContent from "../../components/Profile/WatchedContent.svelte";
    import WatchList from "../../components/Profile/WatchListContent.svelte";
    import Reviews from "../../components/Profile/ReviewsContent.svelte";
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

    async function handleFollow() {
        if (isOwner) {
            return;
        }

        const body = {
            followerId: $userStore.id,
            followedId: user.id,
        };

        const { status } = await fetchPost(`${$BASE_URL}/api/follows`, body);

        if (status === 200) {
            following = !following;

            if (following) {
                user.followers_count++;
            } else {
                user.followers_count--;
            }
        }
    }

    async function handleUnfollow() {
        if (isOwner) {
            return;
        }

        const { status } = await fetchDelete(
            `${$BASE_URL}/api/follows/${$userStore.id}/${user.id}`
        );

        if (status === 200) {
            following = !following;

            if (following) {
                user.followers_count++;
            } else {
                user.followers_count--;
            }
        }
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
                <div class="flex items-center">
                    <h1 class="text-3xl font-bold text-slate-900">
                        {user.username}
                    </h1>
                    {#if !isOwner}
                        {#if !following}
                            <Button on:click={handleFollow} class="ml-4 h-8"
                                >Follow</Button
                            >
                        {:else}
                            <Button on:click={handleUnfollow} class="ml-4 h-8"
                                >Unfollow</Button
                            >
                        {/if}
                    {/if}
                </div>
                <span
                    class="text-slate-900 text-left text-xs flex items-center"
                >
                    <MapPinSolid size="xs" class="mr-1 fill-primary-600" />
                    {user.location}
                </span>
                <div class="text-gray-600">
                    <span>{user.followers_count} followers</span> •
                    <span>{user.following_count} following</span>
                    •
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
            open={$activeTab === "Profile"}
            title="Profile"
            on:click={() => activeTab.set("Profile")}
            inactiveClasses="bg-slate-300 inline-block text-sm font-medium text-center disabled:cursor-not-allowed py-3 px-4 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-slate-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        >
            <ProfileContent
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
            <WatchedContent {watchedMovies} />
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
