import {addComment,getComments} from "../controllers/commentController.js"
import express from "express"

commentRouter=express.Router();

commentRouter.put("/",addComment)
commentRouter.get("/:taskId",getComments)
export default commentRouter