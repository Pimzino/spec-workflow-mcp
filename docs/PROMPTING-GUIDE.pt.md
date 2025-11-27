# Guia de Prompts

Um guia abrangente com exemplos e melhores práticas para interagir com Spec Workflow MCP através de assistentes de IA.

## Referência Rápida

### Comandos Essenciais

```
"Crie uma especificação para [recurso]"
"Liste todas as minhas especificações"
"Mostre o status de [spec-name]"
"Implemente a tarefa [número] de [spec]"
"Crie documentos de direcionamento"
```

## Criando Especificações

### Criação Básica de Especificação

#### Solicitação Simples
```
"Crie uma especificação para autenticação de usuário"
```

A IA irá criar:
- Documento de requisitos
- Documento de design (após aprovação)
- Detalhamento de tarefas (após aprovação do design)

#### Solicitação Detalhada
```
"Crie uma especificação chamada payment-processing com:
- Pagamentos com cartão de crédito via Stripe
- Integração com PayPal
- Tratamento de reembolsos
- Processamento de webhook para eventos de pagamento
- Considerações de conformidade PCI"
```

#### A Partir de Documentação Existente
```
"Crie uma especificação a partir do PRD em @product-requirements.md"
```

```
"Construa uma especificação baseada no documento de design em @figma-export.md"
```

### Criação Avançada de Especificação

#### Com Restrições Técnicas
```
"Crie uma especificação para notificações em tempo real que:
- Use WebSockets para atualizações ao vivo
- Faça fallback para polling em navegadores antigos
- Suporte até 10.000 conexões simultâneas
- Mantenha ordenação de mensagens
- Inclua suporte a fila offline"
```

#### Com Critérios de Aceitação
```
"Crie uma especificação para funcionalidade de busca com estes critérios de aceitação:
- Resultados aparecem em até 200ms
- Suporte correspondência fuzzy
- Inclua filtros para data, categoria e autor
- Mostre pontuação de relevância
- Trate erros de digitação e sinônimos"
```

#### Especificação de Microsserviço
```
"Crie uma especificação para um microsserviço de inventário que:
- Exponha API REST
- Use PostgreSQL para armazenamento
- Publique eventos no Kafka
- Implemente padrão CQRS
- Inclua endpoints de health check"
```

## Gerenciando Especificações

### Listagem e Status

#### Obter Visão Geral
```
"Liste todas as minhas especificações"
"Mostre-me todas as especificações e seu progresso"
"Quais especificações estão aguardando aprovação?"
"Quais especificações estão em progresso atualmente?"
```

#### Status Específico
```
"Mostre o status da especificação user-auth"
"Qual é o progresso em payment-processing?"
"Mostre-me o que falta fazer na especificação notification"
"Quais tarefas estão concluídas em user-profile?"
```

#### Filtragem
```
"Mostre-me especificações que estão mais de 50% completas"
"Liste especificações aguardando minha aprovação"
"Quais especificações não têm tarefas concluídas ainda?"
"Mostre especificações bloqueadas ou travadas"
```

### Gerenciamento de Documentos

#### Visualizando Documentos
```
"Mostre-me os requisitos para user-auth"
"Exiba o documento de design para payments"
"Quais são as tarefas para o sistema de notificação?"
"Mostre todos os documentos para a especificação search"
```

#### Atualizando Documentos
```
"Atualize os requisitos de user-auth para incluir 2FA"
"Revise o design de payment para usar Stripe Connect"
"Adicione uma tarefa para teste de segurança em user-profile"
"Atualize requisitos com base no feedback: [feedback]"
```

## Prompts de Implementação

### Tarefas Individuais

#### Implementação Básica
```
"Implemente a tarefa 1.2 de user-auth"
"Complete a tarefa 2.1.3 na especificação payment"
"Trabalhe na próxima tarefa pendente em notifications"
```

