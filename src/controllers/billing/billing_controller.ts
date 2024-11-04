import {prisma} from '@src/utils/services/db'

export class BillingController {
    private static prisma = prisma;
    constructor() {

    }

    static async getSubscriptionPrices(): Promise<any | false> {
        try {
            
            return await this.prisma.prices.findMany(
                {
                    where: {
                        type: 'recurring',
                        active: true
                    }
                }
            )
        }
        catch (e) {
            console.log(e);
            return false
        }
    }

}