import { CVInfo } from "@src/utils/applicaid-ts-utils/cv_type";
import { JobCV } from "@src/utils/openapi/python";

enum CVStyle {
    CLASSIC = 0,
}


export interface GenerateResumeRequest {
    data: {
        company: string,
        description: string,
        job_board: string,
        job_id: string,
        job_title: string,
        recruiter: string,
        job_scraping_page: string,
        special_instructions: string,
        cv: JobCV,
        user_id: string
    }
    style: CVStyle;
    userData: {
        email: string,
        github?: string,
        linkedin?: string,
        website?: string,
        phone?: string,
        location?: {
            city: string,
            state: string,
            line1?: string | undefined,
            line2?: string | undefined,
            postal_code?: string | undefined,
            country_code?: string | undefined
        },
    }
}