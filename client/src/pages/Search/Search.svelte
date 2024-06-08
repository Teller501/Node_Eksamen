<script>
    import { onMount } from "svelte";
    import { Hr, A, Avatar, Modal, Spinner } from "flowbite-svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { tokenStore } from "../../stores/authStore.js";
    import { listsStore } from "../../stores/listsStore";
    import Movie from "../../components/Movie.svelte";
    import { fetchGet } from "../../util/api";
    import blankProfilePic from "../../assets/blank-profile-pic.png";

    export let params;
    const searchQuery = params.query;
    const type = params.type;

    let lists = [];
    let selectedList = null;
    let listWithMovies = { movies: [] };
    let openSeeMoviesModal = false;
    let loading = true;

    listsStore.subscribe((value) => {
        lists = value;
    });

    let searchResults = [];

    async function getSearchResults() {
        loading = true;

        const endpoint = 
            type === "movies" 
                ? `${$BASE_URL}/api/movies/search?q=${searchQuery}`
                : type === "users"
                ? `${$BASE_URL}/api/users/search?q=${searchQuery}`
                : `${$BASE_URL}/api/lists/search?q=${searchQuery}`;

        const { data } = await fetchGet(endpoint, $tokenStore);
        searchResults = data;

        loading = false;
    }

    async function fetchListMovies(list) {
        const endpoint = `${$BASE_URL}/api/lists/${list.user_id}/${list.id}`;
        const { data } = await fetchGet(endpoint, $tokenStore);
        listWithMovies = data;
        selectedList = list;
        openSeeMoviesModal = true;
    }

    onMount(() => {
        getSearchResults();
    });
</script>

{#if loading}
    <Spinner class="w-12 h-12 text-primary-500" />
{:else}
    <div class="w-full min-w-full p-4 bg-white shadow-md rounded-lg">
        {#if searchResults.length > 0}
            <h2 class="text-slate-900 mb-8 text-xl font-semibold">Found matches for "{searchQuery}"</h2>
            {#if type === "movies"}
                <div id="search-results" class="w-full flex flex-col space-y-4">
                    {#each searchResults as movie, index}
                        <div class="flex flex-row items-center p-4 {index % 2 === 1 ? 'bg-slate-200' : 'bg-slate-50'} rounded-lg shadow-sm w-full">
                            <Movie
                                posterPath={movie.poster_path}
                                alt={movie.title}
                                width={128}
                                movieId={movie.id}
                            />
                            <h3 class="text-slate-900 ml-4 text-lg font-medium flex-grow">
                                <A class="hover:no-underline" href={`/moviedetails/${movie.id}`}>{movie.title} <span class="text-gray-500 ml-2 font-light text-sm">{`${movie.original_title !== movie.title ? `(${movie.original_title})` : ""}`}</span></A>
                            </h3>
                        </div>
                        {#if index < searchResults.length - 1}
                            <Hr hrClass="my-4 border-t-0 border-slate-300 w-full" />
                        {/if}
                    {/each}
                </div>
            {:else if type === "users"}
                <div id="search-results" class="w-full min-w-full flex flex-col space-y-4">
                    {#each searchResults as user, index}
                        <div class="flex flex-row items-center p-4 {index % 2 === 1 ? 'bg-slate-200' : 'bg-slate-50'} rounded-lg shadow-sm w-full">
                            <Avatar
                                src={user.profile_picture? `${$BASE_URL}/${user.profile_picture}` : blankProfilePic}
                                alt={user.username}
                                size="md"
                                class="overflow-hidden"
                                href={`/${user.username}`}
                            />
                            <h3 class="text-slate-900 ml-4 text-lg font-medium flex-grow">
                                <A class="hover:no-underline" href={`/${user.username}`}>{user.username}</A>
                            </h3>
                        </div>
                        {#if index < searchResults.length - 1}
                            <Hr hrClass="my-4 border-t-0 border-slate-300 w-full" />
                        {/if}
                    {/each}
                </div>
            {:else}
                <div id="search-results" class="w-full min-w-full flex flex-col space-y-4">
                    {#each searchResults as list, index}
                        <div class="flex flex-row items-center p-4 {index % 2 === 1 ? 'bg-slate-200' : 'bg-slate-50'} rounded-lg shadow-sm w-full">
                            <h3 class="text-primary-800 ml-4 text-lg font-medium flex-grow">
                                <button type="button" on:click={() => fetchListMovies(list)} class="hover:text-blue-500 {index % 2 === 1 ? 'bg-slate-200' : 'bg-slate-50'}">
                                    {list.list_name}
                                </button>
                                <A class="hover:no-underline" href={`/${list.username}`}>{list.username}</A>
                            </h3>
                        </div>
                        {#if index < searchResults.length - 1}
                            <Hr hrClass="my-4 border-t-0 border-slate-300 w-full" />
                        {/if}
                    {/each}
                </div>
            {/if}
        {:else}
            <h2 class="text-slate-900 mb-8 text-xl font-semibold">
                No matches found for "{searchQuery}"
            </h2>
        {/if}
    </div>
{/if}


<Modal
  title={selectedList ? `${selectedList.list_name} by ${selectedList.username}` : ""}
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
      Created {selectedList.created_at.split("T")[0]} - <b>({listWithMovies.movies.length} movies)</b>
    </p>
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
