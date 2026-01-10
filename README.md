# 🚀 SOAT Tech Challenge — Serviço de Clientes (Cloud-Native)

Repositório do serviço de **Clientes** do SOAT Tech Challenge. Implementa CRUD completo de clientes usando **Clean Architecture**, **TypeORM** e está preparado para deployment cloud-native (EKS + RDS).

---

## 🎯 Sobre o Projeto

Serviço responsável por gerenciar os clientes do SOAT. Principais características:
- ✅ **API REST** para CRUD completo de clientes
- ✅ **Busca por CPF e ID** de clientes
- ✅ **Validação de unicidade** (CPF e email)
- ✅ **Clean Architecture** (domain-first)
- ✅ **TypeORM** com migrations para persistência em PostgreSQL
- ✅ **Testes unitários e E2E** (Jest)
- ✅ **Pronto para deploy cloud-native** (EKS + RDS)

> **Nota**: Este repositório implementa apenas o serviço de clientes — outras responsabilidades do sistema (produtos, pedidos, categorias, pagamentos, autenticação) estão em repositórios separados listados em "Links Úteis".

---

## 🏗️ Arquitetura Cloud-Native

```
┌─────────────────────────────────────────────────────────────┐
│                        AWS CLOUD                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌─────────────────────────────┐    │
│  │  API Gateway │──────▶│  Lambda (Auth/Signup)      │    │
│  │  REST API    │      │  Node.js 20.x              │    │
│  └──────────────┘      └─────────────────────────────┘    │
│         │                           │                       │
│         │                           ▼                       │
│         │                  ┌──────────────────┐            │
│         │                  │  Cognito User Pool│            │
│         │                  │  (custom:cpf)     │            │
│         │                  └──────────────────┘            │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────┐         │
│  │  Network Load Balancer (NLB)                 │         │
│  │  ade6621a32ddf...elb.us-east-1.amazonaws.com │         │
│  └──────────────────────────────────────────────┘         │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  EKS Cluster (fiap-soat-eks-dev)                   │  │
│  │  Kubernetes 1.30 | 2x t3.micro nodes               │  │
│  │                                                     │  │
│  │  ┌────────────────────────────────────────────┐   │  │
│  │  │  Namespace: fiap-soat-app                  │   │  │
│  │  │  ┌──────────────────────────────────────┐  │   │  │
│  │  │  │  Deployment: fiap-soat-application   │  │   │  │
│  │  │  │  - Image: NestJS (ECR)               │  │   │  │
│  │  │  │  - HPA: 1-3 replicas (auto)          │  │   │  │
│  │  │  │  - Resources: 512Mi/500m CPU         │  │   │  │
│  │  │  │  - Health Checks: /health            │  │   │  │
│  │  │  │  - Port: 3000                        │  │   │  │
│  │  │  └──────────────────────────────────────┘  │   │  │
│  │  └────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  RDS PostgreSQL (fiap-soat-db)                      │  │
│  │  PostgreSQL 17.4 | db.t3.micro                      │  │
│  │  Endpoint: fiap-soat-db.cfcimi4ia52v...amazonaws.com│  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deploy e Execução

### ⚠️ Observação: Deploy cloud-native recomendado

A aplicação é pensada para deployment em cloud (EKS + RDS), porém é possível rodar em ambiente local para desenvolvimento e testes (usando um arquivo `.env` apropriado, `npm run start:dev` ou `docker-compose up`).

### Pré-requisitos

- ✅ **EKS Cluster** configurado ([repo EKS](https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform))
- ✅ **RDS PostgreSQL** provisionado ([repo RDS](https://github.com/3-fase-fiap-soat-team/fiap-soat-database-terraform))
- ✅ **Lambda + Cognito** deployado ([repo Lambda](https://github.com/3-fase-fiap-soat-team/fiap-soat-lambda))
- ✅ **AWS CLI** configurado
- ✅ **kubectl** instalado e configurado
- ✅ **Docker** instalado

### 🔧 Rodando localmente

Opções para desenvolvimento local:

- Usando Node:

```bash
# instalar dependências
npm install

# criar um arquivo .env.local (exemplo abaixo) ou exportar variáveis
# .env.local
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=customers_db
DATABASE_SSL=false
NODE_ENV=development
PORT=3000

