import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateSalespersonDto, UpdateSalespersonDto } from './dto/salesperson.dto';

@Injectable()
export class SalespersonService {
  constructor(private prisma: PrismaService) {}

  async create(createSalespersonDto: CreateSalespersonDto) {
    try {
      return await this.prisma.salesperson.create({
        data: {
          ...createSalespersonDto,
          hiredAt: createSalespersonDto.hiredAt 
            ? new Date(createSalespersonDto.hiredAt)
            : new Date(),
        },
        include: {
          dealership: true,
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
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 20, dealershipId?: string) {
    const skip = (page - 1) * limit;
    const where = dealershipId ? { dealershipId } : {};
    
    const [salespeople, total] = await Promise.all([
      this.prisma.salesperson.findMany({
        skip,
        take: limit,
        where,
        include: {
          dealership: true,
          _count: {
            select: {
              purchases: true,
              serviceOrders: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.salesperson.count({ where }),
    ]);

    return {
      data: salespeople,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
      include: {
        dealership: true,
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

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    return salesperson;
  }

  async findByDealership(dealershipId: string) {
    const salespeople = await this.prisma.salesperson.findMany({
      where: { dealershipId },
      include: {
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return salespeople;
  }

  async findByEmail(email: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { email },
      include: {
        dealership: true,
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
          },
        },
      },
    });

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    return salesperson;
  }

  async update(id: string, updateSalespersonDto: UpdateSalespersonDto) {
    try {
      const updateData: any = { ...updateSalespersonDto };
      
      if (updateSalespersonDto.hiredAt) {
        updateData.hiredAt = new Date(updateSalespersonDto.hiredAt);
      }

      return await this.prisma.salesperson.update({
        where: { id },
        data: updateData,
        include: {
          dealership: true,
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
        throw new NotFoundException('Salesperson not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.salesperson.delete({
        where: { id },
      });
      return { message: 'Salesperson deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Salesperson not found');
      }
      throw error;
    }
  }
}