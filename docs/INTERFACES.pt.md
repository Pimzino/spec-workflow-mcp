# Guia de Interfaces

Este guia cobre as duas interfaces principais para Spec Workflow MCP: o Dashboard Web e a Extensão VSCode.

## Visão Geral

Spec Workflow MCP fornece duas interfaces:

1. **Dashboard Web** - Interface baseada em navegador para usuários de CLI
2. **Extensão VSCode** - Experiência IDE integrada para usuários do VSCode

Ambas as interfaces fornecem a mesma funcionalidade principal com otimizações específicas da plataforma.

## Dashboard Web

### Visão Geral

O dashboard web é uma aplicação web em tempo real que fornece acesso visual às suas especificações, tarefas e fluxos de trabalho de aprovação.

### Iniciando o Dashboard

#### Dashboard Standalone
```bash
# Usa porta efêmera
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Porta personalizada
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard --port 3000
```

#### Com Servidor MCP
```bash
# Executar servidor MCP e dashboard separadamente (recomendado)
# Terminal 1: Iniciar dashboard
npx -y @pimzino/spec-workflow-mcp@latest --dashboard

# Terminal 2: Iniciar servidor MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project
```

### Recursos do Dashboard

#### Visualização Principal

O início do dashboard exibe:

- **Visão Geral do Projeto**
  - Contagem de especificações ativas
  - Total de tarefas
  - Porcentagem de conclusão
  - Atividade recente

- **Cards de Especificação**
  - Nome e status da especificação
  - Barra de progresso
  - Indicadores de documento
  - Ações rápidas

#### Visualização de Detalhes da Especificação

Clicar em uma especificação mostra:

- **Abas de Documento**
  - Requisitos
  - Design
  - Tarefas

- **Conteúdo do Documento**
  - Markdown renderizado
  - Destaque de sintaxe
  - Índice

- **Ações de Aprovação**
  - Botão aprovar
  - Solicitar mudanças
  - Opção de rejeição
  - Campo de comentário

#### Gerenciamento de Tarefas

A visualização de tarefas fornece:

- **Lista de Tarefas Hierárquica**
  - Tarefas numeradas (1.0, 1.1, 1.1.1)
  - Indicadores de status
  - Rastreamento de progresso

- **Ações de Tarefa**
  - Botão copiar prompt
  - Marcar como completa
  - Adicionar notas
  - Ver dependências

- **Visualização de Progresso**
  - Barra de progresso geral
  - Progresso de seção
  - Estimativas de tempo

#### Documentos de Direcionamento

Acesse orientação do projeto:

- **Direcionamento de Produto**
  - Visão e objetivos
  - Personas de usuário
  - Métricas de sucesso

- **Direcionamento Técnico**
  - Decisões de arquitetura
  - Escolhas de tecnologia
  - Objetivos de desempenho

- **Direcionamento de Estrutura**
  - Organização de arquivos
  - Convenções de nomenclatura
  - Limites de módulos

### Navegação do Dashboard

#### Atalhos de Teclado

| Atalho | Ação |
|----------|--------|
| `Alt + S` | Focar lista de especificações |
| `Alt + T` | Ver tarefas |
| `Alt + R` | Ver requisitos |
| `Alt + D` | Ver design |
| `Alt + A` | Abrir diálogo de aprovação |
| `Esc` | Fechar diálogo |

#### Estrutura de URL

Links diretos para visualizações específicas:
- `/` - Dashboard inicial
- `/spec/{name}` - Especificação específica
- `/spec/{name}/requirements` - Documento de requisitos
- `/spec/{name}/design` - Documento de design
- `/spec/{name}/tasks` - Lista de tarefas
- `/steering/{type}` - Documentos de direcionamento

### Atualizações em Tempo Real

O dashboard usa WebSockets para atualizações ao vivo:

- **Atualização Automática**
  - Novas especificações aparecem instantaneamente
  - Atualizações de status de tarefa
  - Mudanças de progresso
  - Notificações de aprovação

- **Status de Conexão**
  - Verde: Conectado
  - Amarelo: Reconectando
  - Vermelho: Desconectado

- **Sistema de Notificação**
  - Solicitações de aprovação
  - Conclusões de tarefa
  - Alertas de erro
  - Mensagens de sucesso

### Personalização do Dashboard

#### Configurações de Tema

Alterne entre modos claro e escuro:
- Clique no ícone de tema no cabeçalho
- Persiste entre sessões
- Respeita preferência do sistema

#### Seleção de Idioma

Mude o idioma da interface:
1. Clique no ícone de configurações
2. Selecione idioma no dropdown
3. Interface atualiza imediatamente

