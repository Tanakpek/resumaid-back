// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { ScrapingPage } from "@src/models/scraping/scraping_instructions";

export class ScrapeInstructionsController {
    private prisma = new PrismaClient()
    constructor() {
        const a  = this.prisma.job_scraping_pages.findFirst();
    }

    async getScrapeInstructions(): Promise<any | false> {
        try {
            const u: any = await this.prisma.$queryRaw`
            select private.job_scraping_pages.id, path_url, job_board, instructions, name, root_url , job_id_param
            from private.job_scraping_pages 
            join private.job_boards on private.job_scraping_pages.job_board = private.job_boards.id;
            ` as ScrapingPage
            return {
                data:u,
                ts: Date.now()
            };
        }
        catch (e) {
            console.log(e);
            return false
        }
    }
}