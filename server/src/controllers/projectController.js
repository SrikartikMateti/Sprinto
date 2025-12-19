
import prisma from "../../configs/prisma.configs.js"


//Create Project
export const createProject=async(req,res)=>{
    try{
       const {userId}=req.auth();
        const {workspaceId,name,description,status,priority,start_date,end_date,team_members,team_lead,progress }=req.body;

        //checking if user has admin role or not
        const workspace=await prisma.workspace.findUnique({
            where:{
                id:workspaceId
            },
            include:{
                members:{
                    include:{
                        user:true
                    }
                }
            }
        })
        
        if(!workspace){
            return res.status(404).json({message:"Workspace not found"})
        }
        //checking if user is not admin
        if(!workspace.members.some((member)=>{
            return member.userId===userId && member.role==='ADMIN'
        }))
        {
            return res.status(401).json({ message: "Unauthorized access" })
        }
        //get Team lead using email and getting the id
        const teamLead=await prisma.user.findUnique({where:{
           email:team_lead

        },
        select:{
            id:true
        }

        }) 
        if (!teamLead) {
            return res.status(404).json({ message: "Team lead not found" })
        }

        
        const project=await prisma.project.create({
            data:{
                name
                ,description
                ,priority
                ,status
                ,start_date: start_date ? new Date(start_date) : null
                ,end_date:end_date?new Date(end_date):null
                ,team_lead:teamLead?.id
               ,workspaceId
              ,progress
                
            }
        })
        
        //add members to project if they are in workspace
        if(team_members?.length>0){
            const membersToAdd=[]
            workspace.members.forEach(member => {
                if(team_members.includes(member.user.email))
                    membersToAdd.push(member.user.id)
            });
            await prisma.projectMember.createMany({
                data:
                    membersToAdd.map((memberId)=>({
                        projectId:project.id,
                        userId:memberId
                    }))
                
            })
        }

        //adding project memeber into project
        const projectWithMembers=await prisma.project.findUnique({
            where:{
                id:project.id
            },
            include:{
                members:{include:{
                    user:true
                }},
                tasks:{
                    include:{assignee:true,comments:{include:{user:true}}}
                },
                owner:true
            }
        })
        

        return res.status(201).json({project:projectWithMembers,message:"Project Created Succesfully"})


    }
    catch(error){
        console.log(error);
        res.status(500).json({message:error.code||error.message})
    }
}

//Update Project
export const updateProject=async(req,res)=>{
    try{
        const { userId } = req.auth();
        const {id,workspaceId,description,name,status,start_date,end_date,progress,priority}=req.body;

        //check if user has admin role
        const workspace=await prisma.workspace.findUnique({
            where:
                {id:workspaceId},
        include:{
            members:{
                include:{
                    user:true
                }
            }
        }})

        if(!workspace){
            return res.status(404).json({message:"Workspace not found"})
        }
        
        if(!workspace.members.some((user)=>
            user.userId===userId  && user.role==='ADMIN'
        )){
           //checking if user is the teamlead of the project
           const project=await prisma.project.findUnique({
            where:{id:id}
           })
           if(!project){
               return res.status(404).json({ message: "Project not found" })
           } else if  (project.team_lead !== userId) {
               return res.status(403).json({ message: "User doens't have permission to update projects of this workspace" })
           }
        }
        

        const projectUpdated= await prisma.project.update({
            where:{id:id},
            data:{
                description,
                name,
                status,
                start_date:start_date?new Date(start_date):null,
                end_date: end_date ? new Date(end_date) : null,
                progress,
                priority,
                workspaceId
            }
        })

        res.status(200).json({projectUpdated,message:"Project Data Updated Succesfully",})

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:error.code||error.message})
    }
}

//Add member to project
export const addMember = async (req, res) => {
    try {
        const {userId}=req.auth();
        const {projectId}=req.params;
        const {email}=req.body;//email of new member

        //check if user is project lead
        const project=await prisma.project.findUnique({
            where:{id:projectId},
            include:{
                members:{
                    include:{
                        user:true
                    }
                }
            }
        })

        if(!project)
        {
            return res.status(404).json({message:"Project doesn't exist"})
        }
        if(project.team_lead!==userId){
            return res.status(403).json({ message: "Only Project lead can add memebers" })
        }
        //check if user is already a memeber
        if(project.members.some((member)=>{
            return member.user.email===email
        })){
            return res.status(400).json({ message: "User already a member" })
        }

        const user=await prisma.user.findUnique({
           where:{email:email}
        })

        if(!user){
            return res.status(404).json({ message: "User doesn't exist" })
        }

        const memeber=await prisma.projectMember.create({
            data:{
                userId:user.id,
                projectId
            }
        })

        return res.status(201).json({ memeber, message: "Member added succesfully" })


    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message })
    }
}