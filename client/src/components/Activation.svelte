<script>
    import { onMount } from 'svelte';
    import toast, { Toaster } from "svelte-french-toast";
    import { fetchGet } from '../util/api.js'
    import { navigate } from 'svelte-routing';
    import { BASE_URL } from '../stores/generalStore.js';

    export let params;

    onMount(async () => {
        const token = params.token;
        const { status } = await fetchGet(`${$BASE_URL}/api/activate/${token}`);

        if (status === 200) {
            toast.success("Account activated. You can now login.", { duration: 5000 });
            navigate("/");
        } else {
            toast.error("Account activation failed.", { duration: 3000 });
            navigate("/");
        }
    });
</script>
<Toaster />
