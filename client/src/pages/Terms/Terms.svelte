<script>
    import { writable } from "svelte/store";
    import {
        Sidebar,
        SidebarGroup,
        SidebarItem,
        SidebarWrapper,
    } from "flowbite-svelte";
    import TermsOfUse from "../../components/TermsOfUse.svelte";
    import DataProtectionPolicy from "../../components/DataProtectionPolicy.svelte";

    const currentSection = writable("terms");

    function setActiveSection(section, event) {
        event.preventDefault();
        currentSection.set(section);
    }
</script>

<div class="flex space-x-12">
    <div class="w-1/4">
        <Sidebar>
            <SidebarWrapper class="shadow-sm border-2 border-slate-200">
                <SidebarGroup>
                    <SidebarItem
                        label="Terms of Use"
                        on:click={(event) => setActiveSection("terms", event)}
                    ></SidebarItem>
                    <SidebarItem
                        label="Data Protection Policy"
                        on:click={(event) =>
                            setActiveSection("data-protection", event)}
                    ></SidebarItem>
                </SidebarGroup>
            </SidebarWrapper>
        </Sidebar>
    </div>
    <div class="w-3/4 p-4">
        {#if $currentSection === "terms"}
            <TermsOfUse active={true} />
        {/if}
        {#if $currentSection === "data-protection"}
            <DataProtectionPolicy active={true} />
        {/if}
    </div>
</div>
