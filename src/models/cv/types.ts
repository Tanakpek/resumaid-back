import  mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;


interface Project {
    takeaways: string[];
}

interface WorkExperience {
    role: string;
    dates: [string, string] | [string] ;
    takeaways: string[];
}

interface Volunteer {
    organization_name: string;
    role: string;
    takeaways: string[];
    dates: [string, string] | [string];
}

interface Education {
    institution: string;
    location?: string;
    degree?: string;
    dissertation?: string;
    thesis?: string;
    dates?: [string, string] | [string];
    score?: string;
    classification?: string;
    gpa?: number;
}

interface CVInfo {
    name: string;
    title?: string;
    education: Education[];
    achievements_and_awards: string[];
    description?: string;
    projects: Record<string, Project>;
    volunteer: Volunteer[];
    work: Record<string, WorkExperience[]>;
    skills: string[];
    languages: string[];
    professional_certifications: string[];
}

