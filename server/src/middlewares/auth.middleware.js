export const protect=async(req,res,next)=>{
    try {
        const userId=req.auth?.userId
        if(!userId)
        {
            return res.status(401).json({error:"Unauthorized"})
        }
        return next();
    } catch (error) {
        console.error(error)
        return res.status(401).json({ error: "Unauthorized" })
    }

}