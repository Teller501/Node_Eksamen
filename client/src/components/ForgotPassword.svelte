<script>
    import { Button, Modal, Label, Input, Checkbox } from "flowbite-svelte";
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../stores/generalStore";
    import { fetchPost } from "../util/api";

    let formModal = false;
    let email = "";

    async function handleForgotPassword(event) {
        event.preventDefault();
        const { status, data } = await fetchPost(
            `${$BASE_URL}/api/forgot-password`,
            { email }
        );

        if (status === 200) {
            toast.success("An email has been sent to reset your password.");
        } else {
            toast.error(data.error || "Failed to send reset link.", {
                duration: 3000,
            });
        }

        formModal = false;
    }
</script>

<Toaster />

<button
    type="button"
    class="bg-transparent text-primary-800 hover:bg-transparent hover:text-primary-500 focus:outline-none focus:ring-0 mx-auto my-auto focus:text-primary-500 ms-auto text-sm ml-8 p-0 border-0"
    on:click={() => (formModal = true)}>Forgot password</button
>

<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full" outsideclose>
    <form class="flex flex-col space-y-6" on:submit={handleForgotPassword}>
        <h3 class="mb-4 text-xl font-medium text-neutral-900 dark:text-white">
            Please enter email to reset password
        </h3>
        <Label class="space-y-2">
            <span>Email</span>
            <Input
                type="email"
                name="email"
                id="email"
                placeholder="name@company.com"
                bind:value={email}
                required
            />
        </Label>
        <Button type="submit" class="w-full1">Reset your account</Button>
    </form>
</Modal>
