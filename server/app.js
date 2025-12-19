import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import workspaceRouter from "./src/routes/workspaceRoutes.js";
import projectRouter from "./src/routes/projectRoutes.js"
import taskRouter from "./src/routes/taskRoutes.js"
import { protect } from "./src/middlewares/auth.middleware.js";
import commentRouter from "./src/routes/commentRoutes.js";

const app=express();

//basic configuration
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))

//cors config
app.use(cors())
//clerk middleware
app.use(clerkMiddleware())
//ingest middleware
app.use("/api/inngest", serve({ client: inngest, functions }));

//home route
app.get("/",(req,res)=>{
    return res.send("✅ Server is Live")
})


//workspace url
app.use("/api/workspaces",workspaceRouter);

//project url
app.use("/api/projects",projectRouter);

//task url
app.use("/api/tasks",protect,taskRouter);

//comment url
app.use("/api/comments", protect, commentRouter);

export default app;