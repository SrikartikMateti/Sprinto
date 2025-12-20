import prisma from "../../configs/prisma.configs.js";

//adding a comment
export const addComment = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, taskId } = req.body


        //checking if the user is a team member or not
        const task = await prisma.task.findUnique({
            where: { id: taskId },
        })
        if (!task) {
            return res.status(404).json({ message: "Task doesn't exist" })
        }
        const project = await prisma.project.findUnique({
            where: { id: task.projectId },
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
        if (!project.members.some(members => members.userId === userId)) {
            return res.status(404).json({ message: "User is not a team member" })
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                taskId,
                userId
            },
            include: {
                user: true
            }
        })
        return res.status(201).json({ comment, message: "Comment added successfully" })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}


//get Comments for task
export const getComments = async (req, res) => {

    try {

        const { taskId } = req.params;
        const comment = await prisma.comment.findMany({
            where: { taskId }
        })
        if (!comment) {
            return res.status(404).json({ message: "Comments doesn't exist" })
        }
        return res.status(201).json(comment, { message: "Comment retrieved succesfully" })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }




}