import { promisify } from "util";
const delay = promisify(setTimeout)
import CV from "../../models/cv/CV";
import mongoose from "mongoose";
import User from "../../models/user/User";

import dotenv from 'dotenv';
import { makeImmutable } from "../../utils/lambda_helpers";
import AWS from 'aws-sdk';
dotenv.config();
const handler = async (event:any, context:any) => {
    AWS.config.update({ region: process.env.AWS_REGION });
    let ssm = new AWS.SSM();

    const options = {
        Name: process.env.MONGO_URI, /* required */
    };
    const parameter = await ssm.getParameter(options).promise()
    const MONGO_URI = parameter.Parameter?.Value
    await mongoose
    .connect( MONGO_URI as string)
    .then(async () => {
            console.log("database connected successfully")
            
            try{
                // create a new CV
                console.log(event)
                const data = JSON.parse(event);
                data['user'] = data['user'].split('_cv')[0];
                
                data['cv_object']['email'] = data['user']
                data['cv_object']['education'].forEach((element: { [key: string]: any }) => {
                    element['immutable'] = true
                });
                data['cv_object']['achievements_and_awards'] = makeImmutable(data['cv_object']['achievements_and_awards'])
                data['cv_object']['professional_certifications'] = makeImmutable(data['cv_object']['professional_certifications'])
                data['cv_object']['skills'] = makeImmutable(data['cv_object']['skills'])
                data['cv_object']['languages'] = makeImmutable(data['cv_object']['languages'])
                Object.values(data['cv_object']['projects']).forEach((element: { [key: string]: any }) => {
                    element['immutable'] = true
                    element['takeaways'] = makeImmutable(element['takeaways'])
                })
                Object.values(data['cv_object']['work']).forEach((elements: any[]) => {
                    elements.forEach((element: { [key: string]: any }) => {
                        element['immutable'] = true
                        element['takeaways'] = makeImmutable(element['takeaways'])
                    })
                })
                data['cv_object']['volunteer'].forEach((element: { [key: string]: any }) => {
                    element['immutable'] = true
                    element['takeaways'] = makeImmutable(element['takeaways'])
                })
                
                const cv = await CV.create(data['cv_object']);
                console.log(cv)
                console.log('good')
                await User.findOneAndUpdate({email: data['user']}, { $set: {cv: cv._id, cv_uploaded: true }})
                

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'all good'
                    })
                };
            }
            catch(err){
                // return error response
                console.error(err);
                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: err
                    })
                };
            }


        }
    ).catch((err) => {
        console.log("error connecting to mongodb", err)
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err
            })
        };
    })
    
    
};
exports.handler = handler
