
import prisma from "../../configs/prisma.configs.js"
import { inngest } from "../../inngest/index.js";
 

//Create a new task

export const createTask=async(req,res)=>{
    try{
        const {userId} = req.auth();
        const { projectId, title, description, type, status, priority, assigneeId, due_date }=req.body;
        const origin=req.get('origin')
        //check has admin role
        const project=await prisma.project.findUnique({
            where:{id:projectId},
            include:{
                members:
                {
                    include:
                    {
                        user:true
                    }
                }
            }
        })

        if(!project)
        {
            return res.status(404).json({message:"Project doesn't exist"})
        }
        else if(project.team_lead!==userId)
        {
            return res.status(403).json({ message: "Unauthorized access" })
        }
        else if(assigneeId&&!project.members.some(member=>member.userId===assigneeId))
        {
            return res.status(403).json({message:"Assignee is not the member of the project/workspace"})
        }
        
        const task=await prisma.task.create({
            data:{
                projectId, 
                title, 
                description, 
                type, 
                status, 
                priority, 
                assigneeId, 
                due_date:new Date(due_date)
            }
        })

        const taskWithAssignee=await prisma.task.findUnique({where:{id:task.id},
            include:{assignee:true}})


        await inngest.send({ name:"app/task.assigned",data:{
            taskId:task.id,
            origin
        }})//Calling the inngest function
        res.status(201).json({task:taskWithAssignee,message:"Task Created Succesfully"})


    }
    catch(error){
        console.log(error);
        res.status(500).json({message:error.code||error.message})
    }
}

//update task
export const updateTask=async(req,res)=>{
    try
    {const task=await prisma.task.findUnique({
        where:{id:req.params.id}
    })

    if(!task){
    return res.status(404).json({ message: "Task doesn't exist" })

    }
     const {userData}=req.auth();
    const { projectId, title, description, type, status, priority, assigneeId, due_date } = req.body;

    //checking is user has admin role for project
    const project=await prisma.project.findUnique({
        where:{id:projectId},
        include:{
            members:{
                include:
                {
                    user:true
                }
            }
        }
    })

    if (!project) {
        return res.status(404).json({ message: "Project doesn't exist" })
    }
    else if(project.team_lead!==userData)
    {
        return res.status(403).json({ message: "Unauthorized access" })
    }

    const updatedTask=await prisma.task.update({
        where:{id:req.params.id},
        data:{
            projectId, 
            title, 
            description, 
            type, 
            status, 
            priority, 
            assigneeId, 
            due_date:new Date(due_date)
        }
    })

    res.status(201).json({ updatedTask, message: "Task Updated Succesfully" })}
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }


}

//delete task

export const deleteTask= async(req,res)=>{
    
    try{const { userData } = req.auth();
    const {taskIds}=req.body;

    const task=await prisma.task.findMany({
        where:{id:{in:taskIds}}
    })
    if(task.length===0)
        return res.status(404).json({message:"Task not found"})
    
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
    else if (project.team_lead !== userData) {
        return res.status(403).json({ message: "Unauthorized access" })
    }


    await prisma.task.deleteMany({
        where:{id:{in:taskIds}}
    })

    return res.status(201).json({ message: "Task Deleted Succesfully" })
    }
catch(error){
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
}
}