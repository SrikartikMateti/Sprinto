import {addComment,getComments} from "../controllers/commentController.js"
import express from "express"

const commentRouter=express.Router();

commentRouter.put("/",addComment)
commentRouter.get("/:taskId",getComments)
export default commentRouter