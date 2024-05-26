<script>
    import { Modal, A, Avatar } from "flowbite-svelte";
    import { MapPinSolid } from "flowbite-svelte-icons";

    export let followings;
    export let followingsCount;

    let followingsModal = false;
</script>

<span><A class="hover:no-underline text-blue-500 hover:text-blue-600 font-normal" on:click={() => (followingsModal = true)}>{followingsCount} following</A></span>

<Modal bind:open={followingsModal} size="md" autoclose={false} class="w-full" outsideclose>
    <div class="flex flex-col items-center">
        <h1 class="text-2xl font-bold mb-4">Following</h1>
        {#if followingsCount === 0}
            <p>No followers yet.</p>
        {:else}
            {#each followings as following}
                <div class="flex items-center justify-between w-full p-4 border-b border-gray-200">
                    <div class="flex items-center">
                        <Avatar src={following.profile_picture} alt="Profile Picture" class="w-12 h-12" border />
                        <div class="ml-4">
                            <h2 class="text-lg font-bold"><A href={`/${following.username}`}>{following.username}</A></h2>
                            <div class="flex items-center">
                                <MapPinSolid size="xs" class="mr-1 fill-primary-600" />
                                <p class="text-gray-600">{following.location}</p>
                            </div>
                        </div>
                    </div>                    
                </div>
            {/each}
        {/if}
</Modal>