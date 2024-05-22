<script>
    import {
        Navbar,
        NavBrand,
        NavLi,
        NavUl,
        NavHamburger,
        Button,
        Input,
        Dropdown,
        DropdownItem,
        DropdownDivider,
    } from "flowbite-svelte";
    import CineMatch from "./assets/CineMatch.png";
    import { Router, Route } from "svelte-routing";
    import Auth from "./pages/Auth/Auth.svelte";
    import Activation from "./components/Activation.svelte";
    import ResetPassword from "./pages/ResetPassword/ResetPassword.svelte";
    import { SearchOutline, ChevronDownOutline } from "flowbite-svelte-icons";
    import { userStore, tokenStore } from "./stores/authStore";
    import { logoutUser } from "./util/auth.js";
    import PrivateRoute from "./components/PrivateRoute.svelte";
    import Home from "./pages/Home/Home.svelte";
    import MovieDetails from "./pages/MovieDetails/MovieDetails.svelte";
    import Movies from "./pages/Movies/Movies.svelte";
    import Search from "./pages/Search/Search.svelte";
    import Profile from "./pages/Profile/Profile.svelte";
    import Recommender from "./pages/Recommender/Recommender.svelte";
    import Recommendations from "./pages/Recommendations/Recommendations.svelte";
    import NotFound from "./pages/NotFound/NotFound.svelte";

    let searchQuery = "";

    function handleLogout(event) {
        event.preventDefault();
        localStorage.removeItem("rememberMe");
        logoutUser($tokenStore);
    }

    function handleSearch() {
        if (searchQuery.trim()) {
            window.location.href = `/search/${encodeURIComponent(searchQuery.trim())}`;
        }
    }
</script>

<Router>
    <Navbar
        fluid={true}
        class="min-w-full fixed inset-x-0 top-0 bg-slate-200 drop-shadow-sm z-50"
    >
        <NavBrand href="/">
            <img src={CineMatch} class="me-1 h-14 sm:h-18" alt="Logo" />
            <span
                class="self-center whitespace-nowrap text-xl font-semibold dark:text-white"
                >CineMatch</span
            >
        </NavBrand>
        <div class="hidden relative md:block">
            <div
                class="flex absolute inset-y-0 start-0 items-center ps-3 pointer-events-none"
            >
                <SearchOutline class="w-4 h-4" />
            </div>
            <Input
                bind:value={searchQuery}
                on:keydown={(event) => {
                    if (event.key === "Enter") {
                        handleSearch();
                    }
                }}
                id="search-navbar"
                class="ps-10"
                placeholder="Search..."
            />
        </div>
        <div class="flex md:order-2">
            <Button
                color="none"
                data-collapse-toggle="mobile-menu-3"
                aria-controls="mobile-menu-3"
                aria-expanded="false"
                class="md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1"
            >
                <SearchOutline class="w-5 h-5" />
            </Button>
            <NavHamburger />
        </div>
        {#if !$userStore}
            <div class="flex md:order-2">
                <Button size="sm" href="/">Login</Button>
            </div>
        {/if}
        <NavUl>
            <NavLi href="/home" active={true}>Home</NavLi>
            <NavLi href="/movies">Movies</NavLi>
            <NavLi href="/recommender" class="text-blue">Recommender (AI)</NavLi>
            {#if $userStore}
                <NavLi class="cursor-pointer">
                    Profile<ChevronDownOutline
                        class="w-6 h-6 ms-2 text-primary-800 dark:text-white inline"
                    />
                </NavLi>
                <Dropdown class="w-44 z-20 bg-slate-50 rounded">
                    <DropdownItem href="/home">Home</DropdownItem>
                    <DropdownItem href={`/${$userStore.username}`}>Profile</DropdownItem>
                    <DropdownItem href="/movies">Movies</DropdownItem>
                    <DropdownItem href="/">Reviews</DropdownItem>
                    <DropdownItem href="/"
                        >Settings</DropdownItem
                    >
                    <DropdownDivider />
                    <DropdownItem href="/" on:click={handleLogout}
                        >Sign out</DropdownItem
                    >
                </Dropdown>
            {/if}
        </NavUl>
    </Navbar>

    <div class="pt-20">
        <Route path="/activate/:token" let:params>
            <Activation {params} />
        </Route>
        <Route path="/reset-password/:token" let:params>
            <ResetPassword {params} />
        </Route>
        {#if !$userStore}
            <Route path="/"><Auth /></Route>
        {/if}
        {#if $userStore}
            <PrivateRoute path="/"><Home /></PrivateRoute>
        {/if}
        <Route path="*"><Auth /></Route>
        <PrivateRoute path="/home"><Home /></PrivateRoute>
        <PrivateRoute path="/movies"><Movies /></PrivateRoute>
        <PrivateRoute path="/search/:query" let:params
            ><Search {params} /></PrivateRoute
        >
        <PrivateRoute path="/moviedetails/:id">
            <MovieDetails />
        </PrivateRoute>
        <PrivateRoute path="/recommender">
            <Recommender />
        </PrivateRoute>
        <PrivateRoute path="/recommendations">
            <Recommendations />
        </PrivateRoute>
        <Route path="/:username" let:params>
            <Profile {params} />
        </Route>
        <Route path="/404"><NotFound /></Route>
    </div>
</Router>
