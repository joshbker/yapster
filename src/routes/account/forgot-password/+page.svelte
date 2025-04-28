<script>
	import { Button } from '$lib/component/ui/button';
	import { Input } from '$lib/component/ui/input';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
	import { client } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';

	let email = '';
	let isLoading = false;
	let error = '';
	let success = '';

	async function handleSubmit() {
		error = '';
		success = '';
		isLoading = true;

		await client.resetPassword.sendEmail({
			email: email,
			callbackURL: "/account/reset-password"
		}, {
			onRequest: (ctx) => {
				console.log("REQUEST", ctx)
			},
			onSuccess: (ctx) => {
				console.log("SUCCESS", ctx)
				success = 'Password reset instructions have been sent to your email';
			},
			onError: (ctx) => {
				console.log("ERROR", ctx)
				error = ctx.error.message || 'Failed to send reset instructions';
			}
		});

		isLoading = false;
	}
</script>

<div class="flex h-full flex-grow w-full flex-col md:flex-row items-center justify-center bg-background px-4">
	<!-- Left Side with Images -->
	<div class="hidden md:flex md:w-1/2 items-center justify-center p-4">
		<div class="relative h-[600px] w-[400px]">
			<!-- Stack of images with animations -->
			<div class="absolute left-0 top-0 rotate-[-5deg] z-20">
				<div class="rounded-3xl w-72 h-[500px] bg-gradient-to-br from-pink-500 to-orange-400 shadow-xl overflow-hidden"></div>
			</div>
			<div class="absolute left-20 top-10 rotate-[5deg] z-10">
				<div class="rounded-3xl w-72 h-[500px] bg-gradient-to-br from-purple-500 to-blue-400 shadow-xl overflow-hidden"></div>
			</div>
			<div class="absolute left-10 top-20 rotate-[-10deg]">
				<div class="rounded-3xl w-72 h-[500px] bg-gradient-to-br from-yellow-400 to-pink-500 shadow-xl overflow-hidden"></div>
			</div>
		</div>
	</div>

	<!-- Right Side with Forgot Password Form -->
	<div class="w-full md:w-1/2 max-w-md">
		<Card class="border-border bg-card pt-4">
			<CardHeader class="items-center space-y-4">
				<CardTitle class="text-5xl font-serif text-card-foreground">Yapster</CardTitle>
				<CardDescription class="text-base">Reset your password</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
					<Input 
						type="email" 
						placeholder="Email address" 
						class="rounded-lg text-foreground border-border"
						bind:value={email}
						required
					/>
					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}
					{#if success}
						<p class="text-sm text-green-600">{success}</p>
					{/if}
					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							Sending reset instructions...
						{:else}
							Reset Password
						{/if}
					</Button>
				</form>
			</CardContent>
			<CardFooter class="flex-col items-center space-y-6">
				<p class="text-center text-muted-foreground text-sm">
					Remember your password? <a href="/account/login" class="link">Log in</a>
				</p>
			</CardFooter>
		</Card>
	</div>
</div>
