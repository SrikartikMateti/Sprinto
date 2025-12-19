import {updatedTask,createTask,deleteTask} from "../controllers/taskController.js"

import express from "express"

taskRouter=express.Router()
taskRouter.post('/',createTask)
taskRouter.put('/:id',updatedTask)
taskRouter.post('/delete/',deleteTask)

export default taskRouter