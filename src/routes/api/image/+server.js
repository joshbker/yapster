import { json } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { user as User } from '$lib/data/model/user.js';
import { uploadToR2, deleteFromR2 } from '$lib/data/r2.js';
import { v4 as uuidv4 } from 'uuid';

export async function POST({ request, url, locals }) {
    try {
        // Get query parameters
        const isAvatar = url.searchParams.get('avatar') === 'true';
        const isBanner = url.searchParams.get('banner') === 'true';
        const isPost = url.searchParams.get('post') === 'true';

        // Ensure user is authenticated
        if (!locals.user) {
            throw error(401, { message: "Unauthorized - user not logged in" });
        }

        // Get the image data from the request
        let formData;
        try {
            formData = await request.formData();
        } catch (formDataError) {
            console.error('Error parsing form data:', formDataError);
            throw error(400, { message: 'Invalid form data: ' + formDataError.message });
        }
        
        const imageFile = formData.get('image');

        if (!imageFile) {
            console.error('No image file provided in form data');
            throw error(400, { message: 'No image file provided' });
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
            throw error(400, { 
                message: `Invalid file type (${imageFile.type}). Only JPEG, PNG, GIF, and WebP images are allowed.`,
                details: {
                    providedType: imageFile.type,
                    acceptedTypes
                }
            });
        }

        // Validate file size
        const MAX_FILE_SIZE = 512 * 1024;
        
        if (imageFile.size > MAX_FILE_SIZE) {
            console.error('File too large:', {
                providedSize: imageFile.size,
                maxSize: MAX_FILE_SIZE
            });
            throw error(400, { 
                message: `Image file is too large (${Math.round(imageFile.size / 1024)}KB). Maximum size is 512KB.`,
                details: {
                    providedSizeKB: Math.round(imageFile.size / 1024),
                    maxSizeKB: MAX_FILE_SIZE / 1024
                }
            });
        }

        // Get current user data to check for existing images
        let currentUser;
        try {
            currentUser = await User.findById(locals.user.id).lean();
            if (!currentUser) {
                console.error('User not found when uploading image:', locals.user.id);
                throw error(404, { message: "User not found" });
            }
        } catch (userError) {
            console.error('Error fetching user for image upload:', userError);
            throw error(500, { message: "Error fetching user data: " + userError.message });
        }

        // Delete old image if it exists
        const oldImageUrl = isAvatar ? currentUser.image : isBanner ? currentUser.banner : null;
        if (oldImageUrl) {
            try {
                await deleteFromR2(oldImageUrl);
            } catch (deleteError) {
                console.error('Error deleting old image:', {
                    url: oldImageUrl,
                    error: deleteError.message || deleteError
                });
                // Continue with upload even if delete fails
            }
        }

        let folder = "other";

        if (isAvatar) {
            folder = "avatar";
        } else if (isBanner) {
            folder = "banner";
        } else if (isPost) {
            folder = "post";
        }

        // Create custom filename with user ID and UUID
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const key = `${locals.user.id}/${folder}/${uuidv4()}.${fileExtension}`;

        // Log request details (excluding sensitive data)
        console.log('Uploading to R2:', {
            fileType: imageFile.type,
            fileSize: imageFile.size,
            key,
            isAvatar,
            isBanner,
            isPost
        });

        // Upload to R2
        let imageUrl;
        try {
            imageUrl = await uploadToR2(imageFile, key);
        } catch (uploadError) {
            console.error('R2 upload error:', uploadError);
            throw error(500, { message: "Failed to upload image to storage: " + uploadError.message });
        }

        // Return the image URL
        return json({ url: imageUrl });
    } catch (err) {
        console.error('Error uploading image:', err);
        
        // If it's already a SvelteKit error with status and message, return it
        if (err.status) {
            return json({ 
                error: err.body?.message || err.message || 'Unknown error', 
                details: err.body?.details 
            }, { status: err.status });
        }
        
        // For other errors
        return json({ 
            error: err.message || 'Internal server error' 
        }, { status: 500 });
    }
}