#### Com Contexto
```
"Implemente a tarefa 1.2 de user-auth usando TypeScript e Express"
"Complete a tarefa de migração de banco de dados usando Prisma"
"Implemente a tarefa de endpoint de API seguindo convenções REST"
```

### Implementação em Lote

#### Por Seção
```
"Implemente todas as tarefas de banco de dados de user-auth"
"Complete todas as tarefas de frontend na especificação dashboard"
"Trabalhe em todas as tarefas de API para payments"
```

#### Por Prioridade
```
"Implemente todas as tarefas críticas primeiro"
"Complete as tarefas MVP de user-profile"
"Foque nas tarefas necessárias para a demo"
```

#### Sequencial
```
"Implemente as tarefas 1.1 a 1.5 de user-auth"
"Complete todas as subtarefas da seção 2"
"Trabalhe nas tarefas de configuração em ordem"
```

### Estratégias de Implementação

#### Orientado a Testes
```
"Para a tarefa 1.2, escreva testes primeiro e depois implemente"
"Implemente a tarefa 2.1 com cobertura completa de testes"
"Crie testes unitários enquanto implementa a tarefa de serviço"
```

#### Com Documentação
```
"Implemente a tarefa 1.3 e documente a API"
"Complete a tarefa de autenticação com comentários inline"
"Implemente e crie exemplos de uso para a tarefa 2.2"
```

## Documentos de Direcionamento

### Criando Direcionamento

#### Conjunto Completo
```
"Crie documentos de direcionamento para meu projeto de e-commerce"
"Configure direcionamento para uma aplicação SaaS"
"Crie orientação de projeto para um aplicativo mobile"
```

#### Documentos Individuais
```
"Crie um documento de direcionamento de produto focando em experiência do usuário"
"Crie direcionamento técnico para arquitetura de microsserviços"
"Crie direcionamento de estrutura para configuração de monorepo"
```

#### A Partir de Contexto
```
"Crie documentos de direcionamento baseados em @project-brief.md"
"Gere direcionamento a partir de nossas decisões técnicas em @architecture.md"
```

### Atualizando Direcionamento

```
"Atualize direcionamento de produto para incluir recursos B2B"
"Revise direcionamento técnico para usar GraphQL em vez de REST"
"Atualize direcionamento de estrutura para o novo sistema de módulos"
```

## Fluxos de Trabalho de Aprovação

### Solicitando Feedback

#### Com Preocupações Específicas
```
"Solicite aprovação para requisitos de user-auth - verifique especialmente a seção de segurança"
"Peça revisão do design de payment - foque no tratamento de erros"
"Solicite feedback sobre o detalhamento de tarefas - está muito granular?"
```

#### Solicitações de Revisão
```
"Os requisitos precisam de mais detalhes sobre:
- Cenários de tratamento de erros
- Requisitos de desempenho
- Considerações de segurança
Por favor revise e reenvie"
```

### Decisões de Aprovação

#### Aprovando
```
"Aprove os requisitos de user-auth"
"O design parece bom, aprove-o"
"Aceite o detalhamento de tarefas como está"
```

#### Solicitando Mudanças
```
"Solicite mudanças nos requisitos:
- Adicione suporte multi-tenant
- Inclua limitação de taxa
- Especifique política de retenção de dados"
```

#### Rejeitando
```
"Rejeite o design atual - precisamos usar arquitetura orientada a eventos"
"Comece do zero com os requisitos - o escopo está muito amplo"
```

## Fluxo de Trabalho de Bugs

### Relatando Bugs

#### Relatório Detalhado
```
"Crie um relatório de bug:
Título: Login falha com caracteres especiais
Passos: 1) Digite email com '+' 2) Envie formulário 3) Veja erro
Esperado: Login bem-sucedido
Atual: Erro 500
Prioridade: Alta
Ambiente: Produção"
```

#### A Partir de Logs de Erro
```
"Crie um relatório de bug a partir deste erro: [colar stack trace]"
"Documente este bug do alerta Sentry: [link]"
```

### Resolução de Bug

