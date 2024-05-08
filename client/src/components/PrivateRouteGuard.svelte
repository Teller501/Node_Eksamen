<script>
    import { navigate } from "svelte-routing";
    import { userStore, tokenStore, refreshTokenStore } from "../stores/authStore.js";
    import { isTokenExpired, refreshToken, logoutUser } from "../util/auth.js";
    import { onMount } from 'svelte';

    let currentURL = ``;

    onMount(() => currentURL = window.location.href);

    $: if ($userStore && isTokenExpired($tokenStore)) {
        refreshToken($refreshTokenStore).then((newToken) => {
            if (newToken) {
                tokenStore.update((store) => {
                    store = newToken;
                    return store;
                });
            } else {
                logoutUser();
                navigate("/", {
                    state: { from: currentURL },
                    replace: true,
                });
            }
        });
    } else if (!$userStore) {
        navigate("/", {
            state: { from: currentURL },
            replace: true,
        });
    }
</script>

{#if $userStore}
    <slot />
{/if}
