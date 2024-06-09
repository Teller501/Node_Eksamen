<script>
    import { userStore } from "../../stores/authStore";
    import Login from "../../components/Login.svelte";
    import Signup from "../../components/Signup.svelte";
    import { Button, Spinner } from "flowbite-svelte";
    let currentView = "login";
    let isLoading = false;

    function switchView(view) {
        currentView = view;
    }

    function handleLoading(event) {
        isLoading = event.detail;
    }
</script>

{#if isLoading}
    <div
        class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10"
    >
        <Spinner size={16} />
    </div>
{/if}

{#if !$userStore}
    <div class="bg-slate-200 rounded-lg min-w-80 mx-auto my-auto relative">
        <div class="flex gap-4 m-2">
            <Button
                class="bg-transparent text-neutral-900 hover:bg-transparent hover:text-neutral-500 focus:outline-none focus:ring-0 mx-auto my-auto focus:text-neutral-500"
                on:click={() => switchView("login")}>SIGN IN</Button
            >
            <Button
                class="bg-transparent text-neutral-900 hover:bg-transparent hover:text-neutral-500 focus:outline-none focus:ring-0 mx-auto my-auto focus:text-neutral-500"
                on:click={() => switchView("signup")}>SIGN UP</Button
            >
        </div>
        {#if currentView === "login"}
            <Login {isLoading} on:handleLoading={handleLoading} />
        {:else if currentView === "signup"}
            <Signup />
        {/if}
    </div>
{/if}
