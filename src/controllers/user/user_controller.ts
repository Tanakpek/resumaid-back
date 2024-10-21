// import { PrismaClient } from "@prisma/client";
import bcrypt, { hash } from "bcrypt";
import { createUser } from "./types";
import User, { UserType } from "@src/models/user/User";
import { CVsController } from "../cv/cv_controller";
import { applicants, PrismaClient } from "@prisma/client";
import { AchivevementFormValues, CertFormValues, EducationFormValues, LanguageFormValues, ProfileFormValues, ProjectFormValues, SkillFormValues, VolunteerFormValues, WorkFormValues, profileFormSchema } from "@src/utils/applicaid-ts-utils/cv_form_types";
import CV from "@src/models/cv/CV";
import { CVInfo, Education, Project, WorkExperience } from "@src/utils/applicaid-ts-utils/cv_type";
import mongoose from "mongoose";
import { client as stripeClient } from "@src/models/stripe/client";
import { SubscriptionStatus } from "@src/models/stripe/types/shared";
import { Cache, stripeToUserIdKey } from "@src/utils/services/cache";
import { prisma } from "@src/utils/services/db";
export class UsersController {
    private prisma = prisma
    private CVsController = new CVsController();
    private cache = Cache
    constructor(){

    }
    async createUser(user : createUser) : Promise<any | false> {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try{
            const data = {
                email: user.email,
                name: user.name,
                given_name: user.given_name,
                family_name: user.family_name,
                details: {
                    email: user.email,
                    name: user.name,
                    given_name: user.given_name,
                    family_name: user.family_name,
                }
            }
            
            const userdata = {...data, password: hashedPassword }
            let new_user = await User.create(userdata)
            new_user = await new_user.save()
            let stripeCustomer;
            
            try{
                stripeCustomer = await stripeClient.customers.create({
                    name: user.name,
                    email: user.email,
                    metadata: {
                        user_id: new_user.id
                    }
                })
            }catch(e){
                console.error(e)
                await new_user.deleteOne({ id: new_user.id })
                return false
            }
            
            try{
                await this.prisma.applicants.create(
                    {
                        data: {
                            id: new_user.id,
                            email: user.email,
                            stripe_id: stripeCustomer.id, 
                        }
                    }
                )
            }
            catch(e){
                await User.deleteOne({id: new_user.id})
                console.error(e);
                return false
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
            const u =  await User.findById(id).populate('details')
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
        const user_app_data = await User.findOne({ email: email })
        if (user_app_data === null) {
            return false;
        }
        
        const user_record :  applicants & { plan_name: string | null, subscription_status: SubscriptionStatus | null } = await this.prisma.$queryRaw`
        SELECT applicants.*, products.stripe_id as plan, subscriptions.status as subscription_status FROM private.applicants 
        LEFT  JOIN private.subscriptions  ON applicants.subscription = subscriptions.id
        LEFT JOIN private.products  ON subscriptions.product = products.stripe_id
		where applicants.email = ${email}
        `
    
        if(!user_record){
            return false;
        }
        else{
            try{
                const billing = user_record.stripe_id;
                const entitlement = user_record.subscription;
                const match = await bcrypt.compare(password, user_app_data.password);
                if(match){
                    return  {id: user_app_data.id, email: user_app_data.email, name: user_app_data.name, plan: user_record.plan_name, subscription_status: user_record.subscription_status || null, billing_id: user_record.stripe_id }
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

    async getUserByEmail(email: string) {
        const user_app_data = await User.findOne({ email: email })
        if (user_app_data === null) {
            return false;
        }

        const user_data: (applicants & { plan: string | null, subscription_status: SubscriptionStatus | null })[] = await this.prisma.$queryRaw`
        SELECT applicants.*, products.stripe_id as plan, subscriptions.status as subscription_status FROM private.applicants 
        LEFT  JOIN private.subscriptions  ON applicants.subscription = subscriptions.id
        LEFT JOIN private.products  ON subscriptions.product = products.stripe_id
		where applicants.email = ${email}
        `
        const user_record = user_data[0]
     
        if (!user_record) {
            console.log('no user record')
            return false;
        }
        
        else {
            try {
                return { id: user_app_data.id, email: user_app_data.email, name: user_app_data.name, plan: user_record.plan, subscription_status: user_record.subscription_status || null, billing_id: user_record.stripe_id }
            }
            catch (e) {
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

    async getUserIdFromStripeId  (stripe_id: string) {
        try {
            let id = await this.cache.get(stripeToUserIdKey(stripe_id))
            if (!id) {
                const applicant = await this.prisma.applicants.findFirst({
                    where: {
                        stripe_id
                    }
                })
                if (applicant) {
                    id = applicant.id
                    await this.cache.set(stripeToUserIdKey(stripe_id), id)
                }
            }
            if (id) {
                return id
            } else {
                throw new Error('could not find user from stripe id')
            }
        } catch (e) {
            console.log(e)
            return false
        }
    }

    async getUserFromSubscription(subscription_id: string): Promise<string | false> {
        try {
            const applicant = await this.prisma.applicants.findFirst({
                where: {
                    subscription: subscription_id
                }
            })
            if (applicant) {
                return applicant.id
            }
        } catch (e) {
            console.log(e)
            return false
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
            cv.education = cv.education.filter((ed: Education) => ed._id.toString() !== id)
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
            const newProjects = cv.projects
            for (const [key, project] of newProjects.entries()) {
                if(project._id.toString() === id){
                    newProjects.delete(key)
                    break
                }
            }
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
                        takeaways: org.takeaways
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
            const cv: typeof CV = user.cv
            cv.volunteer = cv.volunteer.filter((vol: typeof CV['volunteer']) => vol._id.toString() !== id)
            const cv_new = await cv.save()
            return cv_new
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

    async updateDetails(email: string, data: ProfileFormValues) {
        const user = await User.findOne({ email: email })
        if (!user) {
            return 404
        }
        try {   
            const deets = user.details
            if (deets) {
                profileFormSchema.parse(data)
                user.details = Object.assign(user.details, data )
                const details_new = await user.save()
                const { name, given_name, family_name, email, bio, cv_uploaded, linkedin, github, personal_website, details } = details_new;
                const resp = { name, given_name, bio, family_name, email, cv_uploaded, linkedin, github, personal_website, details };
                return resp
            }
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