# Guia de Processo de Fluxo de Trabalho

Este guia explica o processo completo de desenvolvimento orientado por especificações e melhores práticas para usar Spec Workflow MCP.

## Visão Geral

O fluxo de trabalho orientado por especificações segue uma abordagem estruturada:

```
Direcionamento → Especificações → Implementação → Verificação
```

Cada fase se baseia na anterior, garantindo desenvolvimento sistemático e bem documentado.

## Fase 1: Configuração do Projeto com Documentos de Direcionamento

### Por que Documentos de Direcionamento?

Documentos de direcionamento fornecem orientação de alto nível que mantém seu projeto alinhado e consistente. Eles atuam como uma estrela-guia para todas as decisões de desenvolvimento.

### Criando Documentos de Direcionamento

```
"Crie documentos de direcionamento para meu projeto"
```

Isso gera três documentos-chave:

#### 1. Direcionamento de Produto (`steering/product.md`)
- Visão e missão do produto
- Usuários-alvo e personas
- Recursos principais e prioridades
- Métricas de sucesso e KPIs
- Não-objetivos e restrições

#### 2. Direcionamento Técnico (`steering/tech.md`)
- Decisões de arquitetura
- Escolhas de pilha tecnológica
- Requisitos de desempenho
- Considerações de segurança
- Abordagem de escalabilidade

#### 3. Direcionamento de Estrutura (`steering/structure.md`)
- Organização do projeto
- Convenções de arquivo e pasta
- Padrões de nomenclatura
- Limites de módulo
- Estrutura de documentação

### Melhores Práticas para Direcionamento

1. **Crie cedo** - Configure o direcionamento antes de qualquer especificação
2. **Mantenha atualizado** - Revise conforme o projeto evolui
3. **Referencie frequentemente** - Use para tomada de decisão
4. **Compartilhe amplamente** - Garanta alinhamento da equipe

## Fase 2: Criação de Especificação

### O Sistema de Três Documentos

Cada especificação consiste em três documentos sequenciais:

```
Requisitos → Design → Tarefas
```

### Documento de Requisitos

**Propósito**: Definir O QUE precisa ser construído

**Conteúdo**:
- Visão geral do recurso
- Histórias de usuário
- Requisitos funcionais
- Requisitos não-funcionais
- Critérios de aceitação
- Restrições e suposições

**Exemplo de Criação**:
```
"Crie requisitos para um sistema de notificação de usuário que suporte:
- Notificações por email
- Notificações no aplicativo
- Notificações push
- Preferências de usuário
- Histórico de notificações"
```

### Documento de Design

**Propósito**: Definir COMO será construído

**Conteúdo**:
- Arquitetura técnica
- Design de componentes
- Modelos de dados
- Especificações de API
- Pontos de integração
- Abordagem de implementação

**Geração Automática**: Criado após aprovação dos requisitos

### Documento de Tarefas

**Propósito**: Definir os PASSOS para construí-lo

**Conteúdo**:
- Detalhamento hierárquico de tarefas
- Dependências
- Estimativas de esforço
- Ordem de implementação
- Requisitos de teste

**Exemplo de Estrutura**:
```
1.0 Configuração de Banco de Dados
  1.1 Criar tabelas de notificação
  1.2 Configurar índices
  1.3 Criar scripts de migração

2.0 Implementação Backend
  2.1 Criar serviço de notificação
    2.1.1 Manipulador de email
    2.1.2 Manipulador de push
  2.2 Criar endpoints de API
  2.3 Adicionar autenticação

3.0 Implementação Frontend
  3.1 Criar componentes de notificação
  3.2 Integrar com API
  3.3 Adicionar UI de preferências
```

## Fase 3: Revisão e Aprovação

### Fluxo de Trabalho de Aprovação

1. **Criação de Documento** - IA gera documento
2. **Solicitação de Revisão** - Aprovação solicitada automaticamente
3. **Revisão do Usuário** - Revise no dashboard/extensão
4. **Decisão** - Aprovar, solicitar mudanças ou rejeitar
5. **Revisão** (se necessário) - IA atualiza com base no feedback
6. **Aprovação Final** - Documento bloqueado para implementação

