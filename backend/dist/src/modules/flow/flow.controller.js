"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const flow_service_1 = require("./flow.service");
let FlowController = class FlowController {
    constructor(flowService) {
        this.flowService = flowService;
    }
    async getFlow(id) {
        return this.flowService.getFlowById(id);
    }
    async getFlowByAccessPoint(publicId) {
        return this.flowService.getFlowByAccessPoint(publicId);
    }
    async listFlows(tenantId) {
        return this.flowService.listFlows(tenantId);
    }
};
exports.FlowController = FlowController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get flow by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flow retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Flow not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlowController.prototype, "getFlow", null);
__decorate([
    (0, common_1.Get)('by-access-point/:publicId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get flow by access point public ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flow retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Access point not found' }),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlowController.prototype, "getFlowByAccessPoint", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List flows' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Flows retrieved successfully' }),
    __param(0, (0, common_1.Query)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FlowController.prototype, "listFlows", null);
exports.FlowController = FlowController = __decorate([
    (0, swagger_1.ApiTags)('Flows'),
    (0, common_1.Controller)('flows'),
    __metadata("design:paramtypes", [flow_service_1.FlowService])
], FlowController);
//# sourceMappingURL=flow.controller.js.map