#### Investigação
```
"Investigue a causa raiz do bug #45"
"Analise por que o webhook de pagamento está falhando"
"Depure o problema de desempenho no endpoint de busca"
```

#### Implementação de Correção
```
"Crie uma correção para o bug #45 em autenticação de usuário"
"Implemente uma solução para o problema de timeout de pagamento"
"Corrija o vazamento de memória no serviço de notificação"
```

## Mudanças Durante Implementação

### Quando Especificações Mudam Durante Desenvolvimento

Requisitos e designs frequentemente evoluem durante a implementação. Quando isso acontece, você precisa manter tasks.md alinhado com a especificação atual enquanto preserva trabalho concluído.

### Usando o Recurso de Atualização de Tarefas

A IA tem acesso a instruções abrangentes de atualização de tarefas através do prompt refresh-tasks. Simplesmente informe a IA sobre suas mudanças:

#### Atualização Básica de Tarefas
```
"Os requisitos foram atualizados. Por favor atualize tasks.md para alinhar com requirements.md e design.md atuais."
```

#### Atualização Detalhada de Tarefas com Contexto
```
"Atualizei a especificação com as seguintes mudanças:
- Removido o módulo de relatórios
- Mudado banco de dados de MongoDB para PostgreSQL
- Adicionado recurso de login social

Por favor atualize tasks.md seguindo o processo de atualização de tarefas:
1. Preserve todas as tarefas concluídas e em progresso
2. Adicione tarefas de migração para a mudança de banco de dados
3. Remova tarefas pendentes para o módulo de relatórios
4. Adicione novas tarefas para login social"
```

#### Mudança de Arquitetura Requerendo Migração
```
"Estamos mudando de API REST para GraphQL. Vários endpoints REST já estão implementados. Por favor atualize tasks.md com:
1. Todo trabalho REST concluído preservado
2. Tarefas de migração para envolver lógica REST em resolvers GraphQL
3. Novas tarefas de implementação GraphQL
4. Tarefas de limpeza para remover REST após GraphQL ser verificado"
```

### Comportamento Esperado da IA

Quando você solicita atualização de tarefas, a IA irá:

1. **Analisar Estado Atual**
   - Ler requirements.md e design.md para especificação atual
   - Identificar tarefas concluídas, em progresso e pendentes
   - Determinar quais recursos foram adicionados, removidos ou alterados

2. **Preservar Trabalho Concluído**
   - Manter todas as tarefas [x] concluídas inalteradas
   - Manter todas as tarefas [-] em progresso inalteradas
   - Adicionar notas quando trabalho concluído é para recursos removidos

3. **Tratar Mudanças de Arquitetura**
   - Adicionar tarefas de migração após trabalho concluído que precisa atualização
   - Criar tarefas de transição para migração progressiva
   - Incluir tarefas de verificação antes de remover implementação antiga

4. **Atualizar Tarefas Pendentes**
   - Remover tarefas pendentes para recursos deletados
   - Atualizar tarefas pendentes para requisitos alterados
   - Adicionar novas tarefas para novos recursos

5. **Manter Estrutura de Tarefas**
   - Manter numeração sequencial
   - Preservar formato de tarefa
   - Incluir referências de requisitos
   - Manter ordem de dependência

### Cenários de Exemplo

#### Remoção de Recurso
```
"Decidimos remover o módulo de relatórios da especificação. Atualize tasks.md adequadamente."
```

Comportamento esperado da IA:
- Manter todas as tarefas de relatórios concluídas com status [x]
- Manter todas as tarefas de relatórios em progresso com status [-]
- Remover apenas tarefas [ ] pendentes de relatórios
- Adicionar nota: "_Nota: Recurso de relatório removido da especificação mas trabalho concluído preservado_"

#### Mudança de Arquitetura com Trabalho Concluído
```
"Estamos mudando de MongoDB para PostgreSQL. Atualize as tarefas de banco de dados pendentes. Note que já implementamos esquemas MongoDB e lógica de conexão."
```

