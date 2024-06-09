<script>
    import {
        Modal,
        Input,
        Button,
        DropdownItem,
        Dropdown,
        SpeedDialButton,
        Popover,
        Spinner,
    } from "flowbite-svelte";
    import { CirclePlusSolid, PlusOutline } from "flowbite-svelte-icons";
    import toast, { Toaster } from "svelte-french-toast";
    import { fetchGet, fetchPost } from "../util/api.js";
    import { BASE_URL } from "../stores/generalStore.js";
    import { userStore, tokenStore } from "../stores/authStore.js";
    import { favoritesStore } from "../stores/favoritesStore.js";
    import LogMovie from "./LogMovie.svelte";
    import { fade } from "svelte/transition";

    export let mode = "favorite";
    export let selectedList = null;

    let searchModal = false;
    let searchQuery = "";
    let searchResults = [];
    let searchTimeout;
    let dropdownOpen = false;
    let logMovieModal = false;
    let selectedMovie = null;
    let loading = false;

    async function fetchSearchResults() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/search?q=${searchQuery}`,
            $tokenStore
        );
        searchResults = data;
    }

    function handleInput() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            if (searchQuery) {
                loading = true;
                await fetchSearchResults();
                dropdownOpen = true;
                loading = false;
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
        const { data, status } = await fetchPost(
            `${$BASE_URL}/api/favorites`,
            body,
            $tokenStore
        );

        if (status === 200) {
            searchModal = false;
            dropdownOpen = false;
            favoritesStore.update((favorites) => [...favorites, data.data]);
            toast.success("Movie added to favorites.");
        }

        if (status === 400) {
            toast.error(data.error);
            dropdownOpen = false;
        }
    }

    async function handleAddMovieToList(movieId) {
        const body = {
            movieId: movieId,
        };
        const { status } = await fetchPost(
            `${$BASE_URL}/api/lists/${$userStore.id}/${selectedList.id}`,
            body,
            $tokenStore
        );

        if (status === 201) {
            searchModal = false;
            dropdownOpen = false;
            toast.success("Movie added to list.");
        }
    }

    function handleDropdownClick(movie) {
        if (mode === "favorite") {
            handleAddFavorite(movie.id);
        } else if (mode === "log") {
            selectedMovie = movie;
            logMovieModal = true;
            searchModal = false;
        } else if (mode === "addToMovieList") {
            handleAddMovieToList(movie.id);
        }
    }
</script>

<Toaster />

{#if mode === "favorite"}
    <Button
        on:click={() => (searchModal = true)}
        class="bg-transparent hover:bg-transparent active:ring-0 focus:ring-0 hover:cursor-default"
    >
        <CirclePlusSolid
            size="md"
            class="absolute top-0 right-0 fill-green-600 hover:fill-green-800 hover:cursor-pointer"
        />
    </Button>
{:else if mode === "log"}
    <SpeedDialButton name="Log Movie" on:click={() => (searchModal = true)}>
        <PlusOutline class="w-6 h-6" />
    </SpeedDialButton>
{:else if mode === "addToMovieList"}
    <Button
        on:click={() => (searchModal = true)}
        id="addMovies"
        class="bg-green-800 hover:bg-green-900 text-white rounded-md py-1"
    >
        <CirclePlusSolid />
    </Button>
    <Popover class="w-64 text-sm font-light" triggeredBy="#addMovies">
        Click here to add movies to this list
    </Popover>
{/if}

<Modal
    bind:open={searchModal}
    size="sm"
    class="w-full"
>
    <h1 class="text-lg font-bold">Search Movie</h1>
    <Input
        bind:value={searchQuery}
        on:keyup={handleInput}
        placeholder="Search..."
        class="relative"
    />
    {#if loading}
        <div class="flex justify-center p-2">
            <Spinner class="w-6 h-6" />
        </div>
    {:else if searchResults.length > 0}
        <Dropdown
            bind:open={dropdownOpen}
            class="overflow-y-auto py-1 w-96 h-96 bg-slate-200 absolute z-10 left-1/2 transform -translate-x-1/2"
        >
            {#each searchResults as result}
                <DropdownItem
                    on:click={() => handleDropdownClick(result)}
                    defaultClass="bg-slate-300 mb-1 hover:bg-primary-700 hover:text-white rounded-none my-0"
                >
                    {result.title}
                </DropdownItem>
            {/each}
        </Dropdown>
    {:else if searchQuery}
        <p>No results found.</p>
    {/if}
</Modal>

{#if selectedMovie}
    <div transition:fade={{ delay: 10, duration: 300 }}>
        <LogMovie
            bind:open={logMovieModal}
            movieId={selectedMovie.id}
            title={selectedMovie.title}
            posterPath={selectedMovie.poster_path}
        />
    </div>
{/if}
