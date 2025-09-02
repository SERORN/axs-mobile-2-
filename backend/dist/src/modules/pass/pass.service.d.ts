import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class PassService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserPasses(userId: string): Promise<any>;
    getPassById(passId: string): Promise<any>;
    consumePass(passId: string, userId: string, consumeData?: {
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
