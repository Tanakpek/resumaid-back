import { Router, Request, Response, NextFunction } from 'express';
import { body, check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { ORIGIN, DATA_API_URL, DOCGEN_API_URL } from '@src/config/vars';
import { ScrapeInstructionsController } from '@src/controllers/scraper/scrape_instruction_controller';
import User from '@src/models/user/User';
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { file } from 'googleapis/build/src/apis/file';
import { JobCV } from '@src/utils/openapi/python';
import fs from 'fs';
import { AuthenticatedRequest } from '@src/controllers/user/types';
import { GenerateResumeRequest } from '@src/utils/openapi/node/types';
import { ScrapingInstructions } from '@src/models/scraping/scraping_instructions';
import { jobs, runs } from '@prisma/client';
import { RunCreateData, RunCreateUncheckedData } from '@src/models/runs/run';
import { JobCreateUncheckedData } from '@src/models/jobs/job';
import { RunsController } from '@src/controllers/runs/runs_controller';
dotenv.config();
const router = Router();
const scrape_instruction_controller = new ScrapeInstructionsController();
const run_controller = new RunsController();
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
], async (req: AuthenticatedRequest<any, any, ScrapingInstructions>, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.userData.userId).populate('cv');
        req.body
        const cv = user.cv;
        const body = req.body;

        
        const prep:any = { ...req.body, cv }
        prep.user_id = req.userData.userId
        let job_string = ''
        job_string += `Job Title: ${body.job_title}\n`
        job_string += `Company: ${body.company}\n`
        job_string += `Recruiter Name: ${body.recruiter !== "" ? body.recruiter : 'Information Not Available'}\n`
        job_string += `Job Description: ${body.description}\n`
        prep.job = job_string
        
        let run : RunCreateUncheckedData | undefined = undefined;
        let job: JobCreateUncheckedData = {
            job_board: body.job_board,
            unique_id : body.job_board + '&' + body.job_id ,
            company: body.company,
            title: body.job_title,
            recruiter_name: body.recruiter,
            active: true,
        };
        if (! (process.env.TESTING === 'true')) {
            await fs.readFile('seed/1/data/seed_1.json', 'utf8', async (err, data) => {
                const r = JSON.parse(data)
                prep.cv = {...r.cv}
             })

        }
        else {
            const response: AxiosResponse<JobCV> = await axios(DATA_API_URL + '/api/v1/generate/cv/curate/', {
                method: 'post',
                // responseType: 'stream', // Ensure response is returned as a stream,
                data: prep
            });
            delete prep.cv;
            prep.cv = {...response.data};
            
            const input_tokens = parseInt(response.headers['x-input-tokens'])
            const output_tokens = parseInt(response.headers['x-output-tokens'])
            run = {
                input_tokens,
                output_tokens,
                applicant: req.userData.userId,
                job_board: body.job_board,
                application: req.userData.userId + '@' + job.unique_id,
                type: 'resume',
                success: true
            }
            
            if (response.status !== 200) {
                run.success = false;
                await run_controller.postRun(run, job);
                res.status(500).send('There was an error, please try again later');
            }
        }

        
        
        
        
        const payload : GenerateResumeRequest = {
            data: prep,
            style: 0,
            userData: {
                email: user.details.email,
                github: user.details.github,
                linkedin: user.details.linkedin,
                website: user.details.personal_website,
                phone: user.details.phone_number,
                // todo add location
            }
        }
        fs.writeFileSync('payload.json', JSON.stringify(payload))
        const fileResponse = await axios(DOCGEN_API_URL + '/api/cvs/', {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
            },
            responseType: 'stream', // Ensure response is returned as a stream,
            data: payload
        });
        if(fileResponse.status !== 200) {
            run.success = false;
            await run_controller.postRun(run, job);
            res.status(500).send('There was an error, please try again later');
            return
        }
        res.setHeader('Content-Type', 'application/pdf');
        fileResponse.data.pipe(res);

        fileResponse.data.on('error', (err: Error) => {
            console.error('Error in stream:', err);
            run.success = false;
            res.status(500).send('Error while downloading the file');
        });
        await run_controller.postRun(run, job);
        return fileResponse

    } catch (e) {
        console.log(e)
        res.status(500).send('There was an error, please try again later');
    }
})

// NO NEED FOR DOCGEN API YET
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
        // add logic to check if style is present
        prep.style = prep.style ? prep.style : 'classic'
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