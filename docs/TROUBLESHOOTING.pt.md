# Guia de Solução de Problemas

Este guia ajuda você a resolver problemas comuns com Spec Workflow MCP.

## Diagnóstico Rápido

### Verificar Instalação
```bash
# Verificar se pacote npm está acessível
npx -y @pimzino/spec-workflow-mcp@latest --help

# Verificar se está executando no diretório correto
pwd  # ou 'cd' no Windows

# Verificar se diretório .spec-workflow existe
ls -la .spec-workflow  # ou 'dir .spec-workflow' no Windows
```

### Verificar Serviços
```bash
# Testar servidor MCP
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project

# Testar dashboard
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Verificar disponibilidade de porta
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Problemas Comuns e Soluções

## Problemas de Instalação

### Pacote NPM Não Encontrado

**Erro**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Soluções**:
1. Verificar conexão com internet
2. Limpar cache do npm:
   ```bash
   npm cache clean --force
   ```
3. Tentar sem tag de versão:
   ```bash
   npx @pimzino/spec-workflow-mcp /path/to/project
   ```
4. Instalar globalmente primeiro:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /path/to/project
   ```

### Permissão Negada

**Erro**: `EACCES: permission denied`

**Soluções**:
1. **macOS/Linux**: Use permissões adequadas do npm:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Execute como Administrador ou corrija permissões do npm:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Use npx com flag -y:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## Problemas do Servidor MCP

### Servidor Não Iniciando

**Erro**: `Failed to start MCP server`

**Soluções**:
1. Verificar versão do Node.js:
   ```bash
   node --version  # Deve ser 18.0 ou superior
   ```
2. Verificar se caminho do projeto existe:
   ```bash
   ls -la /path/to/project
   ```
3. Verificar processos conflitantes:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Tentar com caminho absoluto:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP Não Conectando à Ferramenta de IA

**Erro**: `MCP server unreachable` ou `Connection refused`

**Soluções**:

1. **Claude Desktop**: Verificar arquivo de configuração:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/absolute/path/to/project"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Verificar configuração:
   ```bash
   claude mcp list  # Verificar se spec-workflow está listado
   claude mcp remove spec-workflow  # Remover se existir
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /path/to/project
   ```

3. **Problemas de Caminho**: Garantir que caminho seja absoluto e exista:
   - ❌ `~/project` ou `./project`
   - ✅ `/Users/name/project` ou `C:\Users\name\project`

### Ferramentas Não Disponíveis

**Erro**: `Tool 'spec-workflow' not found`

**Soluções**:
1. Reiniciar sua ferramenta de IA completamente
2. Verificar se servidor MCP está rodando (procurar processo)
3. Verificar se configuração está salva corretamente
4. Tentar mencionar a ferramenta explicitamente: "Use spec-workflow para criar uma especificação"

## Problemas do Dashboard

### Dashboard Não Carregando

**Erro**: `Cannot connect to dashboard` ou página em branco

**Soluções**:
1. Verificar se dashboard foi iniciado:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. Verificar a URL no navegador (note a porta):
   ```
   http://localhost:3000  # Ou qualquer porta mostrada
   ```
3. Tentar navegador diferente ou modo anônimo
4. Verificar console do navegador para erros (F12 → Console)
5. Desabilitar extensões do navegador temporariamente

### Porta Já em Uso

**Erro**: `Error: listen EADDRINUSE: address already in use :::3000`

**Soluções**:
1. Usar uma porta diferente:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3456
   ```
2. Encontrar e encerrar o processo usando a porta:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Usar porta efêmera (omitir flag --port):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```

### Conexão WebSocket Falhou

**Erro**: `WebSocket connection lost` ou atualizações em tempo real não funcionando

**Soluções**:
1. Atualizar a página do navegador
2. Verificar se firewall está bloqueando WebSocket
3. Verificar se dashboard e servidor MCP estão rodando do mesmo projeto
4. Verificar console do navegador para erros específicos
5. Tentar rede diferente (se em rede corporativa)

### Dashboard Não Atualizando

**Sintomas**: Mudanças não refletidas em tempo real

