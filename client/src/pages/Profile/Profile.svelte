<script>
  import {
    Input,
    Label,
    InputAddon,
    ButtonGroup,
    Modal,
    Button,
  } from "flowbite-svelte";

  import { EditSolid } from "flowbite-svelte-icons";

  import EditProfile from "../../components/EditProfile.svelte";
  import { userStore } from "../../stores/authStore";

  let editProfileModal = false;
</script>

<div class="mt-20 border border-gray-200 p-6 rounded-lg shadow-md relative">
  <div class="flex items-center justify-center mb-6">

    <Button on:click={() => (editProfileModal = true)} class="absolute top-5 start-5">
        Edit your profile<EditSolid />
      </Button>

    <h1 class="text-2xl font-semibold">Welcome, {$userStore.username}</h1>
    <img
      src="https://picsum.photos/200"
      alt="profile-pic"
      class="rounded-full w-20 ms-4"
    />
  </div>
  {#if $userStore.bio}
    <p class="text-gray-500">{$userStore.bio}</p>
  {:else}
    <p class="text-gray-500">You have no bio yet...</p>
  {/if}
  <hr class="mb-6" />

  <div class="justify-start mt-5">
    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">First name</p>
      </InputAddon>
      <Input id="firstname" type="text" value={$userStore.firstname} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">Last name</p>
      </InputAddon>
      <Input id="lastname" type="text" value={$userStore.lastname} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">Username</p>
      </InputAddon>
      <Input id="username" type="text" value={$userStore.username} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">Birthday</p>
      </InputAddon>
      {#if !$userStore.birthday}
      <Input id="username" type="text" value="" readonly />
      {:else}
      <Input id="username" type="date" value={$userStore.birthday} readonly />
      {/if}
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">Location</p>
      </InputAddon>
      <Input id="location" type="text" value={$userStore.location} readonly />
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500 dark:text-gray-400">Email</p>
      </InputAddon>
      <Input id="email" type="email" value={$userStore.email} readonly></Input>
    </ButtonGroup>

    <ButtonGroup class="w-1/2 mb-5">
      <InputAddon>
        <p class="w-20 h-4 text-gray-500">Password</p>
      </InputAddon>
      <Input id="password" type="password" value="•••••••••" readonly />
    </ButtonGroup>
  </div>

  <Button on:click={() => (editProfileModal = true)}>
    Edit your profile<EditSolid />
  </Button>

</div>

<Modal title="Update your profile" bind:open={editProfileModal} autoclose>
  <EditProfile />
</Modal>
