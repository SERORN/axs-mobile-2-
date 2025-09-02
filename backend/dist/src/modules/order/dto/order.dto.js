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
exports.OrderSearchDto = exports.UpdateOrderStatusDto = exports.OrderItemDto = exports.CreateOrderDto = exports.UpdateCartItemDto = exports.AddToCartDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class AddToCartDto {
}
exports.AddToCartDto = AddToCartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'variant-id-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddToCartDto.prototype, "variantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AddToCartDto.prototype, "qty", void 0);
class UpdateCartItemDto {
}
exports.UpdateCartItemDto = UpdateCartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3, minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateCartItemDto.prototype, "qty", void 0);
class CreateOrderDto {
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'B2C',
        enum: ['B2B', 'B2C'],
        description: 'Order type - B2B for business orders, B2C for consumer orders'
    }),
    (0, class_validator_1.IsEnum)(['B2B', 'B2C']),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'org-id-123',
        required: false,
        description: 'Required for B2B orders - seller organization ID'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "sellerOrgId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            street: '123 Main St',
            city: 'Mexico City',
            state: 'CDMX',
            zipCode: '12345',
            country: 'MX'
        }
    }),
    __metadata("design:type", Object)
], CreateOrderDto.prototype, "billingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: {
            street: '123 Main St',
            city: 'Mexico City',
            state: 'CDMX',
            zipCode: '12345',
            country: 'MX'
        }
    }),
    __metadata("design:type", Object)
], CreateOrderDto.prototype, "shippingAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Please handle with care', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "notes", void 0);
class OrderItemDto {
}
exports.OrderItemDto = OrderItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'variant-id-123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "variantId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "qty", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 299.99 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "unitPrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'MXN', default: 'MXN' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "currency", void 0);
class UpdateOrderStatusDto {
}
exports.UpdateOrderStatusDto = UpdateOrderStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'CONFIRMED',
        enum: ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']
    }),
    (0, class_validator_1.IsEnum)(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Order confirmed and processing', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateOrderStatusDto.prototype, "notes", void 0);
class OrderSearchDto {
}
exports.OrderSearchDto = OrderSearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: ['B2B', 'B2C'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['B2B', 'B2C']),
    __metadata("design:type", String)
], OrderSearchDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: ['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED']),
    __metadata("design:type", String)
], OrderSearchDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PENDING', 'PAID', 'FAILED', 'REFUNDED']),
    __metadata("design:type", String)
], OrderSearchDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderSearchDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderSearchDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Role-based filtering: seller/buyer perspective'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OrderSearchDto.prototype, "role", void 0);
//# sourceMappingURL=order.dto.js.map