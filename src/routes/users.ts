import { Router, Request, Response, NextFunction } from 'express';
import {check, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import { UsersController } from '@src/controllers/user/user_controller';
import { generateS3PresignedURL, createS3Folder } from '@src/utils/services/createS3Folder';



const usersController = new UsersController();
const router = Router();

router.get('/profile', 
async (req: any, res: Response, next: NextFunction) => {
        try{
            const user = await usersController.getUser(req.session.userId);
            return res.status(200).json(user);
            
        }catch(e){
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)

router.get('/cv',
async (req: any, res: Response, next: NextFunction) => {
        try{
            console.log(req.session)
            console.log(req.session.userId)
            const cv = await usersController.getCV(req.session.email);
            return res.status(200).json(cv);
            
        }catch(e){
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)

router.post('/cv_url',async (req: any, res: Response, next: NextFunction) => {
    try{
        const user = await usersController.getUser(req.session.userId);
        const url = await generateS3PresignedURL(process.env.AWS_BUCKET_NAME as string, user.email + '_cv');
        console.log(url)
        
        return res.status(200).json({upload_location: url});
    }catch(e){
        console.log(e)
    }
})

// create
router.post('/', [
    check('email').isEmail(),
    check('name').notEmpty(),
    check("password").notEmpty() // .isStrongPassword()
],
async (req: any, res: Response, next: NextFunction) => {
        try{
            if(validationResult(req).isEmpty()){
                const user = req.body;
                const newuser = await usersController.createUser(user);
                if(newuser){
                    const id = newuser;
                    const folder = await createS3Folder(id.email);
                    console.log(folder)
                    if(!folder){
                        await usersController.deleteUser(id.id);
                        res.status(500).send('User not created');
                    }
                    req.session.userId = id;
                    console.log('created user')
                    res.status(200)
                }
                else{
                    res.status(500).send('User not created');
                }
            }
            else{
                res.status(500).send('User not created');
            }
            
        }catch(e){
            res.status(500).send('There was an error, please try again later');
        }
    }
)

export default router;