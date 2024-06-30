
import { Express, NextFunction } from "express";
// import { PrismaClient } from "@prisma/client";
import { UsersController } from "@src/controllers/user/user_controller";
import express, { Request, Response } from 'express';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import UserRoutes from "@src/routes/users";
import { loginRoutes, logoutRoutues } from "@src/routes/auth";
import mongoose, { mongo } from "mongoose";
import { checkAuth } from "@src/middleware/check-auth";
import session from 'express-session';
import dotenv from 'dotenv';
import CV from '@src/models/cv/CV'
import fs from 'fs';
import https from 'https';
import User from '@src/models/user/User';
import { UserDetails } from '@src/models/user/User'
import cookieParser = require("cookie-parser");
import { PrismaClient } from "@prisma/client";
dotenv.config();


declare module 'express-session' {
    interface SessionData {
        userId: string;
        email: string;
        isAdmin?: boolean;
    }
}

// const client = new PrismaClient();
const usersController = new UsersController();



process.on('SIGINT', async () => {
    // await client.$disconnect();
    process.exit();
})


mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
    console.log('connected to db')
    await User.deleteMany({})
    await CV.deleteMany({})
    await UserDetails.deleteMany({})
    await fs.readFile('seed/data/seed_1.json', 'utf8', async (err, data) => {
        const user = JSON.parse(data)
        const cv = user.cv
        const details = user.details
        await CV.create(cv)
        await UserDetails.create(details)
        await User.create(JSON.parse(data))
        await mongoose.connection.close()
    })
    
})

