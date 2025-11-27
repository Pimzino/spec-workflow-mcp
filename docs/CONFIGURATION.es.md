# Guía de Configuración

Esta guía cubre todas las opciones de configuración para Spec Workflow MCP.

## Opciones de Línea de Comandos

### Uso Básico

```bash
npx -y @pimzino/spec-workflow-mcp@latest [ruta-proyecto] [opciones]
```

### Opciones Disponibles

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `--help` | Mostrar información completa de uso | `npx -y @pimzino/spec-workflow-mcp@latest --help` |
| `--dashboard` | Ejecutar en modo solo panel de control (puerto predeterminado: 5000) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard` |
| `--port <número>` | Especificar puerto personalizado del panel (1024-65535) | `npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080` |

### Notas Importantes

- **Una Sola Instancia del Panel**: Solo se ejecuta un panel de control a la vez. Todos los servidores MCP se conectan al mismo panel.
- **Puerto Predeterminado**: El panel usa el puerto 5000 por defecto. Usa `--port` solo si 5000 no está disponible.
- **Panel Separado**: Siempre ejecuta el panel de control por separado de los servidores MCP.

## Ejemplos de Uso

### Flujo de Trabajo Típico

1. **Iniciar el Panel de Control** (hazlo primero, solo una vez):
```bash
# Usa el puerto predeterminado 5000
npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

2. **Iniciar Servidores MCP** (uno por proyecto, en terminales separados):
```bash
# Proyecto 1
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app1

# Proyecto 2
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app2

# Proyecto 3
npx -y @pimzino/spec-workflow-mcp@latest ~/projects/app3
```

Todos los proyectos aparecerán en el panel de control en http://localhost:5000

### Panel de Control con Puerto Personalizado

Solo usa un puerto personalizado si el puerto 5000 no está disponible:

```bash
# Iniciar el panel en el puerto 8080
npx -y @pimzino/spec-workflow-mcp@latest --dashboard --port 8080
```

## Variables de Entorno

### SPEC_WORKFLOW_HOME

Sobrescribir el directorio de estado global predeterminado (`~/.spec-workflow-mcp`). Esto es útil para entornos en sandbox donde `$HOME` es de solo lectura.

| Variable | Predeterminado | Descripción |
|----------|---------|-------------|
| `SPEC_WORKFLOW_HOME` | `~/.spec-workflow-mcp` | Directorio para archivos de estado global |

**Archivos almacenados en este directorio:**
- `activeProjects.json` - Registro de proyectos
- `activeSession.json` - Información de sesión del panel
- `settings.json` - Configuración global
- `job-execution-history.json` - Historial de ejecución de trabajos
- `migration.log` - Registro de migración de implementación

**Ejemplos de uso:**

```bash
# Ruta absoluta
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace

# Ruta relativa (resuelta contra el directorio de trabajo actual)
SPEC_WORKFLOW_HOME=./.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest .

# Para modo panel de control
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest --dashboard
```

**Entornos en sandbox (por ejemplo, Codex CLI):**

Al ejecutar en entornos en sandbox como Codex CLI con `sandbox_mode=workspace-write`, establece `SPEC_WORKFLOW_HOME` en una ubicación con permisos de escritura dentro de tu espacio de trabajo:

```bash
SPEC_WORKFLOW_HOME=/workspace/.spec-workflow-mcp npx -y @pimzino/spec-workflow-mcp@latest /workspace
```

## Gestión de Sesión del Panel de Control

El panel de control almacena su información de sesión en `~/.spec-workflow-mcp/activeSession.json` (o `$SPEC_WORKFLOW_HOME/activeSession.json` si está configurado). Este archivo:
- Fuerza una sola instancia del panel
- Permite a los servidores MCP descubrir el panel en ejecución
- Se limpia automáticamente cuando el panel se detiene

### Aplicación de Instancia Única

Solo un panel de control puede ejecutarse en cualquier momento. Si intentas iniciar un segundo panel:

