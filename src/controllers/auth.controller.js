import bcrypt from "bcryptjs"
import {db} from "../libs/db.js"
import { UserRole } from "../generated/prisma/index.js"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    const {email, password , name } = req.body

    try {
        const existingUser = await db.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({
                error: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await db.user.create({
            data:{
                email,
                password: hashedPassword,
                name,
                role: UserRole.USER,
                image: ''
            }
        })

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "7d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 7*24*60*60*1000
        })

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user:{
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                image: newUser.image
            }
        })
    } catch (error) {
        console.error("Error creating user:", error)
        res.status(500).json({
            error: "Error creating user"
        })
        
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    
    if(!email || !password){
        register.status(400).json({
            message: "both email or passwored is required"
        })
    }

    
    try {
        const user = await db.user.findUnique({
            where:{
                email
            }
        })
    
        if(!user){
            res.status(400).json({
                message: "User not found"
            })
        }
    
        const isMatch = await bcrypt.compare(password, user.password)
    
        if(!isMatch === true){
            res.status(400).json({
                message: "Invalid credentials"
            })
        }
    
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET,{
            expiresIn: "7d"
        })
    
        res.cookie("jwt", token , {
            httpOnly: true,
            sameSite: "Strict",
            secure: process.env.NODE_ENV !== "developement",
            maxAge: 1000*60*60*24*7
        })
        
        res.status(200).json({
            success: true,
            message: "User Logged in successfully",
            user:{
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                image: user.image
            }
        })
    } catch (error) {
        console.error("Error Logging in user:", error)
        res.status(500).json({
            error: "Error Logging in user"
        })
    }
    
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt",{
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development"
        })

        res.status(200).json({
            success: true,
            message: "User logged out successfully"
        })
    } catch (error) {
        console.error("Error logging out user:", error)
        res.status(500).json({
            error: "Error logging out user  "
            
        })
        
    }
}

export const check = async (req, res) => {

    try {
        res.status(200).json({
            success: true,
            message: "User authenticated successfully",
            user: req.user
        })
    } catch (error) {
        console.error("Error checking user:", error)
        res.status(500).json({
            error: "Error checking user",

        })
    }
}
