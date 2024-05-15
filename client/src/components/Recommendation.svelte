<script>
    import { Card, Button, Img } from "flowbite-svelte";
    import StarRating from "@ernane/svelte-star-rating";

    export let onRateMovie;
    export let onSkipMovie;
    export let movie;

    let config = {
        readOnly: false,
        countStars: 5,
        range: {
            min: 0, 
            max: 5, 
            step: 0.5
        },
        score: 0.0,
        showScore: true,
        scoreFormat: function(){ return `(${this.score}/${this.countStars})` },
        name: "",
        starConfig: {
            size: 30,
            fillColor: '#eb4e27',
            strokeColor: "#BB8511",
            unfilledColor: '#FFF',
            strokeUnfilledColor: '#000'
        }
    };
    
</script>


<Card size="sm">
    <div class="flex flex-col items-center">
        <Img src={`https://image.tmdb.org/t/p/original/${movie.poster_path}`} alt={movie.title} class="rounded-sm mx-2 w-2/5" />
        <h2 class="text-slate-900 font-bold">{movie.title}</h2>
        <p class="mb-8 text-xs">{movie.overview}</p>


        <div class="mb-4">
            <StarRating bind:config on:change={() => onRateMovie(config.score)}/>
        </div>
        <div class="flex flex-row items-center">
            <Button class="mr-4" on:click={() => onSkipMovie()}>Skip</Button>
            <Button>Add to watchlist</Button>
        </div>
    </div>
    </Card>
