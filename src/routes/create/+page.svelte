<script>
    import { Button } from '$lib/component/ui/button';
    import { Input } from '$lib/component/ui/input';
    import { Textarea } from '$lib/component/ui/textarea';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
    import { Label } from '$lib/component/ui/label';
    import { toast } from "svelte-sonner";
    import { goto } from '$app/navigation';
    import { MapPin, Image as ImageIcon, Hash } from 'lucide-svelte';
    import { acceptedTypes, MAX_FILE_SIZE, processImageFile } from '$lib/mediaUtil';

    let isLoading = false;
    let error = '';

    // Form data
    let text = '';
    let location = '';
    let tags = '';
    let mediaFiles = [];
    let previewUrls = [];

    const MAX_FILES = 9; // Maximum number of media files

    async function handleFileSelect(event) {
        const files = Array.from(event.target.files || []);
        
        if (mediaFiles.length + files.length > MAX_FILES) {
            toast.error(`You can only upload up to ${MAX_FILES} files`);
            return;
        }

        for (const file of files) {
            try {
                let processedFile = file;
                if (file.type.startsWith('image/')) {
                    processedFile = await processImageFile(file);
                } else if (!acceptedTypes.includes(file.type)) {
                    toast.error('Unsupported file type');
                    continue;
                } else if (file.size > MAX_FILE_SIZE) {
                    toast.error('File too large (max 5MB)');
                    continue;
                }

                mediaFiles = [...mediaFiles, processedFile];
                const url = URL.createObjectURL(processedFile);
                previewUrls = [...previewUrls, url];
            } catch (err) {
                console.error('Error processing file:', err);
                toast.error(err.message || 'Error processing file');
            }
        }
    }

    function removeMedia(index) {
        URL.revokeObjectURL(previewUrls[index]);
        mediaFiles = mediaFiles.filter((_, i) => i !== index);
        previewUrls = previewUrls.filter((_, i) => i !== index);
    }

    async function handleSubmit() {
        if (!text.trim() && mediaFiles.length === 0) {
            toast.error('Please add some content to your post');
            return;
        }

        isLoading = true;
        error = '';

        try {
            // Upload media files first if any
            const uploadedItems = [];
            for (const file of mediaFiles) {
                // TODO: Implement media upload endpoint and add the URLs to uploadedItems array
                // const formData = new FormData();
                // formData.append('file', file);
                // const response = await fetch('/api/upload', { method: 'POST', body: formData });
                // const { url } = await response.json();
                // uploadedItems.push(url);
            }

            // Create the post
            const response = await fetch('/api/me/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: {
                        text: text.trim(),
                        location: location.trim(),
                        tags: tags.trim().split(/[,\s]+/).filter(Boolean),
                        items: uploadedItems
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            const result = await response.json();
            toast.success('Post created successfully');
            goto('/'); // Redirect to home page
        } catch (err) {
            console.error('Error creating post:', err);
            error = err.message || 'Failed to create post';
            toast.error(error);
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Create Post | Yapster</title>
</svelte:head>

<div class="container max-w-2xl mx-auto px-4 py-8">
    <Card class="border-border bg-card">
        <CardHeader>
            <CardTitle class="text-2xl font-semibold">Create a Post</CardTitle>
            <CardDescription>Share your thoughts, images, or videos</CardDescription>
        </CardHeader>
        <CardContent>
            <form class="space-y-6" on:submit|preventDefault={handleSubmit}>
                <!-- Text Content -->
                <div class="space-y-2">
                    <Label for="text">What's on your mind?</Label>
                    <Textarea
                        id="text"
                        bind:value={text}
                        placeholder="Share your thoughts..."
                        class="min-h-[120px]"
                    />
                </div>

                <!-- Media Upload -->
                <div class="space-y-2">
                    <Label for="media">Add Photos or Videos</Label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {#each previewUrls as url, index}
                            <div class="relative aspect-square">
                                {#if url.startsWith('blob:') && url.includes('video')}
                                    <video 
                                        src={url} 
                                        class="w-full h-full object-cover rounded-lg"
                                        controls
                                    />
                                {:else}
                                    <img 
                                        src={url} 
                                        alt="Preview" 
                                        class="w-full h-full object-cover rounded-lg"
                                    />
                                {/if}
                                <button
                                    type="button"
                                    class="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                                    on:click={() => removeMedia(index)}
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                        {#if previewUrls.length < MAX_FILES}
                            <label class="border-2 border-dashed border-muted-foreground rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <ImageIcon class="w-8 h-8 text-muted-foreground" />
                                <span class="text-sm text-muted-foreground mt-2">Add Media</span>
                                <input
                                    type="file"
                                    accept={acceptedTypes.join(',')}
                                    on:change={handleFileSelect}
                                    class="hidden"
                                    multiple
                                />
                            </label>
                        {/if}
                    </div>
                    <p class="text-sm text-muted-foreground">
                        You can upload up to {MAX_FILES} photos or videos (max 5MB each)
                    </p>
                </div>

                <!-- Location -->
                <div class="space-y-2">
                    <Label for="location">Location (optional)</Label>
                    <div class="relative">
                        <MapPin class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="location"
                            bind:value={location}
                            placeholder="Add location"
                            class="pl-10"
                        />
                    </div>
                </div>

                <!-- Tags -->
                <div class="space-y-2">
                    <Label for="tags">Tags (optional)</Label>
                    <div class="relative">
                        <Hash class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="tags"
                            bind:value={tags}
                            placeholder="Add tags (separated by spaces or commas)"
                            class="pl-10"
                        />
                    </div>
                </div>

                {#if error}
                    <p class="text-sm text-destructive">{error}</p>
                {/if}

                <Button type="submit" class="w-full" disabled={isLoading}>
                    {#if isLoading}
                        Creating post...
                    {:else}
                        Create Post
                    {/if}
                </Button>
            </form>
        </CardContent>
    </Card>
</div>