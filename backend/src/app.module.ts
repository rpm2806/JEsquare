import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { InstitutesModule } from './modules/institutes/institutes.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { TestsModule } from './modules/tests/tests.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { DoubtsModule } from './modules/doubts/doubts.module';
import { StorageModule } from './modules/storage/storage.module';
import { PaymentModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    InstitutesModule,
    QuestionsModule,
    TestsModule,
    AttemptsModule,
    PdfModule,
    AnalyticsModule,
    SubscriptionsModule,
    OcrModule,
    DoubtsModule,
    StorageModule,
    PaymentModule,
  ],
})
export class AppModule {}
