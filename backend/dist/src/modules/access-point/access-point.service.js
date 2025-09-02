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
exports.AccessPointService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let AccessPointService = class AccessPointService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAccessPointByPublicId(publicId) {
        const accessPoint = await this.prisma.accessPoint.findUnique({
            where: { publicId },
            include: {
                site: {
                    include: {
                        tenant: true,
                    },
                },
                flow: true,
            },
        });
        if (!accessPoint) {
            throw new common_1.NotFoundException(`AccessPoint with publicId ${publicId} not found`);
        }
        return accessPoint;
    }
    async getAccessPointFlow(publicId) {
        const accessPoint = await this.getAccessPointByPublicId(publicId);
        if (!accessPoint.flow) {
            return {
                id: 'default',
                name: 'Default Flow',
                version: '1.0',
                definitionJson: {
                    screens: [
                        {
                            id: 'entry',
                            type: 'form',
                            title: 'Información de Entrada',
                            fields: [
                                { id: 'vehiclePlate', type: 'text', label: 'Placa del vehículo', required: false },
                                { id: 'photo', type: 'photo', label: 'Foto de entrada', required: true },
                            ]
                        }
                    ],
                    rules: [],
                    payment: null,
                }
            };
        }
        return accessPoint.flow;
    }
    async listAccessPoints(siteId) {
        return this.prisma.accessPoint.findMany({
            where: siteId ? { siteId } : {},
            include: {
                site: {
                    include: {
                        tenant: true,
                    },
                },
                flow: true,
            },
        });
    }
};
exports.AccessPointService = AccessPointService;
exports.AccessPointService = AccessPointService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessPointService);
//# sourceMappingURL=access-point.service.js.map