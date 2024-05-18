<script>
  import {
      Input,
      InputAddon,
      ButtonGroup,
      Img,
      Tabs,
      TabItem,
  } from "flowbite-svelte";

  import { onMount } from "svelte";
  import EditProfile from "../../components/EditProfile.svelte";
  import { userStore } from "../../stores/authStore";
  import { BASE_URL } from "../../stores/generalStore.js";
  import { fetchGet } from "../../util/api.js";

  let user = $userStore;
  const profilePicturePath = `${$BASE_URL}/${user.profile_picture}`;
</script>

<div class="container mx-auto p-4">
  <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
          <Img
              src={profilePicturePath ??
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
              alt="Profile Picture"
              class="w-20 h-20 rounded-full"
          />
          <div>
              <h1 class="text-3xl font-bold text-slate-900">
                  {user.username}
              </h1>
              <div class="text-gray-600">
                  <span>3 followers</span> • <span>8 following</span> •
                  <span>123 movies watched</span>
              </div>
          </div>
      </div>
      <EditProfile />
  </div>
</div>

<div class="container mx-auto px-4 mt-4">
  <Tabs>
      <TabItem open title="Profile">
          <div class="container mx-auto px-4 mt-8 mb-12 grid grid-cols-3 gap-4">
              <div class="col-span-2">
                  <div>
                      <h2 class="text-2xl font-bold text-slate-900">Last watched</h2>
                      <div class="grid grid-cols-4 gap-4 mt-4">
                          {#each Array(4) as _, i}
                              <div class="text-center">
                                  <img
                                      src="shrek_poster.jpg"
                                      alt="Shrek"
                                      class="w-full h-auto"
                                  />
                                  <div class="mt-2">
                                      <span class="text-red-500">★★★★☆</span>
                                      <span class="text-gray-500">8/5/2024</span>
                                  </div>
                              </div>
                          {/each}
                      </div>
                  </div>
                  <div class="mt-8">
                      <h2 class="text-2xl font-bold text-slate-900">
                          Recent Reviews
                      </h2>
                      <div class="mt-4 space-y-4 mb-2">
                          {#each Array(2) as _, i}
                              <div class="flex space-x-4">
                                  <img
                                      src="shrek_poster.jpg"
                                      alt="Shrek"
                                      class="w-24 h-36"
                                  />
                                  <div>
                                      <h3 class="text-xl font-bold text-slate-900">
                                          Shrek <span class="text-gray-500">(2001)</span>
                                      </h3>
                                      <div class="text-gray-600">
                                          Watched on 8/5/2024
                                      </div>
                                      <p class="mt-2 text-gray-700">
                                          Lorem ipsum dolor sit amet, consectetur
                                          adipiscing elit...
                                      </p>
                                  </div>
                              </div>
                          {/each}
                      </div>
                  </div>
              </div>
              <div class="col-span-1 space-y-4">
                  <div class="bg-white p-4 rounded-md shadow-md">
                      <h3 class="text-lg font-bold text-slate-900">About Teller501</h3>
                      <p class="text-gray-700 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                  </div>
                  <div class="bg-white p-4 rounded-md shadow-md mt-4">
                      <h3 class="text-lg font-bold text-slate-900">Favorites</h3>
                      <div class="flex space-x-2 mt-2">
                          {#each Array(4) as _, i}
                              <img src="shrek_poster.jpg" alt="Favorite" class="w-12 h-16" />
                          {/each}
                      </div>
                  </div>
                  <div class="bg-white p-4 rounded-md shadow-md mt-4">
                      <h3 class="text-lg font-bold text-slate-900">Watchlist</h3>
                      <div class="flex space-x-2 mt-2">
                          {#each Array(4) as _, i}
                              <img src="shrek_poster.jpg" alt="Watchlist" class="w-12 h-16" />
                          {/each}
                      </div>
                  </div>
              </div>
          </div>
      </TabItem>
      <TabItem title="Settings">
          <p class="text-sm text-gray-500 dark:text-gray-400">
              <b>Settings:</b>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
          </p>
      </TabItem>
      <TabItem title="Users">
          <p class="text-sm text-gray-500 dark:text-gray-400">
              <b>Users:</b>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
          </p>
      </TabItem>
      <TabItem title="Dashboard">
          <p class="text-sm text-gray-500 dark:text-gray-400">
              <b>Dashboard:</b>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tempor incididunt ut labore et dolore magna aliqua.
          </p>
      </TabItem>
  </Tabs>
</div>
