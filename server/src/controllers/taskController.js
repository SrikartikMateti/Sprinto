
import prisma from "../../configs/prisma.configs.js"
import { inngest } from "../../inngest/index.js";


//Create a new task

export const createTask = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;
        const origin = req.get('origin')
        //check has admin role
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                members:
                {
                    include:
                    {
                        user: true
                    }
                }
            }
        })

        if (!project) {
            return res.status(404).json({ message: "Project doesn't exist" })
        }
        else if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Unauthorized access" })
        }
        else if (assigneeId && !project.members.some(member => member.userId === assigneeId)) {
            return res.status(403).json({ message: "Assignee is not the member of the project/workspace" })
        }

        const task = await prisma.task.create({
            data: {
                projectId,
                title,
                description,
                type,
                status,
                priority,
                assigneeId,
                due_date: new Date(due_date)
            }
        })

        const taskWithAssignee = await prisma.task.findUnique({
            where: { id: task.id },
            include: { assignee: true }
        })


        await inngest.send({
            name: "app/task.assigned", data: {
                taskId: task.id,
                origin
            }
        })//Calling the inngest function
        res.status(201).json({ task: taskWithAssignee, message: "Task Created Succesfully" })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}

//update task
export const updateTask = async (req, res) => {
    try {
        const task = await prisma.task.findUnique({
            where: { id: req.params.id }
        })

        if (!task) {
            return res.status(404).json({ message: "Task doesn't exist" })
        }

        const { userId } = req.auth();
        const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;

        // If projectId is provided, check authorization
        if (projectId) {
            const project = await prisma.project.findUnique({
                where: { id: projectId },
                include: {
                    members: {
                        include: {
                            user: true
                        }
                    }
                }
            })

            if (!project) {
                return res.status(404).json({ message: "Project doesn't exist" })
            }
            else if (project.team_lead !== userId) {
                return res.status(403).json({ message: "Unauthorized access" })
            }
        }

        // Build update data object with only provided fields
        const updateData = {};
        if (projectId !== undefined) updateData.projectId = projectId;
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;
        if (priority !== undefined) updateData.priority = priority;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;
        if (due_date !== undefined) updateData.due_date = due_date ? new Date(due_date) : null;

        const updatedTask = await prisma.task.update({
            where: { id: req.params.id },
            data: updateData,
            include: { assignee: true, comments: { include: { user: true } } }
        })

        res.status(201).json({ updatedTask, message: "Task Updated Successfully" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }


}

//delete task

export const deleteTask = async (req, res) => {

    try {
        const { userId } = req.auth();
        const { taskIds } = req.body;

        const task = await prisma.task.findMany({
            where: { id: { in: taskIds } }
        })
        if (task.length === 0)
            return res.status(404).json({ message: "Task not found" })

        const project = await prisma.project.findUnique({
            where: { id: task[0].projectId },
            include: {
                members: {
                    include:
                    {
                        user: true
                    }
                }
            }
        })

        if (!project) {
            return res.status(404).json({ message: "Project doesn't exist" })
        }
        else if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Unauthorized access" })
        }


        await prisma.task.deleteMany({
            where: { id: { in: taskIds } }
        })

        return res.status(201).json({ message: "Task Deleted Succesfully" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}