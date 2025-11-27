# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

Um servidor Model Context Protocol (MCP) para desenvolvimento estruturado orientado por especificações com dashboard em tempo real e extensão VSCode.

## ☕ Apoie Este Projeto

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 Demonstração

### 🔄 Sistema de Aprovação em Ação
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*Veja como funciona o sistema de aprovação: crie documentos, solicite aprovação através do dashboard, forneça feedback e acompanhe revisões.*

### 📊 Dashboard e Gerenciamento de Especificações
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Explore o dashboard em tempo real: visualize especificações, acompanhe progresso, navegue em documentos e monitore seu fluxo de desenvolvimento.*

## ✨ Recursos Principais

- **Fluxo de Desenvolvimento Estruturado** - Criação sequencial de especificações (Requisitos → Design → Tarefas)
- **Dashboard Web em Tempo Real** - Monitore especificações, tarefas e progresso com atualizações ao vivo
- **Extensão VSCode** - Dashboard integrado na barra lateral para usuários do VSCode
- **Fluxo de Aprovação** - Processo completo de aprovação com revisões
- **Rastreamento de Progresso de Tarefas** - Barras de progresso visuais e status detalhado
- **Logs de Implementação** - Logs pesquisáveis de todas as implementações de tarefas com estatísticas de código
- **Suporte Multi-idioma** - Disponível em 11 idiomas

## 🌍 Idiomas Suportados

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Início Rápido

### Passo 1: Adicione à sua ferramenta de IA

Adicione à sua configuração MCP (veja configuração específica do cliente abaixo):

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

### Passo 2: Escolha sua interface

**Opção A: Dashboard Web** (Obrigatório para usuários de CLI)
Inicie o dashboard (executa na porta 5000 por padrão):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

O dashboard estará acessível em: http://localhost:5000

> **Nota:** Apenas uma instância do dashboard é necessária. Todos os seus projetos se conectarão ao mesmo dashboard.

**Opção B: Extensão VSCode** (Recomendado para usuários do VSCode)

Instale a [Extensão Spec Workflow MCP](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) do marketplace do VSCode.

## 📝 Como Usar

Simplesmente mencione spec-workflow em sua conversa:

- **"Crie uma especificação para autenticação de usuário"** - Cria fluxo completo de especificação
- **"Liste minhas especificações"** - Mostra todas as especificações e seus status
- **"Execute a tarefa 1.2 na especificação user-auth"** - Executa uma tarefa específica

[Veja mais exemplos →](docs/PROMPTING-GUIDE.pt.md)

## 🔧 Configuração de Cliente MCP

<details>
<summary><strong>Augment Code</strong></summary>

Configure nas suas configurações do Augment:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Adicione à sua configuração MCP:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/your/project
```

**Notas Importantes:**
- A flag `-y` ignora prompts do npm para instalação mais suave
- O separador `--` garante que o caminho seja passado para o script spec-workflow, não para o npx
- Substitua `/path/to/your/project` pelo caminho real do diretório do seu projeto

**Alternativa para Windows (se o comando acima não funcionar):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /path/to/your/project"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Adicione ao `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```

> **Importante:** Execute o dashboard separadamente com `--dashboard` antes de iniciar o servidor MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Adicione à configuração do seu servidor MCP:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Adicione à sua configuração do Continue:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Adicione às configurações do Cursor (`settings.json`):
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Adicione ao arquivo de configuração `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"],
      "enabled": true
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Adicione ao arquivo de configuração `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex</strong></summary>

Adicione ao arquivo de configuração `~/.codex/config.toml`:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/path/to/your/project"]
```
</details>

## 🐳 Implantação com Docker

Execute o dashboard em um container Docker para implantação isolada:

```bash
# Usando Docker Compose (recomendado)
cd containers
docker-compose up --build

# Ou usando Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

O dashboard estará disponível em: http://localhost:5000

[Veja guia de configuração Docker →](containers/README.md)

## 🔒 Ambientes Isolados (Sandboxed)

Para ambientes isolados (por exemplo, Codex CLI com `sandbox_mode=workspace-write`) onde `$HOME` é somente leitura, use a variável de ambiente `SPEC_WORKFLOW_HOME` para redirecionar arquivos de estado global para um local gravável:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[Veja Guia de Configuração →](docs/CONFIGURATION.pt.md#environment-variables)

## 📚 Documentação

- [Guia de Configuração](docs/CONFIGURATION.pt.md) - Opções de linha de comando, arquivos de configuração
- [Guia do Usuário](docs/USER-GUIDE.pt.md) - Exemplos de uso abrangentes
- [Processo de Fluxo de Trabalho](docs/WORKFLOW.pt.md) - Fluxo de trabalho de desenvolvimento e melhores práticas
- [Guia de Interfaces](docs/INTERFACES.pt.md) - Detalhes do dashboard e extensão VSCode
- [Guia de Prompts](docs/PROMPTING-GUIDE.pt.md) - Exemplos avançados de prompts
- [Referência de Ferramentas](docs/TOOLS-REFERENCE.pt.md) - Documentação completa de ferramentas
- [Desenvolvimento](docs/DEVELOPMENT.pt.md) - Contribuição e configuração de desenvolvimento
- [Solução de Problemas](docs/TROUBLESHOOTING.pt.md) - Problemas comuns e soluções

## 📁 Estrutura do Projeto

```
your-project/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Construir o projeto
npm run build

# Executar em modo de desenvolvimento
npm run dev
```

[Veja guia de desenvolvimento →](docs/DEVELOPMENT.pt.md)

## 📄 Licença

GPL-3.0

## ⭐ Histórico de Estrelas

<a href="https://www.star-history.com/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
