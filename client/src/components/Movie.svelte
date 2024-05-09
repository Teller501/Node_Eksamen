<script>
    import { Img } from "flowbite-svelte";

    export let poster_path;
    export let alt;
    export let width;
    export let movieId;
</script>

<Img
    src={`https://image.tmdb.org/t/p/original/${poster_path}`}
    {alt}
    {width}
    data-movie-id={movieId}
    class="rounded-sm mx-2 drop-shadow-md hover:scale-105 mb-2"
/>
