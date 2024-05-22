<script>
    import { Marquee, Img } from "flowbite-svelte";

    import chigurh from "../../assets/404/chigurh.jpg";
    import inbruges from "../../assets/404/inbruges.jpeg";
    import johnlakeman from "../../assets/404/johnlakeman.jpeg";
    import stanfield from "../../assets/404/stanfield.jpeg";
    import thedude from "../../assets/404/thedude.jpg";

    const images = [chigurh, inbruges, johnlakeman, stanfield, thedude];
</script>

<h1 class="text-slate-900">Sorry, not found!</h1>
<p class="text-slate-900">But take a look at some of these iconic characters</p>

<Marquee shadow class="py-16">
    {#each images as image}
        <Img src={image} alt="404 image" class="w-32 h-64 object-cover rounded-lg shadow-lg" />
    {/each}
</Marquee>