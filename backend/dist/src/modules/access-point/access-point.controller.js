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
exports.AccessPointController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const access_point_service_1 = require("./access-point.service");
let AccessPointController = class AccessPointController {
    constructor(accessPointService) {
        this.accessPointService = accessPointService;
    }
    async getAccessPoint(publicId) {
        return this.accessPointService.getAccessPointByPublicId(publicId);
    }
    async listAccessPoints(siteId) {
        return this.accessPointService.listAccessPoints(siteId);
    }
};
exports.AccessPointController = AccessPointController;
__decorate([
    (0, common_1.Get)(':publicId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get access point by public ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access point retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Access point not found' }),
    __param(0, (0, common_1.Param)('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessPointController.prototype, "getAccessPoint", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List access points' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access points retrieved successfully' }),
    __param(0, (0, common_1.Query)('siteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessPointController.prototype, "listAccessPoints", null);
exports.AccessPointController = AccessPointController = __decorate([
    (0, swagger_1.ApiTags)('Access Points'),
    (0, common_1.Controller)('access-points'),
    __metadata("design:paramtypes", [access_point_service_1.AccessPointService])
], AccessPointController);
//# sourceMappingURL=access-point.controller.js.map