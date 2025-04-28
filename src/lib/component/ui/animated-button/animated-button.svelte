<script>
    import { Loader2 } from "lucide-svelte"
    import { onMount } from "svelte"

    export let loading = false

    let isHovered = false
    let sparkles = []

    const createSparkle = () => ({
        id: Math.random(),
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 10 + 10,
        rotation: Math.random() * 360,
        color: ["#FFD700", "#FFA500", "#FF4500"][Math.floor(Math.random() * 3)]
    })

    const addSparkles = () => {
        const newSparkles = Array(3).fill(null).map(createSparkle)
        sparkles = [...sparkles, ...newSparkles]
        setTimeout(() => {
            sparkles = sparkles.filter(s => s.id !== newSparkles[0].id)
        }, 1000)
    }

    let sparkleInterval
    $: if (isHovered) {
        addSparkles()
        sparkleInterval = setInterval(addSparkles, 200)
    } else {
        clearInterval(sparkleInterval)
        sparkles = []
    }
</script>

<style>
    @keyframes sparkle-fall {
        0% {
            transform: translateY(0) rotate(var(--rotation))
            opacity: 1
        }
        100% {
            transform: translateY(100px) rotate(calc(var(--rotation) + 180deg))
            opacity: 0
        }
    }

    @keyframes button-pulse {
        0% { transform: scale(1) }
        50% { transform: scale(1.02) }
        100% { transform: scale(1) }
    }

    @keyframes glow {
        0% { box-shadow: 0 0 2px rgba(0, 108, 254, 0.3) }
        50% { box-shadow: 0 0 10px rgba(0, 108, 254, 0.5) }
        100% { box-shadow: 0 0 2px rgba(0, 108, 254, 0.3) }
    }

    .sparkle {
        position: absolute
        pointer-events: none
        animation: sparkle-fall 1s linear forwards
    }

    .button {
        transition: all 0.3s ease
    }

    .button:hover {
        animation: button-pulse 2s infinite, glow 1.5s infinite
    }

    .ripple {
        position: absolute
        border-radius: 50%
        transform: scale(0)
        animation: ripple 0.6s linear
        background-color: rgba(255, 255, 255, 0.7)
    }

    @keyframes ripple {
        to {
            transform: scale(4)
            opacity: 0
        }
    }
</style>

<button
        class="button relative overflow-hidden w-full mt-3 bg-[#006cfe] hover:bg-amber-500 text-white font-medium px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        on:click
        disabled={loading}
        on:mouseenter={() => isHovered = true}
        on:mouseleave={() => isHovered = false}
>
    <div class="flex justify-center gap-2">
        {#if loading}
            <Loader2 class="h-4 w-4 animate-spin" />
        {/if}

        <span class="relative z-10">
            <slot></slot>
        </span>
    </div>

    {#if isHovered}
        {#each sparkles as sparkle (sparkle.id)}
            <div
                    class="sparkle"
                    style="
                    left: {sparkle.left}%
                    top: {sparkle.top}%
                    --rotation: {sparkle.rotation}deg
                "
            >
                <svg
                        viewBox="0 0 24 24"
                        width={sparkle.size}
                        height={sparkle.size}
                >
                    <path
                            fill={sparkle.color}
                            d="M12 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z"
                    />
                </svg>
            </div>
        {/each}
    {/if}
</button>
