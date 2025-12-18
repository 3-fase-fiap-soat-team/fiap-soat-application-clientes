import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from 'src/config/database.config';
import { OrmCustomerRepository } from './repositories/customer.repository';
import { CustomerEntity } from './entities/customer.entity';
import { ICustomerDataSource } from 'src/interfaces/customer-datasource';

@Module({
  imports: [
    TypeOrmModule.forRoot(getTypeOrmConfig()),
    TypeOrmModule.forFeature([
      CustomerEntity,
    ]),
  ],
  providers: [
    {
      provide: ICustomerDataSource,
      useClass: OrmCustomerRepository,
    },
  ],
  exports: [
    ICustomerDataSource,
  ],
})
export class DatabaseModule {}

