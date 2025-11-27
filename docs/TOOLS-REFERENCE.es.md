# Referencia de Herramientas

Documentación completa para todas las herramientas MCP proporcionadas por Spec Workflow MCP.

## Descripción General

Spec Workflow MCP proporciona herramientas especializadas para desarrollo de software estructurado. Estas herramientas son accesibles para asistentes de IA a través del Model Context Protocol.

## Categorías de Herramientas

1. **Guías de Flujo de Trabajo** - Documentación y orientación
2. **Gestión de Especificaciones** - Crear y gestionar especificaciones
3. **Herramientas de Contexto** - Recuperar información del proyecto
4. **Herramientas de Orientación** - Orientación a nivel de proyecto
5. **Herramientas de Aprobación** - Flujo de trabajo de aprobación de documentos

## Herramientas de Guía de Flujo de Trabajo

### spec-workflow-guide

**Propósito**: Proporciona orientación completa para el proceso de flujo de trabajo basado en especificaciones.

**Parámetros**: Ninguno

**Retorna**: Guía en markdown explicando el flujo de trabajo completo

**Ejemplo de Uso**:
```
"Muéstrame la guía del flujo de trabajo de especificaciones"
```

**La Respuesta Contiene**:
- Descripción general del flujo de trabajo
- Proceso paso a paso
- Mejores prácticas
- Prompts de ejemplo

### steering-guide

**Propósito**: Guía para crear documentos de orientación del proyecto.

**Parámetros**: Ninguno

**Retorna**: Guía en markdown para creación de documentos de orientación

**Ejemplo de Uso**:
```
"Muéstrame cómo crear documentos de orientación"
```

**La Respuesta Contiene**:
- Tipos de documentos de orientación
- Proceso de creación
- Guías de contenido
- Ejemplos

## Herramientas de Gestión de Especificaciones

### create-spec-doc

**Propósito**: Crea o actualiza documentos de especificación (requisitos, diseño, tareas).

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación (kebab-case) |
| docType | string | Sí | Tipo: "requirements", "design", o "tasks" |
| content | string | Sí | Contenido markdown del documento |
| revision | boolean | No | Si es una revisión (predeterminado: false) |

**Ejemplo de Uso**:
```typescript
{
  specName: "autenticacion-usuarios",
  docType: "requirements",
  content: "# Requisitos de Autenticación de Usuarios\n\n## Descripción General\n...",
  revision: false
}
```

**Retorna**:
```typescript
{
  success: true,
  message: "Documento de requisitos creado exitosamente",
  path: ".spec-workflow/specs/autenticacion-usuarios/requirements.md",
  requestedApproval: true
}
```

**Notas**:
- Crea directorio de especificación si no existe
- Solicita aprobación automáticamente para nuevos documentos
- Valida formato markdown
- Preserva documentos existentes al crear nuevos tipos

### spec-list

**Propósito**: Lista todas las especificaciones con su estado actual.

**Parámetros**: Ninguno

**Retorna**: Arreglo de resúmenes de especificaciones

**Estructura de Respuesta**:
```typescript
[
  {
    name: "autenticacion-usuarios",
    status: "en-progreso",
    progress: 45,
    documents: {
      requirements: "aprobado",
      design: "pendiente-aprobacion",
      tasks: "no-creado"
    },
    taskStats: {
      total: 15,
      completed: 7,
      inProgress: 1,
      pending: 7
    }
  }
]
```

**Ejemplo de Uso**:
```
"Lista todas mis especificaciones"
```

### spec-status

**Propósito**: Obtiene información detallada de estado para una especificación específica.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación a verificar |

**Retorna**: Estado detallado de la especificación

**Estructura de Respuesta**:
```typescript
{
  exists: true,
  name: "autenticacion-usuarios",
  documents: {
    requirements: {
      exists: true,
      approved: true,
      lastModified: "2024-01-15T10:30:00Z",
      size: 4523
    },
    design: {
      exists: true,
      approved: false,
      pendingApproval: true,
      lastModified: "2024-01-15T14:20:00Z",
      size: 6234
    },
    tasks: {
      exists: true,
      taskCount: 15,
      completedCount: 7,
      inProgressCount: 1,
      progress: 45
    }
  },
  overallProgress: 45,
  currentPhase: "implementacion"
}
```

**Ejemplo de Uso**:
```
"Muéstrame el estado de la especificación autenticacion-usuarios"
```

### manage-tasks

**Propósito**: Gestión completa de tareas incluyendo actualizaciones, cambios de estado y seguimiento de progreso.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación |
| action | string | Sí | Acción: "update", "complete", "list", "progress" |
| taskId | string | A veces | ID de tarea (requerido para update/complete) |
| status | string | No | Nuevo estado: "pending", "in-progress", "completed" |
| notes | string | No | Notas adicionales para la tarea |

