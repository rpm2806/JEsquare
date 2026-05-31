import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { JEsquareeratorService } from './test-generator.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TestsController],
  providers: [TestsService, JEsquareeratorService],
  exports: [TestsService, JEsquareeratorService],
})
export class TestsModule {}
