# Guia de Desenvolvimento

Este guia cobre a configuração de um ambiente de desenvolvimento, construção do projeto, contribuição de código e compreensão da arquitetura do Spec Workflow MCP.

## Pré-requisitos

### Software Necessário

- **Node.js** 18.0 ou superior
- **npm** 9.0 ou superior
- **Git** para controle de versão
- Conhecimento de **TypeScript** é útil

### Ferramentas Recomendadas

- **VSCode** com extensões TypeScript
- **Chrome/Edge DevTools** para depuração do dashboard
- **Postman/Insomnia** para testes de API

## Configurando o Ambiente de Desenvolvimento

### 1. Clonar o Repositório

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Instalar Dependências

```bash
npm install
```

Isso instala:
- MCP SDK
- TypeScript e ferramentas de build
- Express para servidor do dashboard
- Bibliotecas WebSocket
- Frameworks de teste

### 3. Construir o Projeto

```bash
npm run build
```

Isso compila os arquivos TypeScript para JavaScript no diretório `dist/`.

## Comandos de Desenvolvimento

### Comandos Principais

| Comando | Descrição |
|---------|-------------|
| `npm run dev` | Inicia em modo de desenvolvimento com auto-reload |
| `npm run build` | Constrói bundle de produção |
| `npm start` | Executa servidor de produção |
| `npm test` | Executa suite de testes |
| `npm run clean` | Remove artefatos de build |
| `npm run lint` | Executa linter de código |
| `npm run format` | Formata código com Prettier |

### Modo de Desenvolvimento

```bash
npm run dev
```

Recursos:
- Auto-recompilação em mudanças de arquivo
- Hot reload para dashboard
- Mensagens de erro detalhadas
- Source maps para depuração

### Construindo para Produção

```bash
npm run clean && npm run build
```

Otimizações:
- JavaScript minificado
- Tamanho de bundle otimizado
- Tratamento de erros de produção
- Melhorias de desempenho

## Estrutura do Projeto

```
spec-workflow-mcp/
├── src/                    # Código fonte
│   ├── index.ts           # Ponto de entrada do servidor MCP
│   ├── server.ts          # Servidor do dashboard
│   ├── tools/             # Implementações de ferramentas MCP
│   ├── prompts/           # Templates de prompt
│   ├── utils/             # Funções utilitárias
│   └── types/             # Definições de tipo TypeScript
├── dist/                   # JavaScript compilado
├── dashboard/             # Arquivos do dashboard web
│   ├── index.html         # UI do dashboard
│   ├── styles.css         # Estilos do dashboard
│   └── script.js          # JavaScript do dashboard
├── vscode-extension/      # Extensão VSCode
│   ├── src/               # Fonte da extensão
│   └── package.json       # Manifesto da extensão
├── tests/                 # Arquivos de teste
├── docs/                  # Documentação
└── package.json           # Configuração do projeto
```

## Visão Geral da Arquitetura

### Arquitetura do Servidor MCP

```
Cliente (IA) ↔ Protocolo MCP ↔ Servidor ↔ Sistema de Arquivos
                              ↓
                          Dashboard
```

### Componentes Principais

#### 1. Servidor MCP (`src/index.ts`)
- Gerencia comunicação do protocolo MCP
- Processa requisições de ferramentas
- Gerencia estado do projeto
- Operações de sistema de arquivos

#### 2. Servidor Dashboard (`src/server.ts`)
- Serve dashboard web
- Conexões WebSocket
- Atualizações em tempo real
- Endpoints HTTP API

#### 3. Ferramentas (`src/tools/`)
Cada ferramenta é um módulo separado:
- Validação de entrada
- Lógica de negócio
- Operações de arquivo
- Formatação de resposta

#### 4. Prompts (`src/prompts/`)
Strings de template para:
- Geração de documentos
- Orientação de fluxo de trabalho
- Mensagens de erro
- Instruções do usuário

## Implementando Novos Recursos

### Adicionando uma Nova Ferramenta

1. **Criar arquivo de ferramenta** em `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Descrição do que a ferramenta faz',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Descrição do parâmetro' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Implementação da ferramenta
    const { param1, param2 = 0 } = params;

    // Lógica de negócio aqui

    return {
      success: true,
      data: 'Resposta da ferramenta'
    };
  }
};
```

2. **Registrar no índice** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Adicionar ao servidor** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Adicionando Recursos do Dashboard

1. **Atualizar HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>Novo Recurso</h3>
  <button id="new-action">Ação</button>
</div>
```

2. **Adicionar JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Lógica do recurso
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Tratar no servidor** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Tratar nova ação
  }
});
```

## Testes

### Executando Testes

```bash
# Executar todos os testes
npm test

# Executar arquivo de teste específico
npm test -- src/tools/my-tool.test.ts

# Executar com cobertura
npm run test:coverage

# Modo watch
npm run test:watch
```

### Escrevendo Testes

