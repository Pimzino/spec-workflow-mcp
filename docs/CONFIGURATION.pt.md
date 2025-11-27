# Guia de Configuração

Este guia cobre todas as opções de configuração para Spec Workflow MCP.

## Opções de Linha de Comando

### Uso Básico

```bash
npx -y @pimzino/spec-workflow-mcp@latest [project-path] [options]
```

### Opções Disponíveis

| Opção | Descrição | Exemplo |
|--------|-------------|---------|
| `--help` | Mostra informações de uso abrangentes | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Executa apenas o dashboard (porta padrão: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <number>` | Especifica porta personalizada do dashboard (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Notas Importantes

- **Instância Única do Dashboard**: Apenas um dashboard é executado por vez. Todos os servidores MCP se conectam ao mesmo dashboard.
- **Porta Padrão**: O dashboard usa a porta 5000 por padrão. Use `--port` apenas se 5000 não estiver disponível.
- **Dashboard Separado**: Sempre execute o dashboard separadamente dos servidores MCP.

## Exemplos de Uso

### Fluxo de Trabalho Típico

1. **Iniciar o Dashboard** (faça isso primeiro, apenas uma vez):
```bash
# Usa a porta padrão 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **Iniciar Servidores MCP** (um por projeto, em terminais separados):
```bash
# Projeto 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# Projeto 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# Projeto 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

Todos os projetos aparecerão no dashboard em http://localhost:5000

### Dashboard com Porta Personalizada

Use uma porta personalizada apenas se a porta 5000 não estiver disponível:

```bash
# Inicia o dashboard na porta 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Variáveis de Ambiente

### SPEC_WORKFLOW_HOME

Substitui o diretório de estado global padrão (`~/.spec-workflow-mcp`). Útil para ambientes isolados onde `$HOME` é somente leitura.

| Variável | Padrão | Descrição |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | Diretório para arquivos de estado global |

**Arquivos armazenados neste diretório:**
- `activeProjects.json` - Registro de projetos
- `activeSession.json` - Informações de sessão do dashboard
- `settings.json` - Configurações globais
- `job-execution-history.json` - Histórico de execução de trabalhos
- `migration.log` - Rastreamento de migração de logs de implementação

**Exemplos de uso:**

```bash
# Caminho absoluto
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# Caminho relativo (resolvido em relação ao diretório de trabalho atual)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# Para modo dashboard
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**Ambientes isolados (por exemplo, Codex CLI):**

Ao executar em ambientes isolados como Codex CLI com `sandbox_mode=workspace-write`, defina `SPEC_WORKFLOW_HOME` para um local gravável dentro do seu workspace:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## Gerenciamento de Sessão do Dashboard

O dashboard armazena suas informações de sessão em `~/.spec-workflow-mcp/activeSession.json` (ou `$SPEC_WORKFLOW_HOME/activeSession.json` se definido). Este arquivo:
- Impõe instância única do dashboard
- Permite que servidores MCP descubram o dashboard em execução
- Limpa automaticamente quando o dashboard para

### Imposição de Instância Única

Apenas um dashboard pode ser executado por vez. Se você tentar iniciar um segundo dashboard:

```
Dashboard já está em execução em: http://localhost:5000

Você pode:
  1. Usar o dashboard existente em: http://localhost:5000
  2. Pará-lo primeiro (Ctrl+C ou kill PID), depois iniciar um novo

Nota: Apenas uma instância do dashboard é necessária para todos os seus projetos.
```

## Gerenciamento de Portas

**Porta Padrão**: 5000
**Porta Personalizada**: Use `--port <number>` apenas se a porta 5000 não estiver disponível

### Conflitos de Porta

Se a porta 5000 já estiver em uso por outro serviço:

```bash
Falha ao iniciar dashboard: Porta 5000 já está em uso.

Pode ser outro serviço usando a porta 5000.
Para usar uma porta diferente:
  spec-workflow-mcp --dashboard --port 8080
```

## Arquivo de Configuração (Descontinuado)

### Localização Padrão

O servidor procura a configuração em: `<project-dir>/.spec-workflow/config.toml`

### Formato do Arquivo

A configuração usa formato TOML. Aqui está um exemplo completo:

```toml
# Diretório do projeto (padrão: diretório atual)
projectDir = "/path/to/your/project"

# Porta do dashboard (1024-65535)
port = 3456

# Executar apenas modo dashboard
dashboardOnly = false

# Idioma da interface
# Opções: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "pt"

# Notificações sonoras (apenas extensão VSCode)
[notifications]
enabled = true
volume = 0.5

# Configurações avançadas
[advanced]
# Tentativas de reconexão WebSocket
maxReconnectAttempts = 10

# Configurações do observador de arquivos
[watcher]
enabled = true
debounceMs = 300
```

### Opções de Configuração

#### Configurações Básicas

| Opção | Tipo | Padrão | Descrição |
|--------|------|---------|-------------|
| `projectDir` | string | Diretório atual | Caminho do diretório do projeto |
| `port` | number | Efêmera | Porta do dashboard (1024-65535) |
| `dashboardOnly` | boolean | false | Executar dashboard sem servidor MCP |
| `lang` | string | "en" | Idioma da interface |

> **Nota**: A opção `autoStartDashboard` foi removida na v2.0.0. O dashboard agora usa um modo multi-projeto unificado acessível via flag `--dashboard`.

#### Opções de Idioma

- `en` - English
- `ja` - Japanese (日本語)
- `zh` - Chinese (中文)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)
- `de` - German (Deutsch)
- `fr` - French (Français)
- `ru` - Russian (Русский)
- `it` - Italian (Italiano)
- `ko` - Korean (한국어)
- `ar` - Arabic (العربية)

### Criando uma Configuração Personalizada

1. Copie a configuração de exemplo:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Edite a configuração:
```toml
# Configuração do meu projeto
projectDir = "/Users/myname/projects/myapp"
port = 3000
lang = "pt"
```

3. Use a configuração:
```bash
# Usa .spec-workflow/config.toml automaticamente
npx -y @pimzino/spec-workflow-mcp@latest

# Ou especifique explicitamente
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Precedência de Configuração

Os valores de configuração são aplicados nesta ordem (maior para menor prioridade):

1. **Argumentos de linha de comando** - Sempre têm precedência
2. **Arquivo de configuração personalizado** - Especificado com `--config`
3. **Arquivo de configuração padrão** - `.spec-workflow/config.toml`
4. **Padrões internos** - Valores de fallback

### Exemplo de Precedência

```toml
# config.toml
port = 3000
```

```bash
# Argumento de linha de comando substitui arquivo de configuração
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Resultado: port = 4000 (CLI vence)
```

## Configurações Específicas do Ambiente

### Configuração de Desenvolvimento

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "pt"

[advanced]
debugMode = true
verboseLogging = true
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Configuração de Produção

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "pt"

[advanced]
debugMode = false
verboseLogging = false
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Configuração de Porta

### Intervalo de Porta Válido

As portas devem estar entre 1024 e 65535.

### Portas Efêmeras

Quando nenhuma porta é especificada, o sistema seleciona automaticamente uma porta efêmera disponível. Recomendado para:
- Ambientes de desenvolvimento
- Múltiplos projetos simultâneos
- Evitar conflitos de porta

### Portas Fixas

Use portas fixas quando precisar:
- URLs consistentes para favoritos
- Integração com outras ferramentas
- Colaboração em equipe com configurações compartilhadas

### Resolução de Conflito de Porta

Se uma porta já estiver em uso:

1. **Verifique o que está usando a porta:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **Soluções:**
   - Use uma porta diferente: `--port 3001`
   - Encerre o processo usando a porta
   - Omita `--port` para usar uma porta efêmera

## Configuração Multi-Projeto

### Configurações Separadas

Crie configurações específicas do projeto:

```bash
# Projeto A
project-a/
  .spec-workflow/
    config.toml  # port = 3000

# Projeto B
project-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Configuração Compartilhada

Use uma configuração compartilhada com substituições:

```bash
# Configuração base compartilhada
~/configs/spec-workflow-base.toml

# Substituições específicas do projeto
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /path/to/project-a
```

## Configuração da Extensão VSCode

A extensão VSCode tem suas próprias configurações:

1. Abra Configurações do VSCode (Cmd/Ctrl + ,)
2. Pesquise "Spec Workflow"
3. Configure:
   - Preferência de idioma
   - Notificações sonoras
   - Visibilidade do arquivo
   - Intervalo de atualização automática

## Solução de Problemas de Configuração

### Configuração Não Carregando

1. **Verifique a localização do arquivo:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **Valide a sintaxe TOML:**
   ```bash
   # Instalar ferramenta CLI TOML
   npm install -g @iarna/toml

   # Validar
   toml .spec-workflow/config.toml
   ```

3. **Verifique as permissões:**
   ```bash
   # Certifique-se de que o arquivo é legível
   chmod 644 .spec-workflow/config.toml
   ```

### Problemas Comuns

| Problema | Solução |
|-------|----------|
| Porta já em uso | Use porta diferente ou omita para efêmera |
| Arquivo de configuração não encontrado | Verifique o caminho e use caminho absoluto se necessário |
| Sintaxe TOML inválida | Valide com linter TOML |
| Configurações não aplicando | Verifique precedência de configuração |

## Melhores Práticas

1. **Use controle de versão** para arquivos de configuração
2. **Documente configurações personalizadas** no README do seu projeto
3. **Use portas efêmeras** em desenvolvimento
4. **Mantenha dados sensíveis** fora dos arquivos de configuração
5. **Crie configurações** específicas do ambiente
6. **Teste mudanças de configuração** antes de implantar

## Documentação Relacionada

- [Guia do Usuário](USER-GUIDE.pt.md) - Usando o servidor configurado
- [Guia de Interfaces](INTERFACES.pt.md) - Configurações do dashboard e extensão
- [Solução de Problemas](TROUBLESHOOTING.pt.md) - Problemas comuns de configuração
