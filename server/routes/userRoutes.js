import express from "express";
import { getUserById,getUserResumes,loginUser,registerUser,forgotPassword,resetPassword } from "../controllers/userController.js";
import  protect  from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/data',protect,getUserById);
userRouter.get('/resumes',protect,getUserResumes);
userRouter.post('/forgot-password', forgotPassword);
userRouter.put('/reset-password/:token', resetPassword);
export default userRouter;