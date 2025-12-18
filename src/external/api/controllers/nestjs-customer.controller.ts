import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CustomerIdDto } from 'src/core/common/dtos/customer-id.dto';
import { CustomerDTO } from 'src/core/common/dtos/customer.dto';
import { CustomersController } from 'src/core/customers/operation/controllers/customers-controller';
import { ICustomerDataSource } from 'src/interfaces/customer-datasource';
import { CreateCustomerDto } from '../dtos/create-customer.dto';
import { UpdateCustomerDto } from '../dtos/update-customer.dto';


@Controller('customers')
export class NestJSCustomerController {
  constructor(private readonly customersDatasource: ICustomerDataSource) {}
  
  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retorna todas os clientes',
    type: [CustomerDTO]
  })  
  async findAll() {
      return await CustomersController.findAll(this.customersDatasource);
    }

    @Get(':cpf')
    @ApiOperation({summary: 'Busca o cliente pelo CPF'})
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'Retorna um cliente',
      type: CustomerDTO
    })
  async findByCpf(@Param('cpf') cpf: string): Promise<CustomerDTO> {
    return await CustomersController.findByCpf(cpf, this.customersDatasource)
  }

  @Get('id/:id')
  @ApiOperation({summary: 'Busca o cliente pelo ID'})
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retorna um cliente',
    type: CustomerDTO
  })
  async findById(@Param('id') id: string): Promise<CustomerDTO> {
    return await CustomersController.findById(id, this.customersDatasource)
  }

  @Post()
  @ApiOperation({
    summary: 'Criar novo cliente',
    description: 'Retorna o objeto do cliente criado.',
  })
  @ApiResponse({
    description: 'Retorna o cliente criado',
    status: HttpStatus.CREATED,
    type: CustomerIdDto,    
  })
  async create(@Body() createCustomer: CreateCustomerDto) {
    return await CustomersController.save(createCustomer, this.customersDatasource);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar cliente',
    description: 'Atualiza um cliente existente.',
  })
  @ApiResponse({
    description: 'Retorna o cliente atualizado',
    status: HttpStatus.OK,
    type: CustomerDTO,    
  })
  async update(@Param('id') id: string, @Body() updateCustomer: UpdateCustomerDto) {
    return await CustomersController.update({ id, ...updateCustomer }, this.customersDatasource);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar cliente',
    description: 'Remove um cliente do sistema.',
  })
  @ApiResponse({
    description: 'Cliente deletado com sucesso',
    status: HttpStatus.NO_CONTENT,    
  })
  async delete(@Param('id') id: string) {
    await CustomersController.delete(id, this.customersDatasource);
  }
}