Crie arquivos de teste ao lado dos arquivos fonte:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('deve processar entrada corretamente', async () => {
    const result = await myTool.handler({
      param1: 'teste'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('esperado');
  });

  it('deve tratar erros', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Testes de Integração

Teste fluxos de trabalho completos:

```typescript
// tests/integration/workflow.test.ts
describe('Fluxo de Trabalho Completo', () => {
  it('deve criar especificação do início ao fim', async () => {
    // Criar requisitos
    // Aprovar requisitos
    // Criar design
    // Aprovar design
    // Criar tarefas
    // Verificar estrutura
  });
});
```

## Depuração

### Depurar Servidor MCP

1. **Adicionar saída de depuração**:

```typescript
console.error('[DEBUG]', 'Ferramenta chamada:', toolName, params);
```

2. **Usar depurador do VSCode**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug MCP Server",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/path/to/test/project"],
  "console": "integratedTerminal"
}
```

### Depurar Dashboard

1. **DevTools do Navegador**:
   - Abra dashboard no navegador
   - Pressione F12 para DevTools
   - Verifique Console para erros
   - Monitore aba Network para WebSocket

2. **Adicionar logs**:

```javascript
console.log('Mensagem WebSocket:', message);
console.log('Atualização de estado:', newState);
```

## Estilo de Código e Padrões

### Diretrizes TypeScript

- Use modo estrito
- Defina interfaces para estruturas de dados
- Evite tipo `any`
- Use async/await em vez de callbacks

### Organização de Arquivos

- Um componente por arquivo
- Agrupe funcionalidade relacionada
- Convenções de nomenclatura claras
- Comentários abrangentes

### Convenções de Nomenclatura

- **Arquivos**: kebab-case (`my-tool.ts`)
- **Classes**: PascalCase (`SpecManager`)
- **Funções**: camelCase (`createSpec`)
- **Constantes**: UPPER_SNAKE (`MAX_RETRIES`)

## Contribuindo

### Processo de Contribuição

1. **Fork do repositório**
2. **Criar branch de recurso**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Fazer mudanças**
4. **Escrever testes**
5. **Executar testes e lint**:
   ```bash
   npm test
   npm run lint
   ```
6. **Commit das mudanças**:
   ```bash
   git commit -m "feat: adicionar novo recurso"
   ```
7. **Push do branch**:
   ```bash
   git push origin feature/my-feature
   ```
8. **Criar Pull Request**

### Formato de Mensagem de Commit

Siga conventional commits:

- `feat:` Novo recurso
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Reestruturação de código
- `test:` Testes
- `chore:` Manutenção

Exemplos:
```
feat: adicionar fluxo de trabalho de revisão de aprovação
fix: resolver problema de reconexão WebSocket do dashboard
docs: atualizar guia de configuração
```

### Diretrizes de Pull Request

- Descrição clara
- Referenciar issues relacionados
- Incluir capturas de tela para mudanças de UI
- Garantir que todos os testes passem
- Atualizar documentação

## Publicação

### Pacote NPM

1. **Atualizar versão**:
   ```bash
   npm version patch|minor|major
   ```

2. **Construir pacote**:
   ```bash
   npm run build
   ```

3. **Publicar**:
   ```bash
   npm publish
   ```

### Extensão VSCode

1. **Atualizar versão da extensão** em `vscode-extension/package.json`

2. **Construir extensão**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Publicar no marketplace**:
   ```bash
   vsce publish
   ```

## Otimização de Desempenho

### Desempenho do Servidor

- Use cache para leituras de arquivo
- Implemente debouncing para observadores de arquivo
- Otimize batching de mensagens WebSocket
- Carregue documentos grandes de forma lazy

### Desempenho do Dashboard

- Minimize atualizações de DOM
- Use scroll virtual para listas longas
- Implemente renderização progressiva
- Otimize reconexão WebSocket

## Considerações de Segurança

### Validação de Entrada

Sempre valide entradas de ferramentas:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Nome de especificação inválido');
}

// Sanitize caminhos de arquivo
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Caminho inválido');
}
```

### Segurança do Sistema de Arquivos

- Restrinja operações ao diretório do projeto
- Valide todos os caminhos de arquivo
- Use operações de arquivo seguras
- Implemente verificações de permissão

## Solução de Problemas de Desenvolvimento

### Erros Comuns de Build

| Erro | Solução |
|-------|----------|
| Erros TypeScript | Execute `npm run build` para ver erros detalhados |
| Módulo não encontrado | Verifique imports e execute `npm install` |
| Porta já em uso | Mude porta ou encerre processo existente |
| Falha na conexão WebSocket | Verifique se servidor está rodando e porta está correta |

### Dicas de Desenvolvimento

1. **Use modo estrito do TypeScript** para melhor segurança de tipo
2. **Habilite source maps** para depuração mais fácil
3. **Use nodemon** para auto-restart durante desenvolvimento
4. **Teste operações de arquivo** em diretório isolado
5. **Monitore desempenho** com Chrome DevTools

## Recursos

- [Documentação MCP SDK](https://github.com/anthropics/mcp-sdk)
- [Manual TypeScript](https://www.typescriptlang.org/docs/)
- [Melhores Práticas Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [API de Extensão VSCode](https://code.visualstudio.com/api)

## Documentação Relacionada

- [Guia de Configuração](CONFIGURATION.pt.md) - Configuração do servidor
- [Guia do Usuário](USER-GUIDE.pt.md) - Usando o servidor
- [Referência de Ferramentas](TOOLS-REFERENCE.pt.md) - Documentação de ferramentas
- [Solução de Problemas](TROUBLESHOOTING.pt.md) - Problemas comuns
