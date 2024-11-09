import { prisma } from '@src/utils/services/db'
import { runs, jobs } from '@prisma/client'
import { RunCreateData, RunCreateUncheckedData } from '@src/models/runs/run';
import { JobCreateData, JobCreateUncheckedData } from '@src/models/jobs/job';
import { connect } from 'cookies';
import { create } from 'domain';

export class RunsController {
    private prisma = prisma
    constructor() {

    }

    async getRuns(runsFilter:any, cursor:string): Promise<any | false> {
        try {
            const u: any = await this.prisma.runs.findMany()
            return {
                data: u,
                ts: Date.now()
            };
        }
        catch (e) {
            console.log(e);
            return false
        }
    }


    async postRun(run: RunCreateUncheckedData, job: JobCreateUncheckedData ): Promise<any | false> {
        try {
            const insert_run:any = run
            const insert_job:any = job
            delete insert_run.job
            delete insert_run.application
            const applicant = insert_run.applicant
            delete insert_run.applicant

            const a = await prisma.runs.create({
                data: {
                    ...insert_run,
                    applications: {
                        connectOrCreate: {
                            where: {
                                id: applicant + '@' + job.unique_id
                            },
                            create: {
                                applicants: {
                                    connect: {
                                        id: applicant
                                    }
                                },
                                status: 'new',
                                id: applicant + '@' + job.unique_id,
                                jobs: {
                                    connectOrCreate: {
                                        where: {
                                            unique_id: job.unique_id
                                        },
                                        create: {job, creation_dt: new Date().toISOString()}
                                    }
                                }
                            }
                        }
                    },
                    applicants: {
                        connect: {
                            id: applicant
                        }
                    }
                }
            })
            await prisma.applications.update({
                where: {
                    id: applicant + '@' + job.unique_id
                },
                data: {
                    last_update_dt: new Date().toISOString()
                }
            })

        }
        catch (e) {
            console.log(e);
            return false
        }
    }
}