**Soluções**:
1. Atualização forçada do navegador (Ctrl+Shift+R ou Cmd+Shift+R)
2. Limpar cache do navegador
3. Verificar status de conexão WebSocket (deve mostrar verde)
4. Verificar se observadores de sistema de arquivos estão funcionando:
   ```bash
   # Criar arquivo de teste no projeto
   touch .spec-workflow/test.md
   # Deve acionar atualização no dashboard
   ```

## Problemas do Sistema de Aprovação

### Aprovações Não Aparecendo

**Erro**: Sem notificações de aprovação no dashboard

**Soluções**:
1. Garantir que dashboard esteja rodando junto com servidor MCP:
   ```bash
   # Ou use auto-start
   npx -y @pimzino/spec-workflow-mcp@latest /path --AutoStartDashboard

   # Ou rode ambos separadamente
   # Terminal 1:
   npx -y @pimzino/spec-workflow-mcp@latest /path
   # Terminal 2:
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard
   ```
2. Verificar se diretório de aprovação existe:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Acionar solicitação de aprovação manualmente através da IA

### Não Consegue Aprovar Documentos

**Erro**: Botões de aprovação não funcionando

**Soluções**:
1. Verificar console do navegador para erros JavaScript
2. Verificar se está na página de especificação correta
3. Garantir que documento tenha status de aprovação pendente
4. Tentar usar extensão VSCode em vez disso (se disponível)

## Problemas de Sistema de Arquivos

### Arquivos de Especificação Não Criados

**Erro**: Documentos de especificação não aparecem no sistema de arquivos

**Soluções**:
1. Verificar permissões de escrita:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Verificar diretório de trabalho correto:
   ```bash
   pwd  # Deve ser a raiz do seu projeto
   ```
3. Procurar por arquivos ocultos:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Verificar se antivírus está bloqueando criação de arquivo

### Permissão Negada em Arquivos

**Erro**: `EACCES` ou `Permission denied` ao criar especificações

**Soluções**:
1. Corrigir permissões de diretório:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Verificar propriedade do arquivo:
   ```bash
   ls -la .spec-workflow
   # Deve ser propriedade do seu usuário
   ```
3. Executar de um diretório que você possui (não diretórios do sistema)

## Problemas da Extensão VSCode

### Extensão Não Carregando

**Erro**: Ícone Spec Workflow não aparecendo na Barra de Atividades

**Soluções**:
1. Verificar se extensão está instalada:
   - Abrir Extensões (Ctrl+Shift+X)
   - Pesquisar "Spec Workflow MCP"
   - Verificar se está instalada e habilitada
2. Recarregar janela do VSCode:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Verificar saída da extensão:
   - View → Output → Selecionar "Spec Workflow" do dropdown
4. Garantir que projeto tenha diretório `.spec-workflow`

### Comandos da Extensão Não Funcionando

**Erro**: Comandos falham ou mostram erros

**Soluções**:
1. Abrir pasta de projeto que contém `.spec-workflow`
2. Verificar se VSCode está usando workspace correto
3. Ver logs da extensão para erros específicos
4. Tentar reinstalar extensão:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Problemas de Configuração

### Arquivo de Configuração Não Carregando

**Erro**: Configurações em config.toml não sendo aplicadas

**Soluções**:
1. Verificar sintaxe TOML:
   ```bash
   # Instalar validador TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Verificar localização do arquivo:
   - Padrão: `.spec-workflow/config.toml`
   - Personalizado: Use flag `--config`
3. Garantir que não há erros de sintaxe:
   ```toml
   # Correto
   port = 3000
   lang = "pt"

   # Errado
   port: 3000  # Deve usar = não :
   lang = pt   # Deve ter aspas
   ```

### Argumentos de Linha de Comando Não Funcionando

**Erro**: Flags como `--port` sendo ignoradas

**Soluções**:
1. Verificar ordem dos argumentos:
   ```bash
   # Correto
   npx -y @pimzino/spec-workflow-mcp@latest /path --dashboard --port 3000

   # Errado
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /path --port 3000
   ```
2. Garantir que valores de flag sejam válidos:
   - Porta: 1024-65535
   - Idioma: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Usar `--help` para ver todas as opções

## Problemas de Desempenho

### Tempos de Resposta Lentos

**Sintomas**: Dashboard ou ferramentas respondendo lentamente

**Soluções**:
1. Verificar recursos do sistema:
   ```bash
   # Uso de CPU e memória
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Reduzir observadores de arquivo em projetos grandes:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Limpar registros de aprovação antigos:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Usar nomes de especificações específicas em vez de listar todas

