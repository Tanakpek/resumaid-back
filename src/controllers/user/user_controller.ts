// import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import { createUser } from "./types";
import User  from '@src/models/user/User'
import { CVsController } from "../cv/cv_controller";
import { PrismaClient } from "@prisma/client";
export class UsersController {
    private prisma = new PrismaClient();
    private CVsController = new CVsController();
    constructor(){

    }
    async createUser(user : createUser) : Promise<any | false> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try{
            const data = {
                email: user.email,
                name: user.name,
                given_name: user.given_name,
                family_name: user.family_name
            }
            const userdata = {...data, password: hashedPassword }
            let new_user = await User.create(userdata)
            new_user = await new_user.save()
            try{
                await this.prisma.user.create(
                    {
                        data: {
                            email: user.email,
                        }
                    }
                )
            }
            catch(e){
                await User.deleteOne({id: new_user.id})
                console.error(e);
            }
            return new_user
        }
        catch(e){
            console.error(e);
        }
        return false
    }

    async getUser(id: string): Promise<any|false>{
        try{
            const u = await User.findById(id)
            return u;
        }
        catch(e){
            console.log(e);
            return false
        }
    }

    async deleteUser(id: string){
        try{
            await User.deleteOne({id: id})
        }
        catch(e){
            console.error(e);
        }
    }

    async loginEmail(email: string, password: string){
        const u = await User.findOne({ email: email })
        if(u === null){
            return false;
        }
        else{
            try{
                const match = await bcrypt.compare(password, u.password);
                if(match){
                    return  {id: u.id, email: u.email}
                }
                else{
                    return false;
                }
            }
            catch(e){
                return false;
            }
        }
    }

    async getCV(email: string){
        return await this.CVsController.getCV(email)
    }
}