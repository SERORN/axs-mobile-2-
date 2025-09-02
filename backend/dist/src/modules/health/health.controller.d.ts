import { HealthService } from './health.service';
export declare class HealthController {
    private healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        environment: string;
    }>;
    getDetailedHealth(): Promise<{
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
