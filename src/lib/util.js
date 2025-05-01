import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cubicOut } from "svelte/easing"
import { error } from "@sveltejs/kit"
import { PUBLIC_BASE_URL } from "$env/static/public"

// Function to calculate how long ago a date was
export function getTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return `${diffInSeconds}s`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours}h`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays}d`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths}M`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears}y`;
}

export function toTitleCase(str) {
	const minorWords = new Set([
		"a", "an", "and", "as", "at", "but", "by", "for", "in",
		"nor", "of", "on", "or", "so", "the", "to", "up", "yet"
	])

	return str
		.toLowerCase()
		.split(" ")
		.map((word, index, arr) => {
			if (index === 0 || index === arr.length - 1) {
				return word.charAt(0).toUpperCase() + word.slice(1)
			}
			if (minorWords.has(word)) {
				return word
			}
			return word.charAt(0).toUpperCase() + word.slice(1)
		})
		.join(" ")
}

// ShadCN util function ???
export function cn(...inputs) {
	return twMerge(clsx(inputs))
}

export const flyAndScale = (
	node,
	params = { y: -8, x: 0, start: 0.95, duration: 150 }
) => {
	const style = getComputedStyle(node)
	const transform = style.transform === "none" ? "" : style.transform

	const scaleConversion = (valueA, scaleA, scaleB) => {
		const [minA, maxA] = scaleA
		const [minB, maxB] = scaleB

		const percentage = (valueA - minA) / (maxA - minA)
		const valueB = percentage * (maxB - minB) + minB

		return valueB
	}

	const styleToString = (style) => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str
			return str + `${key}:${style[key]}`
		}, "")
	}

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0])
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0])
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1])

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			})
		},
		easing: cubicOut
	}
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email) {
    return emailRegex.test(email);
}

export async function getUserById(id) {
    const response = await fetch(`${PUBLIC_BASE_URL}/api/user/id/${id}`)
    const data = await response.json()
    return data
}

export async function getUserByUsername(username) {
    if (username.startsWith('@')) {
        username = username.slice(1)
    }
    const response = await fetch(`${PUBLIC_BASE_URL}/api/user/username/${username}`)
    const data = await response.json()
    return data
}

export async function getPostById(id) {
    const response = await fetch(`${PUBLIC_BASE_URL}/api/post/${id}`)
    const data = await response.json()
    return data
}

// Validation constants
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 16;
export const NAME_MAX_LENGTH = 20;
export const PRONOUNS_MAX_LENGTH = 20;
export const BIO_MAX_LENGTH = 200;
export const IMAGE_URL_PREFIX = 'https://cdn.yapster.gg/';

export const validateUsername = (username) => {
    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
        throw error(400, `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`)
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        throw error(400, "Username can only contain letters and numbers")
    }
    return username.toLowerCase()
}

export const validateName = (name) => {
    if (name === null) return null;
    if (name.length > NAME_MAX_LENGTH) {
        throw error(400, `Name must be ${NAME_MAX_LENGTH} characters or less`)
    }
    if (!/^[\x20-\x7E]+$/.test(name)) {
        throw error(400, "Name can only contain standard ASCII characters and spaces")
    }
    if (/\s/.test(name) && !/^[ \t\n\r\f]*$/.test(name)) {
        const invalidWhitespace = /[^\S ]/g.test(name)
        if (invalidWhitespace) {
            throw error(400, "Name can only contain regular spaces as whitespace")
        }
    }
    return name
}

export const validateImageUrl = (url, field) => {
    if (url === null) return null;
    if (!url.startsWith(IMAGE_URL_PREFIX)) {
        throw error(400, `${field} must be from ${IMAGE_URL_PREFIX}`)
    }
    return url
}

export const validatePronouns = (pronouns) => {
    if (pronouns === null) return null;
    if (pronouns.length > PRONOUNS_MAX_LENGTH) {
        throw error(400, `Pronouns must be ${PRONOUNS_MAX_LENGTH} characters or less`)
    }
    if (!/^[\x20-\x7E]+$/.test(pronouns)) {
        throw error(400, "Pronouns can only contain standard ASCII characters and spaces")
    }
    if (/\s/.test(pronouns) && !/^[ \t\n\r\f]*$/.test(pronouns)) {
        const invalidWhitespace = /[^\S ]/g.test(pronouns)
        if (invalidWhitespace) {
            throw error(400, "Pronouns can only contain regular spaces as whitespace")
        }
    }
    return pronouns
}

export const validateBio = (bio) => {
    if (bio === null) return null;
    if (bio.length > BIO_MAX_LENGTH) {
        throw error(400, `Bio must be ${BIO_MAX_LENGTH} characters or less`)
    }
    return bio
}

/**
 * Parses text content to identify mentions and links
 * @param {string} text - The text to parse
 * @returns {Array<{type: 'text' | 'mention' | 'link', content: string, username?: string, url?: string}>}
 */
export function parseTextContent(text) {
    const parts = [];
    let lastIndex = 0;
    // Combined regex for mentions and links
    const regex = /(@\w+)|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Determine if it's a mention or link
        if (match[1]) { // Mention
            parts.push({
                type: 'mention',
                username: match[1].slice(1), // Remove @ symbol
                content: match[1]
            });
        } else { // Link
            parts.push({
                type: 'link',
                url: match[2],
                content: match[2]
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (lastIndex < text.length) {
        parts.push({
            type: 'text',
            content: text.slice(lastIndex)
        });
    }

    return parts;
}