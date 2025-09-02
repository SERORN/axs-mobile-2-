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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessWebhookDto = exports.RefundPaymentDto = exports.ConfirmPaymentDto = exports.CreatePaymentIntentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'order-id-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'STRIPE',
        enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX'],
        description: 'Payment provider'
    }),
    (0, class_validator_1.IsEnum)(['STRIPE', 'PAYPAL', 'SPEI', 'PIX']),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MXN', default: 'MXN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            saveCard: false,
            customerId: 'customer-id'
        },
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePaymentIntentDto.prototype, "metadata", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pi_1ABC123...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'STRIPE',
        enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX']
    }),
    (0, class_validator_1.IsEnum)(['STRIPE', 'PAYPAL', 'SPEI', 'PIX']),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pm_1ABC123...', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentMethodId", void 0);
class RefundPaymentDto {
}
exports.RefundPaymentDto = RefundPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'payment-id-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "paymentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100.50, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], RefundPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Customer requested refund', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefundPaymentDto.prototype, "reason", void 0);
class ProcessWebhookDto {
}
exports.ProcessWebhookDto = ProcessWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'STRIPE',
        enum: ['STRIPE', 'PAYPAL', 'SPEI', 'PIX']
    }),
    (0, class_validator_1.IsEnum)(['STRIPE', 'PAYPAL', 'SPEI', 'PIX']),
    __metadata("design:type", String)
], ProcessWebhookDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'evt_1ABC123...' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessWebhookDto.prototype, "eventId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], ProcessWebhookDto.prototype, "payload", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'whsec_123...', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessWebhookDto.prototype, "signature", void 0);
//# sourceMappingURL=payment.dto.js.map