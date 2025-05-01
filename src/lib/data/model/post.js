import pkg from "mongoose"
const { Schema, model, models } = pkg;

const postSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
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
    content: {
        items: {
            type: [String],
            default: []
        },
        text: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        tags: {
            type: [String],
            default: []
        }
    },
}, {
    versionKey: false,
    _id: true
})

export const post = models.post || model("post", postSchema, "post"); 