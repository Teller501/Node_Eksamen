<script>
    import { fade } from "svelte/transition";
    import { Card, Button, Label, Input, Spinner, Helper } from "flowbite-svelte";
    import { CheckOutline, CloseOutline } from "flowbite-svelte-icons";
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../stores/generalStore.js";
    import { fetchPost, fetchGet } from "../util/api.js";
    import { navigate } from "svelte-routing";
    import z from "zxcvbn"

    let username = "";
    let email = "";
    let password = "";
    let confirmPassword = "";
    let isUsernameAvailable;
    let usernameTimeout;

    $: strongPassword = z(password).score > 3;

    let errors = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    function validateForm() {
        let valid = true;

        errors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        };

        if (!username) {
            errors.username = 'Username is required';
            valid = false;
        }
        if (!email) {
            errors.email = 'Email is required';
            valid = false;
        }
        if (!password) {
            errors.password = 'Password is required';
            valid = false;
        }
        if (!confirmPassword) {
            errors.confirmPassword = 'Confirm password is required';
            valid = false;
        }
        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
            valid = false;
        }
        if (!strongPassword) {
            errors.password = 'Password is too weak';
            valid = false;
        }

        return valid;
    }

    async function handleSignup(event) {
        event.preventDefault();

        if (!validateForm()) {
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

    async function checkUsernameAvailability() {
        isUsernameAvailable = null;
        const { data, status } = await fetchGet(`${$BASE_URL}/api/check-username/${username}`);
        if (status === 200) {
            isUsernameAvailable = data;
        }
    }

    function handleUsernameInput() {
        clearTimeout(usernameTimeout);
        usernameTimeout = setTimeout(async () => {
            if (username) {
                await checkUsernameAvailability();
            } else {
                isUsernameAvailable = null;
            }
        }, 300);
    }
</script>

<Toaster />

<div in:fade={{ duration: 300 }}>
    <Card class="bg-slate-200">
        <form class="flex flex-col space-y-6" on:submit={handleSignup} novalidate>
            <Label class="space-y-2">
                <span>Username</span>
                <div class="relative">
                    <Input
                        type="text"
                        name="username"
                        id="username"
                        placeholder="Username"
                        bind:value={username}
                        on:input={handleUsernameInput}
                        required
                    />
                    {#if errors.username}
                        <Helper color="red">{errors.username}</Helper>
                    {/if}
                    {#if isUsernameAvailable === null && username}
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <Spinner />
                        </div>
                    {/if}
                    {#if isUsernameAvailable === false}
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <CloseOutline color="red" />
                        </div>
                    {:else if isUsernameAvailable === true}
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                            <CheckOutline color="green" />
                        </div>
                    {/if}
                </div>
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
                {#if errors.email}
                    <Helper color="red">{errors.email}</Helper>
                {/if}
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
                {#if password}
                    <span class={`${strongPassword ? "text-green-700" : "text-red-700"}`}>{strongPassword ? 'Strong Password' : 'Weak Password'}</span>
                {/if}
                {#if errors.password}
                    <Helper color="red">{errors.password}</Helper>
                {/if}
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
                {#if errors.confirmPassword}
                    <Helper color="red">{errors.confirmPassword}</Helper>
                {/if}
            </Label>
            <Button type="submit" class="w-full">Sign up</Button>
        </form>
    </Card>
</div>
