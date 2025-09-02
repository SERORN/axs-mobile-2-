import { Module } from '@nestjs/common';
import { DealershipController } from './dealership.controller';
import { DealershipService } from './dealership.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DealershipController],
  providers: [DealershipService],
  exports: [DealershipService],
})
export class DealershipModule {}