# rodar em modo dev
npm run start:dev

# rodar migrações
npm run migration:up

# rodar testes
npm run test
```

- Usando Docker Compose (requer Postgres acessível ou ajuste do `.env`):

```bash
docker-compose up --build
```

### 1️⃣ Build e Push da Imagem

```bash
# Build da imagem Docker
docker build -t fiap-soat-application-clientes:latest .

# Tag para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
docker tag fiap-soat-application-clientes:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-application-clientes:latest

# Push para ECR
docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-application-clientes:latest
```

### 2️⃣ Deploy no Kubernetes

```bash
# Aplicar manifests (do repositório EKS)
cd ../fiap-soat-k8s-terraform

# Infraestrutura Kubernetes (namespace, configmap, secret, service, HPA)
kubectl apply -f manifests/namespace.yaml
kubectl apply -f manifests/configmap.yaml
kubectl apply -f manifests/secret.yaml
kubectl apply -f manifests/service.yaml
kubectl apply -f manifests/hpa.yaml

# Deployment da aplicação (neste repositório)
cd ../fiap-soat-application-clientes
kubectl apply -f k8s/deployment.yaml

# Verificar deployment
kubectl get all -n fiap-soat-app
kubectl logs -f deployment/fiap-soat-application-clientes -n fiap-soat-app
```

> **📝 Nota**: O deployment agora está neste repositório (`k8s/deployment.yaml`) e usa os recursos padronizados:
> - Container: `fiap-soat-application-clientes`
> - ConfigMap: `fiap-soat-application-clientes-config`
> - Secret: `fiap-soat-application-clientes-secrets`
> - Service: `fiap-soat-application-clientes-service`
> - Health Checks: Liveness + Readiness probes (`/health`)
> - HPA: Autoscaling 1-3 replicas (gerenciado pelo repo EKS)

### 3️⃣ Rodar Migrações

```bash
# Conectar ao pod
kubectl exec -it deployment/fiap-soat-application-clientes -n fiap-soat-app -- /bin/sh

# Rodar migrações
npm run migration:up
```

### 4️⃣ Verificar Health

```bash
# Obter Load Balancer URL
kubectl get svc fiap-soat-application-clientes-service -n fiap-soat-app

# Testar endpoints
curl http://<LOAD_BALANCER_URL>/health
curl http://<LOAD_BALANCER_URL>/docs  # Swagger
```

---

## 📂 Arquitetura Limpa (Clean Architecture)

Estrutura de camadas bem definidas:

```
src/
├── core/                    # 🔴 DOMAIN + APPLICATION LAYER
│   ├── customers/          # Domínio: Clientes
│   │   ├── entities/       # Entidades de negócio
│   │   ├── operation/
│   │   │   ├── gateways/    # Interfaces (portas)
│   │   │   ├── presenters/  # Transformadores
│   │   │   └── controllers/ # Controllers de domínio
│   │   └── usecases/        # Casos de uso (CQRS)
│   │       ├── commands/    # Operações de escrita
│   │       └── queries/     # Operações de leitura
│   └── common/              # Compartilhado
│       ├── dtos/
│       └── exceptions/
│
├── external/                # 🟢 INFRASTRUCTURE + INTERFACE LAYER
│   ├── api/                 # Controllers NestJS (HTTP)
│   │   ├── controllers/
│   │   └── dtos/
│   ├── database/            # Persistência (TypeORM)
│   │   ├── entities/
│   │   ├── mappers/
│   │   └── repositories/
│   ├── gateways/            # Integrações externas
│   └── providers/           # Serviços externos
│
├── interfaces/              # Interfaces (portas)
├── config/                  # Configurações
│   └── database.config.ts   # Config cloud-native
├── app.module.ts            # Módulo principal
└── main.ts                  # Entrypoint + validação
```

### Princípios Aplicados

1. ✅ **Separação de Camadas**: Domínio isolado da infraestrutura
2. ✅ **CQRS**: Commands (escrita) e Queries (leitura) separados
3. ✅ **Dependency Inversion**: Domínio define interfaces, infraestrutura implementa
4. ✅ **Use Cases**: Lógica de negócio orquestrada por casos de uso
5. ✅ **Testabilidade**: Domínio testável sem dependências externas

---

## 🔐 Autenticação Serverless

### Lambda + Cognito

```bash
# Signup (criar cliente + user Cognito)
curl -X POST https://nlxpeaq6w0.execute-api.us-east-1.amazonaws.com/dev/signup \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678900",
    "name": "João Silva",
    "email": "joao@example.com"
  }'

