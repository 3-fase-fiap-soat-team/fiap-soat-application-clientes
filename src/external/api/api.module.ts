import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './controllers/health.controller';
import { NestJSCustomerController } from './controllers/nestjs-customer.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, TerminusModule],
  controllers: [
    HealthController,
    NestJSCustomerController,
  ],
})
export class ApiModule {}

