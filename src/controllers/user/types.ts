
import { Request as Req } from 'express';
export type createUser = {
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    password: string;
    entitlement?: string;
}

export interface userDataType {
    userId: string,
    email: string,
    name: string, plan: string, 
    subscription_status: string
 }

 export interface AuthenticatedRequest<A, B, C> extends Req<A,B,C> {
    userData: userDataType
 }