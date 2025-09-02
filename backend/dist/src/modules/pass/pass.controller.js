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
exports.PassController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const pass_service_1 = require("./pass.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let PassController = class PassController {
    constructor(passService) {
        this.passService = passService;
    }
    async getUserPasses(req) {
        return this.passService.getUserPasses(req.user.id);
    }
    async getPass(id) {
        return this.passService.getPassById(id);
    }
    async consumePass(passId, req, consumeData) {
        return this.passService.consumePass(passId, req.user.id, consumeData);
    }
};
exports.PassController = PassController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user passes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User passes retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PassController.prototype, "getUserPasses", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pass by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pass retrieved' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PassController.prototype, "getPass", null);
__decorate([
    (0, common_1.Post)(':id/consume'),
    (0, swagger_1.ApiOperation)({ summary: 'Consume a pass (scan QR)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pass consumed successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PassController.prototype, "consumePass", null);
exports.PassController = PassController = __decorate([
    (0, swagger_1.ApiTags)('Passes'),
    (0, common_1.Controller)('passes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [pass_service_1.PassService])
], PassController);
//# sourceMappingURL=pass.controller.js.map