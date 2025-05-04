<script>
	import { Button } from '$lib/component/ui/button';
	import { Input } from '$lib/component/ui/input';
	import { PasswordInput } from '$lib/component/ui/password-input';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
	import { isValidEmail } from '$lib/validationUtil';
	import { client } from '$lib/auth/auth-client';

	export let showForgotPassword = true;
	export let showCreateAccount = true;

	let identifier = '';
	let password = '';
	let isLoading = false;
	let error = '';

	async function handleSubmit() {
		error = '';
		isLoading = true;

		if (isValidEmail(identifier)) {
			await client.signIn.email({
				email: identifier,
				password: password,
				callbackURL: "/"
			}, {
				onRequest: (ctx) => {
					console.log("REQUEST", ctx)
				},
				onSuccess: (ctx) => {
					console.log("SUCCESS", ctx)
					window.location.href = '/';
					isLoading = false;
				},
				onError: (ctx) => {
					console.log("ERROR", ctx)
					error = ctx.error.message || 'Invalid credentials';
					isLoading = false;
				}
			});
		} else {
			await client.signIn.username({
				username: identifier,
				password: password,
				callbackURL: "/"
			}, {
				onRequest: (ctx) => {
					console.log("REQUEST", ctx)
				},
				onSuccess: (ctx) => {
					console.log("SUCCESS", ctx)
					window.location.href = '/';
					isLoading = false;
				},
				onError: (ctx) => {
					console.log("ERROR", ctx)
					error = ctx.error.message || 'Invalid credentials';
					isLoading = false;
				}
			});
		}
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

	<!-- Right Side with Login Form -->
	<div class="w-full md:w-1/2 max-w-md">
		<Card class="border-border bg-card pt-4">
			<CardHeader class="items-center space-y-4">
				<CardTitle class="text-5xl font-serif text-card-foreground">Yapster</CardTitle>
				<CardDescription class="text-base">Continue your yapfest</CardDescription>
			</CardHeader>
			<CardContent>
				<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
					<Input 
						type="text" 
						placeholder="Username or email address" 
						class="rounded-lg text-foreground border-border"
						bind:value={identifier}
						required
					/>
					<PasswordInput 
						placeholder="Password"
						bind:value={password}
					/>
					{#if error}
						<p class="text-sm text-destructive">{error}</p>
					{/if}
					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							Logging in...
						{:else}
							Log in
						{/if}
					</Button>
				</form>
				{#if showForgotPassword}
					<p class="text-center text-sm mt-4">
						<a href="/account/forgot-password" class="link">Forgotten your password?</a>
					</p>
				{/if}
			</CardContent>
			{#if showCreateAccount}
				<CardFooter class="flex-col items-center space-y-6">
					<p class="text-center text-muted-foreground text-sm">
						Don't have an account? <a href="/account/create" class="link">Create one</a>
					</p>
				</CardFooter>
			{/if}
		</Card>
	</div>
</div>
