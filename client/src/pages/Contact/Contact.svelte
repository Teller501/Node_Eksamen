<script>
    import {
        Img,
        P,
        Label,
        Input,
        Textarea,
        Button,
        Helper,
    } from "flowbite-svelte";
    import waltz from "../../assets/contact/waltz-ringing.png";
    import toast, { Toaster } from "svelte-french-toast";
    import { fetchPost } from "../../util/api.js";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { userStore, tokenStore } from "../../stores/authStore.js";

    let name = $userStore.username ? $userStore.username : "";
    let email = $userStore.email ? $userStore.email : "";
    let message = "";

    let errors = {
        name: "",
        email: "",
        message: "",
    };

    function validateForm() {
        let valid = true;

        if (!name) {
            errors.name = "Name is required";
            valid = false;
        }

        if (!email) {
            errors.email = "Email is required";
            valid = false;
        }

        if (!message) {
            errors.message = "Please enter a message";
            valid = false;
        }

        return valid;
    }

    async function handleContact(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const body = { name, email, message };

        const { status } = await fetchPost(
            `${$BASE_URL}/api/contact`,
            body,
            $tokenStore
        );

        if (status === 200) {
            toast.success("Message sent successfully");
            name = "";
            email = "";
            message = "";
        } else {
            toast.error("An error occurred, please try again later");
        }
    }
</script>

<Toaster />

<div class="flex mt-8">
    <div class="w-1/3 flex-none mr-8">
        <Img
            src={waltz}
            alt="Waltz ringing"
            class="shadow-md drop-shadow-md rounded-sm"
        />
    </div>
    <div class="flex-auto w-64 flex flex-col items-center">
        <h1 class="text-slate-950 font-bold mb-4">Contact CineMatch</h1>
        <P weight="light" class="text-slate-950 mb-12">
            We are always looking to improve at CineMatch, and we would like
            your help! Please do not hesitate to contact us with any questions,
            remarks or recommendations. We want to hear from you, with your
            suggestions for enhancements in the user interface, advancements to
            existing features that we could bring about or just how you are
            hoping things to become. Your input is instrumental in helping to
            form CineMatch as the definitive online home for film fans around
            the globe. <br /><br /> If you have a minute, we would love to hear
            how we can improve our service even further for CineMatch and all of
            our users. You can get in touch with us through our site, email or
            socials. We commit to being responsive in our listening of your
            feedback and working hard to input that feedback into the continued
            development of this effort. <br /><br />
            If you have any questions at all please feel free to contact us here,
            we are always happy to help and love welcoming new members to the CineMatch
            family.
        </P>

        <div class="w-full flex flex-col items-stretch">
            <form class="space-y-4" on:submit={handleContact} novalidate>
                <Label class="space-y-2">
                    <span>Your name</span>
                    <Input
                        type="text"
                        name="name"
                        id="name"
                        placeholder="Your name"
                        bind:value={name}
                        required
                    />
                    {#if errors.name}
                        <Helper class="text-red-700">{errors.name}</Helper>
                    {/if}
                </Label>
                <Label class="space-y-2">
                    <span>Your email</span>
                    <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Your email"
                        bind:value={email}
                        required
                    />
                    {#if errors.email}
                        <Helper class="text-red-700">{errors.email}</Helper>
                    {/if}
                </Label>
                <Label class="space-y-2">
                    <span>Your message</span>
                    <Textarea
                        name="message"
                        id="message"
                        placeholder="Your message"
                        bind:value={message}
                        required
                    />
                    {#if errors.message}
                        <Helper class="text-red-700">{errors.message}</Helper>
                    {/if}
                </Label>
                <Button type="submit" class="w-full">Send message</Button>
            </form>
        </div>
    </div>
</div>
