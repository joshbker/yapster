<script>
    import { Play, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-svelte";
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    export let item;
    export let isVideo;

    // Initialize with default values from localStorage or fallback values
    const getStoredValue = (key, defaultValue) => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? 
                (typeof defaultValue === 'boolean' ? stored === 'true' : parseFloat(stored)) 
                : defaultValue;
        } catch {
            return defaultValue;
        }
    };

    let isPaused = true;
    let isMuted = getStoredValue('videoMuted', true);
    let volume = getStoredValue('videoVolume', 1);
    let isVolumeControlVisible = false;
    let volumeTimeout;
    let isFullscreen = false;
    let videoElement;

    // Save settings whenever they change
    $: {
        try {
            if (typeof isMuted === 'boolean') {
                localStorage.setItem('videoMuted', isMuted.toString());
            }
            if (typeof volume === 'number') {
                localStorage.setItem('videoVolume', volume.toString());
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    // Handle video binding to set initial volume
    $: if (videoElement) {
        videoElement.volume = volume;
        videoElement.muted = isMuted;
    }

    onMount(() => {
        if (!isVideo || !videoElement) return;

        // Set up Intersection Observer for video autoplay
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        videoElement.play().catch(error => {
                            console.error('Error auto-playing video:', error);
                        });
                        isPaused = false;
                    } else {
                        videoElement.pause();
                        isPaused = true;
                    }
                });
            },
            {
                threshold: 0.5 // Trigger when 50% or more is visible
            }
        );

        observer.observe(videoElement);

        const handleFullscreenChange = () => {
            isFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.msFullscreenElement
            );
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            if (volumeTimeout) clearTimeout(volumeTimeout);
            observer.disconnect();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    });

    function showVolumeControl() {
        isVolumeControlVisible = true;
        if (volumeTimeout) clearTimeout(volumeTimeout);
    }

    function hideVolumeControl() {
        volumeTimeout = setTimeout(() => {
            isVolumeControlVisible = false;
        }, 2000);
    }

    function toggleVideo() {
        if (!videoElement) return;
        
        if (videoElement.paused) {
            videoElement.play();
            isPaused = false;
        } else {
            videoElement.pause();
            isPaused = true;
        }
    }

    function toggleFullscreen() {
        try {
            const container = videoElement?.closest('.video-container');
            if (!container) return;

            if (!document.fullscreenElement) {
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
                isFullscreen = true;
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
                isFullscreen = false;
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }

    function onVideoMount(event) {
        if (videoElement) {
            dispatch('videoMount', { videoElement });
        }
    }
</script>

<div 
    class="relative w-full h-full video-container"
    role="button"
    tabindex="0"
    on:click={toggleVideo}
    on:keydown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
            toggleVideo();
        }
    }}
>
    {#if isVideo}
        <div class="relative w-full h-full isolate">
            <video 
                bind:this={videoElement}
                on:loadeddata={onVideoMount}
                src={item} 
                alt="Post media" 
                class="absolute inset-0 w-full h-full rounded-lg object-cover"
                loop
                playsinline
                preload="metadata"
                bind:muted={isMuted}
                bind:paused={isPaused}
                disablePictureInPicture
                controlsList="nodownload"
            >
                <track kind="captions" />
                Your browser does not support the video tag.
            </video>
            {#if isPaused}
                <div 
                    class="absolute inset-0 rounded-lg flex items-center justify-center bg-black/20 z-[10]"
                    transition:fade
                >
                    <Play class="w-16 h-16 text-white" fill="white" />
                </div>
            {/if}
        </div>
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-full h-full relative pointer-events-auto">
                <div
                    class="absolute bottom-2 left-2 bg-black/50 flex items-center gap-2 p-1.5 rounded-xl text-white hover:opacity-100 transition-all overflow-hidden z-[10]"
                    style="width: {isVolumeControlVisible ? '140px' : '32px'}"
                    role="presentation"
                    on:mouseenter={showVolumeControl}
                    on:mouseleave={hideVolumeControl}
                    on:touchstart|preventDefault={showVolumeControl}
                    on:touchend={hideVolumeControl}
                >
                    <button
                        class="shrink-0"
                        on:click|stopPropagation={() => {
                            isMuted = !isMuted;
                            if (!isMuted && volume === 0) {
                                volume = 1;
                            }
                        }}
                    >
                        {#if isMuted || volume === 0}
                            <VolumeX class="w-5 h-5" />
                        {:else}
                            <Volume2 class="w-5 h-5" />
                        {/if}
                    </button>
                    {#if isVolumeControlVisible}
                        <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01"
                            bind:value={volume}
                            on:input={(e) => {
                                if (videoElement) {
                                    videoElement.volume = e.target.value;
                                    isMuted = e.target.value === "0";
                                }
                            }}
                            class="w-24 h-1 accent-white bg-white/20 rounded-full"
                            on:click|stopPropagation
                            on:mousedown|stopPropagation
                        />
                    {/if}
                </div>
                <button
                    class="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-xl text-white hover:opacity-100 transition-opacity z-[10]"
                    on:click|stopPropagation={toggleFullscreen}
                >
                    {#if isFullscreen}
                        <Minimize2 class="w-5 h-5" />
                    {:else}
                        <Maximize2 class="w-5 h-5" />
                    {/if}
                </button>
            </div>
        </div>
    {:else}
        <img 
            src={item} 
            alt="Post media" 
            class="absolute inset-0 w-full h-full rounded-lg object-cover"
            draggable="false"
        >
    {/if}
</div>

<style>
    .video-container:fullscreen {
        background: black;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-container:fullscreen video {
        max-height: 100vh;
        max-width: 100vw;
    }

    .video-container:-webkit-full-screen {
        background: black;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-container:-webkit-full-screen video {
        max-height: 100vh;
        max-width: 100vw;
    }

    .video-container:-ms-fullscreen {
        background: black;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .video-container:-ms-fullscreen video {
        max-height: 100vh;
        max-width: 100vw;
    }

    :global(video::-webkit-media-controls) {
        display: none !important;
    }
</style> 