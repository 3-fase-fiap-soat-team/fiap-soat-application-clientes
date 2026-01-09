# 🚀 Resumo do Deploy do Microserviço de Clientes

**Data**: 2026-01-08  
**Status**: ⏳ Em progresso - Timeout no rollout

## ✅ Infraestrutura Criada com Sucesso

### 1. **RDS PostgreSQL**
- ✅ **RDS Principal**: `fiap-soat-db.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
  - Database: `fiapdb_dev`
  - Username: `postgresadmin`
  - Para: Demais CRUDs (produtos, pedidos, etc)
  
- ✅ **RDS Clientes**: `fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com`
  - Database: `fiapdb_clientes`
  - Username: `postgresadmin`
  - Para: Microserviço de clientes

### 2. **EKS Cluster**
- ✅ Cluster: `fiap-soat-eks-dev`
- ✅ Region: `us-east-1`
- ✅ VPC: `vpc-06ae6bf4415905e13`
- ✅ Status: Ativo e funcional

### 3. **Kubernetes Resources**
- ✅ Namespace: `fiap-soat-app`
- ✅ ConfigMap: `fiap-soat-application-config` (aplicação principal)
- ✅ Secret: `fiap-soat-application-secrets` (aplicação principal)
- ✅ Service: `fiap-soat-application-service` (LoadBalancer)
- ✅ HPA: `fiap-soat-application-hpa`

### 4. **Microserviço de Clientes - Manifests K8s**
- ✅ `k8s/deployment.yaml` - Deployment configuration
- ✅ `k8s/service.yaml` - LoadBalancer service
- ✅ `k8s/configmap.yaml` - RDS clientes configuration
- ✅ `k8s/secret.yaml` - Database password (gitignored)
- ✅ `k8s/secret.example.yaml` - Template
- ✅ `k8s/hpa.yaml` - Autoscaling (2-10 pods)
- ✅ `k8s/README.md` - Documentation

### 5. **CI/CD Workflow**
- ✅ `.github/workflows/ci-cd-eks.yml` criado
- ✅ Workflow configurado para:
  - Build Docker image
  - Push para ECR (auto-creates repository)
  - Deploy no EKS
  - Apply manifests
  - Update deployment

## ⏳ Status Atual

### Workflow Execution
- **Run ID**: 20805280407
- **Status**: ❌ Failed (timeout após 5 minutos)
- **Erro**: `error: timed out waiting for the condition`
- **Problema**: Deployment não completou rollout

### Logs do Erro
```
Waiting for deployment "fiap-soat-clientes" rollout to finish: 1 old replicas are pending termination...
Waiting for deployment spec update to be observed...
Waiting for deployment "fiap-soat-clientes" rollout to finish: 1 out of 2 new replicas have been updated...
error: timed out waiting for the condition
```

## 🔍 Próximos Passos para Debugging

### 1. Verificar Status dos Pods
```bash
# Configurar kubectl
aws eks update-kubeconfig --region us-east-1 --name fiap-soat-eks-dev

# Ver pods
kubectl get pods -n fiap-soat-app -l app=fiap-soat-clientes

# Ver eventos
kubectl get events -n fiap-soat-app --sort-by='.lastTimestamp' | grep clientes

# Descrever pods
kubectl describe pod -n fiap-soat-app -l app=fiap-soat-clientes

# Ver logs
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=100
```

### 2. Possíveis Causas do Timeout

#### A. Health Checks Falhando
- **Liveness Probe**: GET `/health` (porta 3000)
  - Initial Delay: 30s
  - Pode estar falhando se aplicação não responde

- **Readiness Probe**: GET `/health` (porta 3000)
  - Initial Delay: 10s
  - Pod não fica "Ready" se falhar

**Verificar**:
```bash
# Port-forward para testar localmente
kubectl port-forward -n fiap-soat-app deployment/fiap-soat-clientes 3000:3000

# Em outro terminal
curl http://localhost:3000/health
```

#### B. Imagem Docker com Problema
- Build pode ter falhado parcialmente
- Aplicação pode não estar iniciando corretamente

**Verificar**:
```bash
# Ver se imagem existe no ECR
aws ecr describe-images --repository-name fiap-soat-clientes --region us-east-1

