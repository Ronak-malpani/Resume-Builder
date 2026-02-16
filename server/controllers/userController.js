import User from "../models/User.js";
import  bcrypt from "bcrypt";          
import jwt from "jsonwebtoken";
import Resume from "../models/Resume.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
const generateToken = (userId) => {
    const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn: '7d'});
    return token;
}

//POST: /api/users/register
export const registerUser = async (req, res) =>{
    try{
        const {name,email,password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message: "Missing required fields"});
        }

        //check if user already exists
        const user = await User.findOne({email});

        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        //create new user
        const hashedPassword = await bcrypt.hash(password,10)
        const newUser = await User.create({
            name,email,password: hashedPassword
        })

        //Return success response
        const token = generateToken(newUser._id)
        newUser.password = undefined;

        return res.status(201).json({message: "User created successfully",token,user: newUser});
    }
    catch(error){
        return res.status(400).json({message: error.message});
    }
}

//controller for user login
//POST: /api/users/login
export const loginUser = async (req, res) =>{
    try{
        const {email,password} = req.body;

        //check if user already exists
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //check if password is correct
        if(!user.comparePassword(password)){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //Return success response
        const token = generateToken(user._id)
        user.password = undefined;

        return res.status(200).json({message: "Login successfully",token, user});
    }
    catch(error){
        return res.status(400).json({message: error.message});
    }
}


//controller for getting user by id
//GET: /api/users/data

export const getUserById = async (req, res) =>{
    try{
        
        const userId = req.userId;

        //check if user already exists
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        //Return user
        user.password = undefined;

        return res.status(200).json({ user});
    }
    catch(error){
        return res.status(400).json({message: error.message});
    }
}

//controller for getting user's resumes
//GET: /api/users/resumes
export const getUserResumes = async (req, res) =>{
    try{
        const userId = req.userId;

        //return user resumes
        const resumes = await Resume.find({userId})
        return res.status(200).json({resumes})
    }
    catch(error){
        return res.status(400).json({message: error.message});
    }
}
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 

        // IMPORTANT: Bypass validation because we aren't updating name/password here
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'ATS Resume Builder Password Recovery',
            resetUrl: resetUrl,
        });

        res.status(200).json({ success: true, message: `Reset link sent to ${email}` });

    } catch (error) {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
        }
        res.status(500).json({ success: false, message: "Email could not be sent" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Token is invalid or has expired." });
        }

        // Consistent hashing with your register function
        user.password = await bcrypt.hash(req.body.password, 10);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};