### Tomando Decisões de Aprovação

#### Quando Aprovar
- Requisitos estão completos e claros
- Design resolve o problema declarado
- Tarefas são lógicas e abrangentes
- Sem preocupações ou lacunas importantes

#### Quando Solicitar Mudanças
- Faltam detalhes importantes
- Especificações pouco claras
- Abordagem melhor disponível
- Necessita alinhamento com padrões

#### Quando Rejeitar
- Mal-entendido fundamental
- Abordagem totalmente errada
- Requer repensar completo

### Fornecendo Feedback Efetivo

Bom feedback:
```
"O fluxo de autenticação deve usar tokens JWT em vez de sessões.
Adicione limitação de taxa aos endpoints de API.
Inclua tratamento de erros para falhas de rede."
```

Feedback ruim:
```
"Isso não parece certo. Corrija."
```

## Fase 4: Implementação

### Estratégia de Execução de Tarefas

#### Implementação Sequencial
Melhor para tarefas dependentes:
```
"Implemente a tarefa 1.1 da especificação user-auth"
"Agora implemente a tarefa 1.2"
"Continue com a tarefa 1.3"
```

#### Implementação Paralela
Para tarefas independentes:
```
"Implemente todas as tarefas de UI da especificação dashboard enquanto trabalho no backend"
```

#### Implementação Baseada em Seção
Para agrupamentos lógicos:
```
"Implemente todas as tarefas de banco de dados da especificação payment"
```

### Rastreamento de Progresso

Monitore implementação através de:
- Visualização de tarefas do dashboard
- Barras de progresso
- Indicadores de status
- Porcentagens de conclusão

### Tratando Bloqueios

Quando bloqueado:
1. Documente o bloqueio
2. Crie uma subtarefa para resolução
3. Mova para tarefas paralelas se possível
4. Atualize status da tarefa para "bloqueada"

## Fase 5: Verificação

### Estratégia de Teste

Após implementação:

1. **Testes Unitários**
   ```
   "Crie testes unitários para o serviço de notificação"
   ```

2. **Testes de Integração**
   ```
   "Crie testes de integração para os endpoints de API"
   ```

3. **Testes End-to-End**
   ```
   "Crie testes E2E para o fluxo completo de notificação"
   ```

### Atualizações de Documentação

Mantenha documentação atualizada:
```
"Atualize a documentação da API para os novos endpoints"
"Adicione exemplos de uso ao README"
```

## Estrutura de Arquivos e Organização

### Estrutura de Projeto Padrão

```
your-project/
├── .spec-workflow/
│   ├── steering/
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── specs/
│   │   ├── user-auth/
│   │   │   ├── requirements.md
│   │   │   ├── design.md
│   │   │   └── tasks.md
│   │   └── payment-gateway/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── approval/
│       └── [arquivos de rastreamento de aprovação]
├── src/
│   └── [sua implementação]
└── tests/
    └── [seus testes]
```

### Convenções de Nomenclatura

**Nomes de Especificação**:
- Use kebab-case: `user-authentication`
- Seja descritivo: `payment-processing` não `payments`
- Evite versões: `user-profile` não `user-profile-v2`

**Nomes de Documento**:
- Sempre: `requirements.md`, `design.md`, `tasks.md`
- Consistente em todas as especificações

## Fluxos de Trabalho Avançados

### Iterações de Recurso

Para recursos em evolução:

1. Criar especificação inicial
2. Implementar MVP
3. Criar especificação de melhoria
4. Referenciar especificação original
5. Construir sobre trabalho existente

Exemplo:
```
"Crie uma especificação de melhoria para user-auth que adicione:
- Login social (Google, Facebook)
- Autenticação biométrica
- Melhorias no gerenciamento de sessão"
```

### Fluxo de Trabalho de Refatoração

1. **Documentar Estado Atual**
   ```
   "Crie uma especificação documentando o sistema de autenticação atual"
   ```

2. **Projetar Melhorias**
   ```
   "Projete refatoração para melhorar desempenho da autenticação"
   ```

3. **Planejar Migração**
   ```
   "Crie tarefas de migração para a refatoração"
   ```

