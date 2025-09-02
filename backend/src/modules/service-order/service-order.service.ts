import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { CreateServiceOrderDto, UpdateServiceOrderDto, CreatePaymentIntentForServiceDto } from './dto/service-order.dto';
import Stripe from 'stripe';

@Injectable()
export class ServiceOrderService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2023-10-16',
      });
    }
  }

  async create(createServiceOrderDto: CreateServiceOrderDto) {
    try {
      return await this.prisma.serviceOrder.create({
        data: {
          ...createServiceOrderDto,
          openedAt: createServiceOrderDto.openedAt 
            ? new Date(createServiceOrderDto.openedAt)
            : new Date(),
        },
        include: {
          dealership: true,
          vehicle: true,
          customer: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Service order number already exists');
      }
      throw error;
    }
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const [serviceOrders, total] = await Promise.all([
      this.prisma.serviceOrder.findMany({
        skip,
        take: limit,
        include: {
          dealership: true,
          vehicle: true,
          customer: true,
        },
        orderBy: { openedAt: 'desc' },
      }),
      this.prisma.serviceOrder.count(),
    ]);

    return {
      data: serviceOrders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        dealership: true,
        vehicle: true,
        customer: true,
        purchase: true,
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    return serviceOrder;
  }

  async findByOrderNumber(orderNumber: string) {
    const serviceOrder = await this.prisma.serviceOrder.findUnique({
      where: { orderNumber },
      include: {
        dealership: true,
        vehicle: true,
        customer: true,
      },
    });

    if (!serviceOrder) {
      throw new NotFoundException('Service order not found');
    }

    return serviceOrder;
  }

  async update(id: string, updateServiceOrderDto: UpdateServiceOrderDto) {
    try {
      const updateData: any = { ...updateServiceOrderDto };
      
      if (updateServiceOrderDto.closedAt) {
        updateData.closedAt = new Date(updateServiceOrderDto.closedAt);
      }

      return await this.prisma.serviceOrder.update({
        where: { id },
        data: updateData,
        include: {
          dealership: true,
          vehicle: true,
          customer: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Service order not found');
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: string) {
    try {
      return await this.prisma.serviceOrder.update({
        where: { id },
        data: { 
          status: status as any,
          ...(status === 'DELIVERED' && { closedAt: new Date() }),
        },
        include: {
          dealership: true,
          vehicle: true,
          customer: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Service order not found');
      }
      throw error;
    }
  }

  async createPaymentIntent(id: string, createPaymentDto: CreatePaymentIntentForServiceDto) {
    const serviceOrder = await this.findOne(id);
    
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(createPaymentDto.amount * 100), // Convert to cents
        currency: createPaymentDto.currency.toLowerCase(),
        description: createPaymentDto.description || `Service Order ${serviceOrder.orderNumber}`,
        metadata: {
          serviceOrderId: id,
          vehicleVin: serviceOrder.vehicle?.vin || '',
          dealershipId: serviceOrder.dealershipId,
          customerId: serviceOrder.customerId,
          orderNumber: serviceOrder.orderNumber,
        },
      });

      // Update service order with payment intent
      await this.prisma.serviceOrder.update({
        where: { id },
        data: {
          amount: createPaymentDto.amount,
          metadata: {
            ...serviceOrder.metadata as any,
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      });

      return {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.serviceOrder.delete({
        where: { id },
      });
      return { message: 'Service order deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Service order not found');
      }
      throw error;
    }
  }
}