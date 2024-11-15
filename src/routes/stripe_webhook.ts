import { Router, Request, Response, NextFunction } from 'express';
export const WebhookRouter = Router();
import { client as stripeClient } from '@src/models/stripe/client'
import parser from 'body-parser';
import { sync_jobs, async_jobs } from '@src/models/stripe/utils/handlers';




WebhookRouter.post(
    '/',
    parser.raw({ type: 'application/json' }),
    async (req: Request, res) => {
        // Retrieve the event by verifying the signature using the raw body and secret.
        let event;
        try {
            event = stripeClient.webhooks.constructEvent(
                req.body,
                req.headers['stripe-signature'],
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.log(err);
            console.log(`⚠️  Webhook signature verification failed.`);
            console.log(
                `⚠️  Check the env file and enter the correct webhook secret.`
            );
            return res.sendStatus(400);
        }
        // Extract the object from the event. 
        // Handle the event
        // Review important events for Billing webhooks
        // https://stripe.com/docs/billing/webhooks
        // Remove comment to see the various objects sent for this sample
        if(sync_jobs[event.type]){
            try{
                await sync_jobs[event.type](event);
                return res.sendStatus(200);
            }
            catch(e){
                console.log(e)
                return res.sendStatus(500);
            }
        }
        // will handle these asyncronously
        else if(async_jobs[event.type]){
            try{
                async_jobs[event.type](event).then(() => {
                }).catch((e) => {
                    console.log(e)
                })
                return res.sendStatus(200);
            }
            catch(e){
                console.log(e)
                return res.sendStatus(500);
            }
            
        }
        return res.sendStatus(200);

        switch (event.type) {
            case 'invoice.paid':
                // Used to provision services after the trial has ended.
                // The status of the invoice will show up as paid. Store the status in your
                // database to reference when a user accesses your service to avoid hitting rate limits.
                break;
            case 'invoice.payment_failed':
                // If the payment fails or the customer does not have a valid payment method,
                //  an invoice.payment_failed event is sent, the subscription becomes past_due.
                // Use this webhook to notify your user that their payment has
                // failed and to retrieve new card details.
                break;
            case 'invoice.finalized':
                // If you want to manually send out invoices to your customers
                // or store them locally to reference to avoid hitting Stripe rate limits.
                break;
            case 'customer.subscription.deleted':
                if (event.request != null) {
                    // handle a subscription cancelled by your request
                    // from above.
                } else {
                    // handle subscription cancelled automatically based
                    // upon your subscription settings.
                }
                break;
            case 'customer.subscription.trial_will_end':
                // Send notification to your user that the trial will end
                break;
            default:
            // Unexpected event type
        }
        res.sendStatus(200);
    }
);

