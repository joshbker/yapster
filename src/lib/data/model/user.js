import { Schema, model } from "mongoose"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    followers: {
        type: [String],
        default: []
    },
    following: {
        type: [String],
        default: []
    }
}, {
    versionKey: false
})

export const user = model("user", userSchema, "user"); 