<script>
  import { BASE_URL } from "../../stores/generalStore.js";
  import { Button, Modal, Popover } from "flowbite-svelte";
  import { CirclePlusSolid, TrashBinSolid } from "flowbite-svelte-icons";
  import { userStore } from "../../stores/authStore";
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

  export let lists = [];
  export let isOwner;

  async function fetchMoviesFromList(listId) {
    const { data, status } = await fetchGet(
      `${$BASE_URL}/api/lists/${$userStore.id}/${listId}`
    );
    if (status === 404) {
      return;
    }
    listWithMovies = data;
  }

  async function handleCreateList(event) {
    event.preventDefault();
    const payload = {
      listName: event.target.listName.value,
      description: event.target.description.value,
    };

    const response = await fetchPost(
      `${$BASE_URL}/api/lists/${$userStore.id}`,
      payload
    );
    if (response.status === 201) {
      lists = [...lists, response.data.data];
      openCreateListModal = false;
    }
  }

  async function handleDeleteList(listId) {
    const response = await fetchDelete(
      `${$BASE_URL}/api/lists/${$userStore.id}/${listId}`
    );
    if (response.status === 200) {
      lists = lists.filter((list) => list.id !== listId);
    }
  }     
</script>

<div class="flex items-center px-96">
  <h2 class="text-slate-900 text-2xl font-bold me-48">Lists</h2>
  {#if isOwner}
    <Button on:click={() => (openCreateListModal = true)}>
      New <CirclePlusSolid />
    </Button>
  {/if}
</div>
<hr class="my-4 w-full" />
{#if lists.length === 0}
  <p class="text-slate-900 text-lg text-center">You have no lists...</p>
{/if}

{#each lists as list}
<div class="flex justify-between">
  <button
    on:click={() => {
      selectedList = list;
      openSeeMoviesModal = true;
      fetchMoviesFromList(list.id);
    }}
    class="w-full"
  >

      <div class="content bg-white shadow-md rounded-lg p-4 hover:bg-primary-100 cursor-pointer">
        <h3 class="text-slate-900 text-xl">
          {list.list_name} - <b>{list.username}</b>
          <img
            src={`${$BASE_URL}/${list.profile_picture}`}
            alt="profile pic"
            class="w-5 h-5 rounded-full inline-block"
          />
        </h3>
        <p class="text-sm">
          {list.description} - <b>{list.movie_count} movies</b>
        </p>
      </div>

    </button>
      {#if isOwner}
        <div class="actions flex flex-col items-end mt-4">

          <SearchModal mode={"addToMovieList"} selectedList={list} />
          <button
            on:click={(event) => {
              event.stopPropagation();
              handleDeleteList(list.id);
            }}
            id="deleteList"
            on:mouseenter={() => (placement = 'left')}
            class="bg-red-700 hover:bg-red-800 text-white rounded-md mt-1 py-1"
          >
            <TrashBinSolid /></button
          >
          <Popover class="w-64 text-sm font-light" triggeredBy="#deleteList" {placement}>
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
      {selectedList.description}</p>
    {#if listWithMovies.movies.length === 0}
      <p>This list is empty...</p>
    {/if}
    <div class="flex flex-wrap justify-center items-center w-full">
      {#each listWithMovies.movies as movie}
        <Movie
          posterPath={movie.poster_path}
          alt={movie.title}
          movieId={movie.movie_id}
          width="180vw"
        />
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
    ></textarea>
    <button
      class="hover:bg-primary-800 bg-primary-600 text-white mt-4"
      type="submit"
    >
      Create new list
    </button>
  </form>
</Modal>
