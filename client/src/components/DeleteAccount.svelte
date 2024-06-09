<script>
    import { Button, Input, Label } from "flowbite-svelte";
    import { userStore, tokenStore } from "../stores/authStore.js";
    import { BASE_URL } from "../stores/generalStore.js";
    import { fetchDelete } from "../util/api.js";
    import { navigate } from "svelte-routing";
    import { Toaster, toast } from "svelte-french-toast";

    let confirmation = "";

    async function handleDeleteAccount() {
        const { status } = await fetchDelete(
            `${$BASE_URL}/api/users/${$userStore.id}`,
            $tokenStore
        );

        if (status === 200) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");

            toast.success("Account deleted successfully, Goodbye!");

            setTimeout(() => {
                navigate("/");
            }, 1000);
        } else {
            toast.error("Failed to delete account");
        }
    }
</script>

<Toaster />

<Label class="mt-6 text-slate-950"
    >Type <span class="text-red-500">'DELETE'</span> in the input below to confirm
    deletion</Label
>
<Input
    type="text"
    class="w-full border-1 border-red-500"
    bind:value={confirmation}
    required
/>
<Button
    class="mt-4"
    color="red"
    on:click={handleDeleteAccount}
    disabled={confirmation !== "DELETE"}>Delete Account</Button
>
