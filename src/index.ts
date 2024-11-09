
import { Express, NextFunction } from "express";
// import { PrismaClient } from "@prisma/client";
import { UsersController } from "@src/controllers/user/user_controller";
import express, { Request, Response } from 'express';
import {check, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import UserRoutes from "@src/routes/users";
import {loginRoutes, logoutRoutues} from "@src/routes/auth";
import { WebhookRouter } from "@src/routes/stripe_webhook";
import { billingRouter, billingPublicRouter } from "@src/routes/billing";
import { applicationsRouter } from "@src/routes/applications";
import scrapeInstructionsRoutes from "@src/routes/scraping"
import mongoose from "mongoose";
import {checkAuth} from "@src/middleware/check-auth";
import session from 'express-session' ;
import dotenv from 'dotenv';
import CV from '@src/models/cv/CV'
import fs from 'fs';
import https from 'https';
import User from '@src/models/user/User';
import cookieParser = require("cookie-parser");
import { prisma } from "@src/utils/services/db";
import { Cache } from "@src/utils/services/cache";
dotenv.config();
import {client as stripeClient} from '@src/models/stripe/client'
import { BaseStripeErrorHandler } from "@src/models/stripe/utils/ErrorHandler";


const app = express();
const port = process.env.PORT || 3000;
app.use(cookieParser())
const cors = require('cors');
app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    methods: 'GET, POST, PATCH, DELETE',
    strict: true
}));


app.use('/webhook', WebhookRouter);
app.use(express.json());

app.use('/login', loginRoutes);
app.use('/logout', logoutRoutues)
app.use('/billing', billingPublicRouter)
app.use(checkAuth);

app.use('/billing', billingRouter)
app.use('/scraping', scrapeInstructionsRoutes )
app.use('/users', UserRoutes );
app.use('/applications', applicationsRouter)

process.on('SIGINT', async () => {
    // await client.$disconnect();
    process.exit();
})

const httpsOptions = {
    key: fs.readFileSync('./src/utils/services/ssl/_cert.pem'),
    cert: fs.readFileSync('./src/utils/services/ssl/_cert.pem')
}

mongoose
.connect(process.env.MONGO_URI as string)
.then(() => {
console.log("database connected successfully")
    const server = https.createServer(httpsOptions, app).listen(port, async () => {
        await Cache.ping()
        await prisma.$connect()
        console.log('Server running at ' + port)
    })
})
.catch((err) => console.log("program crashed", err));


