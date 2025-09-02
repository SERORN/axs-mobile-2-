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
exports.SiteController = exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenant_service_1 = require("./tenant.service");
let TenantController = class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async getTenant(slug) {
        return this.tenantService.getTenantBySlug(slug);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)(':slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant by slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Tenant retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Tenant not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getTenant", null);
exports.TenantController = TenantController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
let SiteController = class SiteController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async getSites(tenantId) {
        return this.tenantService.getSites(tenantId);
    }
};
exports.SiteController = SiteController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get sites for a tenant' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Sites retrieved successfully' }),
    __param(0, (0, common_1.Param)('tenant')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteController.prototype, "getSites", null);
exports.SiteController = SiteController = __decorate([
    (0, swagger_1.ApiTags)('Sites'),
    (0, common_1.Controller)('sites'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], SiteController);
//# sourceMappingURL=tenant.controller.js.map