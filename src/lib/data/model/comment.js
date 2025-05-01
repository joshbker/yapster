import pkg from "mongoose"
const { Schema, model, models } = pkg;

const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    post: {
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
    }
}, {
    versionKey: false,
    _id: true
})

export const comment = models.comment || model("comment", commentSchema, "comment"); 