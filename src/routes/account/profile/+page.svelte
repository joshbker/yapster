<script>
    import { page } from '$app/stores';
    import HeaderNavigation from '$lib/component/HeaderNavigation.svelte';
    import * as Card from "$lib/component/ui/card";
    import * as Form from "$lib/component/ui/form";
    import { Input } from "$lib/component/ui/input";
    import { Label } from "$lib/component/ui/label";
    import { Textarea } from "$lib/component/ui/textarea";

    // Profile form
    let avatar = $page.data.user.image;
    let banner = $page.data.user.banner;
    let username = $page.data.user.username;
    let name = $page.data.user.name || '';
    let pronouns = $page.data.user.pronouns || '';
    let bio = $page.data.user.bio || '';

    async function updateProfile() {
        console.log("update profile")
    }
</script>

<HeaderNavigation name="Edit Profile" submit={updateProfile} />
<div class="relative">
    <img src={banner} alt="Banner" class="w-full h-32 object-cover">
    <img 
        src={avatar} 
        alt="Avatar" 
        class="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-24 h-24 rounded-full object-cover border-4 border-background"
    >
</div>

<div class="container max-w-2xl mx-auto px-4 sm:px-6 mt-6 space-y-2">
    <div class="space-y-1">
        <Label for="name">Name</Label>
        <Input 
            type="text" 
            id="name" 
            bind:value={name}
            placeholder="Your name"
        />
    </div>

    <div class="space-y-1">
        <Label for="username">Username</Label>
        <div class="flex">
            <span class="flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                @
            </span>
            <Input 
                type="text" 
                id="username" 
                bind:value={username}
                class="rounded-l-none"
                placeholder="username"
            />
        </div>
    </div>

    <div class="space-y-1">
        <Label for="pronouns">Pronouns</Label>
        <Input 
            type="text" 
            id="pronouns" 
            bind:value={pronouns}
            placeholder="Your pronouns"
        />
    </div>

    <div class="space-y-1">
        <Label for="bio">Bio</Label>
        <Textarea 
            id="bio" 
            bind:value={bio}
            rows="4" 
            placeholder="Tell us about yourself..."
        />
    </div>
</div>