# Auth (validar CPF + retornar JWT)
curl -X GET https://nlxpeaq6w0.execute-api.us-east-1.amazonaws.com/dev/auth/12345678900
```

### Fluxo de Autenticação

1. **Signup**: Lambda → NestJS (criar customer) → Cognito (criar user) → JWT
2. **Auth**: Lambda → NestJS (buscar customer) → Cognito (validar) → JWT
3. **Protected Routes**: Validar JWT no NestJS (middleware/guard)

---

## 🗄️ Banco de Dados

### Variáveis de Ambiente Obrigatórias

```bash
# .env.rds (Kubernetes Secret)
DATABASE_HOST=fiap-soat-db.cfcimi4ia52v.us-east-1.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_USERNAME=postgresadmin
DATABASE_PASSWORD=SuperSecret123!
DATABASE_NAME=customers_db
DATABASE_SSL=true
NODE_ENV=production
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

## 📊 Endpoints Principais

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

## 📚 Links Úteis

- 📦 [Repositório EKS + Kubernetes](https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform)
- 🗄️ [Repositório RDS Terraform](https://github.com/3-fase-fiap-soat-team/fiap-soat-database-terraform)
- ⚡ [Repositório Lambda + Cognito](https://github.com/3-fase-fiap-soat-team/fiap-soat-lambda)
- 🎨 [Desenho de Fluxo (Miro)](https://miro.com/app/board/uXjVJXtfEMw=/)
- 🏗️ [Diagrama de Infraestrutura](https://drive.google.com/file/d/12MQ86MMUuziVfoD7i3s9g8UmBE3q78vQ/view)

---

## 🔄 CI/CD e Deploy Automatizado

### GitHub Actions Workflow

O repositório possui um workflow CI/CD completo (`.github/workflows/ci-cd-eks.yml`) que:

1. **🧪 Testes** (Pull Requests)
   - Executa linting
   - Roda testes unitários
   - Valida build da aplicação

2. **🐳 Build & Push** (Push para main)
   - Build da imagem Docker
   - Tag versionada com SHA do commit
   - Push para Amazon ECR

3. **🚀 Deploy para EKS** (Após build)
   - Configura kubectl
   - Cria deployment se não existir
   - Atualiza imagem do deployment
   - Aguarda rollout completar
   - Verifica health da aplicação

4. **📢 Notificação** (Sempre)
   - Relatório de sucesso/falha
   - Informações do deployment

### Separação de Responsabilidades

**Repositório EKS (`fiap-soat-k8s-terraform`)**:
- ✅ Provisiona cluster EKS via Terraform
- ✅ Aplica infraestrutura K8s (namespace, configmap, secret, service, HPA)

**Repositório Application (este)**:
- ✅ Build e push de imagem Docker
- ✅ Gerencia deployment.yaml
- ✅ Atualiza aplicação no cluster

### Secrets Necessários

Configure no GitHub (`Settings` > `Secrets and variables` > `Actions`):

| Secret | Descrição |
|--------|-----------|
| `AWS_DEFAULT_REGION` | Região AWS (ex: `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | Access Key da AWS |
| `AWS_SECRET_ACCESS_KEY` | Secret Key da AWS |
| `AWS_SESSION_TOKEN` | Session Token (AWS Academy) |


---

## 🔐 Validações

O microserviço implementa as seguintes validações:

1. **CPF único**: Não permite criar cliente com CPF já existente
2. **Email único**: Não permite criar cliente com email já existente
3. **Campos obrigatórios**: name, email, cpf são obrigatórios na criação
4. **Validação de existência**: Verifica se cliente existe antes de atualizar/deletar

## Evidência de execução dos testes
<img width="1760" height="1003" alt="image" src="https://github.com/user-attachments/assets/66010eba-1970-42ca-a4a1-34cc0c83437a" />


