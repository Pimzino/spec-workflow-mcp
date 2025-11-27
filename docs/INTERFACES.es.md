# Guía de Interfaces

Esta guía cubre las dos interfaces principales para Spec Workflow MCP: el Panel de Control Web y la Extensión para VSCode.

## Descripción General

Spec Workflow MCP proporciona dos interfaces:

1. **Panel de Control Web** - Interfaz basada en navegador para usuarios de CLI
2. **Extensión para VSCode** - Experiencia IDE integrada para usuarios de VSCode

Ambas interfaces proporcionan la misma funcionalidad central con optimizaciones específicas de la plataforma.

## Panel de Control Web

### Descripción General

El panel de control web es una aplicación web en tiempo real que proporciona acceso visual a tus especificaciones, tareas y flujos de trabajo de aprobación.

### Iniciar el Panel de Control

#### Panel de Control Independiente
```bash
# Usa puerto efímero
npx -y @pimzino/spec-workflow-mcp@latest /ruta/a/proyecto --dashboard

# Puerto personalizado
npx -y @pimzino/spec-workflow-mcp@latest /ruta/a/proyecto --dashboard --port 3000
```

#### Con Servidor MCP
```bash
# Auto-inicio con MCP
npx -y @pimzino/spec-workflow-mcp@latest /ruta/a/proyecto --AutoStartDashboard
```

### Características del Panel de Control

#### Vista Principal

El inicio del panel muestra:

- **Resumen del Proyecto**
  - Conteo de especificaciones activas
  - Total de tareas
  - Porcentaje de completitud
  - Actividad reciente

- **Tarjetas de Especificación**
  - Nombre y estado de especificación
  - Barra de progreso
  - Indicadores de documentos
  - Acciones rápidas

#### Vista de Detalles de Especificación

Al hacer clic en una especificación muestra:

- **Pestañas de Documentos**
  - Requisitos
  - Diseño
  - Tareas

- **Contenido del Documento**
  - Markdown renderizado
  - Resaltado de sintaxis
  - Tabla de contenidos

- **Acciones de Aprobación**
  - Botón de aprobar
  - Solicitar cambios
  - Opción de rechazo
  - Campo de comentarios

#### Gestión de Tareas

La vista de tareas proporciona:

- **Lista de Tareas Jerárquica**
  - Tareas numeradas (1.0, 1.1, 1.1.1)
  - Indicadores de estado
  - Seguimiento de progreso

- **Acciones de Tarea**
  - Botón copiar prompt
  - Marcar completo
  - Agregar notas
  - Ver dependencias

- **Visualización de Progreso**
  - Barra de progreso general
  - Progreso de sección
  - Estimaciones de tiempo

#### Documentos de Orientación

Acceso a orientación del proyecto:

- **Orientación del Producto**
  - Visión y objetivos
  - Personas de usuario
  - Métricas de éxito

- **Orientación Técnica**
  - Decisiones de arquitectura
  - Elecciones de tecnología
  - Objetivos de rendimiento

- **Orientación de Estructura**
  - Organización de archivos
  - Convenciones de nomenclatura
  - Límites de módulos

### Navegación del Panel

#### Atajos de Teclado

| Atajo | Acción |
|----------|--------|
| `Alt + S` | Enfocar lista de especificaciones |
| `Alt + T` | Ver tareas |
| `Alt + R` | Ver requisitos |
| `Alt + D` | Ver diseño |
| `Alt + A` | Abrir diálogo de aprobación |
| `Esc` | Cerrar diálogo |

#### Estructura de URL

Enlaces directos a vistas específicas:
- `/` - Panel de inicio
- `/spec/{nombre}` - Especificación específica
- `/spec/{nombre}/requirements` - Documento de requisitos
- `/spec/{nombre}/design` - Documento de diseño
- `/spec/{nombre}/tasks` - Lista de tareas
- `/steering/{tipo}` - Documentos de orientación

### Actualizaciones en Tiempo Real

El panel usa WebSockets para actualizaciones en vivo:

- **Actualización Automática**
  - Nuevas especificaciones aparecen instantáneamente
  - Actualizaciones de estado de tareas
  - Cambios de progreso
  - Notificaciones de aprobación

- **Estado de Conexión**
  - Verde: Conectado
  - Amarillo: Reconectando
  - Rojo: Desconectado

- **Sistema de Notificaciones**
  - Solicitudes de aprobación
  - Completitud de tareas
  - Alertas de error
  - Mensajes de éxito

### Personalización del Panel

#### Configuración de Tema

Alternar entre modos claro y oscuro:
- Hacer clic en icono de tema en encabezado
- Persiste entre sesiones
- Respeta preferencia del sistema

#### Selección de Idioma

