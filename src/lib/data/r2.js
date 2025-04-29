import { R2_API_KEY, R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_PUBLIC_URL } from '$env/static/private';

/**
 * Uploads a file to R2 storage using Cloudflare's Direct Upload API
 * @param {File} file - The file to upload
 * @param {string} key - The key (path) where the file will be stored
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export async function uploadToR2(file, key) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${key}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${R2_API_KEY}`,
                    'cf-r2-jurisdiction': 'eu',
                    'Content-Type': file.type
                },
                body: file
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.errors?.[0]?.message || 'Failed to upload file');
        }

        // Return the public URL
        return `${R2_PUBLIC_URL}/${key}`;
    } catch (error) {
        console.error('Error uploading to R2:', error);
        throw new Error('Failed to upload file to storage');
    }
}

/**
 * Deletes a file from R2 storage using Cloudflare's API
 * @param {string} url - The public URL of the file to delete
 * @returns {Promise<void>}
 */
export async function deleteFromR2(url) {
    try {
        // Extract the key from the URL
        const key = url.replace(`${R2_PUBLIC_URL}/`, '');
        
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${R2_ACCOUNT_ID}/r2/buckets/${R2_BUCKET_NAME}/objects/${key}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${R2_API_KEY}`,
                    'cf-r2-jurisdiction': 'eu',
                }
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Error deleting from R2:', error);
            throw new Error(error.errors?.[0]?.message || 'Failed to delete file');
        }
    } catch (error) {
        console.error('Error deleting from R2:', error);
        // Don't throw error for delete operations as they might be retried
    }
} 