<script>
    import { Hr, Input, Label, Button } from "flowbite-svelte";
    import { userStore } from "../../stores/authStore.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import ForgotPassword from "../../components/ForgotPassword.svelte";
    import DeleteAccount from "../../components/DeleteAccount.svelte";
    import { fetchPost } from "../../util/api.js";
    import { Toaster, toast } from "svelte-french-toast";

    let newPassword = "";
    let currentPassword = "";

    async function handleChangePassword(event) {
        event.preventDefault();
        const body = {
            username: $userStore.username,
            currentPassword: currentPassword,
            newPassword: newPassword,
        }

        const { status } = await fetchPost(`${$BASE_URL}/api/change-password`, body);

        if (status === 200) {
            toast.success("Password changed successfully");
        } else {
            toast.error("Failed to change password");
        }
    }
</script>

<Toaster />

<h1 class="text-gray-900 text-3xl font-bold mb-6">Account Settings</h1>

<div>
    <h2 class="text-gray-900 text-xl font-bold mb-4">Email Address</h2>
    <p class="text-gray-700 text-sm">Your email address is <strong>{$userStore.email}</strong></p>
    <Hr class="my-4"/>
</div>

<div>
    <h2 class="text-gray-900 text-xl font-bold mb-4">Password</h2>
    <form on:submit={handleChangePassword}>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <Label for="password" class="text-gray-700 text-sm mb-2 block">New Password</Label>
                <Input type="password" id="password" class="w-full" placeholder="•••••" bind:value={newPassword} required/>
            </div>
            <div>
                <Label for="current-password" class="text-gray-700 text-sm mb-2 block">Current Password</Label>
                <Input type="password" id="current-password" class="w-full" placeholder="•••••" bind:value={currentPassword} required/>
            </div>
        </div>
        <p class="text-gray-700 text-sm mt-2">Forgot your current password? <ForgotPassword /></p>
        <Button type="submit" class="mt-4">Change Password</Button>
    </form>
    <Hr class="my-4"/>
</div>

<div>
    <h2 class="text-gray-900 text-xl font-bold mb-4">Delete Account</h2>
    <p class="text-gray-700 text-sm">You can delete your account at any time. This will permanently delete all of your data. We cannot restore your account once deleted.</p>
    <DeleteAccount />
</div>
