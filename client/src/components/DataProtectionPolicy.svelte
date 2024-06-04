<script>
    import { List, Li } from "flowbite-svelte";

    export let active = false;
</script>

{#if active}
    <h1 class="text-slate-950 my-4">Data Protection Policy</h1>
    <div class="flex justify-center">
        <List list="decimal" class="w-2/3">
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Introduction:</span> CineMatch ("we", "us", "our") is committed to protecting and respecting your privacy. This policy outlines how we collect, use, disclose, and protect your personal data in compliance with the General Data Protection Regulation (GDPR).
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Data we collect:</span> We may collect and process the following personal data:
                <List list="disc" class="ml-8">
                    <Li>
                        <span class="font-bold">Identity Data:</span> Name, username, date of birth, gender.
                    </Li>
                    <Li>
                        <span class="font-bold">Contact Data:</span> Email address, telephone number, postal address.
                    </Li>
                    <Li>
                        <span class="font-bold">Technical Data:</span> IP address, browser type and version, time zone setting, browser plug-in types and versions, operating system and platform.
                    </Li>
                    <Li>
                        <span class="font-bold">Usage Data:</span> Information about how you use our website, products, and services.
                    </Li>
                </List>
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">How We Collect Data:</span> We use different methods to collect data from and about you including:
                <List list="disc" class="ml-8">
                    <Li>
                        <span class="font-bold">Direct Interactions:</span> You provide identity and contact data by filling in forms or by corresponding with us by post, phone, email, or otherwise.
                    </Li>
                    <Li>
                        <span class="font-bold">Automated Technologies:</span> As you interact with our website, we may automatically collect technical data about your equipment, browsing actions, and patterns. We collect this personal data by using cookies and other similar technologies.
                    </Li>
                    <Li>
                        <span class="font-bold">Third Parties:</span> We may receive personal data about you from various third parties such as analytics providers, advertising networks, and search information providers.
                    </Li>
                </List>
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">How We Use Your Data:</span> We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                <List list="disc" class="ml-8">
                    <Li>
                        <span class="font-bold">Performance of Contract:</span> Where we need to perform the contract we are about to enter into or have entered into with you.
                    </Li>
                    <Li>
                        <span class="font-bold">Legitimate Interest:</span> Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.
                    </Li>
                    <Li>
                        <span class="font-bold">Compliance with Legal Obligations:</span> Where we need to comply with a legal or regulatory obligation.
                    </Li>
                </List>
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Data Sharing:</span> We may share your personal data with the following parties:
                <List list="disc" class="ml-8">
                    <Li>
                        <span class="font-bold">Service Providers:</span> Companies that provide services to help with our business activities (such as analytics, payment processing, and customer support).
                    </Li>
                    <Li>
                        <span class="font-bold">Affiliates:</span> Our subsidiaries, joint ventures, or other companies under common control.
                    </Li>
                    <Li>
                        <span class="font-bold">Legal Authorities:</span> Law enforcement or other governmental authorities as required by law.
                    </Li>
                </List>
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Data Security:</span> We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, accessed in an unauthorized way, altered, or disclosed. Additionally, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Data Retention:</span> We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized use or disclosure, and the purposes for which we process your personal data.
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Your Legal Rights:</span> Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                <List list="disc" class="ml-8">
                    <Li>Request Access: Receive a copy of the personal data we hold about you.</Li>
                    <Li>Request Correction: Request correction of the personal data that we hold about you.</Li>
                    <Li>Request Erasure: Request deletion or removal of your personal data.</Li>
                    <Li>Object to Processing: Object to processing of your personal data.</Li>
                    <Li>Request Restriction: Request restriction of processing your personal data.</Li>
                    <Li>Data Portability: Request the transfer of your personal data to you or to a third party.</Li>
                </List>
                To exercise any of these rights, please contact us at the contact details provided above.
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Changes to This Policy:</span> We may update this policy from time to time by publishing a new version on our website. We will notify you of any significant changes by email or through a notice on our website.
            </Li>
            <Li class="text-slate-950 text-left">
                <span class="font-bold">Contact Us:</span> If you have any questions or concerns about this data protection policy or our data practices, please contact us at:
                <List list="none" class="ml-8">
                    <Li>CineMatch</Li>
                    <Li>Brigadevej 50 st. 111</Li>
                    <Li>2300 København S</Li>
                    <Li>contact@andersteller.dk</Li>
                    <Li>60704184</Li>
                </List>
            </Li>
        </List>
    </div>
{/if}
