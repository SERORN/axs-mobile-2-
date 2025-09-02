import { AccessPointService } from './access-point.service';
export declare class AccessPointController {
    private accessPointService;
    constructor(accessPointService: AccessPointService);
    getAccessPoint(publicId: string): Promise<any>;
    listAccessPoints(siteId?: string): Promise<any>;
}
