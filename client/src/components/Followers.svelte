<script>
    import { Modal, A, Avatar } from "flowbite-svelte";
    import { MapPinSolid } from "flowbite-svelte-icons";

    export let followers;
    export let followersCount;

    let followersModal = false;
</script>

<span><A class="hover:no-underline text-gray-500 hover:text-gray-600 font-normal" on:click={() => (followersModal = true)}>{followersCount} followers</A></span>

<Modal bind:open={followersModal} size="md" autoclose={false} class="w-full" outsideclose>
    <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-4">Followers</h1>
        {#if followers.length === 0}
            <p>No followers yet.</p>
        {:else}
            {#each followers as follower}
                <div class="flex items-center justify-between w-full p-4 border-b border-gray-200">
                    <div class="flex items-center">
                        <Avatar src={follower.profile_picture} alt="Profile Picture" class="w-12 h-12" border />
                        <div class="ml-4">
                            <h2 class="text-lg font-bold"><A href={`/${follower.username}`}>{follower.username}</A></h2>
                            <div class="flex items-center">
                                <MapPinSolid size="xs" class="mr-1 fill-primary-600" />
                                <p class="text-gray-600">{follower.location}</p>
                            </div>
                        </div>
                    </div>                    
                </div>
            {/each}
        {/if}
</Modal>