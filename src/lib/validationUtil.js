import { error } from "@sveltejs/kit"

// Validation constants
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const NAME_MAX_LENGTH = 20;
export const PRONOUNS_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 200;
export const POST_TEXT_MAX_LENGTH = 1000;
export const MAX_POST_IMAGES = 9;
export const IMAGE_URL_PREFIX = 'https://cdn.yapster.gg/';

// Email validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export function isValidEmail(email) {
    return emailRegex.test(email);
}

// Text content validation
export function validateTextContent(text) {
    if (!text) return "";

    // Check for RTL characters
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0590-\u05FF]/;
    
    if (rtlRegex.test(text)) {
        throw error(400, { message: "Text contains unsupported RTL characters" });
    }
    
    // Replace problematic whitespace characters with standard spaces instead of rejecting
    const originalText = text;
    
    // Non-standard whitespace includes tabs, non-breaking spaces, zero-width spaces, etc.
    // But we'll preserve legitimate newlines and carriage returns
    const nonStandardWhitespace = /[\t\v\u00A0\u2000-\u200A\u202F\u205F\u3000\uFEFF]/g;
    const sanitizedText = text.replace(nonStandardWhitespace, ' ');
    
    // Log if we had to sanitize whitespace
    if (sanitizedText !== originalText) {
        console.log('Text whitespace sanitized:', { 
            originalLength: originalText.length,
            sanitizedLength: sanitizedText.length,
            diff: originalText.length - sanitizedText.length 
        });
    }
    
    if (sanitizedText.length > POST_TEXT_MAX_LENGTH) {
        throw error(400, { message: `Text exceeds maximum length of ${POST_TEXT_MAX_LENGTH} characters` });
    }
    
    return sanitizedText;
}

// Username validation
export function validateUsername(username) {
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        throw error(400, { message: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters` });
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        throw error(400, { message: "Username can only contain letters and numbers" });
    }
    return username.toLowerCase();
}

// Name validation
export function validateName(name) {
    if (name === null) return null;
    if (name.length > NAME_MAX_LENGTH) {
        throw error(400, { message: `Name must be ${NAME_MAX_LENGTH} characters or less` });
    }
    if (!/^[\x20-\x7E]+$/.test(name)) {
        throw error(400, { message: "Name can only contain standard ASCII characters and spaces" });
    }
    if (/\s/.test(name) && !/^[ \t\n\r\f]*$/.test(name)) {
        const invalidWhitespace = /[^\S ]/g.test(name);
        if (invalidWhitespace) {
            throw error(400, { message: "Name can only contain regular spaces as whitespace" });
        }
    }
    return name;
}

// Image URL validation
export function validateImageUrl(url, field) {
    if (url === null) return null;
    if (!url.startsWith(IMAGE_URL_PREFIX)) {
        throw error(400, { message: `${field} must be from ${IMAGE_URL_PREFIX}` });
    }
    return url;
}

// Pronouns validation
export function validatePronouns(pronouns) {
    if (pronouns === null) return null;
    if (pronouns.length > PRONOUNS_MAX_LENGTH) {
        throw error(400, { message: `Pronouns must be ${PRONOUNS_MAX_LENGTH} characters or less` });
    }
    if (!/^[\x20-\x7E]+$/.test(pronouns)) {
        throw error(400, { message: "Pronouns can only contain standard ASCII characters and spaces" });
    }
    if (/\s/.test(pronouns) && !/^[ \t\n\r\f]*$/.test(pronouns)) {
        const invalidWhitespace = /[^\S ]/g.test(pronouns);
        if (invalidWhitespace) {
            throw error(400, { message: "Pronouns can only contain regular spaces as whitespace" });
        }
    }
    return pronouns;
}

// Bio validation
export function validateBio(bio) {
    if (bio === null) return null;
    if (bio.length > BIO_MAX_LENGTH) {
        throw error(400, { message: `Bio must be ${BIO_MAX_LENGTH} characters or less` });
    }
    return bio;
}

// Tag validation
export function validateTag(tag) {
    if (!tag) return null;
    
    // Remove any leading # if present
    tag = tag.startsWith('#') ? tag.slice(1) : tag;
    
    // Only allow alphanumeric characters and underscores
    if (!/^[\p{L}\p{N}_]+$/u.test(tag)) {
        throw error(400, { message: "Tags can only contain letters, numbers, and underscores" });
    }
    
    return tag.toLowerCase();
}

// Post validation
export function validatePost(content) {
    const { text = "", items = [], location = "", tags = [] } = content;

    // Validate that there's either text or images
    if (!text.trim() && items.length === 0) {
        throw error(400, { message: "Post must contain either text or images" });
    }

    // Validate images count
    if (items.length > MAX_POST_IMAGES) {
        throw error(400, { message: `Cannot upload more than ${MAX_POST_IMAGES} images` });
    }

    // Validate text if present
    const validatedText = text.trim() ? validateTextContent(text.trim()) : "";

    // Validate tags
    const validatedTags = tags
        .filter(tag => tag && typeof tag === 'string')
        .map(tag => validateTag(tag.trim()))
        .filter(Boolean);

    return {
        text: validatedText,
        items,
        location: location.trim(),
        tags: validatedTags
    };
} 