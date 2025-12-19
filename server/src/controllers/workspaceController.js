
import  prisma  from "../../configs/prisma.configs.js"

//Get all workspaces for users(members)
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth;

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {//some means at least one
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json(workspaces);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch workspaces" });
    }
};

// Add member to workspace
export const addMember = async(req,res)=>{
    try {
        const {userId}=await req.auth;//this is the  
        const {email,role,workspaceId,message}=req.body;

        //check if user already exists
        const user=await prisma.user.findUnique({
            where:{
                email:email
            }   
        })//we want the user to be alreaady present in user table

        if(!user)
        {
            return res.status(404).json({message:"User not found"})
        }

        if(!workspaceId || !role)
        {
            return res.status(400).json({ message: "Missing required parameter"})
        }

        if(!["ADMIN","MEMBER"].includes(role))
        {
            return res.status(400).json({ message: "Wrong role provided" })
        }
        //fetch workspace
        const workspace = await prisma.workspace.findUnique({//use lowercase for accessing tables
            where:{
                id:workspaceId
            },
            include:{
                members:true
            }

        })
        if(!workspace)
        {
            return res.status(404).json({ message: "Workspace not found" })
        }
        //Check creator has admin role or not
        if(!workspace.members.find((member)=>member.userId===userId && member.role==='ADMIN'))
        {
            return res.status(403).json({ message: "Insufficient privileges" })
        }
        //check if user is already a member
        const existingMemeber=workspace.members.find((member)=>member.userId===user.id);
        if(existingMemeber)
        {
            return res.status(400).json({ message: "User is already a member" })
        }

        const member=await prisma.workspaceMember.create({
            data:{
                userId:user.id,
                workspaceId,
                email,
                role,
                message

            }
        })
        return res.status(201).json({member,message: "User succesfully added" })




    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to fetch workspaces" });
    }
}