import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class FlowService {
    private prisma;
    constructor(prisma: PrismaService);
    getFlowById(id: string): Promise<any>;
    getFlowByAccessPoint(accessPointPublicId: string): Promise<any>;
    private getDefaultFlowDefinition;
    listFlows(tenantId: string): Promise<any>;
}
