import express from "express";
import { sendMessage } from "../controllers/contactController.js";

const contactRouter = express.Router();

contactRouter.post('/', sendMessage);

export default contactRouter;