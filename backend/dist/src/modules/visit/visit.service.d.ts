import { PrismaService } from '../../shared/prisma/prisma.service';
import { AccessPointService } from '../access-point/access-point.service';
import { CheckinDto, CheckoutDto } from './dto/visit.dto';
export declare class VisitService {
    private prisma;
    private accessPointService;
    constructor(prisma: PrismaService, accessPointService: AccessPointService);
    checkin(userId: string, checkinDto: CheckinDto): Promise<{
        visitId: any;
        status: any;
        requiredPayment: {
            amount: any;
            currency: any;
        };
        paymentSheetClientSecret: string;
    }>;
    checkout(visitId: string, checkoutDto: CheckoutDto, operatorId?: string): Promise<any>;
    getVisit(visitId: string): Promise<any>;
    getQueue(siteId?: string, status?: string[]): Promise<any>;
    approveVisit(visitId: string, operatorId: string): Promise<any>;
    denyVisit(visitId: string, operatorId: string, reason?: string): Promise<any>;
    private checkPaymentRequired;
    private createPaymentIntent;
}
