import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { AccessPointService } from '../access-point/access-point.service';
import { CheckinDto, CheckoutDto } from './dto/visit.dto';

@Injectable()
export class VisitService {
  constructor(
    private prisma: PrismaService,
    private accessPointService: AccessPointService,
  ) {}

  async checkin(userId: string, checkinDto: CheckinDto) {
    const { accessPointPublicId, answers, photos, vehicleId, guest } = checkinDto;

    // Get access point and validate
    const accessPoint = await this.accessPointService.getAccessPointByPublicId(accessPointPublicId);
    
    // Get or create user (if guest mode is enabled)
    let finalUserId = userId;
    if (guest && !userId) {
      finalUserId = null; // Allow null for guest mode
    }

    // Create visit record
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
        checkinPhotoUrl: photos?.[0], // Store first photo as checkin photo
      },
      include: {
        accessPoint: true,
        site: true,
        user: true,
        vehicle: true,
      },
    });

    // Store form answers
    if (answers && Object.keys(answers).length > 0) {
      await this.prisma.visitForm.create({
        data: {
          visitId: visit.id,
          answersJson: answers,
          files: photos || [],
        },
      });
    }

    // Check if payment is required based on flow rules
    const requiredPayment = this.checkPaymentRequired(accessPoint.flow?.definitionJson, answers);

    return {
      visitId: visit.id,
      status: visit.status,
      requiredPayment,
      paymentSheetClientSecret: requiredPayment ? await this.createPaymentIntent(visit.id, requiredPayment) : null,
    };
  }

  async checkout(visitId: string, checkoutDto: CheckoutDto, operatorId?: string) {
    const { photos, notes } = checkoutDto;

    const visit = await this.prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        accessPoint: true,
        site: true,
      },
    });

    if (!visit) {
      throw new NotFoundException(`Visit with id ${visitId} not found`);
    }

    if (visit.status !== 'CHECKED_IN') {
      throw new BadRequestException(`Visit is not in CHECKED_IN status, current status: ${visit.status}`);
    }

    // Update visit with checkout information
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

  async getVisit(visitId: string) {
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
      throw new NotFoundException(`Visit with id ${visitId} not found`);
    }

    return visit;
  }

  async getQueue(siteId?: string, status?: string[]) {
    const where: any = {};
    
    if (siteId) {
      where.siteId = siteId;
    }
    
    if (status && status.length > 0) {
      where.status = { in: status };
    } else {
      // Default to active visits
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
        { status: 'asc' }, // PENDING first
        { createdAt: 'asc' }, // Oldest first
      ],
    });
  }

  async approveVisit(visitId: string, operatorId: string) {
    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'CHECKED_IN',
        checkinAt: new Date(),
        operatorInId: operatorId,
      },
    });
  }

  async denyVisit(visitId: string, operatorId: string, reason?: string) {
    return this.prisma.visit.update({
      where: { id: visitId },
      data: {
        status: 'DENIED',
        operatorInId: operatorId,
        notes: reason,
      },
    });
  }

  private checkPaymentRequired(flowDefinition: any, answers: any) {
    if (!flowDefinition?.payment) {
      return null;
    }

    // Simple payment logic - in production this would be more sophisticated
    const payment = flowDefinition.payment;
    if (payment.type === 'fixed') {
      return {
        amount: payment.amount,
        currency: payment.currency || 'MXN',
      };
    }

    return null;
  }

  private async createPaymentIntent(visitId: string, payment: any) {
    // This would integrate with the existing payment service
    // For now, return a mock client secret
    return 'pi_mock_client_secret_' + visitId;
  }
}