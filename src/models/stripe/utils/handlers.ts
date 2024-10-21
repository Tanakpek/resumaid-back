import { PrismaClient } from "@prisma/client";
import Stripe from 'stripe';
import { prisma as client } from "@src/utils/services/db";
import {Cache as cache, profileKey, stripeToUserIdKey} from '@src/utils/services/cache'
import { profile } from "console";
import { UsersController } from "@src/controllers/user/user_controller";
// TODO notify user of failed payment

// export const invoice_paid = async (event: Stripe.InvoicePaidEvent) => {

// }
const userController = new UsersController()
export const invoice_payment_failed = async (event: Stripe.InvoicePaymentFailedEvent) => {
    const e = event.data.object
}



export const customer_subscription_deleted = async (event: Stripe.CustomerSubscriptionDeletedEvent) => {
    const e = event.data.object
    const userId = await userController.getUserIdFromStripeId(typeof e.customer === 'string' ? e.customer : e.customer.id)
    await client.subscriptions.update({
        where: {
            id: e.id
        },
        data: {
            status: e.status 
        }
    })
    await client.applicants.update({
        where: {
            stripe_id: e.customer as string
        },
        data: {
            subscription: e.status
        }
    })
    if(userId){
        await cache.del(profileKey(userId))
    }
}

export const customer_subscription_updated = async (event: Stripe.CustomerSubscriptionUpdatedEvent) => {
    const e = event.data.object
    const userId = await userController.getUserIdFromStripeId(typeof e.customer === 'string' ? e.customer : e.customer.id)
    console.log('customer_subscription_updated')
    console.log(userId)
    await client.subscriptions.upsert({
        where: {
            id: e.id,
        },
        create : {
            id: e.id,
            applicant_stripe_id: e.customer as string,
            creation_dt: new Date(e.created).toISOString(),
            product: e.items.data[0].plan.product as string,
            price: e.items.data[0].price.id,
            status: e.status,
            current_period_start: new Date(e.current_period_start).toISOString(),
            current_period_end: new Date(e.current_period_end).toISOString(),
        },
        update: {
            status: e.status,
            current_period_start: new Date(e.current_period_start).toISOString(),
            current_period_end: new Date(e.current_period_end).toISOString(),
        }
    })
    if(userId){
        await cache.del(profileKey(userId))
    }
}

export const customer_subscription_created = async (event: Stripe.CustomerSubscriptionCreatedEvent) => {
    const e = event.data.object
    const userId = await userController.getUserIdFromStripeId(typeof e.customer === 'string' ? e.customer : e.customer.id)
    console.log('customer_subscription_created')
    console.log(userId)
    await client.subscriptions.upsert({
        create: {
            applicant_stripe_id: e.customer as string,
            id: e.id,
            status: e.status,
            price: e.items.data[0].price.id,
            creation_dt: new Date(e.created).toISOString(),
            product: e.items.data[0].plan.product as string,
            current_period_start: new Date(e.current_period_start).toISOString(),
            current_period_end: new Date(e.current_period_end).toISOString(),
        },
        update: {
            
        },
        where: {
            id: e.id
        }
    })
    await client.applicants.update({
        where: {
            stripe_id: e.customer as string
        },
        data: {
            subscription: e.id
        }
    })
    if(userId){
        await cache.del(profileKey(userId))
    }
}

export const invoice_created = async (event: Stripe.InvoiceCreatedEvent) => {

}
// export const customer_subscription_trial_will_end = async (event: Stripe.CustomerSubscriptionTrialWillEndEvent) => {
// }

export const payment_method_attached = async (event: Stripe.PaymentMethodAttachedEvent) => {
    const e = event.data.object
    await client.payment_methods.upsert({
        create: {
            stripe_id: e.id,
            type: e.type,
            customer: e.customer as string,
            card_brand: e.card ? e.card.brand : null,
            last_4: e.card ? parseInt(e.card.last4) : null,
        },
        update: {
            last_4: e.card ? parseInt(e.card.last4) : null,
        },
        where: {
            stripe_id: e.id
        }
    })
    await client.applicants.update({
        where: {
            stripe_id: e.customer as string,
            default_payment_method: null
        },
        data: {
            default_payment_method: e.id
        }
    })
    const user_id = await cache.get(stripeToUserIdKey(typeof e.customer === 'string' ? e.customer : e.customer.id))
    await cache.del(profileKey(user_id))
}

export const payment_method_detached = async (event: Stripe.PaymentMethodDetachedEvent) => {
    const e = event.data.object
    await client.applicants.update({
        where: { stripe_id: typeof e.customer === 'string'  ? e.customer : e.customer.id, default_payment_method: e.id as string},
        data: {
            default_payment_method: null
        }
    })
    await client.payment_methods.delete({
        where: {
            stripe_id: e.id
        }
    })
}

export const customer_subscription_paused = async (event: Stripe.CustomerSubscriptionPausedEvent) => {
    const e = event.data.object
    const userId = await userController.getUserIdFromStripeId(typeof e.customer === 'string' ? e.customer : e.customer.id)
    console.log('customer_subscription_paused')
    console.log(userId)
    await client.subscriptions.update({
        where: {
            id: e.id
        },
        data: {
            status: e.status
        }
    })
    if(userId){
        await cache.del(profileKey(userId))
    }
}

export const sync_jobs: {[key:string] : (event:Stripe.Event) => Promise<any> } = {
    // 'invoice.paid': invoice_paid,
    'invoice.payment_failed': invoice_payment_failed,
    'customer.subscription.deleted': customer_subscription_deleted,
    'customer.subscription.updated': customer_subscription_updated,
    'customer.subscription.created': customer_subscription_created,
}
export const async_jobs: { [key: string]: (event: Stripe.Event) => Promise<any> } = {
    
    'invoice.created': invoice_created,
    //'customer.subscription.trial_will_end': customer_subscription_trial_will_end,
    'payment_method.attached': payment_method_attached,
    'payment_method.detached': payment_method_detached,
    'customer.subscription.paused': customer_subscription_paused
}