```
El panel de control ya se está ejecutando en: http://localhost:5000

Puedes:
  1. Usar el panel existente en: http://localhost:5000
  2. Detenerlo primero (Ctrl+C o kill PID), luego iniciar uno nuevo

Nota: Solo se necesita una instancia del panel para todos tus proyectos.
```

## Gestión de Puertos

**Puerto Predeterminado**: 5000
**Puerto Personalizado**: Usa `--port <número>` solo si el puerto 5000 no está disponible

### Conflictos de Puertos

Si el puerto 5000 ya está en uso por otro servicio:

```bash
Error al iniciar el panel: El puerto 5000 ya está en uso.

Esto podría ser otro servicio usando el puerto 5000.
Para usar un puerto diferente:
  spec-workflow-mcp --dashboard --port 8080
```

## Archivo de Configuración (Obsoleto)

### Ubicación Predeterminada

El servidor busca la configuración en: `<directorio-proyecto>/.spec-workflow/config.toml`

### Formato del Archivo

La configuración usa formato TOML. Aquí hay un ejemplo completo:

```toml
# Directorio del proyecto (predeterminado al directorio actual)
projectDir = "/ruta/a/tu/proyecto"

# Puerto del panel (1024-65535)
port = 3456

# Ejecutar en modo solo panel
dashboardOnly = false

# Idioma de la interfaz
# Opciones: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
lang = "es"

# Notificaciones de sonido (solo extensión VSCode)
[notifications]
enabled = true
volume = 0.5

# Configuración avanzada
[advanced]
# Intentos de reconexión WebSocket
maxReconnectAttempts = 10

# Configuración del observador de archivos
[watcher]
enabled = true
debounceMs = 300
```

### Opciones de Configuración

#### Configuración Básica

| Opción | Tipo | Predeterminado | Descripción |
|--------|------|---------|-------------|
| `projectDir` | string | Directorio actual | Ruta del directorio del proyecto |
| `port` | number | Efímero | Puerto del panel (1024-65535) |
| `dashboardOnly` | boolean | false | Ejecutar panel sin servidor MCP |
| `lang` | string | "en" | Idioma de la interfaz |

> **Nota**: La opción `autoStartDashboard` fue eliminada en v2.0.0. El panel ahora usa un modo multi-proyecto unificado accesible mediante la bandera `--dashboard`.

#### Opciones de Idioma

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

### Crear una Configuración Personalizada

1. Copiar la configuración de ejemplo:
```bash
cp .spec-workflow/config.example.toml .spec-workflow/config.toml
```

2. Editar la configuración:
```toml
# Mi configuración de proyecto
projectDir = "/Users/minombre/proyectos/miapp"
port = 3000
lang = "es"
```

3. Usar la configuración:
```bash
# Usa .spec-workflow/config.toml automáticamente
npx -y @pimzino/spec-workflow-mcp@latest

# O especificar explícitamente
npx -y @pimzino/spec-workflow-mcp@latest --config .spec-workflow/config.toml
```

## Precedencia de Configuración

Los valores de configuración se aplican en este orden (de mayor a menor prioridad):

1. **Argumentos de línea de comandos** - Siempre tienen precedencia
2. **Archivo de configuración personalizado** - Especificado con `--config`
3. **Archivo de configuración predeterminado** - `.spec-workflow/config.toml`
4. **Valores predeterminados integrados** - Valores de respaldo

### Ejemplo de Precedencia

```toml
# config.toml
port = 3000
```

```bash
# El argumento de línea de comandos sobrescribe el archivo de configuración
npx -y @pimzino/spec-workflow-mcp@latest --config config.toml --port 4000
# Resultado: port = 4000 (CLI gana)
```

## Configuraciones Específicas del Entorno

### Configuración de Desarrollo

```toml
# dev-config.toml
projectDir = "./src"
port = 3000
lang = "es"

[advanced]
debugMode = true
verboseLogging = true
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config dev-config.toml
```

