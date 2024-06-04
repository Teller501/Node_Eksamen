import { onMount } from "svelte";

export function getProfilePicture(profilePictureUrl, fallbackUrl) {
    let imgUrl;

    onMount(async () => {
        try {
          const response = await fetch(profilePictureUrl, {
            credentials: "include",
          });
          if (response.status !== 404) {
            imgUrl = profilePictureUrl;
          } else {
            imgUrl = fallbackUrl;
          }
        } catch (error) {
          imgUrl = fallbackUrl;
        }
      });
    
      return imgUrl;
}