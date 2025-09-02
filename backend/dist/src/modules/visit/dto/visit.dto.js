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
exports.CheckoutDto = exports.CheckinDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CheckinDto {
}
exports.CheckinDto = CheckinDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'agencia-lomas-vehicular-1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckinDto.prototype, "accessPointPublicId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { vin: '3VW...', plate: 'ABC123', km: 45678, reason: 'service' },
        description: 'Form answers from the flow'
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CheckinDto.prototype, "answers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['data:image/jpeg;base64,...'],
        description: 'Base64 encoded photos'
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CheckinDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckinDto.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CheckinDto.prototype, "guest", void 0);
class CheckoutDto {
}
exports.CheckoutDto = CheckoutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CheckoutDto.prototype, "photos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckoutDto.prototype, "notes", void 0);
//# sourceMappingURL=visit.dto.js.map