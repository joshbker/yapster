import imageCompression from 'browser-image-compression';

export const acceptedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm'
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB hard limit

// Image compression options
export const compressionOptions = {
    maxSizeMB: 4.9, // Just under 5MB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8
};

// Special settings for avatars
export const avatarOptions = {
    ...compressionOptions,
    maxWidthOrHeight: 400 // Smaller dimension for avatars
};

export function validateImageFile(file, acceptedFileTypes = acceptedTypes) {
    if (!file) return { valid: false, error: 'No file selected' };
    
    if (!acceptedFileTypes.includes(file.type)) {
        return {
            valid: false,
            error: `Invalid file type. Please upload a supported format. Provided type: ${file.type}`
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            needsCompression: true,
            error: `File too large. Maximum size is 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`
        };
    }

    return { valid: true };
}

export async function compressImage(file, isAvatar = false) {
    try {
        const options = isAvatar ? avatarOptions : compressionOptions;
        
        console.log('Starting compression:', {
            originalSize: file.size,
            maxAllowedSize: MAX_FILE_SIZE,
            isAvatar
        });

        // Compress with the configured options
        const compressedFile = await imageCompression(file, options);
        
        console.log('Compression result:', {
            originalSize: file.size,
            compressedSize: compressedFile.size,
            maxAllowedSize: MAX_FILE_SIZE,
            compressionRatio: (compressedFile.size / file.size * 100).toFixed(1) + '%'
        });
        
        // Validate the compressed file
        const validation = validateImageFile(compressedFile);
        if (!validation.valid) {
            throw new Error(`Could not compress image to required size. Final size: ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`);
        }

        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}

export async function processImageFile(file, isAvatar = false) {
    try {
        // First try basic validation
        const initialValidation = validateImageFile(file);
        
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
        console.error('Process image error:', error);
        throw error;
    }
}

export function createFileFromCompressed(file) {
    // Ensure we're creating a proper File object with the compressed data
    const timestamp = new Date().getTime();
    const fileExtension = file.name.split('.').pop().toLowerCase() || 'jpg';
    const newFileName = `${timestamp}.${fileExtension}`;
    
    // Create a new File object from the compressed file
    return new File([file], newFileName, {
        type: file.type,
        lastModified: Date.now()
    });
} 