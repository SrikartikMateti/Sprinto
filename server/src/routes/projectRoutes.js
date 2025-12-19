import express from "express"
import { addMember, createProject, updateProject } from "../controllers/projectController.js"
import { protect } from "../middlewares/auth.middleware.js";

const projectRouter=express.Router()


projectRouter.post('/',protect,createProject)
projectRouter.put('/', protect, updateProject)
projectRouter.post('/:projectId/addMember',protect,addMember)

export default projectRouter