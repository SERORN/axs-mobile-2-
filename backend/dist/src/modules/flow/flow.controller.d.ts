import { FlowService } from './flow.service';
export declare class FlowController {
    private flowService;
    constructor(flowService: FlowService);
    getFlow(id: string): Promise<any>;
    getFlowByAccessPoint(publicId: string): Promise<any>;
    listFlows(tenantId: string): Promise<any>;
}