### Uso Alto de Memória

**Soluções**:
1. Reiniciar serviços periodicamente
2. Limitar taxa de atualização do dashboard:
   ```json
   // Configurações VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Arquivar especificações concluídas
4. Limpar cache do navegador para dashboard

## Problemas de Rede

### Atrás de Proxy Corporativo

**Soluções**:
1. Configurar proxy do npm:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Usar instalação local:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /path
   ```

### Firewall Bloqueando Conexões

**Soluções**:
1. Permitir Node.js através do firewall
2. Usar localhost em vez de 0.0.0.0
3. Configurar regras de porta específicas
4. Tentar diferentes intervalos de porta

## Problemas Específicos de Plataforma

### Windows

#### Problemas de Formato de Caminho
**Erro**: `Invalid path` ou caminho não encontrado

**Soluções**:
```bash
# Usar barras normais
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/name/project

# Ou barras invertidas escapadas
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\name\\project"
```

#### Política de Execução do PowerShell
**Erro**: `cannot be loaded because running scripts is disabled`

**Soluções**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Gatekeeper Bloqueando
**Erro**: `cannot be opened because the developer cannot be verified`

**Soluções**:
1. Preferências do Sistema → Segurança e Privacidade → Permitir
2. Ou remover quarentena:
   ```bash
   xattr -d com.apple.quarantine /path/to/node_modules
   ```

### Linux

#### Dependências Faltando
**Erro**: `shared library not found`

**Soluções**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Obtendo Ajuda

### Informações de Diagnóstico

Ao relatar problemas, inclua:

1. **Informações do Sistema**:
   ```bash
   node --version
   npm --version
   uname -a  # ou 'ver' no Windows
   ```

2. **Mensagens de Erro**:
   - Texto completo do erro
   - Captura de tela se problema visual
   - Logs do console do navegador

3. **Configuração**:
   - Configuração do cliente MCP
   - Conteúdo de config.toml
   - Linha de comando usada

4. **Passos para Reproduzir**:
   - Comandos exatos executados
   - Comportamento esperado
   - Comportamento real

### Canais de Suporte

1. **GitHub Issues**: [Criar uma issue](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Documentação**: Verificar outros guias em `/docs`
3. **Comunidade**: Discussões e Q&A

### Modo de Depuração

Habilitar logging verboso:

```bash
# Definir variável de ambiente
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Executar com saída de depuração
npx -y @pimzino/spec-workflow-mcp@latest /path --debug
```

## Dicas de Prevenção

### Melhores Práticas

1. **Sempre use caminhos absolutos** em configurações
2. **Mantenha Node.js atualizado** (v18+ necessário)
3. **Execute do diretório raiz** do projeto
4. **Use --help** para verificar opções
5. **Teste em ambiente limpo** quando problemas ocorrerem
6. **Verifique logs** antes de assumir falha
7. **Faça backup do diretório** .spec-workflow regularmente

### Manutenção Regular

1. Limpar aprovações antigas mensalmente
2. Arquivar especificações concluídas
3. Atualizar pacotes npm regularmente
4. Monitorar espaço em disco para logs
5. Reiniciar serviços após atualizações

## Documentação Relacionada

- [Guia de Configuração](CONFIGURATION.pt.md) - Opções detalhadas de configuração
- [Guia do Usuário](USER-GUIDE.pt.md) - Instruções gerais de uso
- [Guia de Desenvolvimento](DEVELOPMENT.pt.md) - Para contribuir com correções
- [Guia de Interfaces](INTERFACES.pt.md) - Detalhes do dashboard e extensão
