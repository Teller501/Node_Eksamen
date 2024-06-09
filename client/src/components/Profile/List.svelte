<script>
    import { BASE_URL } from "../../stores/generalStore.js";
    import { Button, Modal, Popover } from "flowbite-svelte";
    import {
        CirclePlusSolid,
        TrashBinSolid,
        CloseCircleSolid,
    } from "flowbite-svelte-icons";
    import toast, { Toaster } from "svelte-french-toast";
    import { userStore, tokenStore } from "../../stores/authStore";
    import { listsStore } from "../../stores/listsStore.js";
    import { fetchGet, fetchPost, fetchDelete } from "../../util/api";
    import Movie from "../Movie.svelte";
    import SearchModal from "../SearchModal.svelte";

    let openCreateListModal = false;
    let openSeeMoviesModal = false;
    let selectedList = null;
    let listWithMovies = {
        movies: [],
    };
    let placement;
    let listName = "";
    let description = "";

    export let lists = [];
    export let isOwner;

    listsStore.subscribe((value) => {
        lists = value;
    });

    async function fetchMoviesFromList(listId) {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/lists/${$userStore.id}/${listId}`,
            $tokenStore
        );
        if (status === 404) {
            return;
        }
        listWithMovies = data;
    }

    async function handleCreateList(event) {
        event.preventDefault();
        const payload = { listName, description };

        const { data, status } = await fetchPost(
            `${$BASE_URL}/api/lists/${$userStore.id}`,
            payload,
            $tokenStore
        );

        if (status === 201) {
            listsStore.update((value) => [...value, data.data]);
            openCreateListModal = false;
            toast.success("List created");
        }
    }

    async function handleDeleteList(listId) {
        const { status } = await fetchDelete(
            `${$BASE_URL}/api/lists/${$userStore.id}/${listId}`,
            $tokenStore
        );
        if (status === 200) {
            listsStore.update((value) =>
                value.filter((list) => list.id !== listId)
            );
            toast.success("List deleted");
        }
    }

    async function handleRemoveMovieFromList(movieId, title) {
        const { status } = await fetchDelete(
            `${$BASE_URL}/api/lists/${$userStore.id}/${selectedList.id}/${movieId}`,
            $tokenStore
        );
        if (status === 200) {
            listWithMovies.movies = listWithMovies.movies.filter(
                (movie) => movie.movie_id !== movieId
            );
            toast.success(`'${title}' removed from list`);
        }
    }
</script>

<Toaster />

<div class="flex flex-col sm:flex-row items-center sm:px-96 px-4">
    <h2 class="text-slate-900 text-2xl font-bold sm:me-48">Lists</h2>
    {#if isOwner}
        <Button on:click={() => (openCreateListModal = true)}>
            New <CirclePlusSolid />
        </Button>
    {/if}
</div>
<hr class="my-4 w-full" />
{#if lists.length === 0}
    <p class="text-slate-900 text-lg text-center">No lists to find here!</p>
{/if}

{#each lists as list}
    <div class="flex flex-col sm:flex-row justify-between">
        <Button
            on:click={() => {
                selectedList = list;
                openSeeMoviesModal = true;
                fetchMoviesFromList(list.id);
            }}
            class="w-full bg-transparent hover:bg-transparent focus:ring-0"
        >
            <div
                class="content bg-white shadow-md rounded-lg p-4 hover:bg-primary-100 cursor-pointer w-full"
            >
                <h3 class="text-slate-900 text-xl">
                    {list.list_name} - <b>{list.username}</b>
                </h3>
                <p class="text-xs text-gray-700 font-light">
                    {#if list.description}
                        {list.description}
                    {/if}
                </p>
            </div>
        </Button>
        {#if isOwner}
            <div class="actions flex flex-col items-end mt-4 sm:mt-0">
                <SearchModal mode={"addToMovieList"} selectedList={list} />
                <Button
                    on:click={(event) => {
                        event.stopPropagation();
                        handleDeleteList(list.id);
                    }}
                    id="deleteList"
                    on:mouseenter={() => (placement = "left")}
                    class="bg-red-700 hover:bg-red-800 text-white rounded-md mt-1 py-1"
                >
                    <TrashBinSolid /></Button
                >
                <Popover
                    class="w-64 text-sm font-light"
                    triggeredBy="#deleteList"
                    {placement}
                >
                    Click here to delete this list
                </Popover>
            </div>
        {/if}
    </div>
{/each}

<Modal
    title={selectedList
        ? `${selectedList.list_name} by ${selectedList.username}`
        : ""}
    bind:open={openSeeMoviesModal}
    autoclose={false}
    class="w-full"
    outsideclose
>
    {#if selectedList}
        <p class="text-slate-900 text-lg">
            {selectedList.description}
        </p>
        <p class="text-slate-600 mt-1">
            Created {selectedList.created_at.split("T")[0]}
            - <b>({listWithMovies.movies.length} movies)</b>
        </p>
        {#if listWithMovies.movies.length === 0}
            <p>This list is empty...</p>
        {/if}
        <div class="flex flex-wrap justify-center items-center w-full">
            {#each listWithMovies.movies as movie}
                <div class="relative">
                    {#if isOwner}
                        <Button
                            on:click={() =>
                                handleRemoveMovieFromList(
                                    movie.movie_id,
                                    movie.title
                                )}
                            class="absolute top-0 right-2 z-10 p-0 bg-transparent hover:bg-transparent focus:ring-0"
                        >
                            <CloseCircleSolid
                                size="md"
                                class="text-red-500 hover:text-red-800 z-50"
                            />
                        </Button>
                    {/if}
                    <Movie
                        posterPath={movie.poster_path}
                        alt={movie.title}
                        movieId={movie.movie_id}
                        width="180vw"
                    />
                </div>
            {/each}
        </div>
    {/if}
</Modal>

<Modal
    title="Create a new list"
    bind:open={openCreateListModal}
    autoclose={false}
    class="w-full"
    outsideclose
>
    <form on:submit={handleCreateList}>
        <label for="listName" class="block text-sm font-medium text-gray-700">
            List name
        </label>
        <input
            type="text"
            id="listName"
            name="listName"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            bind:value={listName}
        />

        <label
            for="description"
            class="block text-sm font-medium text-gray-700 mt-4"
        >
            Description
        </label>
        <textarea
            id="description"
            name="description"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            bind:value={description}
        ></textarea>
        <Button
            class="hover:bg-primary-800 bg-primary-600 text-white mt-4"
            type="submit"
        >
            Create new list
        </Button>
    </form>
</Modal>
