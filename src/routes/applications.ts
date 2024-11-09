import { Router, Request, Response, NextFunction } from 'express';
import { query } from 'express-validator';
export const applicationsRouter = Router();
import { check } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { ApplicationsController } from '@src/controllers/applications/applications_controller'
import { AuthenticatedRequest } from '@src/controllers/user/types';
const applicationsController = new ApplicationsController();

applicationsRouter.get('/',
    [
        query('ts').isString().isISO8601()
    ],
    async (req: AuthenticatedRequest<any,any,any>, res: Response, next: NextFunction) => {
    try {
        const id = req.userData.userId
        const { ts, company, job_board }: any = req.query;
        console.log(ts)
        console.log(id)
        const applications = await applicationsController.getApplications(id, ts, { company, job_board })
        console.log(applications)
        res.status(200).json(applications)
    } catch (e) {
        res.status(500).send('There was an error, please try again later');
    }
})