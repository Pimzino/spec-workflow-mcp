# Guía del Proceso de Flujo de Trabajo

Esta guía explica el proceso completo de flujo de trabajo de desarrollo basado en especificaciones y mejores prácticas para usar Spec Workflow MCP.

## Descripción General

El flujo de trabajo basado en especificaciones sigue un enfoque estructurado:

```
Orientación → Especificaciones → Implementación → Verificación
```

Cada fase se construye sobre la anterior, asegurando desarrollo sistemático y bien documentado.

## Fase 1: Configuración del Proyecto con Documentos de Orientación

### ¿Por Qué Documentos de Orientación?

Los documentos de orientación proporcionan guía de alto nivel que mantiene tu proyecto alineado y consistente. Actúan como estrella del norte para todas las decisiones de desarrollo.

### Crear Documentos de Orientación

```
"Crea documentos de orientación para mi proyecto"
```

Esto genera tres documentos clave:

#### 1. Orientación de Producto (`steering/product.md`)
- Visión y misión del producto
- Usuarios objetivo y personas
- Características principales y prioridades
- Métricas de éxito y KPIs
- No-objetivos y restricciones

#### 2. Orientación Técnica (`steering/tech.md`)
- Decisiones de arquitectura
- Elecciones de stack tecnológico
- Requisitos de rendimiento
- Consideraciones de seguridad
- Enfoque de escalabilidad

#### 3. Orientación de Estructura (`steering/structure.md`)
- Organización del proyecto
- Convenciones de archivos y carpetas
- Estándares de nomenclatura
- Límites de módulos
- Estructura de documentación

### Mejores Prácticas para Orientación

1. **Crear temprano** - Configurar orientación antes de cualquier especificación
2. **Mantener actualizado** - Revisar a medida que el proyecto evoluciona
3. **Referenciar a menudo** - Usar para toma de decisiones
4. **Compartir ampliamente** - Asegurar alineación del equipo

## Fase 2: Creación de Especificaciones

### Sistema de Tres Documentos

Cada especificación consiste en tres documentos secuenciales:

```
Requisitos → Diseño → Tareas
```

### Documento de Requisitos

**Propósito**: Definir QUÉ necesita construirse

**Contenidos**:
- Descripción general de característica
- Historias de usuario
- Requisitos funcionales
- Requisitos no funcionales
- Criterios de aceptación
- Restricciones y suposiciones

**Ejemplo de Creación**:
```
"Crea requisitos para un sistema de notificaciones de usuario que soporte:
- Notificaciones por email
- Notificaciones en la app
- Notificaciones push
- Preferencias de usuario
- Historial de notificaciones"
```

### Documento de Diseño

**Propósito**: Definir CÓMO se construirá

**Contenidos**:
- Arquitectura técnica
- Diseño de componentes
- Modelos de datos
- Especificaciones de API
- Puntos de integración
- Enfoque de implementación

**Generación Automática**: Creado después de aprobación de requisitos

### Documento de Tareas

**Propósito**: Definir los PASOS para construirlo

**Contenidos**:
- Desglose jerárquico de tareas
- Dependencias
- Estimaciones de esfuerzo
- Orden de implementación
- Requisitos de prueba

**Ejemplo de Estructura**:
```
1.0 Configuración de Base de Datos
  1.1 Crear tablas de notificaciones
  1.2 Configurar índices
  1.3 Crear scripts de migración

2.0 Implementación Backend
  2.1 Crear servicio de notificaciones
    2.1.1 Manejador de email
    2.1.2 Manejador de push
  2.2 Crear endpoints API
  2.3 Agregar autenticación

3.0 Implementación Frontend
  3.1 Crear componentes de notificación
  3.2 Integrar con API
  3.3 Agregar UI de preferencias
```

## Fase 3: Revisión y Aprobación

### Flujo de Trabajo de Aprobación

1. **Creación de Documento** - IA genera documento
2. **Solicitud de Revisión** - Aprobación solicitada automáticamente
3. **Revisión de Usuario** - Revisar en panel/extensión
4. **Decisión** - Aprobar, solicitar cambios o rechazar
5. **Revisión** (si es necesario) - IA actualiza basado en retroalimentación
6. **Aprobación Final** - Documento bloqueado para implementación

### Tomar Decisiones de Aprobación

