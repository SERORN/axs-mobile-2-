import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async getHealthStatus() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async getDetailedHealthStatus() {
    const baseStatus = await this.getHealthStatus();
    
    // Check database connection
    let databaseStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      databaseStatus = 'error';
      console.error('Database health check failed:', error);
    }

    return {
      ...baseStatus,
      services: {
        database: {
          status: databaseStatus,
        },
        api: {
          status: 'ok',
        },
      },
    };
  }
}
