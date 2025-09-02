import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PassService {
  constructor(private prisma: PrismaService) {}

  async getUserPasses(userId: string) {
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

  async getPassById(passId: string) {
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
      throw new NotFoundException('Pass not found');
    }

    return pass;
  }

  async consumePass(passId: string, userId: string, consumeData?: { location?: string; metadata?: any }) {
    // Buscar pase por ID o QR code
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
      throw new NotFoundException('Pass not found');
    }

    // Verificar que el pase pertenece al usuario (opcional: permitir consumo por otros usuarios)
    if (pass.userId !== userId) {
      console.warn(`Pass ${passId} consumed by different user: ${userId} (owner: ${pass.userId})`);
    }

    // Verificar que el pase esté activo
    if (pass.status !== 'ACTIVE') {
      throw new BadRequestException(`Pass is ${pass.status.toLowerCase()}`);
    }

    // Verificar que el pase no haya expirado
    if (pass.validUntil < new Date()) {
      throw new BadRequestException('Pass has expired');
    }

    // Verificar límites de uso
    if (pass.maxUsage && pass.usageCount >= pass.maxUsage) {
      throw new BadRequestException('Pass usage limit exceeded');
    }

    // Incrementar contador de uso
    const updatedPass = await this.prisma.pass.update({
      where: { id: pass.id },
      data: {
        usageCount: { increment: 1 },
        // Si alcanza el límite, marcar como usado
        ...(pass.maxUsage && pass.usageCount + 1 >= pass.maxUsage ? { status: 'USED' } : {})
      }
    });

    // Registrar evento de consumo
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
}
