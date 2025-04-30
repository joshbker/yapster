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
    import { Pencil, Loader2 } from 'lucide-svelte';
    import { acceptedTypes, processImageFile, createFileFromCompressed } from '$lib/mediaUtil';

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
    let isSaving = false;

    // File upload handling
    let avatarFileInput;
    let bannerFileInput;
    let selectedAvatarFile = null;
    let selectedBannerFile = null;
    let previewAvatarUrl = avatar;
    let previewBannerUrl = banner;
    let isProcessingAvatar = false;
    let isProcessingBanner = false;

    // Image compression options
    const compressionOptions = {
        maxSizeMB: 0.5, // Just under 512KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8
    };

    // Special settings for avatars
    const avatarOptions = {
        ...compressionOptions,
        maxWidthOrHeight: 400 // Smaller dimension for avatars
    };

    async function handleAvatarFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            isProcessingAvatar = true;
            const processedFile = await processImageFile(file, true);
            if (processedFile) {
                selectedAvatarFile = processedFile;
                previewAvatarUrl = URL.createObjectURL(processedFile);
            }
        } catch (error) {
            console.error('Avatar processing error:', error);
            toast.error(error.message || 'Failed to process image');
        } finally {
            isProcessingAvatar = false;
        }
        event.target.value = ''; // Reset input
    }

    async function handleBannerFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            isProcessingBanner = true;
            const processedFile = await processImageFile(file, false);
            if (processedFile) {
                selectedBannerFile = processedFile;
                previewBannerUrl = URL.createObjectURL(processedFile);
            }
        } catch (error) {
            console.error('Banner processing error:', error);
            toast.error(error.message || 'Failed to process image');
        } finally {
            isProcessingBanner = false;
        }
        event.target.value = ''; // Reset input
    }

    function handleAvatarClick() {
        avatarFileInput.click();
    }

    function handleBannerClick() {
        bannerFileInput.click();
    }

    async function uploadImage(file, type) {
        if (!file) return null;

        const formData = new FormData();
        const fileToUpload = createFileFromCompressed(file);
        
        console.log('Uploading file:', {
            fileName: fileToUpload.name,
            fileSize: fileToUpload.size,
            fileType: fileToUpload.type,
            type
        });

        formData.append('image', fileToUpload);

        try {
            const response = await fetch(`/api/image?${type}=true`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Upload failed:', {
                    status: response.status,
                    error: data.error,
                    details: data
                });
                throw new Error(data.error || 'Failed to upload image');
            }

            return data.url;
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error(error.message || 'Failed to upload image');
            return null;
        }
    }

    // Reactive statement to check for changes
    $: hasChanges = 
        selectedAvatarFile !== null ||
        selectedBannerFile !== null ||
        avatar !== originalData.avatar ||
        banner !== originalData.banner ||
        username !== originalData.username ||
        name !== originalData.name ||
        pronouns !== originalData.pronouns ||
        bio !== originalData.bio;

    async function updateProfile() {
        if (isSaving) return;
        try {
            isSaving = true;
            // Upload images first if there are new files
            let newAvatarUrl = null;
            let newBannerUrl = null;
            
            if (selectedAvatarFile) {
                newAvatarUrl = await uploadImage(selectedAvatarFile, 'avatar');
                if (!newAvatarUrl) return; // Stop if avatar upload failed
            }

            if (selectedBannerFile) {
                newBannerUrl = await uploadImage(selectedBannerFile, 'banner');
                if (!newBannerUrl) return; // Stop if banner upload failed
            }

            // Create update object only with changed fields
            const updates = {};
            if (newAvatarUrl || avatar !== originalData.avatar) updates.image = newAvatarUrl || avatar;
            if (newBannerUrl || banner !== originalData.banner) updates.banner = newBannerUrl || banner;
            if (username !== originalData.username) updates.username = username;
            if (name !== originalData.name) updates.name = name;
            if (pronouns !== originalData.pronouns) updates.pronouns = pronouns;
            if (bio !== originalData.bio) updates.bio = bio;

            // Only proceed if there are actual changes
            if (Object.keys(updates).length === 0) {
                toast.info('No changes to update');
                return;
            }

            const response = await fetch('/api/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Clean up any object URLs we created
            if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewAvatarUrl);
            }
            if (previewBannerUrl && previewBannerUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewBannerUrl);
            }

            toast.success('Profile updated successfully');
            // Navigate directly to profile page instead of reloading
            await goto(`/@${username}`, { invalidateAll: true });

        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Failed to update profile');
        } finally {
            isSaving = false;
        }
    }
</script>

<HeaderNavigation 
    name="Edit Profile" 
    submit={updateProfile} 
    disabled={!hasChanges || isSaving} 
    buttonText={isSaving ? "Saving..." : "Save"}
/>

<div class="relative lg:container lg:max-w-5xl lg:px-6 z-10">
    <!-- Hidden file inputs -->
    <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
        class="hidden"
        bind:this={avatarFileInput}
        on:change={handleAvatarFileSelect}
    />
    <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp"
        class="hidden"
        bind:this={bannerFileInput}
        on:change={handleBannerFileSelect}
    />
    
    <!-- Clickable banner -->
    <button
        class="w-full h-32 lg:h-48 lg:rounded-xl overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary relative"
        on:click={handleBannerClick}
        disabled={isProcessingBanner}
    >
        {#if previewBannerUrl}
            <img src={previewBannerUrl} alt="Banner" class="w-full h-full object-cover">
        {:else}
            <div class="w-full h-full bg-gradient-to-br from-purple-500 to-blue-400"></div>
        {/if}
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center -mt-14">
            {#if isProcessingBanner}
                <Loader2 class="w-6 h-6 text-white animate-spin" />
            {:else}
                <Pencil class="w-6 h-6 text-white" />
            {/if}
        </div>
    </button>

    <!-- Clickable avatar -->
    <button
        class="left-1/2 transform -translate-x-1/2 -translate-y-3/4 top-full w-24 h-24 rounded-full border-4 border-background overflow-hidden hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary relative"
        on:click={handleAvatarClick}
        disabled={isProcessingAvatar}
    >
        <img 
            src={previewAvatarUrl ?? PUBLIC_DEFAULT_AVATAR_URL} 
            alt="Avatar" 
            class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
            {#if isProcessingAvatar}
                <Loader2 class="w-6 h-6 text-white animate-spin" />
            {:else}
                <Pencil class="w-6 h-6 text-white" />
            {/if}
        </div>
    </button>
</div>

<div class="container max-w-2xl mx-auto px-4 sm:px-6 -mt-20 space-y-2 z-20">
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