# Ver logs de inicialização
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=200
```

#### C. Configuração do Banco (mais provável)
- DATABASE_HOST pode estar incorreto
- DATABASE_PASSWORD pode estar errada
- Conexão com RDS pode estar falhando

**Verificar**:
```bash
# Ver ConfigMap
kubectl get configmap fiap-soat-clientes-config -n fiap-soat-app -o yaml

# Ver Secret (base64 decoded)
kubectl get secret fiap-soat-clientes-secrets -n fiap-soat-app -o jsonpath='{.data.DATABASE_PASSWORD}' | base64 -d

# Testar conectividade do pod ao RDS
kubectl exec -it -n fiap-soat-app deployment/fiap-soat-clientes -- \
  nc -zv fiap-soat-db-clientes.cjq57yoxrulq.us-east-1.rds.amazonaws.com 5432
```

#### D. Resources Insuficientes
- CPU/Memory limits muito baixos
- Node sem capacidade

**Verificar**:
```bash
# Ver recursos dos nodes
kubectl top nodes

# Ver recursos dos pods
kubectl top pods -n fiap-soat-app

# Descrever HPA
kubectl describe hpa fiap-soat-clientes-hpa -n fiap-soat-app
```

### 3. Fixes Possíveis

#### Fix 1: Aumentar Timeout do Health Check
Editar `k8s/deployment.yaml`:
```yaml
livenessProbe:
  initialDelaySeconds: 60  # era 30
  periodSeconds: 15  # era 10
  timeoutSeconds: 10  # era 5
  failureThreshold: 5  # era 3

readinessProbe:
  initialDelaySeconds: 30  # era 10
  periodSeconds: 15  # era 10
  timeoutSeconds: 10  # era 5
  failureThreshold: 5  # era 3
```

#### Fix 2: Verificar Endpoint do Health Controller
A aplicação precisa ter o controller implementado:
```typescript
// src/external/api/controllers/health.controller.ts
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

#### Fix 3: Atualizar Workflow Timeout
Editar `.github/workflows/ci-cd-eks.yml`:
```yaml
- name: Wait for Rollout
  run: |
    kubectl rollout status deployment/${{ env.K8S_DEPLOYMENT }} \
      -n ${{ env.K8S_NAMESPACE }} \
      --timeout=10m  # era 5m
```

#### Fix 4: Debug Mode - Remover Health Checks Temporariamente
Para testar se o problema é health check, comentar temporariamente em `deployment.yaml`:
```yaml
# livenessProbe:
#   httpGet: ...
# readinessProbe:
#   httpGet: ...
```

## 📊 Recursos Criados

### ECR Repository
```bash
aws ecr describe-repositories --repository-name fiap-soat-clientes --region us-east-1
```

### Docker Image
- **Tag Latest**: `280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:latest`
- **Tag SHA**: `280273007505.dkr.ecr.us-east-1.amazonaws.com/fiap-soat-clientes:{short-sha}`

### Kubernetes Objects
```bash
# Listar todos os recursos relacionados
kubectl get all -n fiap-soat-app -l app=fiap-soat-clientes
kubectl get configmap,secret,hpa -n fiap-soat-app | grep clientes
```

## 🎯 Ação Recomendada Imediata

1. **Verificar logs dos pods**:
   ```bash
   kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=200 -f
   ```

2. **Ver por que pods não ficam prontos**:
   ```bash
   kubectl describe pod -n fiap-soat-app -l app=fiap-soat-clientes
   ```

3. **Se for problema de health check**: Aumentar timeouts e re-deploy
4. **Se for problema de conexão DB**: Verificar secret e configmap
5. **Se for problema de build**: Verificar Dockerfile e dependências

## 📝 Documentação Criada

- ✅ `k8s/README.md` - Guia dos manifests
- ✅ `DEPLOY-EKS.md` - Guia completo de deploy
- ✅ `K8S-SETUP-SUMMARY.md` - Resumo e checklist
- ✅ `.github/workflows/ci-cd-eks.yml` - CI/CD automation

## 🔗 Links Úteis

- **GitHub Actions Run**: https://github.com/3-fase-fiap-soat-team/fiap-soat-application-clientes/actions/runs/20805280407
- **Repository**: https://github.com/3-fase-fiap-soat-team/fiap-soat-application-clientes

---

**Próximo comando para executar**:
```bash
kubectl logs -n fiap-soat-app -l app=fiap-soat-clientes --tail=100
```