**Acciones**:

1. **Actualizar Estado de Tarea**:
```typescript
{
  specName: "user-auth",
  action: "update",
  taskId: "1.2.1",
  status: "in-progress",
  notes: "Implementación iniciada"
}
```

2. **Completar Tarea**:
```typescript
{
  specName: "user-auth",
  action: "complete",
  taskId: "1.2.1"
}
```

3. **Listar Tareas**:
```typescript
{
  specName: "user-auth",
  action: "list"
}
```

4. **Obtener Progreso**:
```typescript
{
  specName: "user-auth",
  action: "progress"
}
```

**Retorna**: Información de tarea o confirmación de actualización

## Herramientas de Contexto

### get-template-context

**Propósito**: Recupera plantillas markdown para todos los tipos de documentos.

**Parámetros**: Ninguno

**Retorna**: Objeto conteniendo todas las plantillas

**Estructura de Respuesta**:
```typescript
{
  requirements: "# Plantilla de Requisitos\n\n## Descripción General\n...",
  design: "# Plantilla de Diseño\n\n## Arquitectura\n...",
  tasks: "# Plantilla de Tareas\n\n## Tareas de Implementación\n...",
  product: "# Plantilla de Orientación de Producto\n...",
  tech: "# Plantilla de Orientación Técnica\n...",
  structure: "# Plantilla de Orientación de Estructura\n..."
}
```

**Ejemplo de Uso**:
```
"Obtén todas las plantillas de documentos"
```

### get-steering-context

**Propósito**: Recupera documentos de orientación y guía del proyecto.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| docType | string | No | Doc específico: "product", "tech", "structure", o "all" |

**Retorna**: Contenido del documento de orientación

**Ejemplo de Uso**:
```typescript
{
  docType: "tech"  // Retorna solo orientación técnica
}
```

**Estructura de Respuesta**:
```typescript
{
  product: "# Orientación de Producto\n\n## Visión\n...",
  tech: "# Orientación Técnica\n\n## Arquitectura\n...",
  structure: "# Orientación de Estructura\n\n## Organización\n..."
}
```

### get-spec-context

**Propósito**: Recupera contexto completo para una especificación específica.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación |
| includeContent | boolean | No | Incluir contenido del documento (predeterminado: true) |

**Retorna**: Contexto completo de la especificación

**Estructura de Respuesta**:
```typescript
{
  name: "autenticacion-usuarios",
  exists: true,
  documents: {
    requirements: {
      exists: true,
      content: "# Requisitos\n\n...",
      approved: true
    },
    design: {
      exists: true,
      content: "# Diseño\n\n...",
      approved: false
    },
    tasks: {
      exists: true,
      content: "# Tareas\n\n...",
      stats: {
        total: 15,
        completed: 7,
        progress: 45
      }
    }
  },
  relatedSpecs: ["perfil-usuario", "gestion-sesiones"],
  dependencies: ["configuracion-bd", "libreria-auth"]
}
```

**Ejemplo de Uso**:
```
"Obtén contexto completo para la especificación autenticacion-usuarios"
```

## Herramientas de Documentos de Orientación

### create-steering-doc

**Propósito**: Crea documentos de orientación del proyecto (producto, tech, estructura).

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| docType | string | Sí | Tipo: "product", "tech", o "structure" |
| content | string | Sí | Contenido markdown del documento |

**Ejemplo de Uso**:
```typescript
{
  docType: "product",
  content: "# Orientación de Producto\n\n## Visión\nConstruir el mejor..."
}
```

**Retorna**:
```typescript
{
  success: true,
  message: "Documento de orientación de producto creado",
  path: ".spec-workflow/steering/product.md"
}
```

**Notas**:
- Crea directorio de orientación si es necesario
- Sobrescribe documentos de orientación existentes
- No se requiere aprobación para documentos de orientación
- Debe crearse antes de las especificaciones

## Herramientas del Sistema de Aprobación

### request-approval

**Propósito**: Solicita aprobación de usuario para un documento.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación |
| docType | string | Sí | Tipo de documento a aprobar |
| documentId | string | Sí | ID único para seguimiento |
| content | string | Sí | Contenido del documento para revisión |

**Ejemplo de Uso**:
```typescript
{
  specName: "user-auth",
  docType: "requirements",
  documentId: "user-auth-req-v1",
  content: "# Requisitos\n\n..."
}
```

**Retorna**:
```typescript
{
  success: true,
  approvalId: "user-auth-req-v1",
  message: "Aprobación solicitada. Revisa el panel para revisar."
}
```

