<script>
    import { Play, Volume2, VolumeX, Maximize2, Minimize2 } from "lucide-svelte";
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
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
    let volumeControlTimeout;
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
        dispatch('videoMount', { videoElement });
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
            if (volumeControlTimeout) clearTimeout(volumeControlTimeout);
            observer.disconnect();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    });

    function showVolumeControl() {
        isVolumeControlVisible = true;
        if (volumeControlTimeout) clearTimeout(volumeControlTimeout);
        volumeControlTimeout = setTimeout(() => {
            isVolumeControlVisible = false;
        }, 3000); // Longer timeout for better mobile usability
    }

    function hideVolumeControl() {
        if (volumeControlTimeout) clearTimeout(volumeControlTimeout);
        volumeControlTimeout = setTimeout(() => {
            isVolumeControlVisible = false;
        }, 3000);
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

            if (!document.fullscreenElement && 
                !document.webkitFullscreenElement && 
                !document.msFullscreenElement) {
                
                // Try all possible methods for requesting fullscreen
                const requestFullscreen = container.requestFullscreen ||
                    container.webkitRequestFullscreen ||
                    container.msRequestFullscreen ||
                    container.mozRequestFullScreen;

                if (requestFullscreen) {
                    requestFullscreen.call(container);
                    isFullscreen = true;
                }
            } else {
                // Try all possible methods for exiting fullscreen
                const exitFullscreen = document.exitFullscreen ||
                    document.webkitExitFullscreen ||
                    document.msExitFullscreen ||
                    document.mozCancelFullScreen;

                if (exitFullscreen) {
                    exitFullscreen.call(document);
                    isFullscreen = false;
                }
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
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
                crossorigin="anonymous"
                on:loadeddata
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
                    class="absolute bottom-2 left-2 bg-black/50 flex items-center gap-2 rounded-xl text-white hover:opacity-100 transition-all overflow-hidden z-[10]"
                    style="width: {isVolumeControlVisible ? '156px' : '40px'}"
                    role="group"
                    aria-label="Volume controls"
                    on:mouseenter={showVolumeControl}
                    on:mouseleave={hideVolumeControl}
                    on:touchstart|preventDefault|stopPropagation={showVolumeControl}
                    on:touchend|preventDefault|stopPropagation={hideVolumeControl}
                >
                    <button
                        class="shrink-0 w-10 h-10 flex items-center justify-center touch-manipulation"
                        on:click|preventDefault|stopPropagation={() => {
                            isMuted = !isMuted;
                            if (!isMuted && volume === 0) {
                                volume = 1;
                            }
                            showVolumeControl();
                        }}
                        on:touchend|preventDefault|stopPropagation={(e) => {
                            isMuted = !isMuted;
                            if (!isMuted && volume === 0) {
                                volume = 1;
                            }
                            showVolumeControl();
                        }}
                    >
                        {#if isMuted || volume === 0}
                            <VolumeX class="w-5 h-5" />
                        {:else}
                            <Volume2 class="w-5 h-5" />
                        {/if}
                    </button>
                    {#if isVolumeControlVisible}
                        <div class="flex items-center pr-2 h-10">
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
                                    showVolumeControl();
                                }}
                                class="w-24 h-1 accent-white bg-white/20 rounded-full touch-manipulation"
                                on:click|stopPropagation
                                on:mousedown|stopPropagation
                                on:touchstart|stopPropagation
                            />
                        </div>
                    {/if}
                </div>
                <button
                    class="absolute bottom-2 right-2 bg-black/50 w-10 h-10 flex items-center justify-center rounded-xl text-white hover:opacity-100 transition-opacity z-[10] touch-manipulation"
                    on:click|preventDefault|stopPropagation={toggleFullscreen}
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