Idiomas suportados:
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)
- Russian (ru)
- Italian (it)
- Korean (ko)
- Arabic (ar)

#### Opções de Exibição

Personalize preferências de visualização:
- Cards de especificação compactos/expandidos
- Mostrar/ocultar tarefas concluídas
- Tamanho da fonte do documento
- Tema de sintaxe de código

## Extensão VSCode

### Instalação

Instale do Marketplace do VSCode:

1. Abra Extensões do VSCode (Ctrl+Shift+X)
2. Pesquise "Spec Workflow MCP"
3. Clique em Instalar
4. Recarregue o VSCode

Ou via linha de comando:
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Recursos da Extensão

#### Painel Lateral

Acesse via ícone da Barra de Atividades:

- **Explorador de Especificações**
  - Visualização em árvore de todas as especificações
  - Expandir para ver documentos
  - Indicadores de status
  - Ações do menu de contexto

- **Lista de Tarefas**
  - Visualização de tarefas filtrável
  - Rastreamento de progresso
  - Ações rápidas
  - Funcionalidade de pesquisa

- **Visualização de Arquivo**
  - Especificações concluídas
  - Dados históricos
  - Opção de restaurar
  - Operações em lote

#### Visualizador de Documentos

Abra documentos no editor:

- **Destaque de Sintaxe**
  - Renderização Markdown
  - Blocos de código
  - Caixas de seleção de tarefa
  - Links e referências

- **Ações de Documento**
  - Editar no local
  - Modo de visualização
  - Visualização dividida
  - Opções de exportação

#### Aprovações Integradas

Diálogos nativos do VSCode para:

- **Solicitações de Aprovação**
  - Notificações pop-up
  - Comentários inline
  - Aprovar/rejeitar rápido
  - Feedback detalhado

- **Fluxo de Trabalho de Revisão**
  - Rastrear mudanças
  - Threads de comentário
  - Comparação de versão
  - Histórico de aprovação

#### Ações do Menu de Contexto

Ações de clique direito no editor:

- **Em Arquivos de Especificação**
  - Aprovar documento
  - Solicitar mudanças
  - Ver no dashboard
  - Copiar caminho da especificação

- **Em Itens de Tarefa**
  - Marcar como completa
  - Copiar prompt
  - Adicionar subtarefa
  - Ver detalhes

### Configurações da Extensão

Configure nas configurações do VSCode:

