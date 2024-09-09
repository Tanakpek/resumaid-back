import jwt, { JwtPayload } from 'jsonwebtoken';
import express, { Request, Response } from 'express';
import { HttpError } from 'src/utils/helper_classes';
import session from 'express-session';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();

export const checkAuth = (req: any, res: Response, next:any) => {
  try {
    // console.log('here')
    try{
      const decodedToken: string | JwtPayload = jwt.verify(req.cookies.token, process.env.JWT_SECRET as string);
      if (typeof decodedToken === 'string') {
        throw new Error();
      }
      req['userData'] = { userId: decodedToken.id, email: decodedToken.email, name: decodedToken.name };
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
    
    req['userData'] = { userId: decodedToken.id, email: decodedToken.email, name: decodedToken.name };
    // console.log(decodedToken)
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 401);
    console.log(error)

    res.sendStatus(401)
    return
  }
};