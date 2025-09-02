import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateDealershipDto, UpdateDealershipDto } from './dto/dealership.dto';

@Injectable()
export class DealershipService {
  constructor(private prisma: PrismaService) {}

  async create(createDealershipDto: CreateDealershipDto) {
    try {
      return await this.prisma.dealership.create({
        data: createDealershipDto,
        include: {
          salespeople: true,
          purchases: {
            include: {
              customer: true,
              vehicle: true,
            },
          },
          serviceOrders: {
            include: {
              customer: true,
              vehicle: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Dealership code already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [dealerships, total] = await Promise.all([
      this.prisma.dealership.findMany({
        skip,
        take: limit,
        include: {
          salespeople: true,
          _count: {
            select: {
              purchases: true,
              serviceOrders: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.dealership.count(),
    ]);

    return {
      data: dealerships,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const dealership = await this.prisma.dealership.findUnique({
      where: { id },
      include: {
        salespeople: true,
        purchases: {
          include: {
            customer: true,
            vehicle: true,
          },
          orderBy: { purchaseDate: 'desc' },
          take: 10,
        },
        serviceOrders: {
          include: {
            customer: true,
            vehicle: true,
          },
          orderBy: { openedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!dealership) {
      throw new NotFoundException('Dealership not found');
    }

    return dealership;
  }

  async findByCode(code: string) {
    const dealership = await this.prisma.dealership.findUnique({
      where: { code },
      include: {
        salespeople: true,
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!dealership) {
      throw new NotFoundException('Dealership not found');
    }

    return dealership;
  }

  async update(id: string, updateDealershipDto: UpdateDealershipDto) {
    try {
      return await this.prisma.dealership.update({
        where: { id },
        data: updateDealershipDto,
        include: {
          salespeople: true,
          _count: {
            select: {
              purchases: true,
              serviceOrders: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Dealership not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.dealership.delete({
        where: { id },
      });
      return { message: 'Dealership deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Dealership not found');
      }
      throw error;
    }
  }
}