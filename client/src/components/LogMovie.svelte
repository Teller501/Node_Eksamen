<script>
    import { Button, Modal, Label, Input, Checkbox, Img, Textarea, Rating } from "flowbite-svelte";
    import StarRating from "@ernane/svelte-star-rating";
    import { EditSolid } from "flowbite-svelte-icons";
    import toast, { Toaster } from "svelte-french-toast";
    import { BASE_URL } from "../stores/generalStore";
    import { fetchPost } from "../util/api";
    import { userStore } from "../stores/authStore";

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

    export let posterPath = "";
    export let title = "";
    export let movieId = "";

    let formModal = false;
    let currentDate = new Date().toISOString().split("T")[0];
    let watchedOn = currentDate;
    let rating = null;
    let review = "";

    function changeRating(){
        rating = config.score;
        console.log(rating);
    }

    async function postLog(event){
        event.preventDefault();
        
        const body = {
            movieId: movieId,
            userId: $userStore.id,
            watchedOn: watchedOn,
            rating: rating,
            review: review
        }

        const { data, status } = await fetchPost(`${$BASE_URL}/api/logs`, body);

        if(status === 200){
            toast.success("Movie logged successfully.");
        } else {
            toast.error(data.error || "Failed to log movie.");
        }

        formModal = false;
    }

</script>
<Toaster />


<Button on:click={() => (formModal = true)}>
    Log Movie <EditSolid />
</Button>

<Modal bind:open={formModal} size="md" autoclose={false} class="w-full" outsideclose>
    <div class="flex flex-row">
        <div class="flex flex-1 w-8">
            <Img class="w-64" src={`https://image.tmdb.org/t/p/original/${posterPath}`} alt={`Poster for ${title}`} />
        </div>
        <form class="flex-auto w-24" on:submit={postLog}>
            <h2>I have just watched:</h2>
            <h2 class="text-slate-900 text-xl font-bold mb-4">{title}</h2>

            <Label class="space-y-2 mb-2">
                <span>I watched this on</span>
                <Input type="date" name="watchDate" id="watchDate" min="1900-01-01" max={currentDate} bind:value={watchedOn} class="bg-slate-200" required />
            </Label>

            <Label class="space-y-2 mb-2">
                <span>Write a review</span>
                <Textarea id="review" class="bg-slate-200 focus:bg-white" placeholder="Your review" rows="4" name="review" bind:value={review}/>
            </Label>

            <Label class="space-y-2 mb-2">
                <Label class="space-y-2 mb-2">
                    <StarRating bind:config on:change={changeRating}/>
                </Label>
            </Label>

            <div class="flex justify-end w-full">
                <Button type="submit" class="m-4">
                    Log Movie <EditSolid />
                </Button>
            </div>            
        </form>
    </div>
    
</Modal>