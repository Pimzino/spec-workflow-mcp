# Referência de Ferramentas

Documentação completa para todas as ferramentas MCP fornecidas pelo Spec Workflow MCP.

## Visão Geral

Spec Workflow MCP fornece ferramentas especializadas para desenvolvimento estruturado de software. Essas ferramentas são acessíveis aos assistentes de IA através do Model Context Protocol.

## Categorias de Ferramentas

1. **Guias de Fluxo de Trabalho** - Documentação e orientação
2. **Gerenciamento de Especificações** - Criar e gerenciar especificações
3. **Ferramentas de Contexto** - Recuperar informações do projeto
4. **Ferramentas de Direcionamento** - Orientação em nível de projeto
5. **Ferramentas de Aprovação** - Fluxo de trabalho de aprovação de documentos

## Ferramentas de Guia de Fluxo de Trabalho

### spec-workflow-guide

**Propósito**: Fornece orientação abrangente para o processo de fluxo de trabalho orientado por especificações.

**Parâmetros**: Nenhum

**Retorna**: Guia em markdown explicando o fluxo de trabalho completo

**Exemplo de Uso**:
```
"Mostre-me o guia de fluxo de trabalho de especificações"
```

**Resposta Contém**:
- Visão geral do fluxo de trabalho
- Processo passo a passo
- Melhores práticas
- Exemplos de prompts

### steering-guide

**Propósito**: Guia para criar documentos de direcionamento do projeto.

**Parâmetros**: Nenhum

**Retorna**: Guia em markdown para criação de documentos de direcionamento

**Exemplo de Uso**:
```
"Mostre-me como criar documentos de direcionamento"
```

**Resposta Contém**:
- Tipos de documentos de direcionamento
- Processo de criação
- Diretrizes de conteúdo
- Exemplos

## Ferramentas de Gerenciamento de Especificações

### create-spec-doc

**Propósito**: Cria ou atualiza documentos de especificação (requisitos, design, tarefas).

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação (kebab-case) |
| docType | string | Sim | Tipo: "requirements", "design" ou "tasks" |
| content | string | Sim | Conteúdo markdown do documento |
| revision | boolean | Não | Se esta é uma revisão (padrão: false) |

**Exemplo de Uso**:
```typescript
{
  specName: "user-authentication",
  docType: "requirements",
  content: "# Requisitos de Autenticação de Usuário\n\n## Visão Geral\n...",
  revision: false
}
```

**Retorna**:
```typescript
{
  success: true,
  message: "Documento de requisitos criado com sucesso",
  path: ".spec-workflow/specs/user-authentication/requirements.md",
  requestedApproval: true
}
```

**Notas**:
- Cria diretório de especificação se não existir
- Solicita aprovação automaticamente para novos documentos
- Valida formato markdown
- Preserva documentos existentes ao criar novos tipos

### spec-list

**Propósito**: Lista todas as especificações com seu status atual.

**Parâmetros**: Nenhum

**Retorna**: Array de resumos de especificações

**Estrutura de Resposta**:
```typescript
[
  {
    name: "user-authentication",
    status: "in-progress",
    progress: 45,
    documents: {
      requirements: "approved",
      design: "pending-approval",
      tasks: "not-created"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**Exemplo de Uso**:
```
"Liste todas as minhas especificações"
```

### spec-status

**Propósito**: Obtém informações detalhadas de status para uma especificação específica.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação para verificar |

**Retorna**: Status detalhado da especificação

**Estrutura de Resposta**:
```typescript
{
  exists: true,
  name: "user-authentication",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementation"
}
```

**Exemplo de Uso**:
```
"Mostre-me o status da especificação user-authentication"
```

### manage-tasks

**Propósito**: Gerenciamento abrangente de tarefas incluindo atualizações, mudanças de status e rastreamento de progresso.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação |
| action | string | Sim | Ação: "update", "complete", "list", "progress" |
| taskId | string | Às vezes | ID da tarefa (obrigatório para update/complete) |
| status | string | Não | Novo status: "pending", "in-progress", "completed" |
| notes | string | Não | Notas adicionais para a tarefa |

**Ações**:

1. **Atualizar Status da Tarefa**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Implementação iniciada"
}
```

