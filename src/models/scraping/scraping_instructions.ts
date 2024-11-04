


export interface ScrapingPage {
    id: string
    path_url: string
    instructions: {
        instructions: any[]
    }
    job_board: string,
    job_id_param:string
}

export interface ScrapingInstructions {
    company: string,
    description: string,
    job_board: string,
    job_id: string,
    job_scraping_page: string,
    job_title: string,
    recruiter: string,
    special_instructions: string
}
