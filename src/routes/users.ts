import { Router, Request, Response, NextFunction } from 'express';
import {check, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import { UsersController } from '@src/controllers/user/user_controller';
import { generateS3PresignedURL, createS3Folder } from '@src/utils/services/createS3Folder';
import User, { UserType } from '@src/models/user/User';
import fs from 'fs';
import CV from '@src/models/cv/CV';

const usersController = new UsersController();
const router = Router();


router.get('/profile', 
async (req: any, res: Response, next: NextFunction) => {
        try{
            const user = await usersController.getUser(req.userData.userId);
            if(!user){
                res.status(500).send('User not found');
                return
            }
            
            const { name, given_name, family_name, email, bio,  cv_uploaded, linkedin, github, personal_website, details } = user ;
            const resp = {  name, given_name, bio, family_name, email, cv_uploaded, linkedin, github, personal_website, details };
            return res.status(200).json(resp);
            
        }catch(e){
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


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
                    if(!folder){
                        await usersController.deleteUser(id.id);
                        res.status(500).send('User not created');
                    }
                    req.userData.userId = id;
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


router.get('/cv/scratch/',
    async (req: any, res: Response, next: NextFunction) => {
        try {
           
            const email = req.userData.email;
            const name = req.userData.name;
            const cv = await usersController.createEmptyCV(email, name);
            if (!cv) {
                res.status(500).send('CV not created');
                return
            }
            return res.status(200).json(cv);

        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


// CV Endpoints 
router.get('/cv',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            // console.log(req.userData)
            // console.log(req.userData.userId)
            
            const cv = await usersController.getCV(req.userData.email);
            return res.status(200).json(cv);

        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv_url', 
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const user = await usersController.getUser(req.userData.userId);
            const url = await generateS3PresignedURL(process.env.AWS_BUCKET_NAME as string, ((user as UserType).email) + '_cv');
            

            return res.status(200).json({ upload_location: url });
        } catch (e) {
            console.log(e)
        }
    })


router.post('/details', 
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const user = await usersController.updateDetails(req.userData.email, req.body);
            if (typeof user !== 'number') {
                return res.status(200).json(user);
            } else {
                res.status(user).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/education',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateEducation(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.delete('/cv/education/:id',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.deleteEducation(req.userData.email, req.params.id)
            if(typeof cv !== 'number'){
                return res.status(200).json(cv);
            }else{
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/work',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateWork(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)

router.delete('/cv/work/:id',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.deleteWork(req.userData.email, req.params.id)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/projects',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateProjects(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)

router.delete('/cv/projects/:id',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.deleteProject(req.userData.email, req.params.id)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/volunteer',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateVolunteer(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.delete('/cv/volunteer/:id',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.deleteVolunteer(req.userData.email, req.params.id)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/achievements',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateAchievements(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/skills',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateSkills(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/certifications',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateCertificates(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/description',
    async (req: any, res: Response, next: NextFunction) => {
        try {

        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/cv/languages',
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const cv = await usersController.updateLanguages(req.userData.email, req.body)
            if (typeof cv !== 'number') {
                return res.status(200).json(cv);
            } else {
                res.status(cv).send();
            }
        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)





export default router;