Cambiar idioma de interfaz:
1. Hacer clic en icono de configuración
2. Seleccionar idioma del menú desplegable
3. La interfaz se actualiza inmediatamente

Idiomas compatibles:
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

#### Opciones de Visualización

Personalizar preferencias de vista:
- Tarjetas de especificación compactas/expandidas
- Mostrar/ocultar tareas completadas
- Tamaño de fuente del documento
- Tema de sintaxis de código

## Extensión para VSCode

### Instalación

Instalar desde VSCode Marketplace:

1. Abrir Extensiones de VSCode (Ctrl+Shift+X)
2. Buscar "Spec Workflow MCP"
3. Hacer clic en Instalar
4. Recargar VSCode

O vía línea de comandos:
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Características de la Extensión

#### Panel Lateral

Acceso vía icono de Barra de Actividad:

- **Explorador de Especificaciones**
  - Vista de árbol de todas las especificaciones
  - Expandir para ver documentos
  - Indicadores de estado
  - Acciones del menú contextual

- **Lista de Tareas**
  - Vista de tareas filtrable
  - Seguimiento de progreso
  - Acciones rápidas
  - Funcionalidad de búsqueda

- **Vista de Archivo**
  - Especificaciones completadas
  - Datos históricos
  - Opción de restaurar
  - Operaciones en lote

#### Visor de Documentos

Abrir documentos en editor:

- **Resaltado de Sintaxis**
  - Renderizado de Markdown
  - Bloques de código
  - Casillas de verificación de tareas
  - Enlaces y referencias

- **Acciones de Documento**
  - Editar en el lugar
  - Modo de vista previa
  - Vista dividida
  - Opciones de exportación

#### Aprobaciones Integradas

Diálogos nativos de VSCode para:

- **Solicitudes de Aprobación**
  - Notificaciones emergentes
  - Comentarios en línea
  - Aprobar/rechazar rápido
  - Retroalimentación detallada

- **Flujo de Trabajo de Revisión**
  - Rastrear cambios
  - Hilos de comentarios
  - Comparación de versiones
  - Historial de aprobación

#### Acciones del Menú Contextual

Acciones de clic derecho en editor:

- **En Archivos de Especificación**
  - Aprobar documento
  - Solicitar cambios
  - Ver en panel
  - Copiar ruta de especificación

- **En Elementos de Tarea**
  - Marcar completo
  - Copiar prompt
  - Agregar subtarea
  - Ver detalles

### Configuración de la Extensión

Configurar en configuración de VSCode:

