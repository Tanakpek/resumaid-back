import { Redis } from 'ioredis'
export const Cache = Redis.createClient()

import { PrismaClient } from '@prisma/client'
const client = new PrismaClient()

export const bootstrap = async () => {
    await client.$connect()
    await bootstrapStripeIdToApplicant()
}

export const bootstrapStripeIdToApplicant = async () => {
   const applicants = await client.applicants.findMany()
   const msetArgs = []
    for (const applicant of applicants) {
        msetArgs.push('stripe_to_user_id:' + applicant.stripe_id)
        msetArgs.push(applicant.id)
    }
    await Cache.mset(...msetArgs)
}

export const profileKey = (id: string) => {
    return `/profile:${id}`
}

export const cvKey = (id: string) => {
    return `/cv:${id}`
}

export const stripeToUserIdKey = (stripe_id: string) => {
    return `stripe_to_user_id:${stripe_id}`
}