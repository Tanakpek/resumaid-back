export type SubscriptionStatus = "incomplete"| "incomplete_expired"| "trialing"| "active"| "past_due"|"canceled"| "unpaid"|"paused"

export type PriceType = 'recurring' | 'one_time' | 'metered'
export type BillingInterval = '1m' | '6m' | '1y' 

export type StripeWebhookEvent<T> = {
    id:string,
    object: string,
    api_version: string,
    created: number,
    data: {
        object: T
    },
    type: string
    livemode: boolean,
    pending_webhooks: number,
    request: object
}

