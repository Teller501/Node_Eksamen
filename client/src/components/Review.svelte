<script>
  import { Review } from "flowbite-svelte";
  import {
    AnnotationOutline,
    ThumbsUpSolid,
    EditSolid,
    UsersOutline,
  } from "flowbite-svelte-icons";
  import {BASE_URL} from "../stores/generalStore";
  import {fetchGet} from "../util/api";
  import {onMount} from "svelte";

  export let review = {
    name: "Jesper Hansen",
    imgSrc: "https://picsum.photos/500/500",
    imgAlt: "profile picture",
    address: "Denmark",
    reviewDate: "20/10, 2023",
    title: "The Best Movie Ever",
    rating: 8.5,
    item1: "20 followers",
    item2: "34 reviews",
    item3: "255 likes",
    reviewText:
      "This movie is the best movie I have ever seen. I would recommend it to everyone. If you haven't seen it yet, you should definitely watch it. It's a must-watch movie.",
  };

</script>

<div class="border border-gray-200 p-4 mt-4 rounded-md">
  <Review {review}>
    <p class="mb-2 font-light text-gray-500 dark:text-gray-400">
      {review.reviewText}
    </p>

    <svelte:fragment slot="item1">
      <UsersOutline class="w-4 h-4 me-2" />
      {review.item1}
    </svelte:fragment>
    <svelte:fragment slot="item2">
      <EditSolid class="w-4 h-4 me-2" />
      {review.item2}
    </svelte:fragment>
    <svelte:fragment slot="item3">
      <ThumbsUpSolid class="w-4 h-4 me-2" />
      {review.item3}
    </svelte:fragment>

    <aside class="flex items-center mt-3 space-x-5 rtl:space-x-reverse">
      <a
        href="/"
        class="inline-flex items-center text-sm font-medium text-primary-600"
      >
        <ThumbsUpSolid class="w-3.5 h-3.5 me-2.5 text-primary-600" />
        Like
      </a>
      <a
        href="/"
        class="inline-flex items-center text-sm font-medium text-primary-600"
      >
        <AnnotationOutline class="w-3.5 h-3.5 me-2.5 text-primary-600" />
        Comment
      </a>
    </aside>
  </Review>
</div>
