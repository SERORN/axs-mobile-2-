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
exports.ConfirmPaymentDto = exports.CreatePaymentIntentDto = exports.PassType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var PassType;
(function (PassType) {
    PassType["HOURLY"] = "HOURLY";
    PassType["DAILY"] = "DAILY";
    PassType["WEEKLY"] = "WEEKLY";
    PassType["MONTHLY"] = "MONTHLY";
    PassType["GUEST"] = "GUEST";
    PassType["VIP_LOUNGE"] = "VIP_LOUNGE";
})(PassType || (exports.PassType = PassType = {}));
class CreatePaymentIntentDto {
}
exports.CreatePaymentIntentDto = CreatePaymentIntentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.99, description: 'Amount in dollars' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.5),
    __metadata("design:type", Number)
], CreatePaymentIntentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usd', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: PassType, example: PassType.DAILY }),
    (0, class_validator_1.IsEnum)(PassType),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "passType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'plaza-parking-001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "plazaId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ABC123', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-12-31T23:59:59Z', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentIntentDto.prototype, "validUntil", void 0);
class ConfirmPaymentDto {
}
exports.ConfirmPaymentDto = ConfirmPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'pi_1234567890abcdef' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "paymentIntentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'trans_1234567890' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConfirmPaymentDto.prototype, "transactionId", void 0);
//# sourceMappingURL=payment.dto.js.map