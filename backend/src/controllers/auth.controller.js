
import bcrypt from 'bcryptjs';
import {db} from '../db/db.js';
import {UserRole} from '../generated/prisma/index.js';
import jwt from 'jsonwebtoken';
export const register = async(req, res) => {
    const {email, password, name} = req.body;
    try {
        // check if the user already existing or not
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
            
        })
        if(existingUser) {
            return res.status(400).json({
                error:"User already exisit",
            })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await db.user.create({
            data: {
                email,
                password:hashedPassword,
                name,
                role:UserRole.USER
            }
        })
        const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })
        res.cookie("jwt", token, {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 // 7 days
        })
        res.status(201).json({
            success:true,
            message:"User created successfully",
            id:newUser.id,
            email:newUser.email,
            name:newUser.name,
            role:newUser.role,
            image:newUser.image
        })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error:"Error creating user"
        })
        
    }
}

export const login = async(req, res) => {
    const {email, password} = req.body;

    // using try catch
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })
        if(!user) {
            return res.status(401).json({
                error:"User not found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(401).json({
                error: "Invalid credentials"
            })
        }

        const token = jwt.sign({id:user.id}, process.env.JWT_SECRET, {
            expiresIn:"7d",
            

        })
        res.cookie("jwt", token, {
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",
            maxAge:1000 * 60 * 60 * 24 * 7 // 7 days
        })
        res.status(200).json({
            success:true,
            message:"User Loggedin successfully",
            id:user.id,
            email:user.email,
            name:user.name,
            role:user.role,
            image:user.image
        })
        
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error:"Error logging in user"
        })
    }
}

export const logout = async(req, res) => {
    try {
        res.clearCookie('jwt',{
            httpOnly:true,
            sameSite:"strict",
            secure:process.env.NODE_ENV !== "development",

        })
        res.status(200).json({
            success:true,
            message:"User Loggedout successfully",
        })
    } catch (error) {
        console.log("Error logging out user: ", error);
        res.status(500).json({
            message: "Error logging out user"
        })
        
        
    }
}

export const check = async(req, res) => {
    try {
        res.status(200).json({
            success:true,
            message:"User authenticated successfully",
            user:req.user
        })
    } catch (error) {
        console.error("Error checking user", error);
        res.status(500).json({
            message:"Error checking user"
        });
        
    }
}


