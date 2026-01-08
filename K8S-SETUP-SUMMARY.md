# Resumo: Configuração Kubernetes para Microserviço Clientes

## ✅ Arquivos Criados

### Manifests Kubernetes (`k8s/`)

1. **`deployment.yaml`** ✅
   - Deployment do microserviço de clientes
   - Imagem: `280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest`
   - Namespace: `fiap-soat-app`
   - Health checks: `/health` endpoint
   - Resources: 128Mi-256Mi RAM, 100m-200m CPU

2. **`service.yaml`** ✅
   - Service tipo LoadBalancer (NLB)
   - Expõe porta 80 → 3000
   - Endpoint público para acesso externo

3. **`configmap.yaml`** ✅
   - Configurações não-sensíveis
   - DATABASE_HOST: `fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
   - DATABASE_NAME: `fiapdb_clientes`
   - DATABASE_USERNAME: `postgresadmin`

4. **`secret.yaml`** ✅
   - Secret com DATABASE_PASSWORD
   - ⚠️ **Adicionado ao `.gitignore`** - não será commitado

5. **`secret.example.yaml`** ✅
   - Template de secret para documentação
   - Pode ser commitado (sem dados sensíveis)

6. **`hpa.yaml`** ✅
   - Horizontal Pod Autoscaler
   - Min: 2 pods, Max: 10 pods
   - Target: CPU 70%, Memory 80%

7. **`README.md`** ✅
   - Documentação completa dos manifests
   - Comandos de deploy e verificação

### Documentação

8. **`DEPLOY-EKS.md`** ✅
   - Guia completo de deploy no EKS
   - Arquitetura e diagramas
   - Integração com outros repositórios
   - Troubleshooting e monitoramento

9. **`.gitignore`** ✅ (atualizado)
   - Adicionada linha: `k8s/secret.yaml`
   - Secret não será commitado por segurança

## 🏗️ Separação de Responsabilidades

### 1. **fiap-soat-k8s-terraform** (Cluster EKS)
```
Responsabilidade: Infraestrutura do Cluster
├── EKS Cluster
├── Node Groups
├── VPC e Networking
├── Load Balancer Controller
├── Metrics Server
├── Cluster Autoscaler
└── Namespace: fiap-soat-app
```

### 2. **fiap-soat-database-clientes-terraform** (RDS)
```
Responsabilidade: Banco de Dados
├── RDS PostgreSQL 17.4
├── Security Group
├── DB Subnet Group
└── Database: fiapdb_clientes
```

### 3. **fiap-soat-application-clientes** (Aplicação)
```
Responsabilidade: Código + Manifests K8s
├── Código NestJS (CRUD Clientes)
├── Dockerfile
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.yaml (não commitado)
│   ├── hpa.yaml
│   └── README.md
├── DEPLOY-EKS.md
└── .github/workflows/ (CI/CD)
```

## 📋 Checklist de Deploy

### ✅ Pré-requisitos Completados
- [x] RDS PostgreSQL criado via Terraform
- [x] Endpoint do RDS obtido: `fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
- [x] Manifests K8s criados
- [x] ConfigMap configurado com dados do RDS
- [x] Secret template criado
- [x] HPA configurado (2-10 pods)
- [x] Documentação completa
- [x] `.gitignore` atualizado

### 🔄 Próximos Passos

1. **Criar ECR Repository**
   ```bash
   aws ecr create-repository \
     --repository-name fiap-soat-clientes \
     --region us-east-1
   ```

2. **Build e Push da Imagem**
   ```bash
   cd fiap-soat-application-clientes
   docker build -t fiap-soat-clientes:latest .
   docker tag fiap-soat-clientes:latest \
     280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest
   
   aws ecr get-login-password --region us-east-1 | \
     docker login --username AWS --password-stdin \
     280273007505.dkr.ecr.us-east-1.amazonaws.com
   
   docker push 280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest
   ```

3. **Configurar kubectl**
   ```bash
   aws eks update-kubeconfig --name fiap-soat-eks-dev --region us-east-1
   ```

4. **Deploy no EKS**
   ```bash
   cd k8s
   
   # Criar secret com senha real
   cp secret.example.yaml secret.yaml
   # Editar secret.yaml
   kubectl apply -f secret.yaml
   
   # Aplicar demais manifests
   kubectl apply -f configmap.yaml
   kubectl apply -f service.yaml
   kubectl apply -f deployment.yaml
   kubectl apply -f hpa.yaml
   ```

5. **Verificar Deploy**
   ```bash
   kubectl get pods -n fiap-soat-app -l app=fiap-soat-clientes
   kubectl get svc -n fiap-soat-app fiap-soat-clientes-service
   kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes
   ```

6. **Criar GitHub Actions Workflow** (opcional)
   - CI/CD para build e deploy automático
   - Integração com ECR e EKS

## 🔑 Informações Importantes

### RDS Clientes
- **Endpoint**: `fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
- **Port**: 5432
- **Database**: `fiapdb_clientes`
- **Username**: `postgresadmin`
- **Password**: Configurada via Secret K8s

### ECR Repository
- **Registry**: `280273007505.dkr.ecr.us-east-1.amazonaws.com`
- **Repository**: `fiap-soat-clientes`
- **Region**: `us-east-1`

### EKS Cluster
- **Cluster Name**: `fiap-soat-eks-dev` (assumindo padrão)
- **Namespace**: `fiap-soat-app`
- **Region**: `us-east-1`

## 🎯 Benefícios da Arquitetura

1. **Separação de Responsabilidades**
   - Cada repositório tem uma responsabilidade clara
   - Facilita manutenção e evolução

2. **Infraestrutura como Código**
   - EKS e RDS gerenciados via Terraform
   - Versionamento e rastreabilidade

3. **Escalabilidade**
   - HPA para autoscaling horizontal (2-10 pods)
   - Node autoscaling via Cluster Autoscaler

4. **Alta Disponibilidade**
   - Mínimo de 2 pods sempre rodando
   - Health checks configurados
   - LoadBalancer com NLB

5. **Segurança**
   - Secrets não commitados no Git
   - RDS em subnet privada
   - Security Groups configurados

## 📝 Notas

- ⚠️ **NUNCA** commitar `k8s/secret.yaml` com dados reais
- ✅ Use `k8s/secret.example.yaml` como template
- ✅ Aplique secrets manualmente via `kubectl apply`
- ✅ Considere usar AWS Secrets Manager ou Sealed Secrets em produção
- ✅ O namespace `fiap-soat-app` deve ser criado pelo repo `fiap-soat-k8s-terraform`

## 🔗 Repositórios Relacionados

- **EKS**: https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform
- **RDS**: https://github.com/3-fase-fiap-soat-team/fiap-soat-database-clientes-terraform
- **App**: https://github.com/3-fase-fiap-soat-team/fiap-soat-application-clientes

---

**Status**: ✅ Manifests K8s prontos para deploy
**Data**: 2026-01-08
