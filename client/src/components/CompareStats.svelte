<script>
    import {
        Modal,
        Button,
        Listgroup,
        ListgroupItem,
        Avatar,
        List,
        Li,
    } from "flowbite-svelte";
    import { StarSolid } from "flowbite-svelte-icons";
    import { onMount } from "svelte";
    import { fetchGet } from "../util/api.js";
    import { tokenStore, userStore } from "../stores/authStore";
    import { BASE_URL } from "../stores/generalStore";
    import blankProfilePic from "../assets/blank-profile-pic.png";

    export let user;
    export let isOwner;
    export let userStats;

    let compareModal = false;
    let followingsList = [];
    let comparingWith = user;
    let comparingStats;

    onMount(async () => {
        if (isOwner) {
            await fetchFollowings();
        }

        comparingWith = isOwner ? user : $userStore;

        await fetchComparingStats();
    });

    async function fetchFollowings() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/follows/${user.id}/following`,
            $tokenStore
        );
        followingsList = data;
    }

    async function handleSelectFollowing(following) {
        comparingWith = following;

        await fetchComparingStats();
    }

    async function fetchComparingStats() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/users/${comparingWith.id}/statistics`,
            $tokenStore
        );
        comparingStats = data;
    }

    function highlightClass(userValue, comparingValue) {
        const userStringValue =
            typeof userValue === "string" ? userValue : String(userValue);
        const comparingStringValue =
            typeof comparingValue === "string"
                ? comparingValue
                : String(comparingValue);

        const userNumericPart = parseInt(
            userStringValue.replace(/\D/g, ""),
            10
        );
        const comparingNumericPart = parseInt(
            comparingStringValue.replace(/\D/g, ""),
            10
        );

        return userNumericPart > comparingNumericPart
            ? "font-bold"
            : userNumericPart < comparingNumericPart
              ? "font-light"
              : "";
    }
</script>

<Button class="h-8 w-18 absolute right-0" on:click={() => (compareModal = true)}
    >Compare</Button
>

<Modal
    bind:open={compareModal}
    size="md"
    autoclose={false}
    class="w-full"
    outsideclose
>
    <div class="flex flex-col md:flex-row items-center justify-around">
        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left"
        >
            <div>
                <h2 class="text-2xl font-bold mb-4">{user.username}</h2>
                {#if userStats}
                    <List list="none">
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    userStats.total_movies_watched,
                                    comparingStats?.total_movies_watched
                                )}
                                >Total movies watched: {userStats.total_movies_watched}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    userStats.movies_watched_this_year,
                                    comparingStats?.movies_watched_this_year
                                )}
                                >Movies watched this year: {userStats.movies_watched_this_year}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    userStats.most_movies_in_a_month.split(" "),
                                    comparingStats?.most_movies_in_a_month.split(
                                        " "
                                    )
                                )}
                                >Most movies in a month: {userStats.most_movies_in_a_month}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    userStats.most_movies_in_a_day.split(" "),
                                    comparingStats?.most_movies_in_a_day.split(
                                        " "
                                    )
                                )}
                                >Most movies in a day: {userStats.most_movies_in_a_day}</span
                            >
                        </Li>
                        <Li class="text-slate-950 flex items-center font-light">
                            <span
                                class={highlightClass(
                                    userStats.average_rating,
                                    comparingStats?.average_rating
                                )}
                                >Average rating: {userStats.average_rating}</span
                            >
                            <StarSolid
                                class="ml-1 fill-current text-primary-700"
                            />
                        </Li>
                        <Li class="text-slate-950 font-light"
                            >Most watched genre: {userStats.most_watched_genre}</Li
                        >
                    </List>
                {/if}
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-4">
                    {comparingWith.username}
                </h2>
                {#if comparingStats}
                    <List list="none">
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    comparingStats.total_movies_watched,
                                    userStats?.total_movies_watched
                                )}
                                >Total movies watched: {comparingStats.total_movies_watched}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    comparingStats.movies_watched_this_year,
                                    userStats?.movies_watched_this_year
                                )}
                                >Movies watched this year: {comparingStats.movies_watched_this_year}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    comparingStats.most_movies_in_a_month.split(
                                        " "
                                    ),
                                    userStats?.most_movies_in_a_month.split(" ")
                                )}
                                >Most movies in a month: {comparingStats.most_movies_in_a_month}</span
                            >
                        </Li>
                        <Li class="text-slate-950 font-light">
                            <span
                                class={highlightClass(
                                    comparingStats.most_movies_in_a_day.split(
                                        " "
                                    ),
                                    userStats?.most_movies_in_a_day.split(" ")
                                )}
                                >Most movies in a day: {comparingStats.most_movies_in_a_day}</span
                            >
                        </Li>
                        <Li class="text-slate-950 flex items-center font-light">
                            <span
                                class={highlightClass(
                                    comparingStats.average_rating,
                                    userStats?.average_rating
                                )}
                                >Average rating: {comparingStats.average_rating}</span
                            >
                            <StarSolid
                                class="ml-1 fill-current text-primary-700"
                            />
                        </Li>
                        <Li class="text-slate-950 font-light"
                            >Most watched genre: {comparingStats.most_watched_genre}</Li
                        >
                    </List>
                {/if}
            </div>
        </div>

        {#if isOwner}
            {#if followingsList?.length > 0}
                <Listgroup class="w-48" active>
                    <h3
                        class="p-1 text-center text-xl font-medium text-gray-900 dark:text-white"
                    >
                        Following
                    </h3>
                    {#each followingsList as following}
                        <ListgroupItem
                            class="bg-slate-200 rounded-none"
                            on:click={() => handleSelectFollowing(following)}
                        >
                            <Avatar
                                src={following.profile_picture
                                    ? `${$BASE_URL}/${following.profile_picture}`
                                    : blankProfilePic}
                                alt={following.username}
                                size="sm"
                            />
                            <span>{following.username}</span>
                        </ListgroupItem>
                    {/each}
                </Listgroup>
            {/if}
        {/if}
    </div>
</Modal>