#### Cuándo Aprobar
- Los requisitos están completos y claros
- El diseño resuelve el problema establecido
- Las tareas son lógicas y completas
- Sin preocupaciones o brechas importantes

#### Cuándo Solicitar Cambios
- Detalles importantes faltantes
- Especificaciones poco claras
- Mejor enfoque disponible
- Necesita alineación con estándares

#### Cuándo Rechazar
- Malentendido fundamental
- Enfoque completamente incorrecto
- Requiere replanteamiento completo

### Proporcionar Retroalimentación Efectiva

Buena retroalimentación:
```
"El flujo de autenticación debe usar tokens JWT en lugar de sesiones.
Agrega limitación de tasa a los endpoints API.
Incluye manejo de errores para fallos de red."
```

Mala retroalimentación:
```
"Esto no se ve bien. Corrígelo."
```

## Fase 4: Implementación

### Estrategia de Ejecución de Tareas

#### Implementación Secuencial
Mejor para tareas dependientes:
```
"Implementa la tarea 1.1 de la especificación user-auth"
"Ahora implementa la tarea 1.2"
"Continúa con la tarea 1.3"
```

#### Implementación Paralela
Para tareas independientes:
```
"Implementa todas las tareas de UI de la especificación del panel mientras trabajo en el backend"
```

#### Implementación Basada en Secciones
Para agrupaciones lógicas:
```
"Implementa todas las tareas de base de datos de la especificación de pagos"
```

### Seguimiento de Progreso

Monitorear implementación a través de:
- Vista de tareas del panel
- Barras de progreso
- Indicadores de estado
- Porcentajes de completitud

### Manejo de Bloqueos

Cuando estés bloqueado:
1. Documentar el bloqueo
2. Crear sub-tarea para resolución
3. Moverse a tareas paralelas si es posible
4. Actualizar estado de tarea a "bloqueado"

## Fase 5: Verificación

### Estrategia de Pruebas

Después de la implementación:

1. **Pruebas Unitarias**
   ```
   "Crea pruebas unitarias para el servicio de notificaciones"
   ```

2. **Pruebas de Integración**
   ```
   "Crea pruebas de integración para los endpoints API"
   ```

3. **Pruebas End-to-End**
   ```
   "Crea pruebas E2E para el flujo completo de notificaciones"
   ```

### Actualizaciones de Documentación

Mantener documentación actualizada:
```
"Actualiza la documentación de API para los nuevos endpoints"
"Agrega ejemplos de uso al README"
```

## Estructura de Archivos y Organización

### Estructura Estándar del Proyecto

```
tu-proyecto/
├── .spec-workflow/
│   ├── steering/
│   │   ├── product.md
│   │   ├── tech.md
│   │   └── structure.md
│   ├── specs/
│   │   ├── user-auth/
│   │   │   ├── requirements.md
│   │   │   ├── design.md
│   │   │   └── tasks.md
│   │   └── payment-gateway/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       └── tasks.md
│   └── approval/
│       └── [archivos de seguimiento de aprobación]
├── src/
│   └── [tu implementación]
└── tests/
    └── [tus pruebas]
```

### Convenciones de Nomenclatura

**Nombres de Especificaciones**:
- Usar kebab-case: `autenticacion-usuarios`
- Ser descriptivo: `procesamiento-pagos` no `pagos`
- Evitar versiones: `perfil-usuario` no `perfil-usuario-v2`

**Nombres de Documentos**:
- Siempre: `requirements.md`, `design.md`, `tasks.md`
- Consistentes en todas las especificaciones

## Flujos de Trabajo Avanzados

### Iteraciones de Características

Para características en evolución:

1. Crear especificación inicial
2. Implementar MVP
3. Crear especificación de mejora
4. Referenciar especificación original
5. Construir sobre trabajo existente

Ejemplo:
```
"Crea una especificación de mejora para user-auth que agregue:
- Login social (Google, Facebook)
- Autenticación biométrica
- Mejoras en gestión de sesión"
```

### Flujo de Trabajo de Refactorización

1. **Documentar Estado Actual**
   ```
   "Crea una especificación documentando el sistema de autenticación actual"
   ```

2. **Diseñar Mejoras**
   ```
   "Diseña refactorización para mejorar rendimiento de autenticación"
   ```

3. **Planear Migración**
   ```
   "Crea tareas de migración para la refactorización"
   ```

