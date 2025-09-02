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
exports.PassService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let PassService = class PassService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserPasses(userId) {
        return this.prisma.pass.findMany({
            where: { userId },
            include: {
                plaza: true,
                vehicle: true,
                passEvents: {
                    orderBy: { createdAt: 'desc' },
                    take: 5
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getPassById(passId) {
        const pass = await this.prisma.pass.findUnique({
            where: { id: passId },
            include: {
                plaza: true,
                vehicle: true,
                user: {
                    select: { id: true, phone: true, name: true }
                }
            }
        });
        if (!pass) {
            throw new common_1.NotFoundException('Pass not found');
        }
        return pass;
    }
    async consumePass(passId, userId, consumeData) {
        const pass = await this.prisma.pass.findFirst({
            where: {
                OR: [
                    { id: passId },
                    { qrCode: passId }
                ]
            },
            include: {
                plaza: true,
                user: true
            }
        });
        if (!pass) {
            throw new common_1.NotFoundException('Pass not found');
        }
        if (pass.userId !== userId) {
            console.warn(`Pass ${passId} consumed by different user: ${userId} (owner: ${pass.userId})`);
        }
        if (pass.status !== 'ACTIVE') {
            throw new common_1.BadRequestException(`Pass is ${pass.status.toLowerCase()}`);
        }
        if (pass.validUntil < new Date()) {
            throw new common_1.BadRequestException('Pass has expired');
        }
        if (pass.maxUsage && pass.usageCount >= pass.maxUsage) {
            throw new common_1.BadRequestException('Pass usage limit exceeded');
        }
        const updatedPass = await this.prisma.pass.update({
            where: { id: pass.id },
            data: {
                usageCount: { increment: 1 },
                ...(pass.maxUsage && pass.usageCount + 1 >= pass.maxUsage ? { status: 'USED' } : {})
            }
        });
        await this.prisma.passEvent.create({
            data: {
                passId: pass.id,
                type: 'SCAN',
                location: consumeData?.location || 'Unknown',
                metadata: {
                    consumedBy: userId,
                    consumedAt: new Date().toISOString(),
                    ...consumeData?.metadata
                }
            }
        });
        console.log(`✅ Pass consumed: ${pass.id} by user ${userId} (usage: ${updatedPass.usageCount}/${pass.maxUsage || '∞'})`);
        return {
            success: true,
            message: 'Pass consumed successfully',
            pass: {
                id: pass.id,
                type: pass.type,
                plaza: pass.plaza.name,
                usageCount: updatedPass.usageCount,
                maxUsage: pass.maxUsage,
                status: updatedPass.status,
                validUntil: pass.validUntil
            }
        };
    }
};
exports.PassService = PassService;
exports.PassService = PassService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PassService);
//# sourceMappingURL=pass.service.js.map