


export class BaseStripeErrorHandler{

    constructor() {
    }

    handleError(err: any) {
        switch (err.type) {
            case 'StripeCardError':
                // A declined card error
                this.StripeCardError(err) // => e.g. "Your card's expiration year is invalid."
                break;
            case 'StripeRateLimitError':
                // Too many requests made to the API too quickly
                this.StripeRateLimitError(err)
                break;
            case 'StripeInvalidRequestError':
                // Invalid parameters were supplied to Stripe's API
                this.StripeInvalidRequestError(err)
                break;
            case 'StripeAPIError':
                // An error occurred internally with Stripe's API
                this.StripeAPIError(err)
                break;
            case 'StripeConnectionError':
                // Some kind of error occurred during the HTTPS communication
                this.StripeConnectionError(err)
                break;
            case 'StripeAuthenticationError':
                // You probably used an incorrect API key
                this.StripeAuthenticationError(err)
                break;
            default:
                // Handle any other types of unexpected errors
                this.default(err)
                break;
        }
    }
    public StripeCardError(err: any) {
        err.message; // => e.g. "Your card's expiration year is invalid."
    }

    public StripeRateLimitError(err: any) {
        // Too many requests made to the API too quickly
    }

    public StripeInvalidRequestError(err: any) {
        // Invalid parameters were supplied to Stripe's API
        console.log(err.message)
    }

    public StripeAPIError(err: any) {
        // An error occurred internally with Stripe's API
    }

    public StripeConnectionError(err: any) {
        // Some kind of error occurred during the HTTPS communication
    }

    public StripeAuthenticationError(err: any) {
        // You probably used an incorrect API key
    }

    public default(err: any) {
        // Handle any other types of unexpected errors
    }
    
}

