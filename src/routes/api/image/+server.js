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

        // Validate file size
        const MAX_FILE_SIZE = 512 * 1024;
        
        if (imageFile.size > MAX_FILE_SIZE) {
            console.error('File too large:', {
                providedSize: imageFile.size,
                maxSize: MAX_FILE_SIZE
            });
            return json({ 
                error: `Image file is too large. Maximum size is 512KB.`,
                maxSizeKB: MAX_FILE_SIZE / 1024
            }, { status: 400 });
        }

        // Get current user data to check for existing images
        const currentUser = await User.findById(locals.user.id).lean();
        if (!currentUser) {
            throw error(404, "User not found");
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
            isBanner
        });

        // Upload to R2
        const imageUrl = await uploadToR2(imageFile, key);

        // Return the image URL
        return json({ url: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
