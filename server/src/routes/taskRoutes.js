import { updateTask, createTask, deleteTask } from "../controllers/taskController.js"

import express from "express"

taskRouter=express.Router()
taskRouter.post('/',createTask)
taskRouter.put('/:id', updateTask)
taskRouter.post('/delete/',deleteTask)

export default taskRouter