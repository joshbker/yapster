import pkg from "mongoose"
const { Schema, model, models } = pkg;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    pronouns: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        required: true
    },
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    },
    posts: {
        type: [String],
        default: []
    },
    likes: {
        type: [String],
        default: []
    },
    saves: {
        type: [String],
        default: []
    },
    comments: {
        type: [String],
        default: []
    },
}, {
    versionKey: false
})

export const user = models.user || model("user", userSchema, "user"); 