import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async getTenantBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: {
        sites: {
          include: {
            accessPoints: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug ${slug} not found`);
    }

    return tenant;
  }

  async getSites(tenantId: string) {
    return this.prisma.site.findMany({
      where: { tenantId },
      include: {
        accessPoints: true,
      },
    });
  }
}