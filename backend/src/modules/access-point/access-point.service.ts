import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class AccessPointService {
  constructor(private prisma: PrismaService) {}

  async getAccessPointByPublicId(publicId: string) {
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
      throw new NotFoundException(`AccessPoint with publicId ${publicId} not found`);
    }

    return accessPoint;
  }

  async getAccessPointFlow(publicId: string) {
    const accessPoint = await this.getAccessPointByPublicId(publicId);
    
    if (!accessPoint.flow) {
      // Return a default flow if none is configured
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

  async listAccessPoints(siteId?: string) {
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
}