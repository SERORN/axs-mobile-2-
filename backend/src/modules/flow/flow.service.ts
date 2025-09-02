import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class FlowService {
  constructor(private prisma: PrismaService) {}

  async getFlowById(id: string) {
    const flow = await this.prisma.flow.findUnique({
      where: { id },
    });

    if (!flow) {
      throw new NotFoundException(`Flow with id ${id} not found`);
    }

    return flow;
  }

  async getFlowByAccessPoint(accessPointPublicId: string) {
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
      throw new NotFoundException(`AccessPoint with publicId ${accessPointPublicId} not found`);
    }

    if (!accessPoint.flow) {
      // Return default flow for the tenant type
      return {
        id: 'default',
        name: 'Default Flow',
        version: '1.0',
        definitionJson: this.getDefaultFlowDefinition(accessPoint.type),
      };
    }

    return accessPoint.flow;
  }

  private getDefaultFlowDefinition(accessPointType: string) {
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

    // Customize based on access point type
    if (accessPointType === 'VEHICULAR') {
      baseFlow.screens[0].fields.push(
        { id: 'vehiclePlate', type: 'text', label: 'Placa del vehículo', required: false },
        { id: 'vin', type: 'text', label: 'VIN (opcional)', required: false },
      );
    }

    return baseFlow;
  }

  async listFlows(tenantId: string) {
    return this.prisma.flow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}