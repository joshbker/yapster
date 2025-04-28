<script>
    import { Button } from '$lib/component/ui/button';
    import { Input } from '$lib/component/ui/input';
    import { PasswordInput } from '$lib/component/ui/password-input';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/component/ui/tabs';
    import { Label } from '$lib/component/ui/label';
    import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '$lib/component/ui/alert-dialog';
    import { client } from '$lib/auth/auth-client';
    import { page } from '$app/stores';

    let isLoading = false;
    let error = '';
    let success = '';

    // Profile form
    let username = $page.data.user.username;
    
    // Password form
    let currentPassword = '';
    let newPassword = '';
    let confirmNewPassword = '';

    // Email form
    let newEmail = '';
    let currentEmailPassword = '';

    async function updateProfile() {
        error = '';
        success = '';
        isLoading = true;

        try {
            // Add profile update logic here when available in BetterAuth
            success = 'Profile updated successfully';
        } catch (e) {
            error = e.message || 'Failed to update profile';
        } finally {
            isLoading = false;
        }
    }

    async function changePassword() {
        error = '';
        success = '';
        isLoading = true;

        if (newPassword !== confirmNewPassword) {
            error = 'New passwords do not match';
            isLoading = false;
            return;
        }

        try {
            await client.user.changePassword({
                currentPassword,
                newPassword
            });
            success = 'Password changed successfully';
            currentPassword = '';
            newPassword = '';
            confirmNewPassword = '';
        } catch (e) {
            error = e.message || 'Failed to change password';
        } finally {
            isLoading = false;
        }
    }

    async function changeEmail() {
        error = '';
        success = '';
        isLoading = true;

        try {
            await client.user.changeEmail({
                email: newEmail,
                password: currentEmailPassword
            });
            success = 'Email change request sent. Please check your new email for verification.';
            newEmail = '';
            currentEmailPassword = '';
        } catch (e) {
            error = e.message || 'Failed to change email';
        } finally {
            isLoading = false;
        }
    }

    async function deleteAccount() {
        try {
            await client.user.delete();
            window.location.href = '/';
        } catch (e) {
            error = e.message || 'Failed to delete account';
        }
    }

    async function handleLogout() {
        error = '';
        success = '';
        isLoading = true;

        try {
            await client.signOut();
            window.location.href = '/';
        } catch (e) {
            error = e.message || 'Failed to log out';
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">Account Settings</h1>

    {#if error}
        <div class="bg-destructive/15 text-destructive p-3 rounded-md mb-4">
            {error}
        </div>
    {/if}

    {#if success}
        <div class="bg-green-500/15 text-green-600 p-3 rounded-md mb-4">
            {success}
        </div>
    {/if}

    <Tabs defaultValue="profile" class="w-full">
        <TabsList class="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your profile details</CardDescription>
                </CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-2">
                        <Label for="username">Username</Label>
                        <Input
                            id="username"
                            bind:value={username}
                            placeholder="Your username"
                        />
                    </div>
                    <Button on:click={updateProfile} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="security">
            <div class="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div class="space-y-2">
                            <Label for="currentPassword">Current Password</Label>
                            <PasswordInput
                                id="currentPassword"
                                bind:value={currentPassword}
                            />
                        </div>
                        <div class="space-y-2">
                            <Label for="newPassword">New Password</Label>
                            <PasswordInput
                                id="newPassword"
                                bind:value={newPassword}
                            />
                        </div>
                        <div class="space-y-2">
                            <Label for="confirmNewPassword">Confirm New Password</Label>
                            <PasswordInput
                                id="confirmNewPassword"
                                bind:value={confirmNewPassword}
                            />
                        </div>
                        <Button on:click={changePassword} disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Change Email</CardTitle>
                        <CardDescription>Update your email address</CardDescription>
                    </CardHeader>
                    <CardContent class="space-y-4">
                        <div class="space-y-2">
                            <Label for="newEmail">New Email</Label>
                            <Input
                                id="newEmail"
                                type="email"
                                bind:value={newEmail}
                                placeholder="new.email@example.com"
                            />
                        </div>
                        <div class="space-y-2">
                            <Label for="currentEmailPassword">Current Password</Label>
                            <PasswordInput
                                id="currentEmailPassword"
                                bind:value={currentEmailPassword}
                            />
                        </div>
                        <Button on:click={changeEmail} disabled={isLoading}>
                            {isLoading ? 'Changing...' : 'Change Email'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="danger">
            <Card>
                <CardHeader>
                    <CardTitle class="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button variant="destructive">Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove all of your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction variant="destructive" on:click={deleteAccount}>
                                    Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>

    <div class="mt-8 border-t pt-6">
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
</div>
