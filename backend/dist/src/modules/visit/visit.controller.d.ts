import { VisitService } from './visit.service';
import { CheckinDto, CheckoutDto } from './dto/visit.dto';
export declare class VisitController {
    private visitService;
    constructor(visitService: VisitService);
    checkin(req: any, checkinDto: CheckinDto): Promise<{
        visitId: any;
        status: any;
        requiredPayment: {
            amount: any;
            currency: any;
        };
        paymentSheetClientSecret: string;
    }>;
    checkout(id: string, checkoutDto: CheckoutDto, req: any): Promise<any>;
    getVisit(id: string): Promise<any>;
    approveVisit(id: string, req: any): Promise<any>;
    denyVisit(id: string, body: {
        reason?: string;
    }, req: any): Promise<any>;
}
export declare class QueueController {
    private visitService;
    constructor(visitService: VisitService);
    getQueue(siteId?: string, state?: string): Promise<any>;
}