```json
{
  "specWorkflow.language": "es",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Descripciones de Configuración

| Configuración | Descripción | Predeterminado |
|---------|-------------|---------|
| `language` | Idioma de interfaz | "en" |
| `notifications.enabled` | Mostrar notificaciones | true |
| `notifications.sound` | Reproducir alertas de sonido | true |
| `notifications.volume` | Volumen de sonido (0-1) | 0.5 |
| `archive.showInExplorer` | Mostrar especificaciones archivadas | true |
| `tasks.autoRefresh` | Auto-actualizar tareas | true |
| `tasks.refreshInterval` | Intervalo de actualización (ms) | 5000 |
| `theme.followVSCode` | Coincidir tema de VSCode | true |

### Comandos de la Extensión

Disponibles en Paleta de Comandos (Ctrl+Shift+P):

| Comando | Descripción |
|---------|-------------|
| `Spec Workflow: Create Spec` | Iniciar nueva especificación |
| `Spec Workflow: List Specs` | Mostrar todas las especificaciones |
| `Spec Workflow: View Dashboard` | Abrir panel web |
| `Spec Workflow: Archive Spec` | Mover a archivo |
| `Spec Workflow: Restore Spec` | Restaurar desde archivo |
| `Spec Workflow: Refresh` | Recargar datos de especificación |
| `Spec Workflow: Show Steering` | Ver documentos de orientación |
| `Spec Workflow: Export Spec` | Exportar a markdown |

### Notificaciones de Sonido

La extensión incluye alertas de audio para:

- **Solicitudes de Aprobación** - Campanada suave
- **Completitud de Tarea** - Sonido de éxito
- **Errores** - Tono de alerta
- **Actualizaciones** - Notificación suave

Configurar en configuración:
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Comparación de Características

| Característica | Panel Web | Extensión VSCode |
|---------|--------------|------------------|
| Ver especificaciones | ✅ | ✅ |
| Gestionar tareas | ✅ | ✅ |
| Aprobaciones | ✅ | ✅ |
| Actualizaciones en tiempo real | ✅ | ✅ |
| Sistema de archivo | ❌ | ✅ |
| Notificaciones de sonido | ❌ | ✅ |
| Integración con editor | ❌ | ✅ |
| Menús contextuales | ❌ | ✅ |
| Atajos de teclado | Limitado | Completo |
| Multi-proyecto | Manual | Automático |
| Acceso sin conexión | ❌ | ✅ |
| Opciones de exportación | Básico | Avanzado |

## Elegir la Interfaz Correcta

### Usar Panel de Control Web Cuando:

- Usar herramientas de IA basadas en CLI
- Trabajar en múltiples IDEs
- Necesitar acceso basado en navegador
- Compartir con miembros del equipo
- Se necesita vista rápida del proyecto

### Usar Extensión VSCode Cuando:

- IDE principal es VSCode
- Querer experiencia integrada
- Necesitar características del editor
- Preferir diálogos nativos
- Querer notificaciones de sonido

## Sincronización de Interfaz

Ambas interfaces comparten los mismos datos:

- **Sincronización en Tiempo Real**
  - Cambios en una se reflejan en otra
  - Estado de aprobación compartido
  - Estado de tarea consistente
  - Seguimiento de progreso unificado

- **Almacenamiento de Datos**
  - Fuente única de verdad
  - Almacenamiento basado en archivos
  - No se necesita sincronización
  - Actualizaciones instantáneas

## Acceso Móvil y Tablet

### Panel de Control Web en Móvil

El panel es responsivo:

- **Vista de Teléfono**
  - Tarjetas de especificación apiladas
  - Navegación plegable
  - Botones optimizados para táctil
  - Gestos de deslizamiento

- **Vista de Tablet**
  - Diseño lado a lado
  - Interacciones táctiles
  - Espaciado optimizado
  - Soporte horizontal

### Limitaciones en Móvil

- Sin extensión VSCode
- Atajos de teclado limitados
- Multi-tarea reducida
- Interacciones simplificadas

## Características de Accesibilidad

### Panel de Control Web

- **Navegación con Teclado**
  - Tab a través de elementos
  - Enter para activar
  - Escape para cancelar
  - Teclas de flecha para listas

- **Soporte de Lector de Pantalla**
  - Etiquetas ARIA
  - Atributos de rol
  - Anuncios de estado
  - Gestión de foco

- **Accesibilidad Visual**
  - Modo de alto contraste
  - Tamaño de fuente ajustable
  - Amigable para daltónicos
  - Indicadores de foco

### Extensión VSCode

Hereda accesibilidad de VSCode:
- Soporte de lector de pantalla
- Navegación con teclado
- Temas de alto contraste
- Funcionalidad de zoom

## Optimización de Rendimiento

### Rendimiento del Panel

- **Carga Diferida**
  - Documentos cargan bajo demanda
  - Paginación para listas largas
  - Renderizado progresivo
  - Optimización de imágenes

- **Estrategia de Caché**
  - Caché del navegador
  - Service worker
  - Soporte sin conexión (limitado)
  - Navegación rápida

### Rendimiento de la Extensión

- **Gestión de Recursos**
  - Uso mínimo de memoria
  - Observación eficiente de archivos
  - Actualizaciones con debouncing
  - Procesamiento en segundo plano

## Solución de Problemas de Interfaz

### Problemas del Panel

| Problema | Solución |
|-------|----------|
| No carga | Verificar que el servidor esté ejecutándose, verificar URL |
| Sin actualizaciones | Verificar conexión WebSocket, actualizar página |
| Aprobación no funciona | Asegurar que panel y MCP estén conectados |
| Estilo roto | Limpiar caché del navegador, verificar consola |

### Problemas de la Extensión

| Problema | Solución |
|-------|----------|
| No muestra especificaciones | Verificar que proyecto tenga directorio .spec-workflow |
| Comandos no funcionan | Recargar ventana de VSCode |
| Sin notificaciones | Verificar configuración de extensión |
| Archivo no visible | Habilitar en configuración |

## Uso Avanzado

### URL Personalizada del Panel

Configurar en múltiples terminales:
```bash
# Terminal 1: Servidor MCP
npx -y @pimzino/spec-workflow-mcp@latest /proyecto

# Terminal 2: Panel
npx -y @pimzino/spec-workflow-mcp@latest /proyecto --dashboard --port 3000
```

### Espacios de Trabajo Multi-Raíz de la Extensión

La extensión soporta espacios de trabajo multi-raíz de VSCode:

1. Agregar múltiples carpetas de proyecto
2. Cada una muestra especificaciones separadas
3. Cambiar entre proyectos
4. Configuraciones independientes

## Documentación Relacionada

- [Guía de Configuración](CONFIGURATION.es.md) - Configuración y ajustes
- [Guía del Usuario](USER-GUIDE.es.md) - Usando las interfaces
- [Proceso de Flujo de Trabajo](WORKFLOW.es.md) - Flujo de trabajo de desarrollo
- [Solución de Problemas](TROUBLESHOOTING.es.md) - Problemas comunes
