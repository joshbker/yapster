import mongoose, { Schema, model } from "mongoose"
import { DATABASE_URI } from "$env/static/private"

mongoose.connect(DATABASE_URI)
export const database = mongoose.connection

database.once("open", () => console.log("[MongoDB]: Successfully connected"))
database.on("error", (error) => console.error(`[MongoDB] Error: ${error}`))
