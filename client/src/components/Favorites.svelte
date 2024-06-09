<script>
    import { Button, Modal, Img, Popover } from "flowbite-svelte";
    import { CirclePlusSolid, CloseCircleSolid } from "flowbite-svelte-icons";
    import posterPlaceholder from "../assets/poster-placeholder.png";
    import SearchModal from "./SearchModal.svelte";
    import { fetchDelete } from "../util/api.js";
    import { BASE_URL } from "../stores/generalStore.js";
    import { favoritesStore } from "../stores/favoritesStore.js";
    import { tokenStore } from "../stores/authStore.js";
    import { get } from "svelte/store";

    export let user;
    export let isOwner;

    let formModal = false;
    const userId = user.id;
    let favorites = get(favoritesStore);

    favoritesStore.subscribe((value) => {
        favorites = value;
    });

    async function handleRemoveFavorite(movieId) {
        await fetchDelete(
            `${$BASE_URL}/api/favorites/${userId}/${movieId}`,
            $tokenStore
        );
        favoritesStore.update((favorites) =>
            favorites.filter((favorite) => favorite.movie_id !== movieId)
        );
    }
</script>

{#if isOwner}
    <Button
        id="addToFavorite"
        on:click={() => (formModal = true)}
        class="absolute right-0 bg-transparent hover:bg-transparent active:ring-0 focus:ring-0 hover:cursor-default"
    >
        <CirclePlusSolid
            size="md"
            class="fill-primary-600 hover:fill-primary-800 hover:cursor-pointer"
        />
    </Button>
    <Popover class="w-64 text-sm font-light " triggeredBy="#addToFavorite">
        Click here to add your favorite movies
    </Popover>
{/if}

<Modal
    bind:open={formModal}
    size="md"
    autoclose={false}
    class="w-full"
    outsideclose
>
    <h1 class="text-lg font-bold">Favorite Movies</h1>

    <div class="flex flex-wrap items-center justify-center">
        {#each favorites as favorite, i (favorite.movie_id)}
            <div class="relative w-32 mx-2 mb-2 shadow-sm">
                <Img
                    src={`https://image.tmdb.org/t/p/original/${favorite.poster_path}`}
                    alt={`Favorite ${i + 1}, (${favorite.title})`}
                />
                <Button
                    on:click={() => handleRemoveFavorite(favorite.movie_id)}
                    class="bg-transparent hover:bg-transparent active:ring-0 focus:ring-0 hover:cursor-default"
                >
                    <CloseCircleSolid
                        size="md"
                        class="absolute top-0 right-0 fill-red-600 hover:fill-red-800 hover:cursor-pointer"
                    />
                </Button>
            </div>
        {/each}
        {#each Array(4 - favorites.length) as _}
            <div class="relative w-32 mx-2 mb-2 shadow-sm">
                <Img src={posterPlaceholder} alt="Placeholder" />
                <SearchModal />
            </div>
        {/each}
    </div>
</Modal>
