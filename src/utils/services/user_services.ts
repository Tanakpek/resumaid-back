import axios from 'axios';
import dotenv from 'dotenv'
import qs from 'qs';
dotenv.config();
import {  GOOGLE_OAUTH_CLIENT_ID , GOOGLE_OAUTH_REDIRECT_URI} from '../../config/vars';
import { access } from 'fs';

export const getGoogleAuthTokens = async (code:string) => {
    const url = 'https://oauth2.googleapis.com/token';
    const values = {
        code,
        client_id: GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
    }
    try{
        const response = await axios.post(url, qs.stringify(values), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        return response.data;
    }
    catch(e:any){
        console.error(e)
    }
}

export const getGoogleUserInfo = async (id_token:string, access_token:string) => {
    try{
        const res = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?${id_token}`, {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        })
        return res
    }catch(e:any){
        console.error(e?.response?.data)
    }
}