2. **Completar Tarefa**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **Listar Tarefas**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Obter Progresso**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Retorna**: Informações de tarefa ou confirmação de atualização

## Ferramentas de Contexto

### get-template-context

**Propósito**: Recupera templates markdown para todos os tipos de documentos.

**Parâmetros**: Nenhum

**Retorna**: Objeto contendo todos os templates

**Estrutura de Resposta**:
```typescript
{
  requirements: "# Template de Requisitos\n\n## Visão Geral\n...",
  design: "# Template de Design\n\n## Arquitetura\n...",
  tasks: "# Template de Tarefas\n\n## Tarefas de Implementação\n...",
  product: "# Template de Direcionamento de Produto\n...",
  tech: "# Template de Direcionamento Técnico\n...",
  structure: "# Template de Direcionamento de Estrutura\n..."
}
```

**Exemplo de Uso**:
```
"Obtenha todos os templates de documento"
```

### get-steering-context

**Propósito**: Recupera documentos de direcionamento do projeto e orientação.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| docType | string | Não | Documento específico: "product", "tech", "structure" ou "all" |

**Retorna**: Conteúdo do documento de direcionamento

**Exemplo de Uso**:
```typescript
{
  docType: "tech"  // Retorna apenas direcionamento técnico
}
```

**Estrutura de Resposta**:
```typescript
{
  product: "# Direcionamento de Produto\n\n## Visão\n...",
  tech: "# Direcionamento Técnico\n\n## Arquitetura\n...",
  structure: "# Direcionamento de Estrutura\n\n## Organização\n..."
}
```

### get-spec-context

**Propósito**: Recupera contexto completo para uma especificação específica.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação |
| includeContent | boolean | Não | Incluir conteúdo do documento (padrão: true) |

**Retorna**: Contexto completo da especificação

**Estrutura de Resposta**:
```typescript
{
  name: "user-authentication",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Requisitos\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Design\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Tarefas\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["user-profile", "session-management"],
  dependencies: ["database-setup", "auth-library"]
}
```

**Exemplo de Uso**:
```
"Obtenha contexto completo para a especificação user-authentication"
```

## Ferramentas de Documento de Direcionamento

### create-steering-doc

**Propósito**: Cria documentos de direcionamento do projeto (produto, técnico, estrutura).

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| docType | string | Sim | Tipo: "product", "tech" ou "structure" |
| content | string | Sim | Conteúdo markdown do documento |

**Exemplo de Uso**:
```typescript
{
  docType: "product",
  content: "# Direcionamento de Produto\n\n## Visão\nConstruir o melhor..."
}
```

**Retorna**:
```typescript
{
  success: true,
  message: "Documento de direcionamento de produto criado",
  path: ".spec-workflow/steering/product.md"
}
```

**Notas**:
- Cria diretório de direcionamento se necessário
- Sobrescreve documentos de direcionamento existentes
- Não requer aprovação para documentos de direcionamento
- Deve ser criado antes das especificações

## Ferramentas do Sistema de Aprovação

### request-approval

**Propósito**: Solicita aprovação do usuário para um documento.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação |
| docType | string | Sim | Tipo de documento para aprovar |
| documentId | string | Sim | ID único para rastreamento |
| content | string | Sim | Conteúdo do documento para revisão |

**Exemplo de Uso**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requisitos\n\n..."
}
```

**Retorna**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Aprovação solicitada. Verifique o dashboard para revisar."
}
```

### get-approval-status

**Propósito**: Verifica o status de aprovação de um documento.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação |
| documentId | string | Sim | ID do documento para verificar |

