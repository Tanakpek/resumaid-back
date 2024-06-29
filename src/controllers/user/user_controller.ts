// import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import { createUser } from "./types";
import User, { UserType } from "@src/models/user/User";
import { CVsController } from "../cv/cv_controller";
import { PrismaClient } from "@prisma/client";
import { AchivevementFormValues, CertFormValues, EducationFormValues, LanguageFormValues, ProjectFormValues, SkillFormValues, VolunteerFormValues, WorkFormValues } from "@src/utils/applicaid-ts-utils/cv_form_types";
import CV from "@src/models/cv/CV";
import { CVInfo, Education, Project, WorkExperience } from "@src/utils/applicaid-ts-utils/cv_type";

export class UsersController {
    private prisma = new PrismaClient();
    private CVsController = new CVsController();
    constructor(){

    }
    async createUser(user : createUser) : Promise<any | false> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try{
            const data = {
                email: user.email,
                name: user.name,
                given_name: user.given_name,
                family_name: user.family_name
            }
            const userdata = {...data, password: hashedPassword }
            let new_user = await User.create(userdata)
            new_user = await new_user.save()
            try{
                await this.prisma.user.create(
                    {
                        data: {
                            email: user.email,
                        }
                    }
                )
            }
            catch(e){
                await User.deleteOne({id: new_user.id})
                console.error(e);
            }
            return new_user
        }
        catch(e){
            console.error(e);
        }
        return false
    }

    async getUser(id: string): Promise<UserType|false>{
        try{
            const u =  await User.findById(id)
            return u;
        }
        catch(e){
            console.log(e);
            return false
        }
    }

    async deleteUser(id: string){
        try{
            await User.deleteOne({id: id})
        }
        catch(e){
            console.error(e);
        }
    }

    async loginEmail(email: string, password: string){
        const u = await User.findOne({ email: email })
        if(u === null){
            return false;
        }
        else{
            try{
                const match = await bcrypt.compare(password, u.password);
                if(match){
                    return  {id: u.id, email: u.email, name: u.name}
                }
                else{
                    return false;
                }
            }
            catch(e){
                return false;
            }
        }
    }

    async getCV(email: string){
        const cv = await this.CVsController.getCV(email)
        if(cv){
            return cv
        }
    }

    async createEmptyCV(email: string, name:string){
        try{
            const cv = await this.CVsController.createEmptyCV(email, name)
            if(cv){
                await User.findOneAndUpdate({email: email}, { $set: { cv: cv._id, cv_uploaded: true }})
                return cv
            }
            else{
                return false
            }
        }catch(e){
            console.error(e)
            return 500
        }
    }

    async updateEducation(email: string, education: EducationFormValues){
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try{
            if (user) {
                const cv: typeof CV = user.cv
                if (cv) {
                    cv.education = education.education
                    const cv_new = await cv.save()
                    return cv_new
                }
            }
        }catch(e){
            console.error(e)
            return 500
        }
        
    }

    async deleteEducation(email: string, id: string){
        const user = await User.findOne({ email: email }).populate('cv')
        if(!user){
            return 404
        }
        try{
            const cv: typeof CV = user.cv
            cv.education = cv.education.filter((ed: Education) => ed._id !== id)
            const cv_new = await cv.save()
            return cv_new
        }catch(e){
            console.error(e)
            return 500
        }
    }

    async updateWork(email: string, work: WorkFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
            
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                const newWork = work.workplaces.reduce((acc: CVInfo['work'], curr) => {
                    if(curr.company in acc){
                        const comp = curr.company
                        delete curr.company
                        const wp: WorkExperience = { ...curr, dates: curr.startDate && curr.endDate ? [curr.startDate, curr.endDate] : [curr.startDate] } as WorkExperience
                        
                        acc[comp].push(wp)
                    }
                    else{
                        const comp = curr.company
                        delete curr.company
                        const wp: WorkExperience = { ...curr, dates: curr.startDate && curr.endDate ? [curr.startDate, curr.endDate] : [curr.startDate] } as WorkExperience
                        acc[comp] = [wp]
                    }
                    return acc
                }, {})
                cv.work = newWork
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async deleteWork(email: string, id: string) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        
        try {
            const cv: typeof CV = user.cv
            const newWork = cv.work
            
            for (const [key, array] of newWork.entries()) {
                newWork.set(key, array.filter((item:WorkExperience)=> item._id.toString() !== id));
                if(newWork.get(key).length === 0){
                    newWork.delete(key)
                }
            }

            await user.save();
            const cv_new = await cv.save()
            return cv_new
            
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateProjects(email: string, projects: ProjectFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                const pj = projects.projects.reduce((acc: CVInfo['projects'], curr) => {
                    if (curr.name in acc) {
                        const comp = curr.name
                        const wp: Project= { ...curr } as Project
                        acc[comp] = wp
                    }
                    else {
                        const name = curr.name
                        const wp: Project = { ...curr } as Project
                        acc[name] = wp
                    }
                    return acc
                }, {})
                cv.projects = pj
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async deleteProject(email: string, id: string) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv;
            cv.projects = cv.projects.filter((project: typeof CV['projects']) => project._id !== id)
            const cv_new = await cv.save()
            return cv_new
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateVolunteer(email: string, vol: VolunteerFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                const orgs = vol.organizations.map((org) => {
                    return {
                        organization_name: org.organization_name,
                        role: org.role,
                        startDate: org.startDate,
                        dates: org.startDate && org.endDate ? [org.startDate, org.endDate] : [org.startDate],
                    }
                })
                cv.volunteer = orgs
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async deleteVolunteer(email: string, id: string) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {

        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateLanguages(email: string, languages: LanguageFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                cv.work = languages.languages
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateAchievements(email: string, achievements: AchivevementFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                cv.achievements_and_awards = achievements.achievements_and_awards
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateCertificates(email: string, certs: CertFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                cv.professional_certifications = certs.certifications
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateDetails(email: string, education: EducationFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {

        } catch (e) {
            console.error(e)
            return 500
        }
    }

    async updateSkills(email: string, education: SkillFormValues) {
        const user = await User.findOne({ email: email }).populate('cv')
        if (!user) {
            return 404
        }
        try {
            const cv: typeof CV = user.cv
            if (cv) {
                cv.skills = education.skills
                const cv_new = await cv.save()
                return cv_new
            }
        } catch (e) {
            console.error(e)
            return 500
        }
    }
}