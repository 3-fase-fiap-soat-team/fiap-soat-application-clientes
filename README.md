# 🚀 Application Clientes - Microserviço de Clientes

Microserviço independente para gerenciamento de clientes, extraído do sistema monolítico SOAT Tech Challenge.

---

## 🎯 Sobre o Projeto

Este microserviço é responsável por todas as operações relacionadas a clientes:
- ✅ **CRUD completo** de clientes
- ✅ **Busca por CPF** e ID
- ✅ **Validação de unicidade** (CPF e email)
- ✅ **Arquitetura Limpa** (Clean Architecture + CQRS)
- ✅ **Deploy cloud-native** (Kubernetes EKS + PostgreSQL RDS)

---

## 🏗️ Arquitetura

O microserviço segue a **Clean Architecture** com separação clara de responsabilidades:

```
src/
├── core/                    # 🔴 DOMAIN + APPLICATION LAYER
│   ├── customers/          # Domínio: Clientes
│   │   ├── entities/       # Entidades de negócio
│   │   ├── operation/
│   │   │   ├── gateways/   # Interfaces (portas)
│   │   │   ├── presenters/ # Transformadores
│   │   │   └── controllers/# Controllers de domínio
│   │   └── usecases/       # Casos de uso (CQRS)
│   │       ├── commands/   # Operações de escrita
│   │       └── queries/    # Operações de leitura
│   └── common/             # Compartilhado
│       └── dtos/
│
├── external/                # 🟢 INFRASTRUCTURE + INTERFACE LAYER
│   ├── api/                # Controllers NestJS (HTTP)
│   │   ├── controllers/
│   │   └── dtos/
│   └── database/           # Persistência (TypeORM)
│       ├── entities/
│       ├── mappers/
│       └── repositories/
│
├── interfaces/             # Interfaces (portas)
├── config/                 # Configurações
├── app.module.ts           # Módulo principal
└── main.ts                 # Entrypoint
```

### Princípios Aplicados

1. ✅ **Separação de Camadas**: Domínio isolado da infraestrutura
2. ✅ **CQRS**: Commands (escrita) e Queries (leitura) separados
3. ✅ **Dependency Inversion**: Domínio define interfaces, infraestrutura implementa
4. ✅ **Use Cases**: Lógica de negócio orquestrada por casos de uso
5. ✅ **Testabilidade**: Domínio testável sem dependências externas

---

## 🚀 Deploy e Execução

### Pré-requisitos

- ✅ **Node.js** 20.x
- ✅ **PostgreSQL** 17.x (local ou RDS)
- ✅ **Docker** e **Docker Compose** (opcional, para desenvolvimento)
- ✅ **AWS CLI** configurado (para deploy em produção)

### 1️⃣ Execução Local com Docker Compose

```bash
# Iniciar banco de dados e aplicação
docker-compose up -d

# Verificar logs
docker-compose logs -f application-clientes

# Parar serviços
docker-compose down
```

### 2️⃣ Execução Local (Desenvolvimento)

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Rodar migrações
npm run migration:up

# Iniciar aplicação em modo desenvolvimento
npm run start:dev
```

### 3️⃣ Build e Deploy em Produção

```bash
# Build da aplicação
npm run build

# Build da imagem Docker
docker build -t fiap-soat-application-clientes:latest .

# Tag para ECR (se necessário)
docker tag fiap-soat-application-clientes:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-application-clientes:latest

# Push para ECR
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-application-clientes:latest
```

---

## 🗄️ Banco de Dados

### Variáveis de Ambiente Obrigatórias

```bash
DATABASE_HOST=localhost          # ou endpoint RDS
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=customers_db
DATABASE_SSL=false               # true para AWS RDS
NODE_ENV=development
PORT=3000
```

### Migrações TypeORM

```bash
# Criar nova migração
npm run migration:create -- -n NomeDaMigracao

# Executar migrações
npm run migration:up

