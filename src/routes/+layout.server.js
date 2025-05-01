export async function load({ locals }) {
    console.log("LOCALS", locals)

    return {
        user: locals.user
    };
} 