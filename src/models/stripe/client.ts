import Stripe from 'stripe'
import dotenv from 'dotenv'
dotenv.config();
if( !process.env.STRIPE_SECRET_KEY){
    throw new Error('No Stripe secret key found')
}
// if( !process.env.STRIPE_WEBHOOK_SECRET){
//     throw new Error('No Stripe webhook secret found')
// }
if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.warn('You are using a production Stripe secret key')
}
export const client =  new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
})

