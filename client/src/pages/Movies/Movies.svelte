<script>
    import { onMount } from "svelte";
    import { fetchGet } from "../../util/api";
    import { BASE_URL } from "../../stores/generalStore";
    import Movie from "../../components/Movie.svelte";
    import {
        ImagePlaceholder,
        Pagination,
        Button,
        Dropdown,
        DropdownItem,
    } from "flowbite-svelte";
    import { ChevronDownOutline } from "flowbite-svelte-icons";

    let movies = null;
    let page = 1;
    let totalPages = null;
    const maxVisiblePages = 5;
    let pages = [];
    let selectedYear = "";
    let selectedGenre = "";
    let genreDropdownOpen = false;
    let yearDropdownOpen = false;
    let ratingDropdownOpen = false;
    
    const genres = [
        "Adventure",
        "Fantasy",
        "Animation",
        "Drama",
        "Horror",
        "Action",
        "Comedy",
        "History",
        "Western",
        "Thriller",
        "Crime",
        "Documentary",
        "Science Fiction",
        "Mystery",
        "Music",
        "Romance",
        "Family",
        "War",
        "TV Movie",
    ];

    const years = [
        "2020s",
        "2010s",
        "2000s",
        "1990s",
        "1980s",
        "1970s",
        "1960s",
        "1950s",
        "1940s",
        "1930s",
        "1920s",
        "1910s",
        "1900s",
    ];
    function updatePagination() {
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        startPage = Math.max(1, endPage - maxVisiblePages + 1);

        pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => ({
            name: String(startPage + i),
        }));
    }

    async function fetchMovies(
        yearFilter = selectedYear,
        genreFilter = selectedGenre,
        ratingFilter = ""
    ) {
        const queryParams = new URLSearchParams([
            ["limit", 20],
            ["page", page],
            ["year", yearFilter],
            ["genre", genreFilter],
            ["rating", ratingFilter],
        ]);

        const { data, pagination } = await fetchGet(
            `${$BASE_URL}/api/movies/popular?${queryParams.toString()}`
        );
        movies = data;

        console.log(data);

        totalPages = pagination.total_pages;
        updatePagination();
    }

    onMount(() => {
        fetchMovies();
    });

    function previous() {
        if (page > 1) {
            movies = null;
            page--;
            fetchMovies();
        }
    }

    function next() {
        if (page < totalPages) {
            movies = null;
            page++;
            fetchMovies();
        }
    }

    function handleClick(event) {
        const newPage = parseInt(event.target.innerText);
        if (newPage !== page) {
            movies = null;
            page = newPage;
            fetchMovies();
        }
    }

    function filterYear(year) {
        selectedYear = year.slice(0, 4);
        movies = null;
        fetchMovies(year);
        yearDropdownOpen = false;
    }

    function filterGenre(genre) {
        selectedGenre = genre;
        movies = null;
        fetchMovies("", genre);
        genreDropdownOpen = false;
    }
</script>

<div class="flex flex-row justify-between items-center mt-20">
    <h1 class="text-slate-900 mb-4 font-bold">Popular Movies</h1>
    <div>
        <Button class="h-8 focus-within:ring-0"
            >Year<ChevronDownOutline
                class="w-4 h-4 ms-2 text-white dark:text-white"
            /></Button
        >
        <Dropdown bind:open={yearDropdownOpen} class="w-44 z-20 bg-slate-50 rounded">
            {#each years as year}
                <DropdownItem
                    on:click={() => filterYear(year)}
                    class="bg-slate-50">{year}</DropdownItem
                >
            {/each}
        </Dropdown>

        <Button class="h-8 focus-within:ring-0"
            >Genre<ChevronDownOutline
                class="w-4 h-4 ms-2 text-white dark:text-white"
            /></Button
        >
        <Dropdown bind:open={genreDropdownOpen}  class="w-44 z-20 bg-slate-50 rounded">
            {#each genres as genre}
                <DropdownItem
                    on:click={() => filterGenre(genre)}
                    class="bg-slate-50">{genre}</DropdownItem
                >
            {/each}
        </Dropdown>

        <Button class="h-8 focus-within:ring-0"
            >Rating<ChevronDownOutline
                class="w-4 h-4 ms-2 text-white dark:text-white"
            /></Button
        >
        <Dropdown bind:open={ratingDropdownOpen}  class="w-44 z-20 bg-slate-50 rounded">
            <DropdownItem class="bg-slate-50">1</DropdownItem>
            <DropdownItem class="bg-slate-50">2</DropdownItem>
            <DropdownItem class="bg-slate-50">3</DropdownItem>
            <DropdownItem class="bg-slate-50">4</DropdownItem>
            <DropdownItem class="bg-slate-50">5</DropdownItem>
        </Dropdown>
    </div>
</div>

<div id="popular-movies" class="w-full flex items-center justify-between">
    <div class="grid grid-cols-5 grid-rows-4">
        {#if movies}
            {#each movies as movie}
                <Movie
                    posterPath={movie.poster_path}
                    alt={movie.title}
                    width={128}
                    movieId={movie.id}
                />
            {/each}
        {:else}
            {#each Array(20).fill() as _}
                <div class="w-full h-48 mb-2">
                    <ImagePlaceholder
                        imgOnly
                        class="w-32 rounded-sm mx-2 drop-shadow-md mb-2"
                    />
                </div>
            {/each}
        {/if}
    </div>
</div>

<Pagination
    {pages}
    on:previous={previous}
    on:next={next}
    on:click={handleClick}
/>
