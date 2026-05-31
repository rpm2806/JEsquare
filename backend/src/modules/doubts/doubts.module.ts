import { Module } from '@nestjs/common';
import { DoubtsController } from './doubts.controller';
import { DoubtsService } from './doubts.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DoubtsController],
  providers: [DoubtsService],
  exports: [DoubtsService],
})
export class DoubtsModule {}
