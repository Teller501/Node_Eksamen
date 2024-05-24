<script>
  import { Img, Rating, Hr, Button } from "flowbite-svelte";
  import { ClockOutline, EyeOutline, EditSolid } from "flowbite-svelte-icons";
  import Movie from "../Movie.svelte";
  import Favorites from "../Favorites.svelte";
  import posterPlaceholder from "../../assets/poster-placeholder.png";
  import { activeTab } from "../../stores/tabStore.js";

  export let lastFourMovies = [];
  export let reviews = [];
  export let favorites = [];
  export let user;
  export let isOwner;
  export let watchList = [];

  function goToTab(tabName) {
    activeTab.set(tabName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
</script>

<div class="container mx-auto px-4 mt-8 mb-12 grid grid-cols-3 gap-4">
  <div class="col-span-2">
    <div>
      <div class="flex items-center">
        <h3 class="text-lg font-bold text-slate-900 me-1">Last watched</h3>
        <EyeOutline />
      </div>
      <div class="grid grid-cols-4 gap-4 mt-4">
        {#each lastFourMovies as movie}
          <div class="text-center">
            <Movie
              posterPath={movie.poster_path}
              alt={movie.title}
              movieId={movie.movie_id}
              width="w-4"
            />
            <div class="mt-2 d-flex align-items-center">
              <span class="text-red-500 me-2">
                <Rating total={5} size={20} rating={movie.rating} />
              </span>
              <span class="text-gray-500 text-xs flex items-center">
                <ClockOutline size="xs" class="mr-1" />
                {movie.watched_on.split("T")[0]}
              </span>
            </div>
          </div>
        {/each}
      </div>
      <Button class="mt-4" on:click={() => goToTab("Watched")}>View more</Button
      >
    </div>
    <div class="mt-8">
      <div class="flex items-center">
        <h3 class="text-lg font-bold text-slate-900 me-1">Recent Reviews</h3>
        <EditSolid />
      </div>
      <div class="mt-4 space-y-4 mb-2">
        {#each reviews.slice(0, 2) as review}
          <div class="flex space-x-4">
            <Movie
              posterPath={review.poster_path}
              alt={review.title}
              movieId={review.movie_id}
              width={128}
            />
            <div class="w-full">
              <h3
                class={`text-lg font-bold text-slate-900 ${review.title.length > 20 ? "text-sm" : "text-lg"}`}
              >
                <span>{review.title}</span>
                <span class="text-gray-500 text-xs font-light"
                  >({review.release_date.split("T")[0]})</span
                >
              </h3>
              <div class="text-gray-600 text-sm">
                Watched on {review.watched_on.split("T")[0]}
              </div>
              <Hr
                hrClass="h-px my-2 bg-primary-300 border-0 dark:bg-primary-700"
              />
              <p class="mt-2 text-sm text-left text-gray-700">
                {review.review}
              </p>
            </div>
          </div>
        {/each}
        <Button class="mt-4" on:click={() => goToTab("Reviews")}
          >View more</Button
        >
      </div>
    </div>
  </div>
  <div class="col-span-1 space-y-4">
    <div class="bg-white p-4 rounded-md shadow-md">
      <h3 class="text-lg font-bold text-slate-900">
        About {user?.username}
      </h3>
      <p class="text-gray-700 mt-2">
        {user?.bio}
      </p>
    </div>
    <div class="bg-white p-4 rounded-md shadow-md mt-4">
      <div class="relative flex items-center">
        <h3 class="text-lg font-bold text-slate-900 ms-16">Favorites</h3>
        <Favorites {user} {isOwner} />
      </div>
      <div class="flex justify-center space-x-2 mt-2">
        {#each favorites as favorite, i (favorite.movie_id)}
          <Movie
            posterPath={favorite.poster_path}
            width={68}
            alt={`Favorite ${i + 1}, (${favorite.title})`}
            movieId={favorite.movie_id}
          />
        {/each}

        {#each Array(4 - favorites.length) as _}
          <Img src={posterPlaceholder} alt="Placeholder" class="w-14 h-20" />
        {/each}
      </div>
    </div>
    <div class="bg-white p-4 rounded-md shadow-md mt-4">
      <div class="flex items-center">
        <h3 class="text-lg font-bold text-slate-900 ms-16 me-1">Watchlist</h3>
        <ClockOutline />
      </div>
      <div class="flex space-x-2 mt-2">
        {#each watchList.slice(0, 3) as movie}
          <Movie
            posterPath={movie.poster_path}
            width={64}
            alt={movie.title}
            movieId={movie.movie_id}
          />
        {/each}
        {#if watchList.length > 3}
          <button
            type="button"
            class="w-10 h-20 text-xs p-1 hover:bg-primary-200"
            on:click={() => goToTab("Watchlist")}
            >+{watchList.length - 3} more</button
          >
        {/if}

        {#if watchList.length === 0}
          <p class="text-gray-500">No movies in watchlist..</p>
        {/if}
      </div>
    </div>
  </div>
</div>
