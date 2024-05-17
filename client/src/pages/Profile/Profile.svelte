<script>
  import {
    Input,
    InputAddon,
    ButtonGroup,
  } from "flowbite-svelte";

  import { onMount } from "svelte";
  import EditProfile from "../../components/EditProfile.svelte";
  import { userStore } from "../../stores/authStore";
  import { BASE_URL } from "../../stores/generalStore.js";
  import { fetchGet } from "../../util/api.js";

  let user = {};
  let profilePicturePath;

  onMount(async () => {
    const { data, status } = await fetchGet(`${$BASE_URL}/api/users/${$userStore.id}`);
    if (status === 200) {
      user = data;
    }

    profilePicturePath = `${$BASE_URL}/${user.profile_picture}`;
  });
</script>

<div class="mt-20 border border-gray-200 p-6 rounded-lg shadow-md relative">
  <div class="flex items-center justify-center mb-6">

    <div class="absolute top-5 start-5">
      <EditProfile />
    </div>

    <h1 class="text-2xl font-semibold">Welcome, {user.username}</h1>
    <img
      src={profilePicturePath ?? "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"}
      alt="profile-pic"
      class="rounded-full w-20 h-20 object-cover ms-4"
    />
  </div>
  {#if user.bio}
    <p class="text-gray-500">{user.bio}</p>
  {:else}
    <p class="text-gray-500">You have no bio yet...</p>
  {/if}
  <hr class="mb-6" />

  <div class="justify-start mt-5">
    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20">Full name</p>
      </InputAddon>
      <Input id="full_name" type="text" value={user.full_name} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20">Username</p>
      </InputAddon>
      <Input id="username" type="text" value={user.username} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20">Birthday</p>
      </InputAddon>
      <Input id="birth_date" type="date" value={user.birthday} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20">Location</p>
      </InputAddon>
      <Input id="location" type="text" value={user.location} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <span class="w-20">Email</span>
      </InputAddon>
      <Input id="email" type="email" value={user.email} readonly></Input>
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20">Password</p>
      </InputAddon>
      <Input id="password" type="password" value="•••••••••" readonly />
    </ButtonGroup>
  </div>

  <EditProfile />

</div>

