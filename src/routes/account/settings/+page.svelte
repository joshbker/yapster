<script>
    import { Button } from '$lib/component/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
    import { client } from '$lib/auth/auth-client';
    import { toast } from "svelte-sonner";
    import HeaderNavigation from '$lib/component/HeaderNavigation.svelte';
    
    let isLoading = false;

    async function handleLogout() {
        isLoading = true;

        try {
            await client.signOut();
            window.location.href = '/';
        } catch (e) {
            toast.error(e.message || 'Failed to log out');
        } finally {
            isLoading = false;
        }
    }
</script>

<HeaderNavigation name="Account Settings" />
<div class="container mx-auto px-4 py-8 max-w-2xl">
    <Card>
        <CardHeader>
            <CardTitle>Log out</CardTitle>
            <CardDescription>Log out of your account</CardDescription>
        </CardHeader>
        <CardContent>
            <Button variant="destructive" on:click={handleLogout} disabled={isLoading}>
                {isLoading ? 'Logging out...' : 'Log Out'}
            </Button>
        </CardContent>
    </Card>
</div>
