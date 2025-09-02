import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class HealthService {
    private prisma;
    constructor(prisma: PrismaService);
    getHealthStatus(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        environment: string;
    }>;
    getDetailedHealthStatus(): Promise<{
        services: {
            database: {
                status: string;
            };
            api: {
                status: string;
            };
        };
        status: string;
        timestamp: string;
        version: string;
        environment: string;
    }>;
}