# Reverter migração
npm run migration:down
```

### Schema da Tabela Customer

```sql
CREATE TABLE customer (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    cpf CHAR(11) UNIQUE,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📊 Endpoints da API

### Health Checks
- `GET /health` - Status da aplicação e conectividade com banco

### Documentação
- `GET /docs` - Swagger UI com documentação completa da API

### Clientes

#### Listar todos os clientes
```http
GET /customers
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "cpf": "12345678901"
  }
]
```

#### Buscar cliente por CPF
```http
GET /customers/:cpf
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901"
}
```

#### Buscar cliente por ID
```http
GET /customers/id/:id
```

#### Criar cliente
```http
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "cpf": "12345678901"
}
```

**Resposta:**
```json
{
  "id": "uuid"
}
```

#### Atualizar cliente
```http
PATCH /customers/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane.doe@example.com"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "cpf": "12345678901"
}
```

#### Deletar cliente
```http
DELETE /customers/:id
```

**Resposta:** `204 No Content`

---

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 🔄 Padrão CQRS

O microserviço implementa o padrão **CQRS** (Command Query Responsibility Segregation):

### Commands (Escrita)
- `CreateCustomerUseCase` - Criar cliente
- `UpdateCustomerUseCase` - Atualizar cliente
- `DeleteCustomerUseCase` - Deletar cliente

### Queries (Leitura)
- `GetAllCustomersQuery` - Listar todos os clientes
- `GetCustomerByCpfQuery` - Buscar por CPF
- `GetCustomerByIdQuery` - Buscar por ID

---

## 🐳 Docker

### Build da Imagem

```bash
docker build -t fiap-soat-application-clientes:latest .
```

### Executar Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=postgres \
  -e DATABASE_NAME=customers_db \
  -e NODE_ENV=production \
  fiap-soat-application-clientes:latest
```

---

## 📦 Estrutura de Módulos

### Core (Domínio)
- **Entities**: Entidades de negócio (`Customer`)
- **Factories**: Criação de entidades (`CustomerFactory`)
- **Gateways**: Interfaces para acesso a dados (`CustomersGateway`)
- **Use Cases**: Lógica de negócio (Commands e Queries)
- **Presenters**: Transformação de dados para DTOs

### External (Infraestrutura)
- **API**: Controllers HTTP NestJS
- **Database**: Repositórios TypeORM, Entities, Mappers

---

## 🔐 Validações

O microserviço implementa as seguintes validações:

1. **CPF único**: Não permite criar cliente com CPF já existente
2. **Email único**: Não permite criar cliente com email já existente
3. **Campos obrigatórios**: name, email, cpf são obrigatórios na criação
4. **Validação de existência**: Verifica se cliente existe antes de atualizar/deletar

---

## 🚀 Próximos Passos

Para completar a migração para microserviços:

1. ✅ **Customers Service** (este repositório) - **CONCLUÍDO**
2. ⏳ **Products Service** - Gerenciamento de produtos
3. ⏳ **Orders Service** - Gerenciamento de pedidos
4. ⏳ **Categories Service** - Gerenciamento de categorias
5. ⏳ **API Gateway** - Roteamento e orquestração
6. ⏳ **Service Discovery** - Descoberta de serviços
7. ⏳ **Message Broker** - Comunicação assíncrona (RabbitMQ/Kafka)

---

## 📚 Links Úteis

- 📦 [Repositório Principal](https://github.com/3-fase-fiap-soat-team/fiap-soat-application)
- 🗄️ [Repositório RDS Terraform](https://github.com/3-fase-fiap-soat-team/fiap-soat-database-terraform)
- ☸️ [Repositório EKS + Kubernetes](https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform)

---

## 🛠️ Troubleshooting

### Aplicação não conecta ao banco

```bash
# Verificar variáveis de ambiente
echo $DATABASE_HOST
echo $DATABASE_PORT

# Testar conectividade
psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USERNAME -d $DATABASE_NAME
```

### Erro de migração

```bash
# Verificar se a tabela já existe
psql -h $DATABASE_HOST -U $DATABASE_USERNAME -d $DATABASE_NAME -c "\dt customer"

# Reverter e rodar novamente
npm run migration:down
npm run migration:up
```

### Porta já em uso

```bash
# Alterar porta no .env
PORT=3001

# Ou matar processo na porta 3000
lsof -ti:3000 | xargs kill -9
```



