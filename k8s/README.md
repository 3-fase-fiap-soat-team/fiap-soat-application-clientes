# Kubernetes Manifests - Microserviço Clientes

Este diretório contém os manifests Kubernetes para deploy do microserviço de clientes no **EKS cluster** gerenciado pelo repositório [fiap-soat-k8s-terraform](https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform).

## 📁 Estrutura

```
k8s/
├── deployment.yaml        # Deployment principal do microserviço
├── service.yaml          # Service (LoadBalancer NLB)
├── configmap.yaml        # Configurações não-sensíveis
├── secret.yaml           # Secret com senha (NÃO COMMITAR)
├── secret.example.yaml   # Template de secret
├── hpa.yaml             # Horizontal Pod Autoscaler
└── README.md            # Esta documentação
```

## 🔧 Pré-requisitos

1. **EKS Cluster** já provisionado (via `fiap-soat-k8s-terraform`)
2. **Namespace** `fiap-soat-app` criado
3. **RDS PostgreSQL** para clientes já criado (via `fiap-soat-database-clientes-terraform`)
4. **ECR Repository** para a imagem Docker
5. **kubectl** configurado para acessar o cluster

## 🚀 Deploy

### 1. Configurar Secret

```bash
# Copiar template
cp k8s/secret.example.yaml k8s/secret.yaml

# Editar com a senha real do RDS
vim k8s/secret.yaml

# Aplicar o secret (NÃO commitar este arquivo)
kubectl apply -f k8s/secret.yaml
```

### 2. Aplicar Manifests

```bash
# Aplicar ConfigMap
kubectl apply -f k8s/configmap.yaml

# Aplicar Service
kubectl apply -f k8s/service.yaml

# Aplicar Deployment
kubectl apply -f k8s/deployment.yaml

# Aplicar HPA
kubectl apply -f k8s/hpa.yaml
```

### 3. Verificar Deploy

```bash
# Verificar pods
kubectl get pods -n fiap-soat-app -l app=fiap-soat-clientes

# Verificar service
kubectl get svc -n fiap-soat-app fiap-soat-clientes-service

# Verificar HPA
kubectl get hpa -n fiap-soat-app fiap-soat-clientes-hpa

# Logs
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=100 -f
```

## 🔍 Configurações

### ConfigMap (`configmap.yaml`)

- **NODE_ENV**: production
- **PORT**: 3000
- **DATABASE_HOST**: `fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
- **DATABASE_PORT**: 5432
- **DATABASE_NAME**: `fiapdb_clientes`
- **DATABASE_USERNAME**: `postgresadmin`
- **DATABASE_SSL**: true

### Secret (`secret.yaml`)

⚠️ **IMPORTANTE**: Nunca commitar `secret.yaml` com dados reais!

- **DATABASE_PASSWORD**: Senha do RDS (base64 encoded)

### Resources

**Requests**:
- CPU: 100m
- Memory: 128Mi

**Limits**:
- CPU: 200m
- Memory: 256Mi

### HPA (Horizontal Pod Autoscaler)

- **Min Replicas**: 2
- **Max Replicas**: 10
- **CPU Target**: 70%
- **Memory Target**: 80%

## 🏥 Health Checks

- **Liveness Probe**: `GET /health` (porta 3000)
  - Initial Delay: 30s
  - Period: 10s
  - Timeout: 5s
  - Failure Threshold: 3

- **Readiness Probe**: `GET /health` (porta 3000)
  - Initial Delay: 10s
  - Period: 10s
  - Timeout: 5s
  - Failure Threshold: 3

## 🔄 Atualização

Para atualizar a aplicação com uma nova imagem:

```bash
# Atualizar imagem no deployment
kubectl set image deployment/fiap-soat-clientes \
  fiap-soat-clientes=280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:v1.0.1 \
  -n fiap-soat-app

# Verificar rollout
kubectl rollout status deployment/fiap-soat-clientes -n fiap-soat-app

# Rollback se necessário
kubectl rollout undo deployment/fiap-soat-clientes -n fiap-soat-app
```

## 🗑️ Cleanup

```bash
# Remover todos os recursos
kubectl delete -f k8s/hpa.yaml
kubectl delete -f k8s/deployment.yaml
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/configmap.yaml
kubectl delete -f k8s/secret.yaml
```

## 📊 Monitoramento

```bash
# Verificar métricas do HPA
kubectl get hpa -n fiap-soat-app fiap-soat-clientes-hpa --watch

# Verificar eventos
kubectl get events -n fiap-soat-app --sort-by='.lastTimestamp' | grep clientes

# Descrever pod
kubectl describe pod -n fiap-soat-app -l app=fiap-soat-clientes
```

## 🔗 Links Relacionados

- **EKS Infrastructure**: [fiap-soat-k8s-terraform](https://github.com/3-fase-fiap-soat-team/fiap-soat-k8s-terraform)
- **RDS Database**: [fiap-soat-database-clientes-terraform](https://github.com/3-fase-fiap-soat-team/fiap-soat-database-clientes-terraform)
- **Application Code**: [fiap-soat-application-clientes](https://github.com/3-fase-fiap-soat-team/fiap-soat-application-clientes)
