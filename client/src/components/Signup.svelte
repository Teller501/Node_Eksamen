<script>
    import { fade } from "svelte/transition";
    import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../stores/generalStore.js";
    import { fetchPost } from "../util/api.js";
    import { navigate } from "svelte-routing";

    let username = "";
    let email = "";
    let password = "";
    let confirmPassword = "";

    async function handleSignup(event) {
        event.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.", { duration: 3000 });
            return;
        }

        const user = {
            username,
            email,
            password,
        };

        const { status, data } = await fetchPost(`${$BASE_URL}/api/signup`, user);
        if (status === 201) {
            toast.success("Signup successful. Please check your email to activate your account.", { duration: 5000 });
            navigate("/");
        } else {
            const errorMessage = data && data.error ? data.error : "User creation failed.";
            toast.error(errorMessage, { duration: 3000 });
        }
    }
</script>

<Toaster />

<div in:fade={{ duration: 300 }}>
    <Card class="bg-slate-200">
        <form class="flex flex-col space-y-6" on:submit={handleSignup}>
            <Label class="space-y-2">
                <span>Username</span>
                <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    bind:value={username}
                    required
                />
            </Label>
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
            <Label class="space-y-2">
                <span>Your password</span>
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
                <span>Confirm password</span>
                <Input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    placeholder="•••••"
                    bind:value={confirmPassword}
                    required
                />
            </Label>
            <Button type="submit" class="w-full">Sign up</Button>
        </form>
    </Card>
</div>