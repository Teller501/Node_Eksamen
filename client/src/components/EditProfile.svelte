<script>
    import { BASE_URL } from "../stores/generalStore.js";
    import { userStore, tokenStore } from "../stores/authStore";
    import { fetchPatch } from "../util/api";
    import toast, { Toaster } from "svelte-french-toast";
    import {
        Input,
        Label,
        Textarea,
        Fileupload,
        Helper,
        Modal,
        Button,
        Img,
    } from "flowbite-svelte";
    import { EditSolid } from "flowbite-svelte-icons";
    import blankProfilePic from "../assets/blank-profile-pic.png";

    let location = $userStore.location ?? "";
    let editProfileModal = false;
    let birthDate = $userStore.birth_date ? $userStore.birth_date.split("T")[0] : "";
    const profilePicturePath = $userStore.profile_picture? `${$BASE_URL}/${$userStore.profile_picture}` : blankProfilePic;
    let selectedImage = null;

    async function handleEditProfile(event) {
        event.preventDefault();
        const formData = new FormData();
        formData.append("full_name", $userStore.full_name);
        formData.append("birth_date", birthDate);
        formData.append("location", location);
        formData.append("bio", $userStore.bio);

        if (selectedImage) {
            formData.append("profile_picture", selectedImage);
        } else {
            formData.append("profile_picture", $userStore.profile_picture);
        }

        const response = await fetchPatch(
            `${$BASE_URL}/api/users/${$userStore.id}`,
            formData,
            $tokenStore
        );
        if (response.status === 200) {
            toast.success("User updated successfully.");

            userStore.set(response.data.data);
        } else {
            toast.error(response.data.error || "Failed to update user.");
        }
        editProfileModal = false;
    }

    const onFileSelected = (event) => {
        selectedImage = event.target.files[0];
    };

    console.log(profilePicturePath);
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
    <form on:submit={handleEditProfile} enctype="multipart/form-data">
        <h3 class="text-lg font-semibold">Profile picture</h3>
        <div class="items-center justify-center flex mb-6">
            {#if selectedImage}
                <Img
                    src={URL.createObjectURL(selectedImage)}
                    alt="profile-pic"
                    class="rounded-full me-4 w-52 h-52 border shadow"
                />
            {:else}
                <Img
                    src={profilePicturePath}
                    alt="profile-pic"
                    class="rounded-full me-4 w-48 h-48 border shadow"
                />
            {/if}
        </div>

        <Label for="with_helper" class="pb-2">Upload file</Label>
        <Fileupload id="profile_picture" on:change={onFileSelected} />
        <Helper>PNG, JPG, JPEG (MAX. 2MB).</Helper>

        <div class="mt-5">
            <p>{$userStore.username}</p>
            <p>{$userStore.email}</p>
        </div>

        <hr class="mb-6" />
        <div class="mb-6">
            <Label for="full_name" class="mb-2">Full name</Label>
            <Input
                type="text"
                id="full_name"
                bind:value={$userStore.full_name}
            />
        </div>
        <div class="mb-6">
            <Label for="birth_date" class="mb-2">Birthday</Label>
            <Input type="date" id="birth_date" bind:value={birthDate} />
        </div>
        <div class="mb-6">
            <Label for="location" class="mb-2">Location</Label>
            <Input type="text" id="location" bind:value={location} />
        </div>
        <div class="mb-6">
            <Label for="bio" class="mb-2">Bio</Label>
            <Textarea id="bio" rows="3" bind:value={$userStore.bio} />
        </div>
        <hr class="mb-6" />
        <button
            type="button"
            class="text-red-500 hover:text-red-600 hover:bg-primary-100"
            on:click={() => (editProfileModal = false)}>Cancel changes</button
        >
        <button
            type="submit"
            class="hover:bg-primary-800 bg-primary-600 text-white"
            >Update profile</button
        >
    </form>
</Modal>
