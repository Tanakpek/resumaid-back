// import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import { PrismaClient } from "@prisma/client";

import CV from "@src/models/cv/CV";
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

    async createEmptyCV(email: string, name: string): Promise<any|false>{
        try{
            const cv = await CV.create({
                name: name,
                title: '',
                email: email,
                education: [],
                achievements_and_awards: [],
                professional_certifications: [],
                skills: [],
                languages: [],
                projects: {},
                volunteer: [],
                work: {},
                description: ''
            })
            return cv
        }
        catch(e){
            console.log(e);
            return false
        }
    }

}