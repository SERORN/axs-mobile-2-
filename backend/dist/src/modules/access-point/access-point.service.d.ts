import { PrismaService } from '../../shared/prisma/prisma.service';
export declare class AccessPointService {
    private prisma;
    constructor(prisma: PrismaService);
    getAccessPointByPublicId(publicId: string): Promise<any>;
    getAccessPointFlow(publicId: string): Promise<any>;
    listAccessPoints(siteId?: string): Promise<any>;
}
