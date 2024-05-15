<script>
  import { onMount } from "svelte";
  import { BASE_URL } from "../stores/generalStore.js";
  import { userStore } from "../stores/authStore";
  import { fetchPatch } from "../util/api";
  import toast, { Toaster } from "svelte-french-toast";

  import {
    Input,
    Label,
    ButtonGroup,
    InputAddon,
    Textarea,
    Fileupload,
    Helper,
    Select,
    Modal,
    Button
  } from "flowbite-svelte";

  import { EditSolid } from "flowbite-svelte-icons";


  let selected;
  let countries = [];
  let editProfileModal = false;

  onMount(async () => {
    try {
      const response = await fetch("https://restcountries.com/v2/all");
      if (!response.ok) {
        throw new Error("Failed to fetch countries data");
      }
      countries = await response.json();
    } catch (error) {
      console.error("Error fetching countries data:", error.message);
    }
  });

  async function handleEditProfile(event) {
    event.preventDefault();
    const body = {
        full_name: $userStore.full_name,
        birth_date: $userStore.birthday,
        location: selected,
        bio: $userStore.bio,
    };

    const { data, status } = await fetchPatch(`http://localhost:8080/api/users/${$userStore.id}`, body);

    if(status === 200){
            toast.success("User updated successfully.");
        } else {
            toast.error(data.error || "Failed to update user.");
        }
        editProfileModal = false;
}


</script>
<Toaster />

<Button on:click={() => (editProfileModal = true)}>
    Edit Profile <EditSolid />
</Button>

<Modal title="Update your profile" bind:open={editProfileModal} autoclose={false} class="w-full" outsideclose>

<form on:submit={handleEditProfile}>
  <h3 class="text-lg font-semibold">Profile picture</h3>
  <div class="items-center justify-center flex mb-6">
    <img
      src="https://picsum.photos/200"
      alt="profile-pic"
      class="rounded-full me-4"
    />
    <Fileupload id="with_helper" class="mb-2" />
    <Helper>SVG, PNG, JPG or GIF (MAX. 800x400px).</Helper>
  </div>

<div class="mt-5">
    <p>{$userStore.username}</p>
    <p>{$userStore.email}</p>
</div>

  <hr class="mb-6" />
    <div class="mb-6">
      <Label for="full_name" class="mb-2">Full name</Label>
      <Input type="text" id="full_name" bind:value={$userStore.full_name} />
    </div>
    <div class="mb-6">
      <Label for="birth_date" class="mb-2">Birthday</Label>
      <Input type="date" id="birth_date" bind:value={$userStore.birthday} />
    </div>
  <div class="mb-6">
    <Label for="location" class="mb-2">Location</Label>
    <Select id="location" bind:value={selected}>
      {#each countries as country}
        <option value={country.name}>{country.name}</option>
      {/each}
    </Select>
  </div>
  <div class="mb-6">
    <Label for="bio" class="mb-2">Bio</Label>
    <Textarea id="bio" rows="3" bind:value={$userStore.bio} />
  </div>
  <hr class="mb-6" />
  <button class="text-red-500 hover:text-red-600 hover:bg-primary-100"
    >Cancel changes</button
  >
  <button type="submit" class="hover:bg-primary-800 bg-primary-600 text-white">
    Update profile</button
  >
</form>

</Modal>