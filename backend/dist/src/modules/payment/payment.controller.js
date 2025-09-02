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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payment_service_1 = require("./payment.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const payment_dto_1 = require("./dto/payment.dto");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async createPaymentIntent(req, createPaymentDto) {
        return this.paymentService.createPaymentIntent(req.user.id, createPaymentDto);
    }
    async confirmPayment(confirmPaymentDto, req) {
        return this.paymentService.confirmPayment(confirmPaymentDto, req.user.id);
    }
    async getPaymentHistory(req) {
        return this.paymentService.getPaymentHistory(req.user.id, req.user.role);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create-intent'),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment intent for a pass purchase' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment intent created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, payment_dto_1.CreatePaymentIntentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm payment and create pass' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment confirmed successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_dto_1.ConfirmPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.Get)('history'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment history for current user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment history retrieved' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentHistory", null);
exports.PaymentController = PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map