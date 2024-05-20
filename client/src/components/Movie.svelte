<script>
  import { Img } from "flowbite-svelte";

  export let posterPath;
  export let alt;
  export let width;
  export let movieId;
</script>

<div class="flex flex-col items-center mb-3">
  <a href={`/moviedetails/${movieId}`}>
    <Img
      src={`https://image.tmdb.org/t/p/original/${posterPath}`}
      {alt}
      {width}
      data-movie-id={movieId}
      class="rounded-sm mr-2 drop-shadow-md hover:scale-105"
    />
  </a>
</div>
