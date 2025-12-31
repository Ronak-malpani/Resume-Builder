import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import resumeRouter from "./routes/resumeRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import contactRouter from "./routes/contactRoutes.js";

const app = express();

// Use the port provided by Render or default to 3000 for local testing
const PORT = process.env.PORT || 3000; 

// Database Connection - Ensure MONGO_URL is in Render Env Variables
await connectDB();

app.use(express.json());

// Optimized CORS for Production
app.use(cors({ 
  origin: [
    "https://resume-builder-drab-eta.vercel.app", // Your specific Vercel URL
    "http://localhost:5173" // Allows you to still test locally with Vite
  ], 
  credentials: true 
}));

// Clerk Middleware for Authentication
app.use(clerkMiddleware());

// Health Check Route
app.get("/", (req, res) => {
  res.send("ResumeAI Server is live and running...");
});

// API Routes
app.use("/api/users", userRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/ai", aiRouter);
app.use("/api/contact", contactRouter);

// Standard error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong on the server!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});