4. **Implementar Gradualmente**
   ```
   "Implementa tareas de refactorización con compatibilidad hacia atrás"
   ```

### Flujo de Trabajo de Resolución de Bugs

1. **Reporte de Bug**
   ```
   "Crea reporte de bug para problema de timeout de login"
   ```

2. **Investigación**
   ```
   "Investiga causa raíz del bug #45"
   ```

3. **Diseño de Solución**
   ```
   "Diseña corrección para el problema de timeout"
   ```

4. **Implementación**
   ```
   "Implementa la corrección del bug"
   ```

5. **Verificación**
   ```
   "Crea pruebas de regresión para el bug #45"
   ```

## Mejores Prácticas

### 1. Mantener Granularidad de Especificaciones

**Bueno**: Una especificación por característica
- `autenticacion-usuarios`
- `procesamiento-pagos`
- `sistema-notificaciones`

**Malo**: Especificaciones demasiado amplias
- `sistema-backend`
- `todas-las-caracteristicas`

### 2. Creación Secuencial de Documentos

Siempre seguir el orden:
1. Requisitos (qué)
2. Diseño (cómo)
3. Tareas (pasos)

Nunca saltarse adelante.

### 3. Completar Aprobación Antes de Implementación

- ✅ Aprobar requisitos → Crear diseño
- ✅ Aprobar diseño → Crear tareas
- ✅ Revisar tareas → Comenzar implementación
- ❌ Saltar aprobación → Problemas de implementación

### 4. Mantener Especificaciones Actualizadas

Cuando los requisitos cambien:
```
"Actualiza los requisitos para user-auth para incluir soporte SSO"
```

### 5. Usar Terminología Consistente

Mantener consistencia en:
- Nombres de especificaciones
- Nombres de componentes
- Terminología de API
- Nomenclatura de base de datos

### 6. Archivar Especificaciones Completadas

Mantener espacio de trabajo limpio:
```
"Archiva la especificación completada user-auth"
```

## Patrones Comunes

### MVP a Característica Completa

1. Comenzar con especificación MVP
2. Implementar funcionalidad central
3. Crear especificaciones de mejora
4. Construir incrementalmente
5. Mantener compatibilidad hacia atrás

### Desarrollo de Microservicios

1. Crear documento de orientación de servicio
2. Definir límites de servicio
3. Crear especificación por servicio
4. Definir puntos de integración
5. Implementar servicios independientemente

### Desarrollo API-First

1. Crear especificación de API primero
2. Diseñar contratos
3. Generar documentación
4. Implementar endpoints
5. Crear SDKs de cliente

## Solución de Problemas de Flujo de Trabajo

### Especificaciones Demasiado Grandes

**Solución**: Dividir en especificaciones más pequeñas
```
"Divide la especificación de e-commerce en:
- catalogo-productos
- carrito-compras
- proceso-checkout
- gestion-pedidos"
```

### Requisitos Poco Claros

**Solución**: Solicitar aclaración
```
"Los requisitos necesitan más detalle sobre:
- Roles y permisos de usuario
- Escenarios de manejo de errores
- Requisitos de rendimiento"
```

### El Diseño No Coincide con Requisitos

**Solución**: Solicitar revisión
```
"El diseño no aborda el requisito de multi-tenancy.
Por favor revisa para incluir aislamiento de tenants."
```

## Integración con Proceso de Desarrollo

### Flujo de Trabajo Git

1. Crear rama de característica por especificación
2. Hacer commit después de completar cada tarea
3. Referenciar especificación en mensajes de commit
4. PR cuando la especificación esté completa

### Integración CI/CD

- Ejecutar pruebas para tareas completadas
- Validar contra requisitos
- Desplegar características completadas
- Monitorear contra métricas de éxito

### Colaboración en Equipo

- Compartir URL del panel
- Asignar especificaciones a miembros del equipo
- Revisar especificaciones de los demás
- Coordinar a través de aprobaciones

## Documentación Relacionada

- [Guía del Usuario](USER-GUIDE.es.md) - Instrucciones generales de uso
- [Guía de Prompts](PROMPTING-GUIDE.es.md) - Ejemplos de prompts y patrones
- [Referencia de Herramientas](TOOLS-REFERENCE.es.md) - Documentación completa de herramientas
- [Guía de Interfaces](INTERFACES.es.md) - Detalles del panel y extensión
