<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import HeaderNavigation from '$lib/component/HeaderNavigation.svelte';
    import { PUBLIC_DEFAULT_AVATAR_URL } from '$env/static/public';
    import { Input } from "$lib/component/ui/input";
    import { Label } from "$lib/component/ui/label";
    import { Textarea } from "$lib/component/ui/textarea";
    import { client } from '$lib/auth/auth-client';
    import { toast } from 'svelte-sonner';

    // Store original values
    const originalData = {
        avatar: $page.data.user.image,
        banner: $page.data.user.banner,
        username: $page.data.user.username,
        name: $page.data.user.name || '',
        pronouns: $page.data.user.pronouns || '',
        bio: $page.data.user.bio || ''
    };

    // Profile form
    let avatar = originalData.avatar;
    let banner = originalData.banner;
    let username = originalData.username;
    let name = originalData.name;
    let pronouns = originalData.pronouns;
    let bio = originalData.bio;

    // Reactive statement to check for changes
    $: hasChanges = 
        avatar !== originalData.avatar ||
        banner !== originalData.banner ||
        username !== originalData.username ||
        name !== originalData.name ||
        pronouns !== originalData.pronouns ||
        bio !== originalData.bio;

    async function updateProfile() {
        // Create update object only with changed fields
        const updates = {};
        if (avatar !== originalData.avatar) updates.image = avatar;
        if (banner !== originalData.banner) updates.banner = banner;
        if (username !== originalData.username) updates.username = username;
        if (name !== originalData.name) updates.name = name;
        if (pronouns !== originalData.pronouns) updates.pronouns = pronouns;
        if (bio !== originalData.bio) updates.bio = bio;

        // Only proceed if there are actual changes
        if (Object.keys(updates).length === 0) {
            toast.info('No changes to update');
            return;
        }

        await client.updateUser(updates, {
            onRequest: (ctx) => {
                console.log("REQUEST", ctx)
            },
            onSuccess: async (ctx) => {
                console.log("SUCCESS", ctx)
                toast.success('Profile updated successfully');
                // Navigate directly to profile page instead of reloading
                await goto(`/${username}`, { invalidateAll: true });
            },
            onError: (ctx) => {
                console.log("ERROR", ctx)
                toast.error(ctx.error.message || 'Failed to update profile');
            }
        })
    }
</script>

<HeaderNavigation name="Edit Profile" submit={updateProfile} disabled={!hasChanges} />

<div class="relative lg:container lg:max-w-5xl lg:px-6">
    {#if banner}
        <img src={banner} alt="Banner" class="w-full h-32 lg:h-48 object-cover lg:rounded-xl">
    {:else}
        <div class="w-full h-32 lg:h-48 lg:rounded-xl bg-gradient-to-br from-purple-500 to-blue-400"></div>
    {/if}
    <img src={avatar ?? PUBLIC_DEFAULT_AVATAR_URL} alt="Avatar" class="absolute left-1/2 transform -translate-x-1/2 -bottom-8 w-24 h-24 rounded-full object-cover border-4 border-background">
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
