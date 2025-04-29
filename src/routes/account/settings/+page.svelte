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
    import { toast } from "svelte-sonner";
    import HeaderNavigation from '$lib/component/HeaderNavigation.svelte';
    let isLoading = false;

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
        isLoading = true;

        await client.updateUser({
            username: username
        }, {
            onError: (error) => {
                toast.error(error.message || 'Failed to update profile');
                isLoading = false;
            },
            onSuccess: () => {
                toast.success('Profile updated successfully');
                isLoading = false;
            }
        })
    }

    async function changePassword() {
        isLoading = true;

        if (newPassword !== confirmNewPassword) {
            toast.error('New passwords do not match');
            isLoading = false;
            return;
        }

        await client.verifyPassword({
            email: $page.data.user.email,
            password: currentPassword
        }, {
            onError: (error) => {
                console.error(error);
                toast.error(error.message || 'Failed to verify password');
                isLoading = false;
            },
            onSuccess: async () => {
                await client.changePassword({
                    currentPassword,
                    newPassword,
                    revokeOtherSessions: true
                }, {
                    onError: (error) => {
                        console.error(error);
                        toast.error(error.message || 'Failed to change password');
                        isLoading = false;
                    },
                    onSuccess: () => {
                        toast.success('Password changed successfully');
                        currentPassword = '';
                        newPassword = '';
                        confirmNewPassword = '';
                        isLoading = false;
                    }
                })
            }
        })
    }

    async function changeEmail() {
        isLoading = true;

        await client.verifyPassword({
            email: $page.data.user.email,
            password: currentPassword
        }, {
            onError: (error) => {
                console.error(error);
                toast.error(error.message || 'Failed to verify password');
                isLoading = false;
            },
            onSuccess: async () => {
                await client.changeEmail({
                    newEmail
                }, {
                    onError: (error) => {   
                        toast.error(error.message || 'Failed to change email');
                        isLoading = false;
                    },
                    onSuccess: () => {
                        toast.success('Email change request sent. Please check your new email for verification.');
                        newEmail = '';
                        currentEmailPassword = '';
                        isLoading = false;
                    }
                })
            }
        })
    }

    async function deleteAccount() {
        try {
            await client.delete();
            window.location.href = '/';
        } catch (e) {
            toast.error(e.message || 'Failed to delete account');
        }
    }

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
                                <AlertDialogAction class="bg-destructive text-destructive-foreground hover:bg-destructive/90" on:click={deleteAccount}>
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
