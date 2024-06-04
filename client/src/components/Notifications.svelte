<script>
    import { notificationStore } from "../stores/notificationStore.js";
    import { DropdownItem, Avatar } from "flowbite-svelte";
    import { BASE_URL } from "../stores/generalStore.js";
    import { userStore, tokenStore } from "../stores/authStore.js";
    import { fetchPost } from "../util/api.js";
    import { formatDistanceToNow } from "date-fns";
    import blankProfilePic from "../assets/blank-profile-pic.png";
    import { getProfilePicture } from "../util/profilePicture.js";

    let notifications = [];

    notificationStore.subscribe((value) => {
        notifications = value;
    });

    async function markNotificationAsRead(notificationId) {
        const body = {
            userId: $userStore.id,
            activityId: notificationId,
        };

        const { data } = await fetchPost(
            `${$BASE_URL}/api/activities/read/`,
            body,
            $tokenStore
        );
        const updatedNotification = data;

        notificationStore.update((notificationListArray) => {
            return notificationListArray.map((notification) =>
                notification._id === notificationId
                    ? { ...notification, read: true }
                    : notification
            );
        });
    }

    function formatTime(date) {
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    }
</script>

{#if notifications.length > 0}
    {#each notifications as notification (notification._id || "fallback-" + Math.random())}
        {#if notification.activityType === "follow"}
            <DropdownItem
                on:click={() => markNotificationAsRead(notification._id)}
                href={`/${notification.follower.username}`}
                class="flex space-x-4 rtl:space-x-reverse bg-slate-200"
            >
                <Avatar
                    src={getProfilePicture(`${$BASE_URL}/${notification.profile_picture}`, blankProfilePic)}
                    alt="Profile Picture"
                    class="w-8 h-8"
                    border
                />
                <div class="ps-3 w-full">
                    <div
                        class="text-gray-500 text-sm mb-1.5 dark:text-gray-400"
                    >
                        <span
                            class="font-semibold text-gray-900 dark:text-white"
                        >
                            {notification.follower.username}
                        </span>
                        started following you!
                    </div>
                    <div class="text-xs text-primary-600 dark:text-primary-500">
                        {formatTime(notification.date)}
                    </div>
                </div>
            </DropdownItem>
        {/if}
        {#if notification.activityType === "like"}
            <DropdownItem
                on:click={() => markNotificationAsRead(notification._id)}
                class="flex space-x-4 rtl:space-x-reverse bg-slate-200"
            >
                <Avatar
                    src={getProfilePicture(`${$BASE_URL}/${notification.profile_picture}`, blankProfilePic)}
                    alt="Profile Picture"
                    class="w-8 h-8"
                    border
                />
                <div class="ps-3 w-full">
                    <div
                        class="text-gray-500 text-sm mb-1.5 dark:text-gray-400"
                    >
                        <span
                            class="font-semibold text-gray-900 dark:text-white"
                        >
                            {notification.liker.username}
                        </span>
                        just liked your review of
                        <span
                            class="font-semibold text-gray-900 dark:text-white"
                        >
                            {notification.movieTitle}
                        </span>
                        !
                    </div>
                    <div class="text-xs text-primary-600 dark:text-primary-500">
                        {formatTime(notification.date)}
                    </div>
                </div>
            </DropdownItem>
        {/if}
    {/each}
{/if}
