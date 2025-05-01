import { user as User } from "$lib/data/model/user.js"

export async function load({ locals }) {
    console.log("LOCALS", locals)

    if (locals.user) {
        const user = await User.findById(locals.user.id)
        if (!user.likedComments) {
            user.likedComments = []
        }
        await user.save()

        locals.user.likedComments = user.likedComments
    }

    return {
        user: locals.user
    };
} 