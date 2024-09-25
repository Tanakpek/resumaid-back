import { Router, Request, Response, NextFunction } from 'express';
import {check, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import { UsersController } from '@src/controllers/user/user_controller';
import { verify, decode } from 'jsonwebtoken';
import dotenv from 'dotenv'
import { ORIGIN } from '@src/config/vars';
import { getGoogleAuthTokens, getGoogleUserInfo } from '@src/utils/services/user_services';
import { createUser } from '@src/controllers/user/types';
import { generateS3PresignedURL, createS3Folder } from '@src/utils/services/createS3Folder';

dotenv.config();
const usersController = new UsersController();
const bucket_name = process.env.AWS_BUCKET_NAME;
const router = Router();

// TODO flesh out cookie fields to match oauth routes for these two email ones
//login
router.post('/email', [
    check('email').isEmail(),
    check('password').notEmpty()
],
async (req: Request, res: Response, next: NextFunction) => {
    if(validationResult(req).isEmpty()){
        const {email, password} = req.body;
        const login = await usersController.loginEmail(email, password);

        if(login){
            const token = jwt.sign(
                {id: login},
                process.env.JWT_SECRET as string, 
                {expiresIn: '1h'}
            );
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            res.status( 200 );
        }
        else{
            res.status(500).send('Invalid credentials');
        }
    }
    else{
        res.status(500).send('User not found');
    }
    }
)

//login for oauth
router.get('/email', 
async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    const {email, password} = req.body;
    const login = await usersController.loginEmail(email, password);
        if(login){
            const token = jwt.sign(
                {id: login},
                process.env.JWT_SECRET as string, 
                {expiresIn: '1h'}
            );
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' })
            res.setHeader('Authorization', `Bearer ${token}`)
            res.status(200).json({token: token, id: login});
        }
        else{
            res.status(500).send('Invalid credentials');
        }
    }
)

router.get('/oauth',
async (req: any, res: Response, next: NextFunction) => {
    // get code from qs
    try{
            const code = req.query.code as string
            // get token from code
            const { id_token, access_token } = await getGoogleAuthTokens(code)
            const user_info = await getGoogleUserInfo(id_token, access_token)
            const login = await usersController.loginEmail(user_info?.data.email, user_info?.data.id);
            if(login){
                const token = jwt.sign(
                    { 
                        id: login.id,
                        email: login.email, 
                        name: login.name, 
                        plan: login.plan || null, 
                        subscription_status: login.subscription_status || null, 
                        billing_id: login.billing_id || null 
                    },
                    process.env.JWT_SECRET as string, 
                    {expiresIn: '1h'}
                );
                res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' })
                res.setHeader('Authorization', `Bearer ${token}`)
                res.redirect(`${ORIGIN}/profile`)
                return
            }
            const user = {
                email: user_info?.data.email,
                name: user_info?.data.name,
                given_name: user_info?.data.given_name,
                family_name: user_info?.data.family_name,
                password: user_info?.data.id, // not secure
                cv_uploaded: false,
                details: {
                    
                }
            }
            
            if(!user_info?.data.verified_email){
                res.status(500).send('Email not verified');
                return
            }
            const user_email = await usersController.createUser(user)
            
            if(user_email){
                await createS3Folder(user.email as string);
                const token = jwt.sign(
                    {
                        id: user_email.id,
                        email: user_email.email,
                        name: user_email.name,
                        user_email: user_email.email,
                        plan: user_email.plan || null,
                        subsription_status: user_email.subscription_status || null,
                        billing_id: user_email.billing_id 
                    },
                    process.env.JWT_SECRET as string, 
                    {expiresIn: '1h'}
                );
                await req.session.save();
                res.cookie('token', token, {httpOnly: true, secure: true, sameSite: 'strict'})
                res.setHeader('Authorization', `Bearer ${token}`)
                res.redirect(`${ORIGIN}/profile`)
                return
            }
        // get user info from token
    }catch(e){
        console.log('oauth login fuckup')
        console.log(e)
        return res.redirect(`${ORIGIN}/auth`)
    }
    res.status(200).send('ok');
})


const logout_router = Router();
logout_router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    await req.session.destroy(() => {
        res.redirect(`${ORIGIN}/login`)
    })
})

export const loginRoutes  = router
export const logoutRoutues = logout_router