### get-approval-status

**Propósito**: Verifica el estado de aprobación de un documento.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación |
| documentId | string | Sí | ID del documento a verificar |

**Retorna**:
```typescript
{
  exists: true,
  status: "pending" | "approved" | "rejected" | "changes-requested",
  feedback: "Por favor agrega más detalle sobre manejo de errores",
  timestamp: "2024-01-15T10:30:00Z",
  reviewer: "usuario"
}
```

**Ejemplo de Uso**:
```
"Verifica estado de aprobación para requisitos de user-auth"
```

### delete-approval

**Propósito**: Elimina solicitudes de aprobación completadas para limpiar la cola de aprobación.

**Parámetros**:

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|----------|-------------|
| specName | string | Sí | Nombre de la especificación |
| documentId | string | Sí | ID del documento a eliminar |

**Retorna**:
```typescript
{
  success: true,
  message: "Registro de aprobación eliminado"
}
```

**Ejemplo de Uso**:
```
"Limpia aprobaciones completadas para user-auth"
```

## Patrones de Integración de Herramientas

### Flujo de Trabajo Secuencial

Las herramientas están diseñadas para trabajar en secuencia:

1. `steering-guide` → Aprender sobre orientación
2. `create-steering-doc` → Crear documentos de orientación
3. `spec-workflow-guide` → Aprender flujo de trabajo
4. `create-spec-doc` → Crear requisitos
5. `request-approval` → Solicitar revisión
6. `get-approval-status` → Verificar estado
7. `create-spec-doc` → Crear diseño (después de aprobación)
8. `manage-tasks` → Rastrear implementación

### Operaciones Paralelas

Algunas herramientas pueden usarse simultáneamente:

- `spec-list` + `spec-status` → Obtener vista general y detalles
- `get-spec-context` + `get-steering-context` → Contexto completo del proyecto
- Múltiples `create-spec-doc` → Crear múltiples especificaciones

### Manejo de Errores

Todas las herramientas retornan estructuras de error consistentes:

```typescript
{
  success: false,
  error: "Especificación no encontrada",
  details: "No existe especificación llamada 'especificacion-invalida'",
  suggestion: "Usa spec-list para ver especificaciones disponibles"
}
```

## Mejores Prácticas

### Selección de Herramientas

1. **Recopilación de Información**:
   - Usa `spec-list` para vista general
   - Usa `spec-status` para especificación específica
   - Usa `get-spec-context` para implementación

2. **Creación de Documentos**:
   - Siempre crea requisitos primero
   - Espera aprobación antes del diseño
   - Crea tareas después de aprobación del diseño

3. **Gestión de Tareas**:
   - Actualiza estado al iniciar tareas
   - Marca completo inmediatamente después de terminar
   - Usa notas para contexto importante

### Consideraciones de Rendimiento

- **Operaciones en Lote**: Solicita múltiples especificaciones en una conversación
- **Caché**: Las herramientas cachean lecturas de archivos para rendimiento
- **Carga Selectiva**: Usa `includeContent: false` para verificaciones de estado más rápidas

### Seguridad

- **Validación de Ruta**: Todas las rutas son validadas y sanitizadas
- **Aislamiento de Proyecto**: Las herramientas solo acceden al directorio del proyecto
- **Sanitización de Entrada**: El contenido markdown es sanitizado
- **Sin Ejecución**: Las herramientas nunca ejecutan código

## Extender Herramientas

### Desarrollo de Herramientas Personalizadas

Para agregar nuevas herramientas:

1. Crear módulo de herramienta en `src/tools/`
2. Definir esquema de parámetros
3. Implementar función manejadora
4. Registrar con servidor MCP
5. Agregar a exportaciones

Estructura de ejemplo:
```typescript
export const customTool = {
  name: 'custom-tool',
  description: 'Descripción',
  parameters: {
    // JSON Schema
  },
  handler: async (params) => {
    // Implementación
  }
};
```

## Versionado de Herramientas

Las herramientas mantienen compatibilidad hacia atrás:

- Adiciones de parámetros son opcionales
- Las estructuras de respuesta se extienden, no reemplazan
- Características obsoletas muestran advertencias
- Guías de migración proporcionadas

## Documentación Relacionada

- [Guía del Usuario](USER-GUIDE.es.md) - Usando herramientas efectivamente
- [Proceso de Flujo de Trabajo](WORKFLOW.es.md) - Uso de herramientas en flujo de trabajo
- [Guía de Prompts](PROMPTING-GUIDE.es.md) - Ejemplo de uso de herramientas
- [Guía de Desarrollo](DEVELOPMENT.es.md) - Agregar nuevas herramientas
