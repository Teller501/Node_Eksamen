<script>
    import { useNavigate, useLocation } from "svelte-navigator";
    import { userStore, tokenStore, refreshTokenStore } from "../stores/authStore.js";
    import { isTokenExpired, refreshToken, logoutUser } from "../util/auth.js";

    const navigate = useNavigate();
    const location = useLocation();

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
                    state: { from: $location.pathname },
                    replace: true,
                });
            }
        });
    } else if (!$userStore) {
        navigate("/", {
            state: { from: $location.pathname },
            replace: true,
        });
    }
</script>

{#if $userStore}
    <slot />
{/if}
