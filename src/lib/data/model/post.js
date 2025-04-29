import { Schema, model } from "mongoose"

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
    shares: {
        type: Number,
        default: 0
    },
    comments: {
        type: [String],
        default: []
    },
    content: {
        thumbnail: {
            type: String,
            default: ""
        },
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

export const post = model("post", postSchema, "post"); 