**Retorna**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Por favor adicione mais detalhes sobre tratamento de erros",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "user"
}
```

**Exemplo de Uso**:
```
"Verifique o status de aprovação para requisitos user-auth"
```

### delete-approval

**Propósito**: Remove solicitações de aprovação concluídas para limpar a fila de aprovação.

**Parâmetros**:

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|----------|-------------|
| specName | string | Sim | Nome da especificação |
| documentId | string | Sim | ID do documento para remover |

**Retorna**:
```typescript
{
  success: true,
  message: "Registro de aprovação excluído"
}
```

**Exemplo de Uso**:
```
"Limpe aprovações concluídas para user-auth"
```

## Padrões de Integração de Ferramentas

### Fluxo de Trabalho Sequencial

As ferramentas são projetadas para trabalhar em sequência:

1. `steering-guide` → Aprender sobre direcionamento
2. `create-steering-doc` → Criar documentos de direcionamento
3. `spec-workflow-guide` → Aprender fluxo de trabalho
4. `create-spec-doc` → Criar requisitos
5. `request-approval` → Solicitar revisão
6. `get-approval-status` → Verificar status
7. `create-spec-doc` → Criar design (após aprovação)
8. `manage-tasks` → Rastrear implementação

### Operações Paralelas

Algumas ferramentas podem ser usadas simultaneamente:

- `spec-list` + `spec-status` → Obter visão geral e detalhes
- `get-spec-context` + `get-steering-context` → Contexto completo do projeto
- Múltiplos `create-spec-doc` → Criar múltiplas especificações

### Tratamento de Erros

Todas as ferramentas retornam estruturas de erro consistentes:

```typescript
{
  success: false,
  error: "Especificação não encontrada",
  details: "Nenhuma especificação chamada 'invalid-spec' existe",
  suggestion: "Use spec-list para ver especificações disponíveis"
}
```

## Melhores Práticas

### Seleção de Ferramenta

1. **Coleta de Informações**:
   - Use `spec-list` para visão geral
   - Use `spec-status` para especificação específica
   - Use `get-spec-context` para implementação

2. **Criação de Documento**:
   - Sempre crie requisitos primeiro
   - Aguarde aprovação antes do design
   - Crie tarefas após aprovação do design

3. **Gerenciamento de Tarefas**:
   - Atualize status ao iniciar tarefas
   - Marque como completa imediatamente após finalizar
   - Use notas para contexto importante

### Considerações de Desempenho

- **Operações em Lote**: Solicite múltiplas especificações em uma conversa
- **Cache**: Ferramentas fazem cache de leituras de arquivo para desempenho
- **Carregamento Seletivo**: Use `includeContent: false` para verificações de status mais rápidas

### Segurança

- **Validação de Caminho**: Todos os caminhos são validados e sanitizados
- **Isolamento de Projeto**: Ferramentas acessam apenas diretório do projeto
- **Sanitização de Entrada**: Conteúdo markdown é sanitizado
- **Sem Execução**: Ferramentas nunca executam código

## Estendendo Ferramentas

### Desenvolvimento de Ferramenta Personalizada

Para adicionar novas ferramentas:

1. Crie módulo de ferramenta em `src/tools/`
2. Defina schema de parâmetros
3. Implemente função handler
4. Registre com servidor MCP
5. Adicione às exportações

Estrutura de exemplo:
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Descrição',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implementação
  }
};
```

## Versionamento de Ferramentas

Ferramentas mantêm compatibilidade retroativa:

- Adições de parâmetros são opcionais
- Estruturas de resposta estendem, não substituem
- Recursos descontinuados mostram avisos
- Guias de migração fornecidos

## Documentação Relacionada

- [Guia do Usuário](USER-GUIDE.pt.md) - Usando ferramentas efetivamente
- [Processo de Fluxo de Trabalho](WORKFLOW.pt.md) - Uso de ferramentas no fluxo de trabalho
- [Guia de Prompts](PROMPTING-GUIDE.pt.md) - Exemplo de uso de ferramentas
- [Guia de Desenvolvimento](DEVELOPMENT.pt.md) - Adicionando novas ferramentas
