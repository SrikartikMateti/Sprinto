import express from "express"
import {getUserWorkspaces,addMember} from "../controllers/workspaceController.js"
import { protect } from "../middlewares/auth.middleware.js";
const workspaceRouter =express.Router();

workspaceRouter.get('/', protect,getUserWorkspaces)

workspaceRouter.post('/add-member', protect,addMember)

export default workspaceRouter