Comportamento esperado da IA:
- Preservar todas as tarefas MongoDB concluídas exatamente como escritas
- Preservar todas as tarefas MongoDB em progresso exatamente como escritas
- Adicionar novas tarefas de migração imediatamente após trabalho MongoDB concluído:
  - Migrar esquemas MongoDB para tabelas PostgreSQL
  - Substituir lógica de conexão MongoDB por cliente PostgreSQL
  - Atualizar queries de banco de dados de sintaxe MongoDB para PostgreSQL
  - Migrar dados existentes do MongoDB para PostgreSQL
  - Atualizar configuração de ambiente para PostgreSQL
  - Remover dependências MongoDB após migração verificada
- Atualizar tarefas de banco de dados pendentes restantes para usar PostgreSQL
- Manter sequência de numeração de tarefas

#### Adição de Recurso
```
"Adicione login social à especificação de autenticação. Os requisitos e design foram atualizados."
```

Comportamento esperado da IA:
- Analisar estrutura de tarefas atual para ponto de inserção lógico
- Adicionar novas tarefas de login social com numeração apropriada
- Referenciar os requisitos específicos para login social
- Garantir que novas tarefas mantenham ordem de dependência
- Se autenticação básica já está implementada, adicionar tarefas de integração

### Tratando Migrações de Arquitetura

Quando mudanças de arquitetura afetam código já implementado:

#### Migração REST para GraphQL
```
"Estamos mudando de REST para GraphQL. Vários endpoints REST já estão implementados."
```

Adições de tarefas esperadas:
- Preservar tarefas de endpoint REST concluídas
- Adicionar tarefas de definição de schema GraphQL
- Adicionar tarefas de implementação de resolver
- Adicionar tarefas de migração para envolver lógica REST existente em resolvers GraphQL
- Adicionar tarefas para atualizar código cliente para usar GraphQL
- Adicionar tarefas de limpeza para remover endpoints REST após GraphQL ser verificado

#### Divisão de Monolito para Microsserviços
```
"Estamos dividindo o serviço monolítico de usuário em serviços separados de auth e profile."
```

Adições de tarefas esperadas:
- Preservar tarefas de serviço monolítico concluídas
- Adicionar tarefas de separação de serviço
- Adicionar tarefas de comunicação entre serviços
- Adicionar tarefas de migração de dados se bancos de dados estão sendo divididos
- Adicionar tarefas de configuração de implantação para novos serviços
- Adicionar tarefas de limpeza para remover código monolítico após serviços serem verificados

### Formato de Tarefa para Migrações

Tarefas de migração devem indicar claramente seu propósito:

```
"Após atualizar tarefas, vejo que você adicionou:
- [ ] 2.4 Migrar esquemas MongoDB para tabelas PostgreSQL
  - Arquivo: src/database/migrations/mongo-to-postgres.ts
  - Converter esquemas de documento para tabelas relacionais
  - Mapear documentos embutidos para relacionamentos de chave estrangeira
  - Preservar todos os relacionamentos de dados existentes
  - Propósito: Transição de camada de banco de dados para nova arquitetura
  - _Aproveitar: Esquemas MongoDB concluídos nas tarefas 2.1-2.3_
  - _Requisitos: Seção 3.2 do Design_"
```

### Comunicando Mudanças à IA

Ao informar a IA sobre mudanças de especificação:

#### Seja Específico Sobre Mudanças e Impacto
```
"Os requisitos de processamento de pagamento mudaram. Stripe agora é obrigatório em vez de PayPal. Já implementamos manipuladores de webhook PayPal. Por favor atualize tasks.md para refletir esta mudança, incluindo tarefas de migração."
```

#### Forneça Contexto para Preservação e Migração
```
"Embora estejamos mudando de MongoDB para PostgreSQL, mantenha todas as tarefas MongoDB concluídas pois esse trabalho já foi feito. Adicione tarefas de migração para transicionar o código MongoDB implementado para PostgreSQL."
```

