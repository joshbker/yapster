<script>
    import { Button } from '$lib/component/ui/button';
    import { Input } from '$lib/component/ui/input';
    import { Textarea } from '$lib/component/ui/textarea';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
    import { Label } from '$lib/component/ui/label';
    import { toast } from "svelte-sonner";
    import { goto } from '$app/navigation';
    import { MapPin, Hash, X } from 'lucide-svelte';
    import { Image as ImageIcon } from 'lucide-svelte';
    import { acceptedTypes, processImageFile } from '$lib/mediaUtil';
    import { POST_TEXT_MAX_LENGTH, MAX_POST_IMAGES, validateTextContent, validateTag } from '$lib/validationUtil';

    let isLoading = false;
    let error = '';
    let isDragging = false;
    let dragCounter = 0; // Track nested drag events

    // Form data
    let text = '';
    let location = '';
    let currentTag = '';
    let tags = [];
    let mediaFiles = [];
    let previewUrls = [];

    // Handle tag input
    function handleTagInput(event) {
        // Handle space or enter key
        if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault();
            addTag();
        }
    }

    function addTag() {
        const tagToAdd = currentTag.trim();
        if (tagToAdd) {
            try {
                const validatedTag = validateTag(tagToAdd);
                if (validatedTag && !tags.includes(validatedTag)) {
                    tags = [...tags, validatedTag];
                }
            } catch (err) {
                toast.error(err.message);
            }
        }
        currentTag = '';
    }

    function removeTag(index) {
        tags = tags.filter((_, i) => i !== index);
    }

    async function handleFileSelect(event) {
        const files = Array.from(event.target.files || []);
        await processFiles(files);
    }

    async function processFiles(files) {
        if (mediaFiles.length + files.length > MAX_POST_IMAGES) {
            toast.error(`You can only upload up to ${MAX_POST_IMAGES} images`);
            return;
        }

        for (const file of files) {
            try {
                // Only accept image files
                if (!file.type.startsWith('image/')) {
                    toast.error('Only images are supported at this time');
                    continue;
                }
                
                if (!acceptedTypes.includes(file.type)) {
                    toast.error('Unsupported file type');
                    continue;
                }

                const processedFile = await processImageFile(file);
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

    // Handle drag and drop
    function handleDragEnter(event) {
        event.preventDefault();
        event.stopPropagation();
        dragCounter++;
        isDragging = true;
    }

    function handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) {
            isDragging = false;
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    async function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        isDragging = false;
        dragCounter = 0;

        const files = Array.from(event.dataTransfer.files);
        await processFiles(files);
    }

    // Handle clipboard paste
    async function handlePaste(event) {
        const items = Array.from(event.clipboardData.items);
        const imageFiles = items
            .filter(item => item.type.startsWith('image/'))
            .map(item => item.getAsFile());

        if (imageFiles.length > 0) {
            await processFiles(imageFiles);
        }
    }

    async function handleSubmit() {
        // Validate that there's either text or images
        if (!text.trim() && mediaFiles.length === 0) {
            toast.error('Please add some text or images to your post');
            return;
        }

        isLoading = true;
        error = '';

        try {
            // Validate text content if present
            let validatedText = '';
            if (text.trim()) {
                // Debug whitespace characters
                if (/[\t\v\u00A0\u2000-\u200A\u202F\u205F\u3000\uFEFF]/.test(text.trim())) {
                    console.log('Text contains non-standard whitespace characters:', 
                        Array.from(text.trim()).map(char => ({
                            char,
                            code: char.charCodeAt(0).toString(16).padStart(4, '0')
                        }))
                    );
                }
                
                try {
                    validatedText = validateTextContent(text.trim());
                    // Check if whitespace was sanitized
                    if (validatedText !== text.trim()) {
                        // Update the text field with the sanitized version
                        text = validatedText;
                    }
                } catch (err) {
                    console.error('Text validation error:', err);
                    toast.error(err.body?.message || err.message || 'Invalid text content');
                    isLoading = false;
                    return;
                }
            }

            // Upload images first if there are any
            const uploadedUrls = [];
            
            for (let i = 0; i < mediaFiles.length; i++) {
                const file = mediaFiles[i];
                try {
                    const formData = new FormData();
                    formData.append('image', file);
                    
                    const response = await fetch('/api/image?post=true', {
                        method: 'POST',
                        body: formData
                    });
                    
                    if (!response.ok) {
                        const data = await response.json();
                        throw new Error(data.error || `Failed to upload image ${i+1}/${mediaFiles.length}`);
                    }
                    
                    const result = await response.json();
                    uploadedUrls.push(result.url);
                } catch (err) {
                    console.error(`Image upload error (${i+1}/${mediaFiles.length}):`, err);
                    throw new Error(`Failed to upload image ${i+1}/${mediaFiles.length}: ${err.message || 'Unknown error'}`);
                }
            }

            // Create the post with uploaded images
            const postData = {
                content: {
                    text: validatedText,
                    location: location.trim(),
                    tags,
                    items: uploadedUrls
                }
            };

            console.log('Sending post data:', JSON.stringify(postData));
            
            const response = await fetch('/api/me/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.message || responseData.error || 'Failed to create post');
            }

            // Clean up preview URLs
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            
            toast.success('Post created successfully');
            goto('/'); // Redirect to home page
        } catch (err) {
            console.error('Error creating post:', err);
            error = err.message || 'Failed to create post. Please try again later.';
            toast.error(error);
        } finally {
            isLoading = false;
        }
    }
</script>

<svelte:head>
    <title>Create Post | Yapster</title>
</svelte:head>

{#if isDragging}
    <div class="fixed inset-0 bg-primary/10 pointer-events-none z-50 flex items-center justify-center">
        <div class="bg-card border-2 border-dashed border-primary rounded-lg p-8 text-center">
            <ImageIcon class="w-12 h-12 text-primary mx-auto mb-4" />
            <p class="text-lg font-medium">Drop your images here</p>
            <p class="text-sm text-muted-foreground mt-2">Images will be added to your post</p>
        </div>
    </div>
{/if}

<div class="container max-w-2xl mx-auto px-4 py-8">
    <Card class="border-border bg-card">
        <CardHeader>
            <CardTitle class="text-2xl font-semibold">Create a Post</CardTitle>
            <CardDescription>Share your thoughts</CardDescription>
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
                        maxlength={POST_TEXT_MAX_LENGTH}
                    />
                    <p class="text-sm text-muted-foreground text-right">
                        {text.length}/{POST_TEXT_MAX_LENGTH}
                    </p>
                </div>

                <!-- Media Upload -->
                <div class="space-y-2">
                    <Label for="media">Add Photos</Label>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {#each previewUrls as url, index}
                            <div class="relative aspect-square">
                                <img 
                                    src={url} 
                                    alt="Preview" 
                                    class="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                    type="button"
                                    class="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center"
                                    on:click={() => removeMedia(index)}
                                >
                                    ×
                                </button>
                            </div>
                        {/each}
                        {#if previewUrls.length < MAX_POST_IMAGES}
                            <label class="border-2 border-dashed border-muted-foreground rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                                <ImageIcon class="w-8 h-8 text-muted-foreground" />
                                <span class="text-sm text-muted-foreground mt-2">Add Photos</span>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    on:change={handleFileSelect}
                                    class="hidden"
                                    multiple
                                />
                            </label>
                        {/if}
                    </div>
                    <p class="text-sm text-muted-foreground">
                        You can upload up to {MAX_POST_IMAGES} photos (max 512KB each)
                    </p>
                    <p class="text-sm text-muted-foreground">
                        Tip: You can paste images or drag & drop them anywhere on the page
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
                    {#if tags.length}
                        <div class="flex flex-wrap gap-1.5">
                            {#each tags as tag, index}
                                <Button 
                                    variant="secondary" 
                                    size="xs" 
                                    class="text-foreground bg-foreground/10 px-2 py-1 flex items-center gap-1"
                                    on:click={() => removeTag(index)}
                                >
                                    <p class="text-xs">{tag}</p>
                                    <X class="h-3 w-3" />
                                </Button>
                            {/each}
                        </div>
                    {/if}
                    <div class="relative">
                        <Hash class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="tags"
                            bind:value={currentTag}
                            placeholder="Add tags (press space or enter)"
                            class="pl-10"
                            on:keydown={handleTagInput}
                            on:blur={addTag}
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

<svelte:window 
    on:paste={handlePaste}
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDrop}
/>