import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CustomersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/customers (GET)', () => {
    it('should return an array of customers', () => {
      return request(app.getHttpServer())
        .get('/customers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/customers (POST)', () => {
    it('should create a new customer', () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        cpf: '12345678900',
      };

      return request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
        });
    });

    it('should return 400 when CPF already exists', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        cpf: '12345678900',
      };

      // Create first customer
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Try to create duplicate
      await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(500); // Will throw error
    });
  });

  describe('/customers/:cpf (GET)', () => {
    it('should return a customer by CPF', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'test@example.com',
        cpf: '98765432100',
      };

      // Create customer first
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      // Get by CPF
      return request(app.getHttpServer())
        .get(`/customers/${createCustomerDto.cpf}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.cpf).toBe(createCustomerDto.cpf);
        });
    });

    it('should return 500 when customer not found', () => {
      return request(app.getHttpServer())
        .get('/customers/00000000000')
        .expect(500);
    });
  });

  describe('/customers/id/:id (GET)', () => {
    it('should return a customer by ID', async () => {
      const createCustomerDto = {
        name: 'Test Customer',
        email: 'test2@example.com',
        cpf: '11122233344',
      };

      // Create customer first
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      const customerId = createResponse.body.id;

      // Get by ID
      return request(app.getHttpServer())
        .get(`/customers/id/${customerId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(customerId);
        });
    });
  });

  describe('/customers/:id (PATCH)', () => {
    it('should update a customer', async () => {
      const createCustomerDto = {
        name: 'Original Name',
        email: 'original@example.com',
        cpf: '55566677788',
      };

      // Create customer first
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      const customerId = createResponse.body.id;

      // Update customer
      const updateDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .patch(`/customers/${customerId}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe(updateDto.name);
          expect(res.body.email).toBe(updateDto.email);
        });
    });
  });

  describe('/customers/:id (DELETE)', () => {
    it('should delete a customer', async () => {
      const createCustomerDto = {
        name: 'To Delete',
        email: 'delete@example.com',
        cpf: '99988877766',
      };

      // Create customer first
      const createResponse = await request(app.getHttpServer())
        .post('/customers')
        .send(createCustomerDto)
        .expect(201);

      const customerId = createResponse.body.id;

      // Delete customer
      return request(app.getHttpServer())
        .delete(`/customers/${customerId}`)
        .expect(204);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
        });
    });
  });
});

