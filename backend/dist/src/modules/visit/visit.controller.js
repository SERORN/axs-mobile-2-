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
exports.QueueController = exports.VisitController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const visit_service_1 = require("./visit.service");
const visit_dto_1 = require("./dto/visit.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let VisitController = class VisitController {
    constructor(visitService) {
        this.visitService = visitService;
    }
    async checkin(req, checkinDto) {
        const userId = req.user?.sub || req.user?.id;
        return this.visitService.checkin(userId, checkinDto);
    }
    async checkout(id, checkoutDto, req) {
        const operatorId = req.user?.operatorId;
        return this.visitService.checkout(id, checkoutDto, operatorId);
    }
    async getVisit(id) {
        return this.visitService.getVisit(id);
    }
    async approveVisit(id, req) {
        const operatorId = req.user?.operatorId || req.user?.sub;
        return this.visitService.approveVisit(id, operatorId);
    }
    async denyVisit(id, body, req) {
        const operatorId = req.user?.operatorId || req.user?.sub;
        return this.visitService.denyVisit(id, operatorId, body.reason);
    }
};
exports.VisitController = VisitController;
__decorate([
    (0, common_1.Post)('checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check in to an access point' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Visit created successfully',
        schema: {
            example: {
                visitId: 'clx123...',
                status: 'CHECKED_IN',
                requiredPayment: { amount: 25, currency: 'MXN' },
                paymentSheetClientSecret: 'pi_...'
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Access point not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, visit_dto_1.CheckinDto]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "checkin", null);
__decorate([
    (0, common_1.Post)(':id/checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check out from a visit' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visit checked out successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Visit not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, visit_dto_1.CheckoutDto, Object]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "checkout", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get visit by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visit retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Visit not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "getVisit", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a pending visit (operator only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visit approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "approveVisit", null);
__decorate([
    (0, common_1.Post)(':id/deny'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Deny a pending visit (operator only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Visit denied successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VisitController.prototype, "denyVisit", null);
exports.VisitController = VisitController = __decorate([
    (0, swagger_1.ApiTags)('Visits'),
    (0, common_1.Controller)('visits'),
    __metadata("design:paramtypes", [visit_service_1.VisitService])
], VisitController);
let QueueController = class QueueController {
    constructor(visitService) {
        this.visitService = visitService;
    }
    async getQueue(siteId, state) {
        const states = state ? state.split(',') : undefined;
        return this.visitService.getQueue(siteId, states);
    }
};
exports.QueueController = QueueController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get visit queue for operators' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Queue retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    status: { type: 'string' },
                    checkinAt: { type: 'string' },
                    user: { type: 'object' },
                    vehicle: { type: 'object' },
                    accessPoint: { type: 'object' },
                }
            }
        }
    }),
    __param(0, (0, common_1.Query)('site')),
    __param(1, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], QueueController.prototype, "getQueue", null);
exports.QueueController = QueueController = __decorate([
    (0, swagger_1.ApiTags)('Queue Management'),
    (0, common_1.Controller)('queue'),
    __metadata("design:paramtypes", [visit_service_1.VisitService])
], QueueController);
//# sourceMappingURL=visit.controller.js.map