import { Module } from '@nestjs/common';
import { InstitutesController } from './institutes.controller';
import { InstitutesService } from './institutes.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InstitutesController],
  providers: [InstitutesService],
  exports: [InstitutesService],
})
export class InstitutesModule {}
