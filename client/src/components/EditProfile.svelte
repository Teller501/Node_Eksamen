<script>
  import { onMount } from "svelte";
  import {
    Input,
    Label,
    ButtonGroup,
    InputAddon,
    Textarea,
    Fileupload,
    Helper,
    Select,
  } from "flowbite-svelte";

  import {
    EnvelopeSolid,
    EyeOutline,
    EyeSlashOutline,
  } from "flowbite-svelte-icons";

  let selected = "";
  let countries = [];
  let show = false;

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
</script>

<form>
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
  <hr class="mb-6" />
  <div class="grid gap-6 mb-6 md:grid-cols-2">
    <div>
      <Label for="first_name" class="mb-2">First name</Label>
      <Input type="text" id="first_name" placeholder="First name" />
    </div>
    <div>
      <Label for="last_name" class="mb-2">Last name</Label>
      <Input type="text" id="last_name" placeholder="Last name" />
    </div>
    <div>
      <Label for="username" class="mb-2">Username*</Label>
      <Input type="text" id="username" placeholder="Username" required />
    </div>
    <div>
      <Label for="date" class="mb-2">Birthday</Label>
      <Input type="date" id="date" placeholder="Birthday" />
    </div>
  </div>
  <div class="mb-6">
    <Label for="location" class="mb-2">Location</Label>
    <Select id="location" bind:value={selected}>
      {#each countries as country}
        <option value={country.alpha2Code}>{country.name}</option>
      {/each}
    </Select>
  </div>
  <div class="mb-6">
    <Label for="bio" class="mb-2">Bio</Label>
    <Textarea id="bio" placeholder="Bio" />
  </div>
  <div class="mb-6">
    <Label for="email" class="mb-2">Email address*</Label>
    <Input type="email" id="email" placeholder="someone@mail.com" required>
      <EnvelopeSolid slot="right" class="w-5 h-5" />
    </Input>
  </div>

  <div class="mb-6">
    <Label for="password" class="mb-2">Your password*</Label>
    <ButtonGroup class="w-full">
      <InputAddon>
        <button on:click={() => (show = !show)}>
          {#if show}
            <EyeOutline class="w-6 h-5" />
          {:else}
            <EyeSlashOutline class="w-6 h-5" />
          {/if}
        </button>
      </InputAddon>
      <Input
        id="password"
        type={show ? "text" : "password"}
        placeholder="•••••••••"
        required
      />
    </ButtonGroup>
  </div>
  <hr class="mb-6" />
  <button class="text-red-500 hover:text-red-600 hover:bg-primary-100"
    >Cancel changes</button
  >
  <button type="submit" class="hover:bg-primary-800 bg-primary-600 text-white">
    Update profile</button
  >
</form>
