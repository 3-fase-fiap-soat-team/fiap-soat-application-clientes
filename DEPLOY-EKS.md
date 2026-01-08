# Deploy no EKS - Microserviço Clientes

## 🎯 Visão Geral

Este documento descreve como o microserviço de clientes é deployado no **Amazon EKS** usando a infraestrutura gerenciada pelo repositório `fiap-soat-k8s-terraform`.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Cloud (us-east-1)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     EKS Cluster (fiap-soat-k8s-terraform)            │   │
│  │  ┌───────────────────────────────────────────────┐  │   │
│  │  │  Namespace: fiap-soat-app                      │  │   │
│  │  │                                                 │  │   │
│  │  │  ┌──────────────────────────────────────┐     │  │   │
│  │  │  │ Deployment: fiap-soat-clientes       │     │  │   │
│  │  │  │  - Min: 2 pods                       │     │  │   │
│  │  │  │  - Max: 10 pods (HPA)                │     │  │   │
│  │  │  │  - CPU: 100m-200m                    │     │  │   │
│  │  │  │  - Memory: 128Mi-256Mi               │     │  │   │
│  │  │  └──────────────────────────────────────┘     │  │   │
│  │  │                     ↓                           │  │   │
│  │  │  ┌──────────────────────────────────────┐     │  │   │
│  │  │  │ Service: fiap-soat-clientes-service  │     │  │   │
│  │  │  │  Type: LoadBalancer (NLB)            │     │  │   │
│  │  │  │  Port: 80 → 3000                     │     │  │   │
│  │  │  └──────────────────────────────────────┘     │  │   │
│  │  │                                                 │  │   │
│  │  │  ┌──────────────────────────────────────┐     │  │   │
│  │  │  │ ConfigMap: fiap-soat-clientes-config │     │  │   │
│  │  │  │  - DATABASE_HOST                     │     │  │   │
│  │  │  │  - DATABASE_NAME: fiapdb_clientes    │     │  │   │
│  │  │  └──────────────────────────────────────┘     │  │   │
│  │  │                                                 │  │   │
│  │  │  ┌──────────────────────────────────────┐     │  │   │
│  │  │  │ Secret: fiap-soat-clientes-secrets   │     │  │   │
│  │  │  │  - DATABASE_PASSWORD (base64)        │     │  │   │
│  │  │  └──────────────────────────────────────┘     │  │   │
│  │  └───────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  RDS PostgreSQL (fiap-soat-database-clientes)       │   │
│  │  - Instance: fiap-soat-db-clientes                  │   │
│  │  - Endpoint: *.cjq57yoxrulq.us-east-1.rds...        │   │
│  │  - Database: fiapdb_clientes                        │   │
│  │  - Engine: PostgreSQL 17.4                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Repositórios Relacionados

### 1. **fiap-soat-k8s-terraform** (Infraestrutura EKS)
- **Responsabilidade**: Provisiona e gerencia o cluster EKS
- **Recursos**:
  - EKS Cluster
  - Node Groups
  - VPC e Networking
  - IAM Roles
  - Namespace `fiap-soat-app`
  - Load Balancer Controller
  - Metrics Server
  - Cluster Autoscaler

### 2. **fiap-soat-database-clientes-terraform** (Banco de Dados)
- **Responsabilidade**: Provisiona RDS PostgreSQL para clientes
- **Recursos**:
  - RDS Instance (db.t3.micro)
  - Security Group
  - DB Subnet Group
  - PostgreSQL 17.4
  - Database: `fiapdb_clientes`

### 3. **fiap-soat-application-clientes** (Este Repositório)
- **Responsabilidade**: Código da aplicação + Manifests K8s
- **Recursos**:
  - Código NestJS
  - Dockerfile
  - Manifests K8s (deployment, service, configmap, secret, hpa)
  - CI/CD (GitHub Actions)

## 🚀 Fluxo de Deploy

### Passo 1: Provisionar Infraestrutura Base

```bash
# 1.1. Criar EKS Cluster
cd fiap-soat-k8s-terraform
terraform apply

# 1.2. Criar RDS para Clientes
cd fiap-soat-database-clientes-terraform/envs/dev
terraform apply
```

### Passo 2: Configurar kubectl

```bash
# Atualizar kubeconfig
aws eks update-kubeconfig --name fiap-soat-eks-dev --region us-east-1

# Verificar acesso
kubectl get nodes
kubectl get namespaces
```

### Passo 3: Build e Push da Imagem Docker

```bash
cd fiap-soat-application-clientes

# Build
docker build -t fiap-soat-clientes:latest .

# Tag para ECR
docker tag fiap-soat-clientes:latest \
  280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest

# Login no ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  280273007505.dkr.ecr.us-east-1.amazonaws.com

# Push
docker push 280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest
```

### Passo 4: Deploy dos Manifests K8s

