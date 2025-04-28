<script>
	import * as FormPrimitive from "formsnap"
	import { cn } from "$lib/util.js"
	let className = undefined
	export { className as class }
	export let errorClasses = undefined
</script>

<FormPrimitive.FieldErrors
	class={cn("text-destructive text-sm font-medium", className)}
	{...$$restProps}
	let:errors
	let:fieldErrorsAttrs
	let:errorAttrs
>
	<slot {errors} {fieldErrorsAttrs} {errorAttrs}>
		{#each errors as error}
			<div {...errorAttrs} class={cn(errorClasses)}>{error}</div>
		{/each}
	</slot>
</FormPrimitive.FieldErrors>
