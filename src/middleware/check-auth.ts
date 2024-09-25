import jwt, { JwtPayload } from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import { HttpError } from 'src/utils/helper_classes';
import session from 'express-session';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import Cookies from 'cookies';
import { UsersController } from '@src/controllers/user/user_controller';
dotenv.config();

const usersController = new UsersController();

export const checkAuth = (req: any, res: Response, next:any) => {
  try {
    // console.log('here')
    try{
      const decodedToken: string | JwtPayload = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string);
      if (typeof decodedToken === 'string') {
        throw new Error();
      }
      req['userData'] = { userId: decodedToken.id, email: decodedToken.email, name: decodedToken.name, plan: decodedToken.plan, subscription_status: decodedToken.subscription_status };
      return next()
    }
    catch(e){
        console.log('cookie authentication failed')
    }

    let token = req?.headers?.authorization?.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!, No Token Provided');
    }
    const decodedToken : string | JwtPayload = jwt.verify(token, process.env.JWT_SECRET as string);
    
    if(typeof decodedToken === 'string'){
        throw new Error('Authentication failed!');
    }
    
    req['userData'] = { userId: decodedToken.id, email: decodedToken.email, name: decodedToken.name, plan: decodedToken.plan, subscription_status: decodedToken.subscription_status };
    // console.log(decodedToken)
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    console.log(error)

    res.sendStatus(401)
    return
  }
};

export const resetCookie = async (req: any, res: Response, next: any) => {
  const cookies = new Cookies(req, res);
  if (req.query?.stripe_session_id){
    console.log(req.query?.stripe_session_id)
    try {
      // console.log('here')
      const userData = req['userData'];
      console.log(userData)
      const login = await usersController.loginEmail(userData?.email, userData?.id);
      if (login) {
        console.log(login)
        const token = jwt.sign(
          {
            id: login.id,
            email: login.email,
            name: login.name,
            plan: login.plan || null,
            subscription_status: login.subscription_status || null,
            billing_id: login.billing_id || null,
            dsad: 'sadasd'
          },
          process.env.JWT_SECRET as string,
          { expiresIn: '1h' }
        );
        console.log(token)
        res.cookie('token',token, { httpOnly: true, secure: true, sameSite: 'strict' })
      }
      next()
      // return next()
      
    } catch (err) {
      const error = new HttpError('Cookie Reset Failed', 401);
      console.log(err)

      res.sendStatus(401)
      return
    }
  }
  else{
    next()
  }
};

