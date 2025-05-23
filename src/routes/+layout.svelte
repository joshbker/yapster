<script>
    import "../app.css"
    import { Toaster } from "$lib/component/ui/sonner"
    import { ModeWatcher, toggleMode } from "mode-watcher"
    import { onMount } from "svelte"
    import { browser } from "$app/environment"
    import { Button } from '$lib/component/ui/button';
    import { client } from '$lib/auth/auth-client';
    import { page } from "$app/stores"
    import { feedTab } from '$lib/data/feedStore'
    import { 
        Home, 
        Compass, 
        PlusCircle, 
        UserCircle,
    } from "lucide-svelte"
    
    let currentTheme = "light"

    const getCurrentTheme = () => document.documentElement.classList.contains("dark") ? "dark" : "light"

    const updateCurrentTheme = () => {
        currentTheme = getCurrentTheme()
    }

    const handleThemeChange = () => {
        toggleMode()
        updateCurrentTheme()
    }

    let screenWidth = 0

    onMount(() => {
        if (browser) {
            screenWidth = window.innerWidth
            const handleResize = () => screenWidth = window.innerWidth
            window.addEventListener("resize", handleResize)
            return () => {
                window.removeEventListener("resize", handleResize)
            }
        }

        updateCurrentTheme()
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    updateCurrentTheme()
                }
            })
        })

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"]
        })

        return () => { observer.disconnect() }
    })

    async function handleLogout() {
        await client.signOut();
        window.location.href = '/';
    }

    $: user = $page.data.user
    $: showNavbar = !$page.data.hideNavbar
    $: currentPath = $page.url.pathname
    $: isHomePath = currentPath === '/' || currentPath === '/following'
    $: homeHref = $feedTab === 'following' ? '/following' : '/'

    // Update feedTab when URL changes
    $: if (currentPath === '/following') {
        feedTab.set('following')
    } else if (currentPath === '/') {
        feedTab.set('for-you')
    }
</script>

<svelte:head>
    <title>Yapster</title>
</svelte:head>

<ModeWatcher/>

<Toaster/>

<div class="flex min-h-screen flex-col">
    <!-- Main content of page -->
    <slot/>
    
    <!-- Sticky Navbar at bottom of page -->
    {#if showNavbar && user}
        <div class="fixed bottom-0 left-0 right-0 h-16 border-t bg-background z-[9999]">
            <div class="container p-0 max-w-xl px-8">
                <div class="flex h-full items-center justify-between">
                    <Button variant="ghost" size="icon" href={homeHref}>
                        <Home class="h-5 w-5" strokeWidth={isHomePath ? 2.5 : 2} />
                        <span class="sr-only">Home</span>
                    </Button>
                    <Button variant="ghost" size="icon" href="/explore">
                        <Compass class="h-5 w-5" strokeWidth={currentPath === '/explore' ? 2.5 : 2} />
                        <span class="sr-only">Explore</span>
                    </Button>
                    <Button variant="ghost" size="icon" href="/create">
                        <PlusCircle class="h-5 w-5" strokeWidth={currentPath === '/create' ? 2.5 : 2} />
                        <span class="sr-only">Create Post</span>
                    </Button>
                    <Button variant="ghost" size="icon" href={`/@${user.username}`}>
                        <UserCircle class="h-5 w-5" strokeWidth={currentPath === `/@${user.username}` ? 2.5 : 2} />
                        <span class="sr-only">Profile</span>
                    </Button>
                </div>
            </div>
        </div>
        <div class="h-16"></div>
    {/if}
</div>