#### Solicite Validação
```
"Após atualizar tasks.md, confirme que todos os requisitos em requirements.md têm tarefas correspondentes, caminhos de migração existem para mudanças de arquitetura, e que não existem tarefas pendentes para recursos removidos."
```

### Estratégia de Migração Progressiva

Para mudanças importantes de arquitetura, a IA deve criar tarefas que suportem migração progressiva:

1. Implementar nova arquitetura ao lado da existente
2. Adicionar tarefas de camada de compatibilidade
3. Migrar funcionalidade incrementalmente
4. Verificar cada passo de migração
5. Remover implementação antiga apenas após verificação completa

Isso garante que a aplicação permaneça funcional durante toda a transição.

### Usando o Prompt Refresh Tasks

Você também pode invocar explicitamente o prompt refresh tasks:

```
"Use o prompt refresh-tasks para a especificação user-auth. As mudanças são: mudou de JWT para OAuth2 para autenticação."
```

A IA então seguirá as instruções abrangentes de atualização para atualizar suas tarefas enquanto preserva todo trabalho concluído.

## Padrões Avançados

### Fluxos de Trabalho Multi-Especificação

#### Especificações Relacionadas
```
"Crie uma especificação para admin-dashboard que integre com:
- especificação user-management
- especificação analytics
- especificação reporting"
```

#### Dependências de Especificação
```
"Crie uma especificação para notifications que dependa de:
- user-auth estar completo
- message-queue estar implementado
- email-service estar disponível"
```

### Desenvolvimento Incremental

#### MVP Primeiro
```
"Crie uma especificação MVP para user-profiles com apenas:
- Criação básica de perfil
- Nome de exibição e avatar
- Visualização pública de perfil
(Adicionaremos recursos sociais depois)"
```

#### Especificações de Melhoria
```
"Crie uma especificação de melhoria para user-auth adicionando:
- Login social (Google, GitHub)
- Autenticação biométrica
- Gerenciamento avançado de sessão
- Vinculação de conta"
```

### Cenários Complexos

#### Especificações de Migração
```
"Crie uma especificação para migrar de MongoDB para PostgreSQL:
- Documente esquema atual
- Projete nova estrutura relacional
- Planeje migração com zero downtime
- Inclua procedimentos de rollback"
```

#### Especificações de Refatoração
```
"Crie uma especificação de refatoração para:
- Dividir o monolito em serviços
- Extrair componentes compartilhados
- Melhorar cobertura de testes para 80%
- Manter compatibilidade retroativa"
```

#### Especificações de Desempenho
```
"Crie uma especificação de otimização de desempenho:
- Perfilar gargalos atuais
- Projetar estratégia de cache
- Planejar indexação de banco de dados
- Implementar monitoramento"
```

## Combinações de Fluxo de Trabalho

### Fluxo de Recurso Completo
```
1. "Crie documentos de direcionamento para o projeto"
2. "Crie uma especificação para autenticação de usuário"
3. "Revise e aprove requisitos"
4. "Revise e aprove design"
5. "Implemente tarefa 1.1 - esquema de banco de dados"
6. "Implemente tarefa 1.2 - serviço de autenticação"
7. "Crie testes para o fluxo de autenticação"
8. "Marque todas as tarefas como concluídas"
```

### Desenvolvimento Paralelo
```
"Enquanto reviso os requisitos, comece a rascunhar o design da API"
"Crie especificações para frontend e backend em paralelo"
"Trabalhe nas tarefas de UI enquanto a equipe de backend faz tarefas de API"
```

### Refinamento Iterativo
```
1. "Crie especificação inicial para busca"
2. "Implemente busca básica (tarefas 1-3)"
3. "Crie especificação de melhoria para busca avançada"
4. "Adicione recursos de filtragem e ordenação"
5. "Crie especificação de otimização para desempenho de busca"
```

## Prompts Conscientes de Contexto

