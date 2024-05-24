<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/api";
    import Movie from "../../components/Movie.svelte";
    import { Hr, A, Avatar } from "flowbite-svelte";

    export let params;
    const searchQuery = params.query;
    const type = params.type;

    let searchResults = [];

    async function getSearchResults() {
        const endpoint =
            type === "movies"
                ? `${$BASE_URL}/api/movies/search?q=${searchQuery}`
                : `${$BASE_URL}/api/users/search?q=${searchQuery}`;

        const { data } = await fetchGet(endpoint);
        searchResults = data;
    }

    onMount(() => {
        getSearchResults();
    });
</script>

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
                            <A class="hover:no-underline" href={`/moviedetails/${movie.id}`}>{movie.title}</A>
                        </h3>
                    </div>
                    {#if index < searchResults.length - 1}
                        <Hr hrClass="my-4 border-t-0 border-slate-300 w-full" />
                    {/if}
                {/each}
            </div>
        {:else}
            <div id="search-results" class="w-full min-w-full flex flex-col space-y-4">
                {#each searchResults as user, index}
                    <div class="flex flex-row items-center p-4 {index % 2 === 1 ? 'bg-slate-200' : 'bg-slate-50'} rounded-lg shadow-sm w-full">
                        <Avatar
                            src={`${$BASE_URL}/${user.profile_picture}`}
                            alt={user.username}
                            class="w-12 h-12 rounded-full"
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
        {/if}
    {:else}
        <h2 class="text-slate-900 mb-8 text-xl font-semibold">
            No matches found for "{searchQuery}"
        </h2>
    {/if}
</div>