```bash
cd k8s

# 4.1. Criar Secret (com senha real)
cp secret.example.yaml secret.yaml
# Editar secret.yaml com a senha do RDS
kubectl apply -f secret.yaml

# 4.2. Aplicar ConfigMap
kubectl apply -f configmap.yaml

# 4.3. Aplicar Service
kubectl apply -f service.yaml

# 4.4. Aplicar Deployment
kubectl apply -f deployment.yaml

# 4.5. Aplicar HPA
kubectl apply -f hpa.yaml
```

### Passo 5: Verificar Deploy

```bash
# Verificar pods
kubectl get pods -n fiap-soat-app -l app=fiap-soat-clientes

# Verificar service e obter endpoint
kubectl get svc -n fiap-soat-app fiap-soat-clientes-service

# Verificar logs
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=50 -f

# Verificar HPA
kubectl get hpa -n fiap-soat-app fiap-soat-clientes-hpa
```

## 🔧 Configurações Importantes

### Variáveis de Ambiente (ConfigMap)

```yaml
NODE_ENV: "production"
PORT: "3000"
AWS_REGION: "us-east-1"
DATABASE_HOST: "fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com"
DATABASE_PORT: "5432"
DATABASE_NAME: "fiapdb_clientes"
DATABASE_USERNAME: "postgresadmin"
DATABASE_SSL: "true"
```

### Secret (DATABASE_PASSWORD)

⚠️ **Nunca commitar secret.yaml com senha real!**

```bash
# Criar secret manualmente
kubectl create secret generic fiap-soat-clientes-secrets \
  --from-literal=DATABASE_PASSWORD='sua_senha_aqui' \
  -n fiap-soat-app
```

### Resources

```yaml
requests:
  memory: "128Mi"
  cpu: "100m"
limits:
  memory: "256Mi"
  cpu: "200m"
```

### Autoscaling (HPA)

- **Min Replicas**: 2 (para alta disponibilidade)
- **Max Replicas**: 10
- **Target CPU**: 70%
- **Target Memory**: 80%

## 🏥 Health Checks

A aplicação precisa expor o endpoint `/health`:

```typescript
// src/health/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

## 🔄 CI/CD com GitHub Actions

O workflow automatiza:
1. Build da imagem Docker
2. Push para ECR
3. Update do deployment no EKS

```yaml
# .github/workflows/deploy.yml
name: Deploy to EKS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v4
      - name: Build and Push
        run: |
          docker build -t $ECR_REPO:$TAG .
          docker push $ECR_REPO:$TAG
      - name: Update Deployment
        run: |
          kubectl set image deployment/fiap-soat-clientes \
            fiap-soat-clientes=$ECR_REPO:$TAG -n fiap-soat-app
```

## 🧪 Testing

### Teste Local

```bash
# Iniciar aplicação
npm run start:dev

# Testar health check
curl http://localhost:3000/health

# Testar API
curl http://localhost:3000/clientes
```

### Teste no EKS

```bash
# Port-forward para testar localmente
kubectl port-forward -n fiap-soat-app \
  deployment/fiap-soat-clientes 3000:3000

# Testar
curl http://localhost:3000/health
curl http://localhost:3000/clientes
```

### Teste via LoadBalancer

```bash
# Obter URL do LoadBalancer
LB_URL=$(kubectl get svc -n fiap-soat-app fiap-soat-clientes-service \
  -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Testar
curl http://$LB_URL/health
curl http://$LB_URL/clientes
```

## 🔍 Troubleshooting

### Pods não iniciam

```bash
# Verificar eventos
kubectl describe pod -n fiap-soat-app -l app=fiap-soat-clientes

# Verificar logs
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=100
```

### Erro de conexão com RDS

```bash
# Verificar ConfigMap
kubectl get configmap -n fiap-soat-app fiap-soat-clientes-config -o yaml

# Verificar Secret
kubectl get secret -n fiap-soat-app fiap-soat-clientes-secrets -o yaml

# Testar conectividade do pod
kubectl exec -it -n fiap-soat-app deployment/fiap-soat-clientes -- \
  nc -zv fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com 5432
```

### HPA não funciona

```bash
# Verificar Metrics Server
kubectl top nodes
kubectl top pods -n fiap-soat-app

# Verificar HPA
kubectl describe hpa -n fiap-soat-app fiap-soat-clientes-hpa
```

## 📊 Monitoramento

### Logs

```bash
# Logs em tempo real
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes -f --tail=100

# Logs de todos os pods
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --all-containers=true
```

### Métricas

```bash
# CPU e Memory dos pods
kubectl top pods -n fiap-soat-app -l app=fiap-soat-clientes

# Status do HPA
kubectl get hpa -n fiap-soat-app fiap-soat-clientes-hpa --watch
```

### Eventos

```bash
# Eventos recentes
kubectl get events -n fiap-soat-app --sort-by='.lastTimestamp' | grep clientes
```

## 🗑️ Cleanup

```bash
# Remover aplicação
kubectl delete -f k8s/

# Remover RDS (se necessário)
cd fiap-soat-database-clientes-terraform/envs/dev
terraform destroy

# Remover EKS (se necessário)
cd fiap-soat-k8s-terraform
terraform destroy
```

## 📚 Referências

- [Amazon EKS User Guide](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)
- [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
