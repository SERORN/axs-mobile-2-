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
exports.FlowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let FlowService = class FlowService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getFlowById(id) {
        const flow = await this.prisma.flow.findUnique({
            where: { id },
        });
        if (!flow) {
            throw new common_1.NotFoundException(`Flow with id ${id} not found`);
        }
        return flow;
    }
    async getFlowByAccessPoint(accessPointPublicId) {
        const accessPoint = await this.prisma.accessPoint.findUnique({
            where: { publicId: accessPointPublicId },
            include: {
                flow: true,
                site: {
                    include: {
                        tenant: true,
                    },
                },
            },
        });
        if (!accessPoint) {
            throw new common_1.NotFoundException(`AccessPoint with publicId ${accessPointPublicId} not found`);
        }
        if (!accessPoint.flow) {
            return {
                id: 'default',
                name: 'Default Flow',
                version: '1.0',
                definitionJson: this.getDefaultFlowDefinition(accessPoint.type),
            };
        }
        return accessPoint.flow;
    }
    getDefaultFlowDefinition(accessPointType) {
        const baseFlow = {
            screens: [
                {
                    id: 'entry',
                    type: 'form',
                    title: 'Información de Entrada',
                    fields: [
                        { id: 'photo', type: 'photo', label: 'Foto de entrada', required: true },
                    ]
                }
            ],
            rules: [],
            payment: null,
        };
        if (accessPointType === 'VEHICULAR') {
            baseFlow.screens[0].fields.push({ id: 'vehiclePlate', type: 'text', label: 'Placa del vehículo', required: false }, { id: 'vin', type: 'text', label: 'VIN (opcional)', required: false });
        }
        return baseFlow;
    }
    async listFlows(tenantId) {
        return this.prisma.flow.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.FlowService = FlowService;
exports.FlowService = FlowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FlowService);
//# sourceMappingURL=flow.service.js.map