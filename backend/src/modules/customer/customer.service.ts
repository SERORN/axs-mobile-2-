import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      return await this.prisma.customer.create({
        data: createCustomerDto,
        include: {
          purchases: {
            include: {
              vehicle: true,
              dealership: true,
              salesperson: true,
            },
          },
          ownerships: {
            include: {
              vehicle: true,
            },
          },
          serviceOrders: {
            include: {
              vehicle: true,
              dealership: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              purchases: true,
              serviceOrders: true,
              ownerships: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        purchases: {
          include: {
            vehicle: true,
            dealership: true,
            salesperson: true,
          },
          orderBy: { purchaseDate: 'desc' },
        },
        ownerships: {
          include: {
            vehicle: true,
          },
          orderBy: { from: 'desc' },
        },
        serviceOrders: {
          include: {
            vehicle: true,
            dealership: true,
          },
          orderBy: { openedAt: 'desc' },
        },
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
            ownerships: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByEmail(email: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
            ownerships: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async findByPhone(phone: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { phone },
      include: {
        _count: {
          select: {
            purchases: true,
            serviceOrders: true,
            ownerships: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    try {
      return await this.prisma.customer.update({
        where: { id },
        data: updateCustomerDto,
        include: {
          _count: {
            select: {
              purchases: true,
              serviceOrders: true,
              ownerships: true,
            },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not found');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.customer.delete({
        where: { id },
      });
      return { message: 'Customer deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Customer not found');
      }
      throw error;
    }
  }
}