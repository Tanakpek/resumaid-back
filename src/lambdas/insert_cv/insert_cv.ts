import { promisify } from "util";
const delay = promisify(setTimeout)
import CV  from '../../models/cv/CV'
import mongoose from "mongoose";
import User from "../../models/user/User";
import dotenv from 'dotenv';
dotenv.config();
const handler = async (event:any, context:any) => {
    console.log('aws lambda handler called');
    await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(async () => {
            console.log("database connected successfully")
            
            try{
                // create a new CV
                console.log(event)
                const data = JSON.parse(event);
                data['user'] = data['user'].split('_cv')[0];
                data['cv_object']['email'] = data['user']
                const cv = new CV(data['cv_object']);
                await cv.save();

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
