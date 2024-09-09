import { Router, Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { ORIGIN, DATA_API_URL } from '@src/config/vars';
import { ScrapeInstructionsController } from '@src/controllers/scraper/scrape_instruction_controller';
import User from '@src/models/user/User';
import axios from 'axios';
import { file } from 'googleapis/build/src/apis/file';
dotenv.config();
const router = Router();
const scrape_instruction_controller = new ScrapeInstructionsController();
router.get('/instructions/', async (req: Request, res: Response, next: NextFunction) => {
        try {
            const instructions = await scrape_instruction_controller.getScrapeInstructions();
            if (!instructions) {
                res.status(500).send('instructions not found');
                return
            }
            
            return res.status(200).json(instructions);

        } catch (e) {
            console.log(e)
            res.status(500).send('There was an error, please try again later');
        }
    }
)


router.post('/resume/',[
    // body('description').isString(),
    // body('description').isLength({ min: 10 }),
    // body('job_title').isString(),
    // body('job_title').isLength({ min: 5 }),
    // body('company').isString(),
    // body('company').isLength({ min: 2 }),
    // body('job_id').isString(),
    // body('job_board').isString(),
], async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userData.userId).populate('cv');
        const cv = user.cv;
        const body = req.body;
        const prep = { ...req.body, cv }
        console.log(req.userData.userId)
        prep.user_id = req.userData.userId
        let job_string = ''
        job_string += `Job Title: ${body.job_title}\n`
        job_string += `Company: ${body.company}\n`
        job_string += `Recruiter Name: ${body.recruiter !== "" ? body.recruiter : 'Information Not Available'}\n`
        job_string += `Job Description: ${body.description}\n`
        prep.job = job_string

        const fileResponse = await axios( DATA_API_URL + '/api/v1/generate/cv/curate/',{
            method: 'post' ,
            responseType: 'stream', // Ensure response is returned as a stream,
            data: prep
        });

        res.setHeader('Content-Disposition', fileResponse.headers['content-disposition']);
        res.setHeader('Content-Type', fileResponse.headers['content-type']);
        fileResponse.data.pipe(res);
        fileResponse.data.on('error', (err: Error) => {
            console.error('Error in stream:', err);
            res.status(500).send('Error while downloading the file');
        });
        return fileResponse

    } catch (e) {
        console.log(e)
        res.status(500).send('There was an error, please try again later');
    }
})

router.post('/cover/', [
    // body('description').isString(),
    // body('description').isLength({ min: 10 }),
    // body('job_title').isString(),
    // body('job_title').isLength({ min: 5 }),
    // body('company').isString(),
    // body('company').isLength({ min: 2 }),
    // body('job_id').isString(),
    // body('job_board').isString(),
], async (req: any, res: Response, next: NextFunction) => {
    
    try {
        const user = await User.findById(req.userData.userId).populate('cv');
        const cv = user.cv;
        const body = req.body;
        const prep = { ...req.body, cv }
        prep.user_id = req.userData.userId
        let job_string = ''
        job_string += `Job Title: ${body.job_title}\n`
        job_string += `Company: ${body.company}\n`
        job_string += `Recruiter Name: ${body.recruiter !== "" ? body.recruiter : 'Information Not Available' }\n`
        job_string += `Job Description: ${body.description}\n`

        prep.job = job_string
        const fileResponse = await axios(DATA_API_URL + '/api/v1/generate/cover_letter/', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'stream', // Ensure response is returned as a stream,
            data: prep
        });
        res.setHeader('Content-Disposition', fileResponse.headers['content-disposition']);
        res.setHeader('Content-Type', fileResponse.headers['content-type']);

        // Pipe the Python server response directly to the client
        fileResponse.data.pipe(res);
        fileResponse.data.on('error', (err:Error) => {
            console.error('Error in stream:', err);
            res.status(500).send('Error while downloading the file');
        });
        console.log(fileResponse)
        // res.setHeader('Content-Disposition', 'attachment; filename="document.docx"');
        // res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        // res.setHeader('Content-Type', 'application/pdf');
        // fileResponse.data.pipe(res);
        return fileResponse

    } catch (e) {
        console.log(e)
        res.status(500).send('There was an error, please try again later');
    }
})

export default router