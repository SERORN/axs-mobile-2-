import { TenantService } from './tenant.service';
export declare class TenantController {
    private tenantService;
    constructor(tenantService: TenantService);
    getTenant(slug: string): Promise<any>;
}
export declare class SiteController {
    private tenantService;
    constructor(tenantService: TenantService);
    getSites(tenantId: string): Promise<any>;
}