```json
{
  "specWorkflow.language": "pt",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Descrições de Configuração

| Configuração | Descrição | Padrão |
|---------|-------------|---------|
| `language` | Idioma da interface | "en" |
| `notifications.enabled` | Mostrar notificações | true |
| `notifications.sound` | Reproduzir alertas sonoros | true |
| `notifications.volume` | Volume do som (0-1) | 0.5 |
| `archive.showInExplorer` | Mostrar especificações arquivadas | true |
| `tasks.autoRefresh` | Auto-atualizar tarefas | true |
| `tasks.refreshInterval` | Intervalo de atualização (ms) | 5000 |
| `theme.followVSCode` | Combinar tema do VSCode | true |

### Comandos da Extensão

Disponíveis na Paleta de Comandos (Ctrl+Shift+P):

| Comando | Descrição |
|---------|-------------|
| `Spec Workflow: Create Spec` | Iniciar nova especificação |
| `Spec Workflow: List Specs` | Mostrar todas as especificações |
| `Spec Workflow: View Dashboard` | Abrir dashboard web |
| `Spec Workflow: Archive Spec` | Mover para arquivo |
| `Spec Workflow: Restore Spec` | Restaurar do arquivo |
| `Spec Workflow: Refresh` | Recarregar dados da especificação |
| `Spec Workflow: Show Steering` | Ver documentos de direcionamento |
| `Spec Workflow: Export Spec` | Exportar para markdown |

### Notificações Sonoras

A extensão inclui alertas de áudio para:

- **Solicitações de Aprovação** - Som suave
- **Conclusão de Tarefa** - Som de sucesso
- **Erros** - Tom de alerta
- **Atualizações** - Notificação suave

Configure nas configurações:
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Comparação de Recursos

| Recurso | Dashboard Web | Extensão VSCode |
|---------|--------------|------------------|
| Ver especificações | ✅ | ✅ |
| Gerenciar tarefas | ✅ | ✅ |
| Aprovações | ✅ | ✅ |
| Atualizações em tempo real | ✅ | ✅ |
| Sistema de arquivo | ❌ | ✅ |
| Notificações sonoras | ❌ | ✅ |
| Integração com editor | ❌ | ✅ |
| Menus de contexto | ❌ | ✅ |
| Atalhos de teclado | Limitado | Completo |
| Multi-projeto | Manual | Automático |
| Acesso offline | ❌ | ✅ |
| Opções de exportação | Básico | Avançado |

## Escolhendo a Interface Certa

### Use o Dashboard Web Quando:

- Usar ferramentas de IA baseadas em CLI
- Trabalhar em múltiplos IDEs
- Precisar de acesso baseado em navegador
- Compartilhar com membros da equipe
- Precisar de visão geral rápida do projeto

### Use a Extensão VSCode Quando:

- IDE principal é VSCode
- Quiser experiência integrada
- Precisar de recursos do editor
- Preferir diálogos nativos
- Quiser notificações sonoras

## Sincronização de Interface

Ambas as interfaces compartilham os mesmos dados:

- **Sincronização em Tempo Real**
  - Mudanças em uma refletem na outra
  - Estado de aprovação compartilhado
  - Status de tarefa consistente
  - Rastreamento de progresso unificado

- **Armazenamento de Dados**
  - Fonte única da verdade
  - Armazenamento baseado em arquivo
  - Sem necessidade de sincronização
  - Atualizações instantâneas

## Acesso Mobile e Tablet

### Dashboard Web em Mobile

O dashboard é responsivo:

- **Visualização em Telefone**
  - Cards de especificação empilhados
  - Navegação recolhível
  - Botões otimizados para toque
  - Gestos de deslizar

- **Visualização em Tablet**
  - Layout lado a lado
  - Interações por toque
  - Espaçamento otimizado
  - Suporte paisagem

### Limitações em Mobile

- Sem extensão VSCode
- Atalhos de teclado limitados
- Multi-tarefa reduzida
- Interações simplificadas

## Recursos de Acessibilidade

### Dashboard Web

- **Navegação por Teclado**
  - Tab pelos elementos
  - Enter para ativar
  - Escape para cancelar
  - Teclas de seta para listas

- **Suporte a Leitor de Tela**
  - Labels ARIA
  - Atributos de role
  - Anúncios de status
  - Gerenciamento de foco

- **Acessibilidade Visual**
  - Modo de alto contraste
  - Tamanho de fonte ajustável
  - Amigável para daltônicos
  - Indicadores de foco

### Extensão VSCode

Herda acessibilidade do VSCode:
- Suporte a leitor de tela
- Navegação por teclado
- Temas de alto contraste
- Funcionalidade de zoom

## Otimização de Desempenho

### Desempenho do Dashboard

- **Carregamento Lazy**
  - Documentos carregam sob demanda
  - Paginação para listas longas
  - Renderização progressiva
  - Otimização de imagem

- **Estratégia de Cache**
  - Cache do navegador
  - Service worker
  - Suporte offline (limitado)
  - Navegação rápida

### Desempenho da Extensão

- **Gerenciamento de Recursos**
  - Uso mínimo de memória
  - Observação eficiente de arquivos
  - Atualizações com debounce
  - Processamento em background

## Solução de Problemas de Interface

### Problemas do Dashboard

| Problema | Solução |
|-------|----------|
| Não carrega | Verifique se servidor está rodando, verifique URL |
| Sem atualizações | Verifique conexão WebSocket, atualize página |
| Aprovação não funcionando | Garanta que dashboard e MCP estão conectados |
| Estilo quebrado | Limpe cache do navegador, verifique console |

### Problemas da Extensão

| Problema | Solução |
|-------|----------|
| Não mostrando especificações | Verifique se projeto tem diretório .spec-workflow |
| Comandos não funcionando | Recarregue janela do VSCode |
| Sem notificações | Verifique configurações da extensão |
| Arquivo não visível | Habilite nas configurações |

## Uso Avançado

### URL Personalizada do Dashboard

Configure em múltiplos terminais:
```bash
# Terminal 1: Servidor MCP
npx -y @pimzino/spec-workflow-mcp@latest /project

# Terminal 2: Dashboard
npx -y @pimzino/spec-workflow-mcp@latest /project --dashboard --port 3000
```

### Workspaces Multi-Raiz da Extensão

A extensão suporta workspaces multi-raiz do VSCode:

1. Adicione múltiplas pastas de projeto
2. Cada mostra especificações separadas
3. Alterne entre projetos
4. Configurações independentes

## Documentação Relacionada

- [Guia de Configuração](CONFIGURATION.pt.md) - Configuração e setup
- [Guia do Usuário](USER-GUIDE.pt.md) - Usando as interfaces
- [Processo de Fluxo de Trabalho](WORKFLOW.pt.md) - Fluxo de trabalho de desenvolvimento
- [Solução de Problemas](TROUBLESHOOTING.pt.md) - Problemas comuns
