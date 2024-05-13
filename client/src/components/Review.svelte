<script>
  import { Review } from "flowbite-svelte";
  import {
    AnnotationOutline,
    ThumbsUpSolid,
    EditSolid,
    UsersOutline,
  } from "flowbite-svelte-icons";

  let review = {
    name: "Jesper Hansen",
    imgSrc: "https://picsum.photos/500/500",
    imgAlt: "profile picture",
    address: "Denmark",
    reviewDate: "20/10, 2023",
    title: "Best movie ever!",
    rating: 8.5,
    item1: "20 followers",
    item2: "34 reviews",
    item3: "255 likes",
    reviewText:
      "This movie is the best movie I have ever seen. I would recommend it to everyone. If you haven't seen it yet, you should definitely watch it. It's a must-watch movie.",
  };
</script>

<div class="border border-gray-300 rounded-md p-10">
    <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
      Write a review to the movie <EditSolid class="inline-block" />
    </h3>
  <div class="flex items-center space-x-4 my-4">
    <input
      type="text"
      class="w-full border border-gray-300 rounded-md"
      placeholder="Title"
    />
    <input
      type="number"
      class="w-full border border-gray-300 rounded-md"
      placeholder="Rating (0-10 ★)"
      min="0"
      max="10"
      step="0.5"
    />
  </div>

  <textarea
    class="w-full border border-gray-300 rounded-md"
    placeholder="Write your review... (max 500 characters)"
    maxlength="500"
  />
  <button class="w-full mt-4 py-2 bg-primary-600 text-white rounded-md">Submit review</button>
</div>

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
