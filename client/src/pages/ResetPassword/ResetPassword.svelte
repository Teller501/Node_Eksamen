<script>
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchPost } from "../../util/api";
    import { Button, Input, Card, Label } from "flowbite-svelte";

    let password = "";
    let confirmPassword = "";

    export let params;
    const token = params.token;

    onMount(async () => {
        if (!token) {
            navigate("/", { replace: true });
        }

        const { status } = await fetchPost(`${$BASE_URL}/api/validate-token`, {
            token,
        });
        if (status !== 200) {
            toast.error("Invalid or expired token.", { duration: 3000 });
            navigate("/");
            return;
        }
    });

    async function handleResetPassword(event) {
        event.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.", { duration: 3000 });
            return;
        }

        const { status } = await fetchPost(
            `${$BASE_URL}/api/reset-password/${token}`,
            { newPassword: password }
        );
        if (status === 200) {
            toast.success("Password reset successful. You can now login.", {
                duration: 5000,
            });
            navigate("/");
        } else {
            toast.error("Password reset failed.", { duration: 3000 });
        }
    }
</script>

<Toaster />

<div class="bg-slate-200 rounded-lg min-w-80 mx-auto my-auto">
    <Card class="bg-slate-200">
        <form class="flex flex-col space-y-6" on:submit={handleResetPassword}>
            <Label class="space-y-2">
                <span>New Password</span>
                <Input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="•••••"
                    bind:value={password}
                    required
                />
            </Label>
            <Label class="space-y-2">
                <span>Confirm Password</span>
                <Input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="•••••"
                    bind:value={confirmPassword}
                    required
                />
            </Label>
            <Button type="submit" class="w-full">Reset password</Button>
        </form>
    </Card>
</div>
