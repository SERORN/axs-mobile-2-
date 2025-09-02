import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class TenantService {
    private prisma;
    constructor(prisma: PrismaService);
    getTenantBySlug(slug: string): Promise<any>;
    getSites(tenantId: string): Promise<any>;
}
