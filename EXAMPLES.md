# 📝 Exemplos de Uso da API

Este documento contém exemplos práticos de como usar a API do Customers Service.

## 🚀 Iniciar o Serviço

```bash
# Com Docker Compose
docker-compose up -d

# Ou localmente
npm run start:dev
```

## 📋 Endpoints Disponíveis

### 1. Health Check

```bash
curl http://localhost:3000/health
```

**Resposta:**
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

### 2. Listar Todos os Clientes

```bash
curl http://localhost:3000/customers
```

**Resposta:**
```json
[
  {
    "id": "3f69217b-d5a0-4dd3-9005-719277ea325b",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "cpf": "12345678901"
  },
  {
    "id": "56942f40-4dc0-4c46-a012-557c189eaf17",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "cpf": "12345678902"
  }
]
```

### 3. Buscar Cliente por CPF

```bash
curl http://localhost:3000/customers/12345678901
```

**Resposta:**
```json
{
  "id": "3f69217b-d5a0-4dd3-9005-719277ea325b",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901"
}
```

### 4. Buscar Cliente por ID

```bash
curl http://localhost:3000/customers/id/3f69217b-d5a0-4dd3-9005-719277ea325b
```

**Resposta:**
```json
{
  "id": "3f69217b-d5a0-4dd3-9005-719277ea325b",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901"
}
```

### 5. Criar Novo Cliente

```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria.silva@example.com",
    "cpf": "98765432100"
  }'
```

**Resposta:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### 6. Atualizar Cliente

```bash
curl -X PATCH http://localhost:3000/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva Santos",
    "email": "maria.santos@example.com"
  }'
```

**Resposta:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Maria Silva Santos",
  "email": "maria.santos@example.com",
  "cpf": "98765432100"
}
```

### 7. Deletar Cliente

```bash
curl -X DELETE http://localhost:3000/customers/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Resposta:** `204 No Content`

## 🧪 Testando com Postman/Insomnia

### Collection JSON (Postman)

```json
{
  "info": {
    "name": "Customers Service API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "List Customers",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3000/customers",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["customers"]
        }
      }
    },
    {
      "name": "Create Customer",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Test Customer\",\n  \"email\": \"test@example.com\",\n  \"cpf\": \"12345678900\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/customers",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["customers"]
        }
      }
    }
  ]
}
```

## 📚 Swagger UI

Acesse a documentação interativa da API em:

```
http://localhost:3000/docs
```

A interface Swagger permite:
- ✅ Visualizar todos os endpoints
- ✅ Testar requisições diretamente no navegador
- ✅ Ver exemplos de requisições e respostas
- ✅ Validar schemas de dados

## ⚠️ Erros Comuns

### Cliente já existe (CPF duplicado)

```json
{
  "statusCode": 500,
  "message": "Customer with this CPF already exists"
}
```

### Cliente não encontrado

```json
{
  "statusCode": 500,
  "message": "Customer not found"
}
```

### Validação de campos

```json
{
  "statusCode": 400,
  "message": [
    "name must be a string",
    "email must be a string",
    "cpf must be a string"
  ],
  "error": "Bad Request"
}
```

## 🔄 Integração com Outros Serviços

### Exemplo: Buscar cliente antes de criar pedido

```javascript
// Em outro microserviço (Orders Service)
const customerResponse = await fetch('http://application-clientes:3000/customers/12345678901');
const customer = await customerResponse.json();

if (customer) {
  // Criar pedido com customerId
  const order = {
    customerId: customer.id,
    items: [...]
  };
}
```

## 📊 Monitoramento

### Health Check para Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
```

