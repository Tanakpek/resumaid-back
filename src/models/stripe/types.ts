export type SubscriptionStatus = "incomplete"| "incomplete_expired"| "trialing"| "active"| "past_due"|"canceled"| "unpaid"|"paused"

export type PriceType = 'recurring' | 'one_time' | 'metered'
export type BillingInterval = '1m' | '6m' | '1y' 