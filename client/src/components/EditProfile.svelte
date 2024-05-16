<script>
  import { onMount } from "svelte";
  import { BASE_URL } from "../stores/generalStore.js";
  import { userStore } from "../stores/authStore";
  import { fetchPatch } from "../util/api";
  import toast, { Toaster } from "svelte-french-toast";

  import {
    Input,
    Label,
    Textarea,
    Fileupload,
    Helper,
    Select,
    Modal,
    Button,
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
      birth_date: $userStore.birthday.split("T")[0],
      location: selected,
      bio: $userStore.bio,
      profile_picture: selectedImage
    };
    const { data, status } = await fetchPatch(
      `${$BASE_URL}/api/users/${$userStore.id}`,
      body
    );

    if (status === 200) {
      toast.success("User updated successfully.");
    } else {
      toast.error(data.error || "Failed to update user.");
    }
    editProfileModal = false;
  }

  let fileuploadprops = {
    id: "user_avatar",
  };

  let selectedImage = null;

  const onFileSelected = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      selectedImage = reader.result;
    };

    reader.readAsDataURL(file);
  };
</script>

<Toaster />

<Button on:click={() => (editProfileModal = true)}>
  Edit Profile <EditSolid />
</Button>

<Modal
  title="Update your profile"
  bind:open={editProfileModal}
  autoclose={false}
  class="w-full"
  outsideclose
>
<form on:submit={handleEditProfile}>
  <h3 class="text-lg font-semibold">Profile picture</h3>
  <div class="items-center justify-center flex mb-6">
    {#if selectedImage}
      <img
        src={selectedImage}
        alt="profile-pic"
        class="rounded-full me-4 w-52 h-52 border shadow"
      />
    {:else}
      <img
        src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
        alt="profile-pic"
        class="rounded-full me-4 w-48 h-48 border shadow"
      />
    {/if}
  </div>

  <Fileupload {...fileuploadprops} on:change={onFileSelected} />

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
    <button
      type="submit"
      class="hover:bg-primary-800 bg-primary-600 text-white"
    >
      Update profile</button
    >
  </form>
</Modal>
