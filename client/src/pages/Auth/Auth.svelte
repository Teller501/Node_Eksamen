<script>
    import { userStore } from "../../stores/authStore";
    import Login from "../../components/Login.svelte";
    import Signup from "../../components/Signup.svelte";
    import { Button } from "flowbite-svelte";
    let currentView = "login";

    function switchView(view) {
        currentView = view;
    }
</script>

{#if !$userStore}
    <div class="bg-slate-200 rounded-lg min-w-80 mx-auto my-auto">
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
            <Login />
        {:else if currentView === "signup"}
            <Signup />
        {/if}
    </div>
{/if}
