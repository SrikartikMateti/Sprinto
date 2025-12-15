import express from "express";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"

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


export default app;