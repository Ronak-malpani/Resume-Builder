import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  enhanceProfessionalSummary,
  enhanceJobDescription,
  enhanceProjectDescription,
  uploadResume,
} from "../controllers/aiController.js";
import { analyzeResumeATS } from "../controllers/atsController.js";

const aiRouter = express.Router();

// JWT protected AI enhance routes
aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/upload-resume", protect, uploadResume);
aiRouter.post("/enhance-project-desc", protect, enhanceProjectDescription);

// ATS scan — NO AUTH (important)
aiRouter.post("/ats-analysis", analyzeResumeATS);

export default aiRouter;
