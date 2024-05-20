<script>
    import { Img, Tabs, TabItem, Rating, Hr, Button, Avatar } from "flowbite-svelte";
    import { ClockOutline, MapPinSolid, CirclePlusSolid } from "flowbite-svelte-icons";
    import Movie from "../../components/Movie.svelte";
    import EditProfile from "../../components/EditProfile.svelte";
    import Favorites from "../../components/Favorites.svelte";
    import { onMount } from "svelte";
    import { userStore } from "../../stores/authStore";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { fetchGet } from "../../util/api.js";
    import posterPlaceholder from "../../assets/poster-placeholder.png";
    import { favoritesStore } from "../../stores/favoritesStore.js";

    let user = $userStore;
    let userData;
    let lastFourMovies = [];
    let reviews = [];
    let favorites = [];
    const profilePicturePath = `${$BASE_URL}/${user.profile_picture}`;

    onMount(async () => {
        await fetchUserData();
        await fetchUserReviews();
        await fetchUserFavorites();
    });

    async function fetchUserData() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}`
        );
        if (status === 404) {
            return;
        }
        userData = data;
        lastFourMovies = userData.last_four;
    }

    async function fetchUserReviews() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/logs/user/${user.id}/reviews?limit=2`
        );
        if (status === 404) {
            return;
        }
        reviews = data;
    }

    async function fetchUserFavorites() {
        const { data, status } = await fetchGet(
            `${$BASE_URL}/api/favorites/${user.id}`
        );
        if (status === 404) {
            return;
        }
        favoritesStore.set(data);
    }

    favoritesStore.subscribe(value => {
        favorites = value;
    });
</script>

<div class="container mx-auto p-4">
    <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
            <Avatar
                src={profilePicturePath ??
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
                alt="Profile Picture"
                class="w-20 h-20"
                border
            />
            <div>
                <h1 class="text-3xl font-bold text-slate-900 text-left">
                    {user.username}
                </h1>
                <span class="text-slate-900 text-left text-xs flex items-center">
                    <MapPinSolid size="xs" class="mr-1 fill-primary-600"/>{user.location}
                </span>
                <div class="text-gray-600">
                    <span>3 followers</span> • <span>8 following</span> •
                    <span>{userData?.unique_movies_watched} movies watched</span>
                </div>
            </div>
        </div>
        <EditProfile />
    </div>
</div>

<div class="container mx-auto px-4 mt-4">
    <Tabs tabStyle="pill">
        <TabItem open title="Profile">
            <div
                class="container mx-auto px-4 mt-8 mb-12 grid grid-cols-3 gap-4"
            >
                <div class="col-span-2">
                    <div>
                        <h2 class="text-2xl font-bold text-slate-900">
                            Last watched
                        </h2>
                        <div class="grid grid-cols-4 gap-4 mt-4">
                            {#each lastFourMovies as movie}
                                <div class="text-center">
                                    <Movie posterPath={movie.poster_path} alt={movie.title} movieId={movie.movie_id} width="w-4" />
                                    <div class="mt-2 d-flex align-items-center">
                                        <span class="text-red-500 me-2">
                                            <Rating
                                                total={5}
                                                size={20}
                                                rating={movie.rating}
                                            />
                                        </span>
                                        <span class="text-gray-500 text-xs flex items-center">
                                            <ClockOutline size="xs" class="mr-1"/>
                                            {movie.watched_on.split("T")[0]}
                                        </span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                        <Button class="mt-4">
                            View more
                        </Button>
                    </div>
                    <div class="mt-8">
                        <h2 class="text-2xl font-bold text-slate-900">
                           Recent Reviews
                        </h2>
                        <div class="mt-4 space-y-4 mb-2">
                           {#each reviews as review}
                           <div class="flex space-x-4">
                              <Movie posterPath={review.poster_path} alt={review.title} movieId={review.movie_id} width={128} />
                              <div class="w-full">
                                 <h3 class={`text-lg font-bold text-slate-900 ${review.title.length>20 ? 'text-sm' : 'text-lg'}`}>
                                 <span>{review.title}</span>
                                 <span class="text-gray-500 text-xs font-light">({review.release_date.split("T")[0]})</span>
                                 </h3>
                                 <div class="text-gray-600 text-sm">
                                    Watched on {review.watched_on.split("T")[0]}
                                 </div>
                                 <Hr hrClass="h-px my-2 bg-primary-300 border-0 dark:bg-primary-700"/>
                                 <p class="mt-2 text-sm text-left text-gray-700">{review.review}</p>
                              </div>
                           </div>
                           {/each}
                           <Button class="mt-4">
                           View more
                           </Button>
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
                            <h3 class="text-lg font-bold text-slate-900 mx-auto">
                                Favorites
                            </h3>
                            <Favorites favorites={favorites}/>
                        </div>
                        <div class="flex space-x-1 mt-2">
                            {#each favorites as favorite, i (favorite.movie_id)}
                            <Movie posterPath={favorite.poster_path} width={64} alt={`Favorite ${i + 1}, (${favorite.title})`} movieId={favorite.movie_id}/>
                          {/each}
                        
                          {#each Array(4 - favorites.length) as _}
                            <Img
                              src={posterPlaceholder}
                              alt="Placeholder"
                              class="w-10 h-16"
                            />
                          {/each}
                        </div>
                    </div>
                    <div class="bg-white p-4 rounded-md shadow-md mt-4">
                        <h3 class="text-lg font-bold text-slate-900">
                            Watchlist
                        </h3>
                        <div class="flex space-x-2 mt-2">
                            {#each Array(4) as _, i}
                                <img
                                    src="shrek_poster.jpg"
                                    alt="Watchlist"
                                    class="w-12 h-16"
                                />
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </TabItem>
        <TabItem title="Watched">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Settings:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
        <TabItem title="Watchlist">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Users:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
        <TabItem title="Reviews">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Dashboard:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
        <TabItem title="List">
            <p class="text-sm text-gray-500 dark:text-gray-400">
                <b>Dashboard:</b>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua.
            </p>
        </TabItem>
    </Tabs>
</div>
