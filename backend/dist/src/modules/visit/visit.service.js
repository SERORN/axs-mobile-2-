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
exports.VisitService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const access_point_service_1 = require("../access-point/access-point.service");
let VisitService = class VisitService {
    constructor(prisma, accessPointService) {
        this.prisma = prisma;
        this.accessPointService = accessPointService;
    }
    async checkin(userId, checkinDto) {
        const { accessPointPublicId, answers, photos, vehicleId, guest } = checkinDto;
        const accessPoint = await this.accessPointService.getAccessPointByPublicId(accessPointPublicId);
        let finalUserId = userId;
        if (guest && !userId) {
            finalUserId = null;
        }
        const visit = await this.prisma.visit.create({
            data: {
                tenantId: accessPoint.site.tenantId,
                siteId: accessPoint.siteId,
                accessPointId: accessPoint.id,
                userId: finalUserId,
                vehicleId,
                flowId: accessPoint.flowId,
                flowSnapshotJson: accessPoint.flow?.definitionJson,
                status: 'CHECKED_IN',
                checkinAt: new Date(),
                checkinPhotoUrl: photos?.[0],
            },
            include: {
                accessPoint: true,
                site: true,
                user: true,
                vehicle: true,
            },
        });
        if (answers && Object.keys(answers).length > 0) {
            await this.prisma.visitForm.create({
                data: {
                    visitId: visit.id,
                    answersJson: answers,
                    files: photos || [],
                },
            });
        }
        const requiredPayment = this.checkPaymentRequired(accessPoint.flow?.definitionJson, answers);
        return {
            visitId: visit.id,
            status: visit.status,
            requiredPayment,
            paymentSheetClientSecret: requiredPayment ? await this.createPaymentIntent(visit.id, requiredPayment) : null,
        };
    }
    async checkout(visitId, checkoutDto, operatorId) {
        const { photos, notes } = checkoutDto;
        const visit = await this.prisma.visit.findUnique({
            where: { id: visitId },
            include: {
                accessPoint: true,
                site: true,
            },
        });
        if (!visit) {
            throw new common_1.NotFoundException(`Visit with id ${visitId} not found`);
        }
        if (visit.status !== 'CHECKED_IN') {
            throw new common_1.BadRequestException(`Visit is not in CHECKED_IN status, current status: ${visit.status}`);
        }
        const updatedVisit = await this.prisma.visit.update({
            where: { id: visitId },
            data: {
                status: 'CHECKED_OUT',
                checkoutAt: new Date(),
                checkoutPhotoUrl: photos?.[0],
                operatorOutId: operatorId,
                notes,
            },
            include: {
                accessPoint: true,
                site: true,
                user: true,
                vehicle: true,
                visitForms: true,
            },
        });
        return updatedVisit;
    }
    async getVisit(visitId) {
        const visit = await this.prisma.visit.findUnique({
            where: { id: visitId },
            include: {
                accessPoint: true,
                site: true,
                user: true,
                vehicle: true,
                visitForms: true,
                payments: true,
                invoices: true,
            },
        });
        if (!visit) {
            throw new common_1.NotFoundException(`Visit with id ${visitId} not found`);
        }
        return visit;
    }
    async getQueue(siteId, status) {
        const where = {};
        if (siteId) {
            where.siteId = siteId;
        }
        if (status && status.length > 0) {
            where.status = { in: status };
        }
        else {
            where.status = { in: ['PENDING', 'CHECKED_IN'] };
        }
        return this.prisma.visit.findMany({
            where,
            include: {
                accessPoint: true,
                site: true,
                user: true,
                vehicle: true,
                visitForms: true,
            },
            orderBy: [
                { status: 'asc' },
                { createdAt: 'asc' },
            ],
        });
    }
    async approveVisit(visitId, operatorId) {
        return this.prisma.visit.update({
            where: { id: visitId },
            data: {
                status: 'CHECKED_IN',
                checkinAt: new Date(),
                operatorInId: operatorId,
            },
        });
    }
    async denyVisit(visitId, operatorId, reason) {
        return this.prisma.visit.update({
            where: { id: visitId },
            data: {
                status: 'DENIED',
                operatorInId: operatorId,
                notes: reason,
            },
        });
    }
    checkPaymentRequired(flowDefinition, answers) {
        if (!flowDefinition?.payment) {
            return null;
        }
        const payment = flowDefinition.payment;
        if (payment.type === 'fixed') {
            return {
                amount: payment.amount,
                currency: payment.currency || 'MXN',
            };
        }
        return null;
    }
    async createPaymentIntent(visitId, payment) {
        return 'pi_mock_client_secret_' + visitId;
    }
};
exports.VisitService = VisitService;
exports.VisitService = VisitService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        access_point_service_1.AccessPointService])
], VisitService);
//# sourceMappingURL=visit.service.js.map