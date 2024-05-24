<script>
    import {
        Modal,
        Input,
        Button,
        DropdownItem,
        Dropdown,
    } from "flowbite-svelte";
    import { CirclePlusSolid } from "flowbite-svelte-icons";
    import toast, { Toaster } from "svelte-french-toast";
    import { fetchGet, fetchPost } from "../util/api.js";
    import { BASE_URL } from "../stores/generalStore.js";
    import { userStore } from "../stores/authStore.js";
    import { favoritesStore } from "../stores/favoritesStore.js";

    let searchModal = false;
    let searchQuery = "";
    let searchResults = [];
    let searchTimeout;
    let dropdownOpen = false;

    async function fetchSearchResults() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/search?q=${searchQuery}`
        );
        searchResults = data;
    }

    function handleInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (searchQuery) {
                await fetchSearchResults();
                dropdownOpen = true;
            } else {
                searchResults = [];
            }
        }, 300);
    }

    async function handleAddFavorite(movieId) {
        const body = {
            userId: $userStore.id,
            movieId: movieId,
        };
        const { data, status } = await fetchPost(`${$BASE_URL}/api/favorites`, body);

        if (status === 200) {
            searchModal = false;
            dropdownOpen = false;
            favoritesStore.update(favorites => [...favorites, data.data]);
            toast.success("Movie added to favorites.");
        }

        if (status === 400) {
            toast.error(data.error);
            dropdownOpen = false;
        }
    }
</script>
<Toaster />

<Button
    on:click={() => (searchModal = true)}
    class="bg-transparent hover:bg-transparent active:ring-0 focus:ring-0 hover:cursor-default"
>
    <CirclePlusSolid
        size="md"
        class="absolute top-0 right-0 fill-green-600 hover:fill-green-800 hover:cursor-pointer"
    />
</Button>

<Modal
    bind:open={searchModal}
    size="sm"
    autoclose={false}
    class="w-full"
    outsideclose
>
    <h1 class="text-lg font-bold">Search Results</h1>
    <Input
        bind:value={searchQuery}
        on:keyup={handleInput}
        placeholder="Search..."
    />
    {#if searchResults.length > 0}
        <Dropdown
            bind:open={dropdownOpen}
            class="overflow-y-auto py-1 w-96 h-96 bg-slate-200"
        >
            {#each searchResults as result}
                <DropdownItem
                    on:click={() => handleAddFavorite(result.id)}
                    defaultClass="bg-slate-300 mb-1 hover:bg-slate-400"
                    >{result.title}</DropdownItem
                >
            {/each}
        </Dropdown>
    {:else if searchQuery}
        <p>No results found.</p>
    {/if}
</Modal>
