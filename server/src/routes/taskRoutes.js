import { updateTask, createTask, deleteTask } from "../controllers/taskController.js"
import { protect } from "../middlewares/auth.middleware.js"

import express from "express"

const taskRouter = express.Router()
taskRouter.post('/', protect, createTask)
taskRouter.put('/:id', protect, updateTask)
taskRouter.post('/delete/', protect, deleteTask)

export default taskRouter