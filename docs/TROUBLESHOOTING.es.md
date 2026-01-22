# Guía de Solución de Problemas

Esta guía te ayuda a resolver problemas comunes con Spec Workflow MCP.

## Diagnóstico Rápido

### Verificar Instalación
```bash
# Verificar que el paquete npm sea accesible
npx -y @pimzino/spec-workflow-mcp@latest --help

# Verificar si se está ejecutando en el directorio correcto
pwd  # o 'cd' en Windows

# Verificar que el directorio .spec-workflow exista
ls -la .spec-workflow  # o 'dir .spec-workflow' en Windows
```

### Verificar Servicios
```bash
# Probar servidor MCP
npx -y @pimzino/spec-workflow-mcp@latest /ruta/a/proyecto

# Probar panel de control
npx -y @pimzino/spec-workflow-mcp@latest /ruta/a/proyecto --dashboard

# Verificar disponibilidad de puerto
netstat -an | grep 3000  # macOS/Linux
netstat -an | findstr :3000  # Windows
```

## Problemas Comunes y Soluciones

## Problemas de Instalación

### Paquete NPM No Encontrado

**Error**: `npm ERR! 404 Not Found - @pimzino/spec-workflow-mcp@latest`

**Soluciones**:
1. Verificar conexión a internet
2. Limpiar caché de npm:
   ```bash
   npm cache clean --force
   ```
3. Intentar sin etiqueta de versión:
   ```bash
   npx @pimzino/spec-workflow-mcp /ruta/a/proyecto
   ```
4. Instalar globalmente primero:
   ```bash
   npm install -g @pimzino/spec-workflow-mcp
   spec-workflow-mcp /ruta/a/proyecto
   ```

### Permiso Denegado

**Error**: `EACCES: permission denied`

**Soluciones**:
1. **macOS/Linux**: Usar permisos npm adecuados:
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```
2. **Windows**: Ejecutar como Administrador o corregir permisos npm:
   ```bash
   npm config set prefix %APPDATA%\npm
   ```
3. Usar npx con bandera -y:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest
   ```

## Problemas del Servidor MCP

### El Servidor No Inicia

**Error**: `Failed to start MCP server`

**Soluciones**:
1. Verificar versión de Node.js:
   ```bash
   node --version  # Debe ser 18.0 o superior
   ```
2. Verificar que la ruta del proyecto existe:
   ```bash
   ls -la /ruta/a/proyecto
   ```
3. Verificar procesos conflictivos:
   ```bash
   ps aux | grep spec-workflow  # macOS/Linux
   tasklist | findstr spec-workflow  # Windows
   ```
4. Intentar con ruta absoluta:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest $(pwd)
   ```

### MCP No Se Conecta a la Herramienta de IA

**Error**: `MCP server unreachable` o `Connection refused`

**Soluciones**:

1. **Claude Desktop**: Verificar archivo de configuración:
   ```json
   {
     "mcpServers": {
       "spec-workflow": {
         "command": "npx",
         "args": ["-y", "@pimzino/spec-workflow-mcp@latest", "/ruta/absoluta/a/proyecto"]
       }
     }
   }
   ```

2. **Claude Code CLI**: Verificar configuración:
   ```bash
   claude mcp list  # Verificar si spec-workflow está listado
   claude mcp remove spec-workflow  # Eliminar si existe
   claude mcp add spec-workflow npx @pimzino/spec-workflow-mcp@latest -- /ruta/a/proyecto
   ```

3. **Problemas de Ruta**: Asegurar que la ruta sea absoluta y exista:
   - ❌ `~/proyecto` o `./proyecto`
   - ✅ `/Users/nombre/proyecto` o `C:\Users\nombre\proyecto`

### Herramientas No Disponibles

**Error**: `Tool 'spec-workflow' not found`

**Soluciones**:
1. Reiniciar tu herramienta de IA completamente
2. Verificar que el servidor MCP esté ejecutándose (buscar proceso)
3. Verificar que la configuración esté guardada correctamente
4. Intentar mencionar la herramienta explícitamente: "Usa spec-workflow para crear una especificación"

## Problemas del Panel de Control

### El Panel No Carga

**Error**: `Cannot connect to dashboard` o página en blanco

**Soluciones**:
1. Verificar que el panel esté iniciado:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /ruta --dashboard
   ```
