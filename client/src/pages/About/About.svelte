<script>
    import { Img, P, Hr, A } from "flowbite-svelte";
    import llewyn from "../../assets/about/inside-llewyn.jpg";
    import oldboy from "../../assets/about/oldboy.jpg";
</script>

<div class="flex mt-8">
    <div class="w-1/3 flex-none mr-8">
        <Img
            src={llewyn}
            alt="Llewyn Davis smoking"
            class="shadow-md drop-shadow-md rounded-sm mb-96"
        />
        <Img
            src={oldboy}
            alt="Oldboy"
            class="shadow-md drop-shadow-md rounded-sm"
        />
    </div>
    <div class="flex-auto w-64 flex flex-col items-center">
        <h1 class="text-slate-950 font-bold mb-4">About CineMatch</h1>
        <P weight="light" class="text-slate-950 mb-8">
            Every Movie has a Story. All of us has an opinion to share. So we
            built a place where you can log all of the movies you consider to be
            your favorites, rank them based on what appeals to YOU and write
            in-depth reviews that will help spark discussions between people who
            share your passion for film. CineMatch serves aficionados of every
            kind, from classic summer tentpole enthusiasts to indie Producer's
            Lunch folk, the self-proclaimed "foreign film expert" with a fresh
            take on everything contemporary. <br /> <br /> But we go beyond just
            sharing the movie experience, we want to make sure passionate film lovers
            connect and try and help each other. By providing features such as forums,
            discussion boards and personalized recommendations, we help people join
            communities surrounded by similar interests, argue over genres, and uncover
            hidden cinematic treasures together
        </P>

        <h2 class="text-slate-950 mb-4 text-2xl">Our vision</h2>
        <P weight="light" class="text-slate-950 mb-20">
            Our vision with CineMatch is to gather as many users as possible who
            share a joint interest: Film. CineMatch is our vision for a living
            ecosystem, powered by the ideas, opinions and experiences that make
            our world of visual storytelling so rich. Users will have a more
            active role in the platform, this is not just an application for
            content consumption. We want to build a collaborative, open-ended
            cinematic knowledge base via user reviews and ratings and
            discussions.
        </P>

        <h2 class="font-light text-slate-950 text-xl">Using CineMatch</h2>
        <Hr classHr="h-px bg-gray-200 mt-1 mb-2 border-0 w-full" />
        <P weight="light" class="text-slate-950 mb-20">
            To use CineMatch, you need to create an account. Once you have
            created an account, you can start adding movies to your profile,
            rate them, write reviews and connect with other users. You can also
            follow other users, see their reviews and ratings and get movie
            recommendations based on your preferences. We are constantly
            improving the platform, so if you have any feedback or suggestions,
            please do not hesitate to <A href="/contact">contact us.</A>
        </P>

        <h2 class="font-light text-slate-950 text-xl">Our Recommender</h2>
        <Hr classHr="h-px bg-gray-200 mt-1 mb-2 border-0 w-full" />
        <P weight="light" class="text-slate-950 mb-20">
            Our recommender system is built on the idea that the best
            recommendations come from people who share your interests. We use
            collaborative filtering to recommend movies based on your ratings!
            So when you visit our <A href="/recommender">recommender page</A>,
            you will get a handful of popular movies, where you can rate them,
            skip them or add them to watchlist. After we have gathered enough
            information, we will provide you with a list of movies that you
            might like.
        </P>
    </div>
</div>