### Usando Contexto do Projeto
```
"Crie uma especificação que siga nossos padrões existentes"
"Implemente esta tarefa consistente com nossa base de código"
"Projete este recurso para integrar com nossa arquitetura atual"
```

### Referenciando Outras Especificações
```
"Crie uma especificação similar a user-auth mas para autenticação de admin"
"Use os mesmos padrões de design da especificação payment"
"Siga a estrutura de tarefas da nossa especificação notification"
```

### Construindo sobre Trabalho Anterior
```
"Estenda a especificação user-auth para incluir gerenciamento de equipe"
"Adicione suporte GraphQL à especificação de API REST existente"
"Melhore a especificação search com recursos de machine learning"
```

## Dicas para Prompts Efetivos

### Seja Específico
❌ **Vago**: "Crie uma especificação de login"
✅ **Específico**: "Crie uma especificação para login por email/senha com 2FA, lembrar-me e redefinição de senha"

### Forneça Contexto
❌ **Sem contexto**: "Implemente a tarefa"
✅ **Com contexto**: "Implemente a tarefa 1.2 usando nosso middleware Express existente e banco de dados PostgreSQL"

### Defina Expectativas Claras
❌ **Pouco claro**: "Melhore"
✅ **Claro**: "Melhore o design para lidar com 10x o tráfego atual com tempos de resposta abaixo de 200ms"

### Use Solicitações Incrementais
❌ **Demais**: "Crie 5 especificações e implemente tudo"
✅ **Incremental**: "Crie a especificação user-auth primeiro, depois revisaremos antes de passar para a próxima"

### Referencie Trabalho Existente
❌ **Começando do zero**: "Crie um novo sistema de pagamento"
✅ **Construindo sobre**: "Melhore nossa especificação de pagamento para adicionar cobrança de assinatura"

## Biblioteca de Padrões Comuns

### Operações CRUD
```
"Crie uma especificação para operações CRUD em produtos incluindo:
- Criar com validação
- Ler com paginação e filtragem
- Atualizar com bloqueio otimista
- Exclusão suave com opção de recuperação"
```

### Autenticação e Autorização
```
"Crie uma especificação de auth com:
- Autenticação baseada em JWT
- Controle de acesso baseado em função
- Gerenciamento de chave de API
- Tratamento de sessão
- Rotação de token de refresh"
```

### Recursos em Tempo Real
```
"Crie uma especificação para chat em tempo real:
- Conexões WebSocket
- Persistência de mensagens
- Indicadores de digitação
- Confirmações de leitura
- Fila de mensagens offline"
```

### Gerenciamento de Arquivos
```
"Crie uma especificação de upload de arquivo:
- Uploads fragmentados para arquivos grandes
- Rastreamento de progresso
- Capacidade de retomar
- Escaneamento de vírus
- Integração com CDN"
```

### Analytics e Relatórios
```
"Crie uma especificação de analytics:
- Rastreamento de eventos
- Dimensões personalizadas
- Dashboards em tempo real
- Relatórios agendados
- Opções de exportação de dados"
```

## Prompts de Solução de Problemas

### Quando as Coisas Dão Errado
```
"Por que esta especificação não está aparecendo?"
"Depure por que a tarefa não está completando"
"O que está bloqueando a aprovação?"
"Ajude-me a entender este erro"
```

### Saindo do Impasse
```
"O que devo fazer a seguir?"
"Mostre-me o que está bloqueando o progresso"
"Em quais tarefas posso trabalhar enquanto espero?"
"Como resolvo esta dependência?"
```

## Documentação Relacionada

- [Guia do Usuário](USER-GUIDE.pt.md) - Instruções gerais de uso
- [Processo de Fluxo de Trabalho](WORKFLOW.pt.md) - Entendendo o fluxo de trabalho
- [Referência de Ferramentas](TOOLS-REFERENCE.pt.md) - Documentação completa de ferramentas
- [Solução de Problemas](TROUBLESHOOTING.pt.md) - Resolvendo problemas comuns
