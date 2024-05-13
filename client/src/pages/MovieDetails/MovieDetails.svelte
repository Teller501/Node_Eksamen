<script>
    import { onMount } from 'svelte';
    import { BASE_URL } from "../../stores/generalStore";
    import { fetchGet } from "../../util/api";

    import { Rating, Card, Button, AccordionItem, Accordion } from 'flowbite-svelte';
    import { EditSolid, ClockOutline, EyeOutline } from 'flowbite-svelte-icons';

    let movieId = window.location.pathname.split("/").pop();
    let movieDetails;

    async function fetchMovies() {
        const { data } = await fetchGet(
            `${$BASE_URL}/api/movies/${movieId}`
        );
        movieDetails = data;

        const showOnlyYear = movieDetails.release_date
        movieDetails.release_date = showOnlyYear.slice(0, 4);

        
    }

    onMount(() => {
        fetchMovies();
    });

</script>



<img src={`https://image.tmdb.org/t/p/original/${movieDetails?.backdrop_path}`} alt="Movie poster" class="w-full absolute z-[-1] inset-0" />
<div class="container mx-auto mt-20 text-left">
    <Card size="md">
                <img src={`https://image.tmdb.org/t/p/original/${movieDetails?.posterPath}`} alt="Movie picture"
            class="rounded-sm mx-2 w-2/5" aria-hidden="true"
        />
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {movieDetails?.title}
        </h5>
        <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">{movieDetails?.release_date} - {movieDetails?.runtime} minutes</p>
        <hr class="my-4 border-gray-200 dark:border-gray-700" />
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{movieDetails?.overview}</p>
        <Rating count rating={movieDetails?.voteAverage}> <span class="font-normal text-black">/10</span>
            <span class="w-1 h-1 mx-1.5 bg-gray-500 rounded-full dark:bg-gray-400" />
            <a href="/" class="text-sm font-medium text-gray-900 underline hover:no-underline dark:text-white"> 
                out of {movieDetails?.voteCount} reviews
            </a>
          </Rating>
        
        <p class="text-gray-700 inline-flex items-center">
            175k <EyeOutline />
        </p>
        
        <p class="text-gray-700 inline-flex items-center">
            15k <ClockOutline />
        </p>

        <hr class="my-4 border-gray-200 dark:border-gray-700" />

        <div class="justify-between flex items-center">
            <Button>
                Create review <EditSolid />
            </Button>
            <Button>
                Add to watchlist <ClockOutline />
            </Button>
            <Button>
                Have watched <EyeOutline />
            </Button>
        </div>
          
          <Accordion flush class="mt-8">
            <AccordionItem>
              <span slot="header">Reviews</span>
              <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>
            </AccordionItem>
            <AccordionItem>
              <span slot="header">Cast</span>
              <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>
            </AccordionItem>
            <AccordionItem>
                <span slot="header">Similar movies</span>
                <p class="mb-2 text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Illo ab necessitatibus sint explicabo ...</p>
              </AccordionItem>
          </Accordion>
    </Card>
</div>