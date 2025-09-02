import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreatePurchaseDto, UpdatePurchaseDto, CreateOwnershipDto } from './dto/purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(createPurchaseDto: CreatePurchaseDto) {
    // Verify vehicle exists
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: createPurchaseDto.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Create purchase and ownership history in transaction
    return await this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          ...createPurchaseDto,
          price: createPurchaseDto.price,
          purchaseDate: createPurchaseDto.purchaseDate 
            ? new Date(createPurchaseDto.purchaseDate)
            : new Date(),
        },
        include: {
          vehicle: true,
          customer: true,
          dealership: true,
          salesperson: true,
        },
      });

      // Create ownership history entry
      await tx.ownershipHistory.create({
        data: {
          vehicleId: createPurchaseDto.vehicleId,
          customerId: createPurchaseDto.customerId,
          from: purchase.purchaseDate,
          note: 'Purchase ownership',
        },
      });

      return purchase;
    });
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        skip,
        take: limit,
        include: {
          vehicle: true,
          customer: true,
          dealership: true,
          salesperson: true,
        },
        orderBy: { purchaseDate: 'desc' },
      }),
      this.prisma.purchase.count(),
    ]);

    return {
      data: purchases,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        vehicle: true,
        customer: true,
        dealership: true,
        salesperson: true,
        serviceOrders: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    return purchase;
  }

  async findByVehicle(vehicleId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: { vehicleId },
      include: {
        vehicle: true,
        customer: true,
        dealership: true,
        salesperson: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return purchases;
  }

  async findByCustomer(customerId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: { customerId },
      include: {
        vehicle: true,
        dealership: true,
        salesperson: true,
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return purchases;
  }

  async update(id: string, updatePurchaseDto: UpdatePurchaseDto) {
    try {
      return await this.prisma.purchase.update({
        where: { id },
        data: updatePurchaseDto,
        include: {
          vehicle: true,
          customer: true,
          dealership: true,
          salesperson: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Purchase not found');
      }
      throw error;
    }
  }

  async addOwnership(vehicleId: string, createOwnershipDto: CreateOwnershipDto) {
    // Close current ownership if exists
    await this.prisma.ownershipHistory.updateMany({
      where: {
        vehicleId,
        to: null,
      },
      data: {
        to: new Date(),
      },
    });

    // Create new ownership
    return await this.prisma.ownershipHistory.create({
      data: {
        vehicleId,
        ...createOwnershipDto,
        from: createOwnershipDto.from ? new Date(createOwnershipDto.from) : new Date(),
      },
      include: {
        vehicle: true,
        customer: true,
      },
    });
  }

  async getOwnershipHistory(vehicleId: string) {
    const history = await this.prisma.ownershipHistory.findMany({
      where: { vehicleId },
      include: {
        customer: true,
      },
      orderBy: { from: 'desc' },
    });

    return history;
  }

  async remove(id: string) {
    try {
      await this.prisma.purchase.delete({
        where: { id },
      });
      return { message: 'Purchase deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Purchase not found');
      }
      throw error;
    }
  }
}