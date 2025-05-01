export async function load({ locals }) {
    console.log("LOCALS", locals)

    // Update all users to ensure they have likedComments field
    // try {
    //     // Use updateMany to set likedComments only where it doesn't exist
    //     await User.updateMany(
    //         { likedComments: { $exists: false } },
    //         { $set: { likedComments: [] } }
    //     );
    // } catch (err) {
    //     console.error("Error updating users with likedComments field:", err);
    // }

    return {
        user: locals.user
    };
} 