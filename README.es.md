# Spec Workflow MCP

[![npm version](https://img.shields.io/npm/v/@pimzino/spec-workflow-mcp)](https://www.npmjs.com/package/@pimzino/spec-workflow-mcp)
[![VSCode Extension](https://vsmarketplacebadges.dev/version-short/Pimzino.spec-workflow-mcp.svg)](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp)

Un servidor Model Context Protocol (MCP) para desarrollo estructurado basado en especificaciones con panel de control en tiempo real y extensión para VSCode.

## ☕ Apoya Este Proyecto

<a href="https://buymeacoffee.com/Pimzino" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## 📺 Demostración

### 🔄 Sistema de Aprobación en Acción
<a href="https://www.youtube.com/watch?v=C-uEa3mfxd0" target="_blank">
  <img src="https://img.youtube.com/vi/C-uEa3mfxd0/maxresdefault.jpg" alt="Approval System Demo" width="600">
</a>

*Mira cómo funciona el sistema de aprobación: crea documentos, solicita aprobación a través del panel de control, proporciona retroalimentación y rastrea revisiones.*

### 📊 Panel de Control y Gestión de Especificaciones
<a href="https://www.youtube.com/watch?v=g9qfvjLUWf8" target="_blank">
  <img src="https://img.youtube.com/vi/g9qfvjLUWf8/maxresdefault.jpg" alt="Dashboard Demo" width="600">
</a>

*Explora el panel de control en tiempo real: visualiza especificaciones, rastrea el progreso, navega documentos y monitorea tu flujo de trabajo de desarrollo.*

## ✨ Características Principales

- **Flujo de Trabajo de Desarrollo Estructurado** - Creación secuencial de especificaciones (Requisitos → Diseño → Tareas)
- **Panel de Control Web en Tiempo Real** - Monitorea especificaciones, tareas y progreso con actualizaciones en vivo
- **Extensión para VSCode** - Experiencia integrada con panel lateral para usuarios de VSCode
- **Flujo de Trabajo de Aprobación** - Proceso completo de aprobación con revisiones
- **Seguimiento de Progreso de Tareas** - Barras de progreso visuales y estado detallado
- **Registros de Implementación** - Registros con búsqueda de todas las implementaciones de tareas con estadísticas de código
- **Soporte Multiidioma** - Disponible en 11 idiomas

## 🌍 Idiomas Compatibles

🇺🇸 English • 🇯🇵 日本語 • 🇨🇳 中文 • 🇪🇸 Español • 🇧🇷 Português • 🇩🇪 Deutsch • 🇫🇷 Français • 🇷🇺 Русский • 🇮🇹 Italiano • 🇰🇷 한국어 • 🇸🇦 العربية

## 🚀 Inicio Rápido

### Paso 1: Agregar a tu herramienta de IA

Agrega a tu configuración MCP (ver configuración específica del cliente a continuación):

```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```

### Paso 2: Elige tu interfaz

**Opción A: Panel de Control Web** (Requerido para usuarios de CLI)
Inicia el panel de control (se ejecuta en el puerto 5000 por defecto):
```bash
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

El panel de control estará accesible en: http://localhost:5000

> **Nota:** Solo se necesita una instancia del panel de control. Todos tus proyectos se conectarán al mismo panel.

**Opción B: Extensión para VSCode** (Recomendado para usuarios de VSCode)

Instala [Spec Workflow MCP Extension](https://marketplace.visualstudio.com/items?itemName=Pimzino.spec-workflow-mcp) desde el marketplace de VSCode.

## 📝 Cómo Usar

Simplemente menciona spec-workflow en tu conversación:

- **"Crea una especificación para autenticación de usuarios"** - Crea un flujo de trabajo de especificación completo
- **"Lista mis especificaciones"** - Muestra todas las especificaciones y su estado
- **"Ejecuta la tarea 1.2 en la especificación user-auth"** - Ejecuta una tarea específica

[Ver más ejemplos →](docs/PROMPTING-GUIDE.es.md)

## 🔧 Configuración del Cliente MCP

<details>
<summary><strong>Augment Code</strong></summary>

Configura en tu configuración de Augment:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```
</details>

<details>
<summary><strong>Claude Code CLI</strong></summary>

Agrega a tu configuración MCP:
```bash
claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /ruta/a/tu/proyecto
```

**Notas Importantes:**
- La bandera `-y` omite las solicitudes de npm para una instalación más fluida
- El separador `--` asegura que la ruta se pase al script spec-workflow, no a npx
- Reemplaza `/ruta/a/tu/proyecto` con la ruta real del directorio de tu proyecto

**Alternativa para Windows (si lo anterior no funciona):**
```bash
claude mcp add spec-workflow cmd.exe /c "npx @pimzino/spec-workflow-mcp@latest /ruta/a/tu/proyecto"
```
</details>

<details>
<summary><strong>Claude Desktop</strong></summary>

Agrega a `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```

> **Importante:** Ejecuta el panel de control por separado con `--dashboard` antes de iniciar el servidor MCP.

</details>

<details>
<summary><strong>Cline/Claude Dev</strong></summary>

Agrega a tu configuración del servidor MCP:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```
</details>

<details>
<summary><strong>Continue IDE Extension</strong></summary>

Agrega a tu configuración de Continue:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```
</details>

<details>
<summary><strong>Cursor IDE</strong></summary>

Agrega a tu configuración de Cursor (`settings.json`):
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```
</details>

<details>
<summary><strong>OpenCode</strong></summary>

Agrega a tu archivo de configuración `opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "spec-workflow": {
      "type": "local",
      "command": ["npx", "-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"],
      "enabled": true
    }
  }
}
```
</details>

<details>
<summary><strong>Windsurf</strong></summary>

Agrega a tu archivo de configuración `~/.codeium/windsurf/mcp_config.json`:
```json
{
  "mcpServers": {
    "spec-workflow": {
      "command": "npx",
      "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
    }
  }
}
```
</details>

<details>
<summary><strong>Codex</strong></summary>

Agrega a tu archivo de configuración `~/.codex/config.toml`:
```toml
[mcp_servers.spec-workflow]
command = "npx"
args = ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/a/tu/proyecto"]
```
</details>

## 🐳 Despliegue con Docker

Ejecuta el panel de control en un contenedor Docker para un despliegue aislado:

```bash
# Usando Docker Compose (recomendado)
cd containers
docker-compose up --build

# O usando Docker CLI
docker build -f containers/Dockerfile -t spec-workflow-mcp .
docker run -p 5000:5000 -v "./workspace/.spec-workflow:/workspace/.spec-workflow:rw" spec-workflow-mcp
```

El panel de control estará disponible en: http://localhost:5000

[Ver guía de configuración de Docker →](containers/README.md)

## 🔒 Entornos en Sandbox

Para entornos en sandbox (por ejemplo, Codex CLI con `sandbox_mode=workspace-write`) donde `$HOME` es de solo lectura, usa la variable de entorno `SPEC_WORKFLOW_HOME` para redirigir los archivos de estado global a una ubicación con permisos de escritura:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

[Ver Guía de Configuración →](docs/CONFIGURATION.es.md#environment-variables)

## 📚 Documentación

- [Guía de Configuración](docs/CONFIGURATION.es.md) - Opciones de línea de comandos, archivos de configuración
- [Guía del Usuario](docs/USER-GUIDE.es.md) - Ejemplos de uso completos
- [Proceso de Flujo de Trabajo](docs/WORKFLOW.es.md) - Flujo de trabajo de desarrollo y mejores prácticas
- [Guía de Interfaces](docs/INTERFACES.es.md) - Detalles del panel de control y extensión para VSCode
- [Guía de Prompts](docs/PROMPTING-GUIDE.es.md) - Ejemplos avanzados de prompts
- [Referencia de Herramientas](docs/TOOLS-REFERENCE.es.md) - Documentación completa de herramientas
- [Desarrollo](docs/DEVELOPMENT.es.md) - Contribución y configuración de desarrollo
- [Solución de Problemas](docs/TROUBLESHOOTING.es.md) - Problemas comunes y soluciones

## 📁 Estructura del Proyecto

```
tu-proyecto/
  .spec-workflow/
    approvals/
    archive/
    specs/
    steering/
    templates/
    user-templates/
    config.example.toml
```

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Construir el proyecto
npm run build

# Ejecutar en modo desarrollo
npm run dev
```

[Ver guía de desarrollo →](docs/DEVELOPMENT.es.md)

## 📄 Licencia

GPL-3.0

## ⭐ Historial de Estrellas

<a href="https://star-history.dera.page/#Pimzino/spec-workflow-mcp&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
   <img alt="Star History Chart" src="https://star-history.dera.page/svg?repos=Pimzino/spec-workflow-mcp&type=Date" />
 </picture>
</a>