4. **Implementar Gradualmente**
   ```
   "Implemente tarefas de refatoração com compatibilidade retroativa"
   ```

### Fluxo de Trabalho de Resolução de Bug

1. **Relatório de Bug**
   ```
   "Crie relatório de bug para problema de timeout de login"
   ```

2. **Investigação**
   ```
   "Investigue a causa raiz do bug #45"
   ```

3. **Design de Solução**
   ```
   "Projete correção para o problema de timeout"
   ```

4. **Implementação**
   ```
   "Implemente a correção do bug"
   ```

5. **Verificação**
   ```
   "Crie testes de regressão para o bug #45"
   ```

## Melhores Práticas

### 1. Mantenha Granularidade de Especificação

**Bom**: Uma especificação por recurso
- `user-authentication`
- `payment-processing`
- `notification-system`

**Ruim**: Especificações muito amplas
- `backend-system`
- `all-features`

### 2. Criação Sequencial de Documentos

Sempre siga a ordem:
1. Requisitos (o quê)
2. Design (como)
3. Tarefas (passos)

Nunca pule etapas.

### 3. Aprovação Completa Antes da Implementação

- ✅ Aprovar requisitos → Criar design
- ✅ Aprovar design → Criar tarefas
- ✅ Revisar tarefas → Iniciar implementação
- ❌ Pular aprovação → Problemas de implementação

### 4. Mantenha Especificações Atualizadas

Quando requisitos mudarem:
```
"Atualize os requisitos de user-auth para incluir suporte SSO"
```

### 5. Use Terminologia Consistente

Mantenha consistência em:
- Nomes de especificação
- Nomes de componente
- Terminologia de API
- Nomenclatura de banco de dados

### 6. Arquive Especificações Concluídas

Mantenha workspace limpo:
```
"Arquive a especificação user-auth concluída"
```

## Padrões Comuns

### MVP para Recurso Completo

1. Comece com especificação MVP
2. Implemente funcionalidade principal
3. Crie especificações de melhoria
4. Construa incrementalmente
5. Mantenha compatibilidade retroativa

### Desenvolvimento de Microsserviços

1. Crie documento de direcionamento de serviço
2. Defina limites de serviço
3. Crie especificação por serviço
4. Defina pontos de integração
5. Implemente serviços independentemente

### Desenvolvimento API-First

1. Crie especificação de API primeiro
2. Projete contratos
3. Gere documentação
4. Implemente endpoints
5. Crie SDKs de cliente

## Solução de Problemas de Fluxo de Trabalho

### Especificações Ficando Muito Grandes

**Solução**: Divida em especificações menores
```
"Divida a especificação de e-commerce em:
- product-catalog
- shopping-cart
- checkout-process
- order-management"
```

### Requisitos Pouco Claros

**Solução**: Solicite esclarecimento
```
"Os requisitos precisam de mais detalhes sobre:
- Funções e permissões de usuário
- Cenários de tratamento de erro
- Requisitos de desempenho"
```

### Design Não Corresponde aos Requisitos

**Solução**: Solicite revisão
```
"O design não aborda o requisito de multi-tenancy.
Por favor, revise para incluir isolamento de tenant."
```

## Integração com Processo de Desenvolvimento

### Fluxo de Trabalho Git

1. Crie branch de recurso por especificação
2. Commit após cada conclusão de tarefa
3. Referencie especificação em mensagens de commit
4. PR quando especificação estiver completa

### Integração CI/CD

- Execute testes para tarefas concluídas
- Valide contra requisitos
- Implante recursos completos
- Monitore contra métricas de sucesso

### Colaboração em Equipe

- Compartilhe URL do dashboard
- Atribua especificações a membros da equipe
- Revise especificações uns dos outros
- Coordene através de aprovações

## Documentação Relacionada

- [Guia do Usuário](USER-GUIDE.pt.md) - Instruções gerais de uso
- [Guia de Prompts](PROMPTING-GUIDE.pt.md) - Exemplos de prompts e padrões
- [Referência de Ferramentas](TOOLS-REFERENCE.pt.md) - Documentação completa de ferramentas
- [Guia de Interfaces](INTERFACES.pt.md) - Detalhes do dashboard e extensão
