<script>
    import { fade } from "svelte/transition";
    import { Card, Button, Label, Input, Checkbox, Spinner } from "flowbite-svelte";
    import { fetchPost } from "../util/api.js";
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../stores/generalStore.js";
    import { navigate } from "svelte-routing";
    import {
        userStore,
        tokenStore,
        refreshTokenStore,
    } from "../stores/authStore.js";
    import ForgotPassword from "./ForgotPassword.svelte";
    import { createEventDispatcher } from "svelte";
    
    const dispatch = createEventDispatcher();

    export let isLoading = false;
    let username = "";
    let password = "";
    let rememberMe = false;

    async function handleLogin(event) {
        event.preventDefault();
        dispatch('handleLoading', true);
        const body = { username, password, rememberMe };
        const { status, data } = await fetchPost(
            `${$BASE_URL}/api/login`,
            body
        );

        if (status === 200) {
            userStore.set(data.user);
            tokenStore.set(data.token);
            refreshTokenStore.set(data.refreshToken);

            if (rememberMe) {
                localStorage.setItem("rememberMe", "true");
            } else {
                localStorage.removeItem("rememberMe");
            }

            await fetchPost(`${$BASE_URL}/api/remember-me`, {
                refreshToken: data.refreshToken,
                rememberMe,
            });

            navigate("/home");
        } else {
            const errorMessage =
                data && data.error ? data.error : "Wrong username or password.";
            toast.error(errorMessage, { duration: 3000 });
        }

        dispatch('handleLoading', false);
    }
</script>

<Toaster />

<div in:fade={{ duration: 300 }}>
    <Card class="bg-slate-200">
        <form class="flex flex-col space-y-6" on:submit={handleLogin}>
            <Label class="space-y-2">
                <span>Username</span>
                <Input
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    bind:value={username}
                    required
                    disabled={isLoading}
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
                    disabled={isLoading}
                />
            </Label>
            <div class="flex items-start">
                <Checkbox bind:checked={rememberMe} disabled={isLoading}>Remember me</Checkbox>
                <ForgotPassword />
            </div>
            <Button type="submit" class="w-full" disabled={isLoading}>
                {#if !isLoading}
                    Login to your account
                {/if}
            </Button>
        </form>
    </Card>
</div>
