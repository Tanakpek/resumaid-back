
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
import cookieParser = require("cookie-parser");
import { PrismaClient } from "@prisma/client";

import { client as stripeClient } from '@src/models/stripe/client'
import { cleanup } from "@src/utils/services/db";
dotenv.config();
declare module 'express-session' {
    interface SessionData {
        userId: string;
        email: string;
        isAdmin?: boolean;
    }
}

const client = new PrismaClient();
const usersController = new UsersController();



mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
        await cleanup()
    })

