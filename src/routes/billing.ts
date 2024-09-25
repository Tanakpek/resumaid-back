import { Router, Request, Response, NextFunction } from 'express';
export const billingRouter = Router();
export const billingPublicRouter = Router();
import { client as stripeClient } from '@src/models/stripe/client'
import { BillingController } from '@src/controllers/billing/billing_controller'

billingPublicRouter.get('/config', async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({publicKey: process.env.STRIPE_PUBLIC_KEY})
    } catch (e) {
        res.status(500).send('There was an error, please try again later');
    }
})

billingPublicRouter.get('/subscription-prices', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const prices = await BillingController.getSubscriptionPrices()
        res.status(200).json(prices);
    } catch (e) {
        res.status(500).send('There was an error, please try again later');
    }
})

billingRouter.post('/create-checkout-session', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const domainURL = process.env.ORIGIN;
        const { priceId } = req.body;
        console.log(priceId)
        const session = await stripeClient.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
            // the actual Session ID is returned in the query parameter when your customer
            // is redirected to the success page.
            success_url: `${domainURL}/profile?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domainURL}/profile`,
        });

        res.status(200).json({ sessionId: session.id });
    } catch (e) {
        res.status(500).send('There was an error, please try again later');
    }
})