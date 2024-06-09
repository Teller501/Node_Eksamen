<script>
    import { navigate } from "svelte-routing";
    import {
        userStore,
        tokenStore,
        refreshTokenStore,
    } from "../stores/authStore.js";
    import { isTokenExpired, refreshToken, logoutUser } from "../util/auth.js";
    import { onMount } from "svelte";

    let currentURL = ``;
    let isRefreshingToken = false;
    let tokenExpired;

    onMount(() => (currentURL = window.location.href));

    function isTokenExpiredOnce() {
        if (tokenExpired === undefined) {
            tokenExpired = isTokenExpired($tokenStore);
        }
        return tokenExpired;
    }

    $: if ($userStore && isTokenExpiredOnce() && !isRefreshingToken) {
        isRefreshingToken = true;
        refreshToken($refreshTokenStore, $tokenStore)
            .then((newToken) => {
                if (newToken) {
                    tokenStore.update((store) => {
                        store = newToken;
                        return store;
                    });
                } else {
                    logoutUser($tokenStore);
                    navigate("/", {
                        state: { from: currentURL },
                        replace: true,
                    });
                }
            })
            .catch(() => {
                logoutUser($tokenStore);
                navigate("/", { state: { from: currentURL }, replace: true });
            })
            .finally(() => {
                isRefreshingToken = false;
                tokenExpired = undefined;
            });
    } else if (!$userStore) {
        navigate("/", { state: { from: currentURL }, replace: true });
    }
</script>

{#if $userStore}
    <slot />
{/if}
