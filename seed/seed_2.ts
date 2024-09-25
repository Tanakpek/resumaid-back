
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
        console.log('connected to db')
        // delete mongo users
        await User.deleteMany({})
        await CV.deleteMany({})
        await fs.readFile('seed/data/seed_1.json', 'utf8', async (err, data) => {
            const user = JSON.parse(data)
            delete user.cv
            // first creating user document in mongo 
            const user_mongo = await User.create(user)

            // use unique id from mongo to check if user exists in postgres and delete if so
            const user_postgres = await client.applicants.findFirst(
                {
                    where: {
                        id: user_mongo.id
                    }
                }
            )
            if (user_postgres) {
                await client.applicants.delete({
                    where: {
                        id: user_mongo.id
                    }
                })
            }

            // if user already exists in stripe, delete them
            await stripeClient.customers.del(user_postgres.stripe_id).catch((err) => {
                console.log(err)
                console.log('could not delete customer')
            })

            // create user in stripe
            const stripe_customer = await stripeClient.customers.create({
                email: user_mongo.email,
                metadata: {
                    user_id: user_mongo.id
                }
            })

            // create user in postgres with mongo id, with stripe id attached
            await client.applicants.create({
                data: {
                    email: user_mongo.email,
                    stripe_id: stripe_customer.id,
                    id: user_mongo.id
                }
            }).catch((err) => {
                console.log(err)
                console.log('Something went wrong with postgres')
            })

            await mongoose.connection.close()
        })

    })

