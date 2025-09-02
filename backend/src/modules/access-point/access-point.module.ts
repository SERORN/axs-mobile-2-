import { Module } from '@nestjs/common';
import { AccessPointController } from './access-point.controller';
import { AccessPointService } from './access-point.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccessPointController],
  providers: [AccessPointService],
  exports: [AccessPointService],
})
export class AccessPointModule {}