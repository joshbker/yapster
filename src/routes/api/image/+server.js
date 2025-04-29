import { json } from '@sveltejs/kit';
import { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_IMAGE_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { user as User } from '$lib/data/model/user.js';

export async function POST({ request, url, locals }) {
    try {
        // Get query parameters
        const isAvatar = url.searchParams.get('avatar') === 'true';
        const isBanner = url.searchParams.get('banner') === 'true';

        // Ensure user is authenticated
        if (!locals.user) {
            throw error(401, "Unauthorized");
        }

        // Get the image data from the request
        const formData = await request.formData();
        const imageFile = formData.get('image');

        if (!imageFile) {
            return json({ error: 'No image file provided' }, { status: 400 });
        }

        // Validate image format
        const acceptedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (!acceptedTypes.includes(imageFile.type)) {
            console.error('Invalid file type:', {
                providedType: imageFile.type,
                acceptedTypes
            });
            return json({ 
                error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.',
                acceptedTypes
            }, { status: 400 });
        }

        // Validate environment variables
        if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_IMAGE_API_KEY) {
            console.error('Missing Cloudflare credentials');
            return json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Get current user data to check for existing images
        const currentUser = await User.findById(locals.user.id).lean();
        if (!currentUser) {
            throw error(404, "User not found");
        }

        // Function to extract image ID from Cloudflare URL
        const extractImageId = (url) => {
            if (!url) return null;
            // Match UUID format from Cloudflare URL (between last two forward slashes)
            const matches = url.match(/\/([a-f0-9-]{36})\/[^\/]+$/i);
            return matches ? matches[1] : null;
        };

        // Delete old image if it exists
        const oldImageId = isAvatar ? extractImageId(currentUser.image) : 
                          isBanner ? extractImageId(currentUser.banner) : null;
        
        console.log('Checking for existing image:', {
            type: isAvatar ? 'avatar' : isBanner ? 'banner' : 'unknown',
            currentImageUrl: isAvatar ? currentUser.image : currentUser.banner,
            extractedImageId: oldImageId,
            urlPattern: '/[UUID]/public'
        });
        
        if (oldImageId) {
            try {
                console.log('Attempting to delete old image:', {
                    imageId: oldImageId,
                    accountId: CLOUDFLARE_ACCOUNT_ID
                });

                const deleteResponse = await fetch(
                    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1/${oldImageId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${CLOUDFLARE_IMAGE_API_KEY}`,
                        }
                    }
                );

                const deleteResult = await deleteResponse.json();
                console.log('Delete response:', {
                    status: deleteResponse.status,
                    ok: deleteResponse.ok,
                    success: deleteResult.success,
                    errors: deleteResult.errors
                });

            } catch (deleteError) {
                console.error('Error deleting old image:', {
                    imageId: oldImageId,
                    error: deleteError.message || deleteError
                });
                // Continue with upload even if delete fails
            }
        }

        // Create form data for Cloudflare
        const cloudflareFormData = new FormData();
        
        // Create custom filename with user ID and timestamp
        const timestamp = new Date().getTime();
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const customFilename = `${locals.user.id}_${timestamp}.${fileExtension}`;
        
        // Create new file with custom filename
        const newFile = new File([imageFile], customFilename, {
            type: imageFile.type,
            lastModified: imageFile.lastModified
        });
        
        cloudflareFormData.append('file', newFile);

        // Log request details (excluding sensitive data)
        console.log('Uploading to Cloudflare:', {
            accountId: CLOUDFLARE_ACCOUNT_ID,
            fileType: imageFile.type,
            fileSize: imageFile.size,
            customFilename,
            isAvatar,
            isBanner
        });

        // Upload to Cloudflare Images
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CLOUDFLARE_IMAGE_API_KEY}`,
                },
                body: cloudflareFormData
            }
        );

        const result = await response.json();

        // Log response for debugging (excluding sensitive data)
        console.log('Cloudflare response:', {
            status: response.status,
            ok: response.ok,
            resultSuccess: result.success,
            errors: result.errors
        });

        if (!response.ok) {
            return json({ 
                error: result.errors?.[0]?.message || 'Failed to upload image to Cloudflare',
                details: result.errors || result 
            }, { status: response.status });
        }

        if (!result.result?.variants?.[0]) {
            console.error('Unexpected Cloudflare response format:', result);
            return json({ error: 'Invalid response from Cloudflare' }, { status: 500 });
        }

        // Return the image URL from the successful response
        return json({ 
            url: result.result.variants[0]
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
