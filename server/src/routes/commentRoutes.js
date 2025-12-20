import { addComment, getComments } from "../controllers/commentController.js"
import { protect } from "../middlewares/auth.middleware.js"
import express from "express"

const commentRouter = express.Router();

commentRouter.post("/", protect, addComment)
commentRouter.get("/:taskId", protect, getComments)
export default commentRouter