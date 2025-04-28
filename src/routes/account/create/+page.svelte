<script>
	import { Button } from '$lib/component/ui/button';
	import { Input } from '$lib/component/ui/input';
	import { PasswordInput } from '$lib/component/ui/password-input';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '$lib/component/ui/card';
	import { client } from '$lib/auth/auth-client';

	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let isLoading = false;
	let error = '';

	async function handleSubmit() {
		error = '';
		isLoading = true;

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			isLoading = false;
			return;
		}

		await client.signUp.email({
			email: email,
			password: password,
			username: username.toLowerCase(),
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
				error = ctx.error.message || 'Failed to create account';
				isLoading = false;
			}
		});
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

	<!-- Right Side with Create Account Form -->
	<div class="w-full md:w-1/2 max-w-md">
		<Card class="border-border bg-card pt-4">
			<CardHeader class="items-center space-y-4">
				<CardTitle class="text-5xl font-serif text-card-foreground">Yapster</CardTitle>
                <CardDescription class="text-base">Create an account to get yapping</CardDescription>
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
					<Input 
						type="text" 
						placeholder="Username" 
						class="rounded-lg text-foreground border-border"
						bind:value={username}
						required
					/>
					<PasswordInput 
						placeholder="Password" 
						bind:value={password}
					/>
					<PasswordInput 
						placeholder="Confirm password" 
						bind:value={confirmPassword}
					/>
					{#if error}
						<p class="text-sm text-red-500">{error}</p>
					{/if}
					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							Creating account...
						{:else}
							Create Account
						{/if}
					</Button>
				</form>
			</CardContent>
			<CardFooter class="flex-col items-center space-y-6">
				<p class="text-center text-muted-foreground text-sm">
					Already have an account? <a href="/account/login" class="link">Log in</a>
				</p>
                <p class="text-center text-muted-foreground text-sm">
                    By creating an account, you agree to our <a href="/legal/terms" target="_blank" class="link">Terms</a> and how we collect, use and share your data in our <a href="/legal/privacy" target="_blank" class="link">Privacy Policy</a>
                </p>
			</CardFooter>
		</Card>
	</div>
</div>