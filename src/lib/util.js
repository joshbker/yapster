import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cubicOut } from "svelte/easing"
import { error } from "@sveltejs/kit"
import { PUBLIC_BASE_URL } from "$env/static/public"

export function handleError(err) {
	if (err.code == 117 || err.code == 11000) error(409, "Another user already has a link with that shortcut, try another one.")
	if (err.errorResponse?.errmsg) error(500, "Database Error: " + err.errorResponse.errmsg)
	if (err.status) {
		if (err.body) error(err.status, err.body)
		error(err.status, "An unhandled error occured: " + err)
	}
	error(500, "An unhandled error occured: " + err)
}

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