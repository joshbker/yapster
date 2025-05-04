import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cubicOut } from "svelte/easing"
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
    if (!id) {
        return null;
    }

    try {
        const response = await fetch(`${PUBLIC_BASE_URL}/api/user/id/${id}`)
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
        }
        const data = await response.json()
        return data
    } catch (err) {
        console.error('Failed to fetch user:', err);
        return null;
    }
}

export async function getUserByUsername(username) {
    if (!username) {
        return null;
    }

    if (username.startsWith('@')) {
        username = username.slice(1)
    }

    const response = await fetch(`${PUBLIC_BASE_URL}/api/user/username/${username}`)

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
    }

    const data = await response.json()
    return data
}

export async function getPostById(id) {
    if (!id) {
        return null;
    }

    try {
        const response = await fetch(`${PUBLIC_BASE_URL}/api/post/${id}`)
        
        if (!response.ok) {
            if (response.status === 404) {
                return {
                    id,
                    isDeleted: true,
                    timestamp: new Date(),
                    likes: [],
                    saves: [],
                    comments: [],
                    content: { items: [], text: "", location: "", tags: [] }
                };
            }
        }

        const data = await response.json()
        return { ...data, isDeleted: false }
    } catch (err) {
        if (err.status === 404) {
            return {
                id,
                isDeleted: true,
                timestamp: new Date(),
                likes: [],
                saves: [],
                comments: [],
                content: { items: [], text: "", location: "", tags: [] }
            };
        }
        console.error('Failed to fetch post:', err);
    }
}

/**
 * Parses text content to identify mentions, links, and hashtags
 * @param {string} text - The text to parse
 * @returns {Array<{type: 'text' | 'mention' | 'link' | 'hashtag', content: string, username?: string, url?: string, tag?: string}>}
 */
export function parseTextContent(text) {
    const parts = [];
    let lastIndex = 0;
    // Combined regex for mentions, links, and hashtags
    const regex = /(@\w+)|(https?:\/\/[^\s<]+[^<.,:;"')\]\s])|(#[\p{L}\p{N}_]+)/gu;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: text.slice(lastIndex, match.index)
            });
        }

        // Determine if it's a mention, link, or hashtag
        if (match[1]) { // Mention
            parts.push({
                type: 'mention',
                username: match[1].slice(1), // Remove @ symbol
                content: match[1]
            });
        } else if (match[2]) { // Link
            parts.push({
                type: 'link',
                url: match[2],
                content: match[2]
            });
        } else { // Hashtag
            parts.push({
                type: 'hashtag',
                tag: match[3].slice(1), // Remove # symbol
                content: match[3]
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