import { promisify } from "util";
const delay = promisify(setTimeout)
import CV from "../../models/cv/CV";
import mongoose from "mongoose";
import User from "../../models/user/User";

import dotenv from 'dotenv';
import { makeImmutable } from "../../utils/lambda_helpers";
dotenv.config();


const main = async () => {
    
    mongoose
        .connect(process.env.MONGO_URI as string)
        .then(() => console.log("database connected successfully"))
    console.log(process.env.MONGO_URI)
    // const cv = await CV.create({
    //     name: 'Efe Akpobome',
    //     email: 'a',
    //     family_name: 'Akpobome',
    //     given_name: 'Efe',
    //     education: [],
    //     achievements_and_awards: [],
    //     professional_certifications: [],
    //     skills: [],
    //     languages: [],
    //     projects: {},
    //     volunteer: [],
    //     work: {},
    //     description: ''
    // })

    const cv = await CV.findOne({ email: 'a'})
    console.log(cv)
    await User.findOneAndUpdate({email: 'akpektan@gmail.com'}, { $set: { cv: cv._id, cv_uploaded: true }})
    
}
main()