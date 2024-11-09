import { Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { prisma } from '@src/utils/services/db'

export class ApplicationsController {
    private prisma = prisma
    constructor() {

    }

    async getApplications(id:string, ts:string, filters: {company?:string, job_board?:string}): Promise<any | false> {
        try {
            const query : any = {
                where: {
                    applicant: id,
                    creation_dt: {
                        lte: ts
                    }
                },
                orderBy: {
                    creation_dt: 'desc'
                },
                take: 10,
                include: {
                    jobs: {
                    },
                    runs: {
                        where: {
                            dt: {
                                lte: ts
                            }
                        },
                        take: 10, // Limit to the last 10 posts
                        orderBy: {
                            dt: 'desc', // Order by creation date in descending order to get the latest posts
                        },
                    },
                },
            }
            if(filters.company){
                query.where.company = filters.company
            }
            if(filters.job_board){
                query.where.job_board = filters.job_board
            }
            const applications = await this.prisma.applications.findMany(query)

            applications.forEach((application:any) => {
                application.job = application.jobs
                delete application.jobs
            })
            return applications;
        }
        catch (e) {
            console.log(e);
            return false
        }
    }

    async changeApplicationStatus(applicant:string, id:string, status:string): Promise<any | false> {
        try {
            const application = await this.prisma.applications.update({
                where: {
                    id: id,
                    applicant: applicant
                },
                data: {
                    status: status
                }
            })
            return application;
        }
        catch (e) {
            console.log(e);
            return false
        }
    }

}