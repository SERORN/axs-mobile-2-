import { PassService } from './pass.service';
export declare class PassController {
    private passService;
    constructor(passService: PassService);
    getUserPasses(req: any): Promise<any>;
    getPass(id: string): Promise<any>;
    consumePass(passId: string, req: any, consumeData?: {
        location?: string;
        metadata?: any;
    }): Promise<{
        success: boolean;
        message: string;
        pass: {
            id: any;
            type: any;
            plaza: any;
            usageCount: any;
            maxUsage: any;
            status: any;
            validUntil: any;
        };
    }>;
}
