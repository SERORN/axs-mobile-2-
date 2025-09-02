import { Module } from '@nestjs/common';
import { VisitController } from './visit.controller';
import { VisitService } from './visit.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';
import { AccessPointModule } from '../access-point/access-point.module';

@Module({
  imports: [PrismaModule, AccessPointModule],
  controllers: [VisitController],
  providers: [VisitService],
  exports: [VisitService],
})
export class VisitModule {}