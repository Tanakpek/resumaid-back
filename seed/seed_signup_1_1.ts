
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
import { cleanup, prisma } from "@src/utils/services/db";
import { client as stripeClient } from '@src/models/stripe/client'
import { Cache, bootstrap } from "@src/utils/services/cache";
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
    await prisma.$connect()
    
    console.log('connected to db')
    // delete mongo users
    await User.deleteMany({})
    await CV.deleteMany({})
    await fs.readFile('seed/data/seed_1.json', 'utf8', async (err, data) => {
        const user = JSON.parse(data)
        let cv = user.cv
        cv = await CV.create(cv)
        user.cv = cv
        await Cache.ping().then(async () => {
            await Cache.flushall()
            console.log('redis connected')
        })
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

        if(user_postgres.subscription){
            await stripeClient.subscriptions.cancel(user_postgres.subscription).catch((err) => {
                console.log(err)
                console.log('could not cancel subscription')
            })
            await client.applicants.update({
                where: {
                    id: user_mongo.id
                },
                data: {
                    subscription: null
                }
            })
            
        }
        
        await client.subscriptions.deleteMany()
        await client.payment_methods.deleteMany()
        await client.applicants.delete({
            where: {
                id: user_mongo.id
            }
        })
        
        // if user already exists in stripe, delete them
        if(user_postgres){
            await stripeClient.customers.del(user_postgres.stripe_id).catch((err) => {
                console.log(err)
                console.log('could not delete customer')
            })
        }
       

        // create user in stripe
        const stripe_customer = await stripeClient.customers.create({
            name: user_mongo.name,
            email: user_mongo.email
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
        await bootstrap()
        await cleanup()
    })
    
})

