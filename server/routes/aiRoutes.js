import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
  enhanceProfessionalSummary,
  enhanceJobDescription,
  enhanceProjectDescription,
  uploadResume
} from "../controllers/aiController.js";
import { analyzeResumeATS } from "../controllers/atsController.js";

const aiRouter = express.Router();

// AI enhancements - JWT protected
aiRouter.post("/enhance-pro-sum", protect, enhanceProfessionalSummary);
aiRouter.post("/enhance-job-desc", protect, enhanceJobDescription);
aiRouter.post("/enhance-project-desc", protect, enhanceProjectDescription);
aiRouter.post("/upload-resume", protect, uploadResume);

// ATS scan - public (no auth)
aiRouter.post("/ats-scan",protect, analyzeResumeATS);

export default aiRouter;
