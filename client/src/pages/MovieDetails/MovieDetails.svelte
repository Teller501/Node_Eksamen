<script>
    import { Rating, Card, Button, AccordionItem, Accordion } from 'flowbite-svelte';
    import { EditSolid, ClockOutline, EyeOutline } from 'flowbite-svelte-icons';
</script>

<img src="https://picsum.photos/1600/600" alt="Movie poster" class="absolute z-[-1] inset-0 blur-sm" />
<div class="container mx-auto mt-20 text-left">
    <Card img="https://picsum.photos/1800/500" size="lg">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Movie title</h5>
        <p class="mb-3 font-normal text-gray-500 dark:text-gray-400">1994 - 2h 22min</p>
        <hr class="my-4 border-gray-200 dark:border-gray-700" />
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <Rating total={5} rating={4}>
            <p slot="text" class="ms-2 text-sm text-gray-700">stars out of 565k reviews</p>
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