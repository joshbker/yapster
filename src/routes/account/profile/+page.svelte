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
    import imageCompression from 'browser-image-compression';

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

    const acceptedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for banners
    const AVATAR_MAX_SIZE = 1 * 1024 * 1024; // 1MB for avatars

    // Image compression options
    const avatarCompressionOptions = {
        maxSizeMB: 0.95, // Slightly under 1MB
        maxWidthOrHeight: 400,
        useWebWorker: true,
        initialQuality: 0.8
    };

    const bannerCompressionOptions = {
        maxSizeMB: 4.9, // Slightly under 5MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: 0.8
    };

    function validateImageFile(file, isAvatar = false) {
        if (!file) return { valid: false, error: 'No file selected' };
        
        if (!acceptedTypes.includes(file.type)) {
            return {
                valid: false,
                error: `Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image. Provided type: ${file.type}`
            };
        }

        const maxSize = isAvatar ? AVATAR_MAX_SIZE : MAX_FILE_SIZE;
        if (file.size > maxSize) {
            return {
                valid: false,
                needsCompression: true,
                error: `File too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
            };
        }

        return { valid: true };
    }

    async function compressImage(file, isAvatar = false) {
        try {
            const options = isAvatar ? avatarCompressionOptions : bannerCompressionOptions;
            
            console.log('Starting compression:', {
                originalSize: file.size,
                maxAllowedSize: isAvatar ? AVATAR_MAX_SIZE : MAX_FILE_SIZE,
                isAvatar,
                targetSizeMB: options.maxSizeMB
            });

            // Compress with the configured options
            const compressedFile = await imageCompression(file, options);
            
            console.log('Compression result:', {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                maxAllowedSize: isAvatar ? AVATAR_MAX_SIZE : MAX_FILE_SIZE,
                compressionRatio: (compressedFile.size / file.size * 100).toFixed(1) + '%'
            });
            
            // Validate the compressed file
            const validation = validateImageFile(compressedFile, isAvatar);
            if (!validation.valid) {
                throw new Error(`Could not compress image to required size. Final size: ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`);
            }

            return compressedFile;
        } catch (error) {
            console.error('Error compressing image:', error);
            throw error;
        }
    }

    async function processImageFile(file, isAvatar = false) {
        try {
            // First try basic validation
            const initialValidation = validateImageFile(file, isAvatar);
            
            // If file is valid and doesn't need compression, return as is
            if (initialValidation.valid) {
                return file;
            }
            
            // If file needs compression or is too large, try to compress it
            if (initialValidation.needsCompression || !initialValidation.valid) {
                const compressedFile = await compressImage(file, isAvatar);
                return compressedFile;
            }
            
            throw new Error(initialValidation.error);
        } catch (error) {
            toast.error(error.message || 'Failed to process image');
            return null;
        }
    }

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
        
        // Ensure we're creating a proper File object with the compressed data
        const timestamp = new Date().getTime();
        const fileExtension = file.name.split('.').pop().toLowerCase() || 'jpg';
        const newFileName = `${timestamp}.${fileExtension}`;
        
        // Create a new File object from the compressed file
        const fileToUpload = new File([file], newFileName, {
            type: file.type,
            lastModified: Date.now()
        });
        
        console.log('Uploading file:', {
            fileName: newFileName,
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

            await client.updateUser(updates, {
                onSuccess: async (ctx) => {
                    toast.success('Profile updated successfully');
                    // Clean up any object URLs we created
                    if (previewAvatarUrl && previewAvatarUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewAvatarUrl);
                    }
                    if (previewBannerUrl && previewBannerUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewBannerUrl);
                    }
                    // Navigate directly to profile page instead of reloading
                    await goto(`/${username}`, { invalidateAll: true });
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || 'Failed to update profile');
                }
            });
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Failed to update profile');
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

<div class="relative lg:container lg:max-w-5xl lg:px-6">
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

<div class="container max-w-2xl mx-auto px-4 sm:px-6 -mt-20 space-y-2">
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
