// import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

import CV from "@src/utils/applicaid-ts-utils/models/cv/CV";
export class CVsController {
    private prisma = new PrismaClient();
    constructor(){

    }

    async getCV(id: string): Promise<any|false>{
        try{
            const u = await CV.findOne({email: id})
            return u;
        }
        catch(e){
            console.log(e);
            return false
        }
    }

}