2. Verificar la URL en el navegador (nota el puerto):
   ```
   http://localhost:3000  # O cualquier puerto que se muestre
   ```
3. Intentar navegador diferente o modo incógnito
4. Verificar consola del navegador para errores (F12 → Console)
5. Deshabilitar extensiones del navegador temporalmente

### Puerto Ya en Uso

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Soluciones**:
1. Usar puerto diferente:
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /ruta --dashboard --port 3456
   ```
2. Encontrar y terminar el proceso usando el puerto:
   ```bash
   # macOS/Linux
   lsof -i :3000
   kill -9 [PID]

   # Windows
   netstat -ano | findstr :3000
   taskkill /PID [PID] /F
   ```
3. Usar puerto efímero (omitir bandera --port):
   ```bash
   npx -y @pimzino/spec-workflow-mcp@latest /ruta --dashboard
   ```

### Conexión WebSocket Fallida

**Error**: `WebSocket connection lost` o actualizaciones en tiempo real no funcionan

**Soluciones**:
1. Actualizar la página del navegador
2. Verificar si el firewall está bloqueando WebSocket
3. Verificar que el panel y el servidor MCP se ejecuten desde el mismo proyecto
4. Verificar consola del navegador para errores específicos
5. Intentar red diferente (si está en red corporativa)

### El Panel No Actualiza

**Síntomas**: Los cambios no se reflejan en tiempo real

**Soluciones**:
1. Actualización forzada del navegador (Ctrl+Shift+R o Cmd+Shift+R)
2. Limpiar caché del navegador
3. Verificar estado de conexión WebSocket (debe mostrar verde)
4. Verificar que los observadores del sistema de archivos funcionen:
   ```bash
   # Crear archivo de prueba en proyecto
   touch .spec-workflow/test.md
   # Debe activar actualización en el panel
   ```

## Problemas del Sistema de Aprobación

### Las Aprobaciones No Se Muestran

**Error**: Sin notificaciones de aprobación en el panel

**Soluciones**:
1. Asegurar que el panel se ejecute junto con el servidor MCP:
   ```bash
   # Ejecutar ambos por separado
   # Terminal 1: Iniciar panel de control
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard
   # Terminal 2: Iniciar servidor MCP
   npx -y @pimzino/spec-workflow-mcp@latest /ruta
   ```
2. Verificar que el directorio de aprobación exista:
   ```bash
   ls -la .spec-workflow/approval/
   ```
3. Activar manualmente solicitud de aprobación a través de IA

### No Se Pueden Aprobar Documentos

**Error**: Botones de aprobación no funcionan

**Soluciones**:
1. Verificar consola del navegador para errores de JavaScript
2. Verificar que estés en la página de especificación correcta
3. Asegurar que el documento tenga estado de aprobación pendiente
4. Intentar usar extensión VSCode en su lugar (si está disponible)

## Problemas del Sistema de Archivos

### Archivos de Especificación No Se Crean

**Error**: Documentos de especificación no aparecen en el sistema de archivos

**Soluciones**:
1. Verificar permisos de escritura:
   ```bash
   touch .spec-workflow/test.txt
   ```
2. Verificar directorio de trabajo correcto:
   ```bash
   pwd  # Debe ser la raíz de tu proyecto
   ```
3. Buscar archivos ocultos:
   ```bash
   ls -la .spec-workflow/specs/
   ```
4. Verificar si el antivirus está bloqueando creación de archivos

### Permiso Denegado en Archivos

**Error**: `EACCES` o `Permission denied` al crear especificaciones

**Soluciones**:
1. Corregir permisos de directorio:
   ```bash
   chmod -R 755 .spec-workflow  # macOS/Linux
   ```
2. Verificar propiedad del archivo:
   ```bash
   ls -la .spec-workflow
   # Debe ser propiedad de tu usuario
   ```
3. Ejecutar desde directorio que posees (no directorios del sistema)

## Problemas de la Extensión VSCode

### La Extensión No Carga

**Error**: Icono de Spec Workflow no aparece en la Barra de Actividad

**Soluciones**:
1. Verificar que la extensión esté instalada:
   - Abrir Extensiones (Ctrl+Shift+X)
   - Buscar "Spec Workflow MCP"
   - Verificar si está instalada y habilitada
2. Recargar ventana de VSCode:
   - Ctrl+Shift+P → "Developer: Reload Window"
3. Verificar salida de extensión:
   - Ver → Salida → Seleccionar "Spec Workflow" del menú desplegable
4. Asegurar que el proyecto tenga directorio `.spec-workflow`

### Los Comandos de la Extensión No Funcionan

**Error**: Los comandos fallan o muestran errores

**Soluciones**:
1. Abrir carpeta de proyecto que contenga `.spec-workflow`
2. Verificar que VSCode use el espacio de trabajo correcto
3. Ver logs de extensión para errores específicos
4. Intentar reinstalar extensión:
   ```bash
   code --uninstall-extension Pimzino.spec-workflow-mcp
   code --install-extension Pimzino.spec-workflow-mcp
   ```

## Problemas de Configuración

### El Archivo de Configuración No Se Carga

**Error**: La configuración en config.toml no se aplica

**Soluciones**:
1. Verificar sintaxis TOML:
   ```bash
   # Instalar validador TOML
   npm install -g @iarna/toml
   toml .spec-workflow/config.toml
   ```
2. Verificar ubicación del archivo:
   - Predeterminado: `.spec-workflow/config.toml`
   - Personalizado: Usar bandera `--config`
3. Asegurar que no haya errores de sintaxis:
   ```toml
   # Correcto
   port = 3000
   lang = "es"

   # Incorrecto
   port: 3000  # Debe usar = no :
   lang = es   # Debe tener comillas
   ```

### Los Argumentos de Línea de Comandos No Funcionan

**Error**: Banderas como `--port` están siendo ignoradas

**Soluciones**:
1. Verificar orden de argumentos:
   ```bash
   # Correcto
   npx -y @pimzino/spec-workflow-mcp@latest /ruta --dashboard --port 3000

   # Incorrecto
   npx -y @pimzino/spec-workflow-mcp@latest --dashboard /ruta --port 3000
   ```
2. Asegurar que los valores de bandera sean válidos:
   - Puerto: 1024-65535
   - Idioma: en, ja, zh, es, pt, de, fr, ru, it, ko, ar
3. Usar `--help` para ver todas las opciones

## Problemas de Rendimiento

### Tiempos de Respuesta Lentos

**Síntomas**: Panel o herramientas respondiendo lentamente

**Soluciones**:
1. Verificar recursos del sistema:
   ```bash
   # Uso de CPU y memoria
   top  # macOS/Linux
   taskmgr  # Windows
   ```
2. Reducir observadores de archivos en proyectos grandes:
   ```toml
   # config.toml
   [watcher]
   enabled = false
   ```
3. Limpiar registros de aprobación antiguos:
   ```bash
   rm -rf .spec-workflow/approval/completed/*
   ```
4. Usar nombres de especificación específicos en lugar de listar todas

### Alto Uso de Memoria

**Soluciones**:
1. Reiniciar servicios periódicamente
2. Limitar tasa de actualización del panel:
   ```json
   // Configuración VSCode
   "specWorkflow.tasks.refreshInterval": 10000
   ```
3. Archivar especificaciones completadas
4. Limpiar caché del navegador para panel

## Problemas de Red

### Detrás de Proxy Corporativo

**Soluciones**:
1. Configurar proxy npm:
   ```bash
   npm config set proxy http://proxy.company.com:8080
   npm config set https-proxy http://proxy.company.com:8080
   ```
2. Usar instalación local:
   ```bash
   npm install @pimzino/spec-workflow-mcp
   node node_modules/@pimzino/spec-workflow-mcp/dist/index.js /ruta
   ```

### Firewall Bloqueando Conexiones

**Soluciones**:
1. Permitir Node.js a través del firewall
2. Usar localhost en lugar de 0.0.0.0
3. Configurar reglas de puerto específicas
4. Intentar rangos de puerto diferentes

## Problemas Específicos de Plataforma

### Windows

#### Problemas de Formato de Ruta
**Error**: `Invalid path` o ruta no encontrada

**Soluciones**:
```bash
# Usar barras diagonales
npx -y @pimzino/spec-workflow-mcp@latest C:/Users/nombre/proyecto

# O barras invertidas escapadas
npx -y @pimzino/spec-workflow-mcp@latest "C:\\Users\\nombre\\proyecto"
```

#### Política de Ejecución de PowerShell
**Error**: `cannot be loaded because running scripts is disabled`

**Soluciones**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Bloqueo de Gatekeeper
**Error**: `cannot be opened because the developer cannot be verified`

**Soluciones**:
1. Preferencias del Sistema → Seguridad y Privacidad → Permitir
2. O eliminar cuarentena:
   ```bash
   xattr -d com.apple.quarantine /ruta/a/node_modules
   ```

### Linux

#### Dependencias Faltantes
**Error**: `shared library not found`

**Soluciones**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install build-essential

# RHEL/CentOS
sudo yum groupinstall "Development Tools"
```

## Obtener Ayuda

### Información de Diagnóstico

Al reportar problemas, incluir:

1. **Información del Sistema**:
   ```bash
   node --version
   npm --version
   uname -a  # o 'ver' en Windows
   ```

2. **Mensajes de Error**:
   - Texto completo del error
   - Captura de pantalla si es problema visual
   - Logs de consola del navegador

3. **Configuración**:
   - Configuración del cliente MCP
   - Contenidos de config.toml
   - Comando de línea usado

4. **Pasos para Reproducir**:
   - Comandos exactos ejecutados
   - Comportamiento esperado
   - Comportamiento actual

### Canales de Soporte

1. **Issues de GitHub**: [Crear un issue](https://github.com/Pimzino/spec-workflow-mcp/issues)
2. **Documentación**: Verificar otras guías en `/docs`
3. **Comunidad**: Discusiones y Q&A

### Modo de Depuración

Habilitar logging detallado:

```bash
# Establecer variable de entorno
export DEBUG=spec-workflow:*  # macOS/Linux
set DEBUG=spec-workflow:*  # Windows

# Ejecutar con salida de depuración
npx -y @pimzino/spec-workflow-mcp@latest /ruta --debug
```

## Consejos de Prevención

### Mejores Prácticas

1. **Siempre usar rutas absolutas** en configuraciones
2. **Mantener Node.js actualizado** (v18+ requerido)
3. **Ejecutar desde directorio raíz** del proyecto
4. **Usar --help** para verificar opciones
5. **Probar en entorno limpio** cuando ocurran problemas
6. **Verificar logs** antes de asumir falla
7. **Respaldar directorio .spec-workflow** regularmente

### Mantenimiento Regular

1. Limpiar aprobaciones antiguas mensualmente
2. Archivar especificaciones completadas
3. Actualizar paquetes npm regularmente
4. Monitorear espacio en disco para logs
5. Reiniciar servicios después de actualizaciones

## Documentación Relacionada

- [Guía de Configuración](CONFIGURATION.es.md) - Opciones de configuración detalladas
- [Guía del Usuario](USER-GUIDE.es.md) - Instrucciones generales de uso
- [Guía de Desarrollo](DEVELOPMENT.es.md) - Para contribuir correcciones
- [Guía de Interfaces](INTERFACES.es.md) - Detalles del panel y extensión
