import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './external/database/database.module';
import { ApiModule } from './external/api/api.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ApiModule,
  ],
  controllers: [],
})
export class AppModule {}

