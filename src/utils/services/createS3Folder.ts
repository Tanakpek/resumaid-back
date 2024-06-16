
import { S3, GetObjectCommand, S3ClientConfig, S3Client, PutObjectCommand } from   "@aws-sdk/client-s3"// 1.0.0-gamma.2 version
import { S3RequestPresigner }  from "@aws-sdk/s3-request-presigner"; // 0.1.0-preview.2 version
import { createRequest } from "@aws-sdk/util-create-request"; // 0.1.0-preview.2 version
import { formatUrl } from "@aws-sdk/util-format-url"; 
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from'dotenv'
dotenv.config();

const s3Configuration: S3ClientConfig = {
    credentials: {
        accessKeyId: process.env.AWS_BUCKET_KEY || 'fail', 
        secretAccessKey: process.env.AWS_BUCKET_SECRET || 'fail'
    },
    region: process.env.AWS_REGION || 'us-west-2',
};
const s3:any = new S3Client(s3Configuration);


export const generateS3PresignedURL = async (BUCKET:string, Key:string) => {
    const command:any = new PutObjectCommand({Bucket: BUCKET, Key: Key});
    const url = await getSignedUrl(s3, command, {expiresIn: 3600,
        
    })
    return url
}


export const createS3Folder = async (folderName: string, metadata?:object) => {

    try{
        const input:any = { // PutObjectRequest
            Body: "", // 
            Bucket: "gb-cvs", // required
            Key: folderName , // required
            metadata: metadata
          };
          const command = new PutObjectCommand(input);
          const response = await s3.send(command);
          return response
    }catch(e){
        console.error(e);
    }
}


    

