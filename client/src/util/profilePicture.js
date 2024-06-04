import { fetchGet } from "./api.js";

export async function getProfilePicture(profilePictureUrl, fallbackUrl) {
    let imgUrl;

    try {
        const { status } = await fetchGet(profilePictureUrl);
        if (status === 200) {
            imgUrl = profilePictureUrl;
        } else {
            imgUrl = fallbackUrl;
        }
    } catch (error) {
        imgUrl = fallbackUrl;
    }

    return imgUrl;
}
