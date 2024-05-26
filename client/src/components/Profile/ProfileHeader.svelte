<script>
    import { Avatar, Button } from "flowbite-svelte";
    import { MapPinSolid } from "flowbite-svelte-icons";
    import EditProfile from "../EditProfile.svelte";
    import { fetchPost, fetchDelete } from "../../util/api.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { userStore } from "../../stores/authStore";
    import Followers from "../Followers.svelte";

    export let user;
    export let isOwner;
    export let following;
    export let profilePicturePath;
    export let userData;
    export let followers;
    export let followersCount;

    $: isFollowing = following;

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
            isFollowing = !isFollowing;

            if (isFollowing) {
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
            isFollowing = !isFollowing;

            if (isFollowing) {
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
                        {#if !isFollowing}
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
                    <Followers {followers} {followersCount}/> •
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