### Configuración de Producción

```toml
# prod-config.toml
projectDir = "/var/app"
port = 8080
lang = "es"

[advanced]
debugMode = false
verboseLogging = false
```

Uso:
```bash
npx -y @pimzino/spec-workflow-mcp@latest --config prod-config.toml
```

## Configuración de Puerto

### Rango de Puerto Válido

Los puertos deben estar entre 1024 y 65535.

### Puertos Efímeros

Cuando no se especifica un puerto, el sistema selecciona automáticamente un puerto efímero disponible. Esto se recomienda para:
- Entornos de desarrollo
- Múltiples proyectos simultáneos
- Evitar conflictos de puertos

### Puertos Fijos

Usa puertos fijos cuando necesites:
- URLs consistentes para marcadores
- Integración con otras herramientas
- Colaboración en equipo con configuraciones compartidas

### Resolución de Conflictos de Puerto

Si un puerto ya está en uso:

1. **Verifica qué está usando el puerto:**
   - Windows: `netstat -an | findstr :3000`
   - macOS/Linux: `lsof -i :3000`

2. **Soluciones:**
   - Usar un puerto diferente: `--port 3001`
   - Terminar el proceso que usa el puerto
   - Omitir `--port` para usar un puerto efímero

## Configuración Multi-Proyecto

### Configuraciones Separadas

Crear configuraciones específicas por proyecto:

```bash
# Proyecto A
proyecto-a/
  .spec-workflow/
    config.toml  # port = 3000

# Proyecto B
proyecto-b/
  .spec-workflow/
    config.toml  # port = 3001
```

### Configuración Compartida

Usar una configuración compartida con sobrescrituras:

```bash
# Configuración base compartida
~/configs/spec-workflow-base.toml

# Sobrescrituras específicas del proyecto
npx -y @pimzino/spec-workflow-mcp@latest \
  --config ~/configs/spec-workflow-base.toml \
  --port 3000 \
  /ruta/a/proyecto-a
```

## Configuración de la Extensión para VSCode

La extensión para VSCode tiene su propia configuración:

1. Abrir Configuración de VSCode (Cmd/Ctrl + ,)
2. Buscar "Spec Workflow"
3. Configurar:
   - Preferencia de idioma
   - Notificaciones de sonido
   - Visibilidad del archivo
   - Intervalo de auto-actualización

## Solución de Problemas de Configuración

### La Configuración No Se Carga

1. **Verificar ubicación del archivo:**
   ```bash
   ls -la .spec-workflow/config.toml
   ```

2. **Validar sintaxis TOML:**
   ```bash
   # Instalar herramienta CLI toml
   npm install -g @iarna/toml

   # Validar
   toml .spec-workflow/config.toml
   ```

3. **Verificar permisos:**
   ```bash
   # Asegurar que el archivo es legible
   chmod 644 .spec-workflow/config.toml
   ```

### Problemas Comunes

| Problema | Solución |
|-------|----------|
| Puerto ya en uso | Usar puerto diferente u omitir para efímero |
| Archivo de configuración no encontrado | Verificar ruta y usar ruta absoluta si es necesario |
| Sintaxis TOML inválida | Validar con linter TOML |
| Configuración no se aplica | Verificar precedencia de configuración |

## Mejores Prácticas

1. **Usar control de versiones** para archivos de configuración
2. **Documentar configuraciones personalizadas** en tu README del proyecto
3. **Usar puertos efímeros** en desarrollo
4. **Mantener datos sensibles** fuera de archivos de configuración
5. **Crear configuraciones** específicas del entorno
6. **Probar cambios de configuración** antes de desplegar

## Documentación Relacionada

- [Guía del Usuario](USER-GUIDE.es.md) - Usando el servidor configurado
- [Guía de Interfaces](INTERFACES.es.md) - Configuración del panel y extensión
- [Solución de Problemas](TROUBLESHOOTING.es.md) - Problemas comunes de configuración
