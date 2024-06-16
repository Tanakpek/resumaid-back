
import { Express, NextFunction } from "express";
// import { PrismaClient } from "@prisma/client";
import { UsersController } from "@src/controllers/user/user_controller";
import express, { Request, Response } from 'express';
import {check, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import UserRoutes from "@src/routes/users";
import {loginRoutes, logoutRoutues} from "@src/routes/auth";
import mongoose from "mongoose";
import {checkAuth} from "@src/middleware/check-auth";
import session from 'express-session' ;
import dotenv from 'dotenv';
import CV from '@src/utils/applicaid-ts-utils/models/cv/CV'
import fs from 'fs';
import https from 'https';
import User from '@src/utils/applicaid-ts-utils/models/user/User';
import cookieParser = require("cookie-parser");
import { PrismaClient } from "@prisma/client";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser())
const cors = require('cors');
// app.use(cookieParser());
app.use(cors({
    origin: `https://${process.env.DOMAIN}`,
    credentials: true
}));

app.use(session({
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: 
        {httpOnly: true, secure: true, sameSite: 'none', path: '/',
            domain: process.env.DOMAIN
        }
    ,
}))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', process.env.ORIGIN as string);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, *'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

// const client = new PrismaClient();
const usersController = new UsersController();



app.use('/login', loginRoutes);
app.use('/logout', logoutRoutues)
app.use(checkAuth);
app.use('/users', UserRoutes);

process.on('SIGINT', async () => {
    // await client.$disconnect();
    process.exit();
})

const httpsOptions = {
    key: fs.readFileSync('./src/utils/services/ssl/cert.key'),
    cert: fs.readFileSync('./src/utils/services/ssl/cert.pem')
  }

  mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("database connected successfully"))
//   .catch((err) => console.log("error connecting to mongodb", err));
const server = https.createServer(httpsOptions, app).listen(port, async () => {
    // await client.user.deleteMany();
    if(true){
        const prisma = new PrismaClient();
        await prisma.user.deleteMany();
        await User.deleteMany()
        await CV.deleteMany();
    }
    
    console.log('Server running at ' + port)
})
