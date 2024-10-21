import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { Cache } from "./cache";
export const prisma = new PrismaClient()

export const cleanup = async () => {
    try{
        await prisma.$disconnect()
    }
    catch(e){
        console.log(e)
    }
    try{
        await mongoose.connection.close()
    }
    catch (e) {
        console.log(e)
    }
    try{
        await Cache.quit()
    }
    catch (e) {
        console.log(e)
    }
    
}