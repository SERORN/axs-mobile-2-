import { Module } from '@nestjs/common';
import { SalespersonController } from './salesperson.controller';
import { SalespersonService } from './salesperson.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SalespersonController],
  providers: [SalespersonService],
  exports: [SalespersonService],
})
export class SalespersonModule {}