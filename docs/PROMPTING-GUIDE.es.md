# Guía de Prompts

Una guía completa con ejemplos y mejores prácticas para interactuar con Spec Workflow MCP a través de asistentes de IA.

## Referencia Rápida

### Comandos Esenciales

```
"Crea una especificación para [característica]"
"Lista todas mis especificaciones"
"Muestra el estado de [nombre-especificación]"
"Implementa la tarea [número] de [especificación]"
"Crea documentos de orientación"
```

## Crear Especificaciones

### Creación Básica de Especificación

#### Solicitud Simple
```
"Crea una especificación para autenticación de usuarios"
```

La IA creará:
- Documento de requisitos
- Documento de diseño (después de aprobación)
- Desglose de tareas (después de aprobación de diseño)

#### Solicitud Detallada
```
"Crea una especificación llamada procesamiento-de-pagos con:
- Pagos con tarjeta de crédito vía Stripe
- Integración con PayPal
- Manejo de reembolsos
- Procesamiento de webhooks para eventos de pago
- Consideraciones de cumplimiento PCI"
```

#### Desde Documentación Existente
```
"Crea una especificación desde el PRD en @requisitos-producto.md"
```

```
"Construye una especificación basada en el documento de diseño en @exportacion-figma.md"
```

### Creación Avanzada de Especificación

#### Con Restricciones Técnicas
```
"Crea una especificación para notificaciones en tiempo real que:
- Use WebSockets para actualizaciones en vivo
- Vuelva a polling para navegadores antiguos
- Maneje hasta 10,000 conexiones concurrentes
- Mantenga orden de mensajes
- Incluya soporte de cola sin conexión"
```

#### Con Criterios de Aceptación
```
"Crea una especificación para funcionalidad de búsqueda con estos criterios de aceptación:
- Resultados aparecen dentro de 200ms
- Soporta coincidencia difusa
- Incluye filtros para fecha, categoría y autor
- Muestra puntuación de relevancia
- Maneja errores tipográficos y sinónimos"
```

#### Especificación de Microservicio
```
"Crea una especificación para un microservicio de inventario que:
- Exponga API REST
- Use PostgreSQL para almacenamiento
- Publique eventos a Kafka
- Implemente patrón CQRS
- Incluya endpoints de verificación de salud"
```

## Gestionar Especificaciones

### Listar y Estado

#### Obtener Vista General
```
"Lista todas mis especificaciones"
"Muéstrame todas las especificaciones y su progreso"
"¿Qué especificaciones están esperando aprobación?"
"¿Qué especificaciones están actualmente en progreso?"
```

#### Estado Específico
```
"Muestra el estado de la especificación user-auth"
"¿Cuál es el progreso de procesamiento-de-pagos?"
"Muéstrame lo que falta hacer en la especificación de notificaciones"
"¿Qué tareas están completadas en user-profile?"
```

#### Filtrado
```
"Muéstrame especificaciones que están más del 50% completas"
"Lista especificaciones esperando mi aprobación"
"¿Qué especificaciones no tienen tareas completadas aún?"
"Muestra especificaciones bloqueadas o atascadas"
```

### Gestión de Documentos

#### Ver Documentos
```
"Muéstrame los requisitos para user-auth"
"Muestra el documento de diseño para pagos"
"¿Cuáles son las tareas para el sistema de notificaciones?"
"Muestra todos los documentos para la especificación de búsqueda"
```

#### Actualizar Documentos
```
"Actualiza los requisitos de user-auth para incluir 2FA"
"Revisa el diseño de pagos para usar Stripe Connect"
"Agrega una tarea para pruebas de seguridad a user-profile"
"Actualiza requisitos basados en la retroalimentación: [retroalimentación]"
```

## Prompts de Implementación

### Tareas Individuales

#### Implementación Básica
```
"Implementa la tarea 1.2 de user-auth"
"Completa la tarea 2.1.3 en la especificación de pagos"
"Trabaja en la siguiente tarea pendiente en notificaciones"
```

#### Con Contexto
```
"Implementa la tarea 1.2 de user-auth usando TypeScript y Express"
"Completa la tarea de migración de base de datos usando Prisma"
"Implementa la tarea del endpoint API siguiendo convenciones REST"
```

### Implementación en Lote

#### Por Sección
```
"Implementa todas las tareas de base de datos de user-auth"
"Completa todas las tareas de frontend en la especificación del panel"
"Trabaja en todas las tareas de API para pagos"
```

#### Por Prioridad
```
"Implementa todas las tareas críticas primero"
"Completa las tareas MVP de user-profile"
"Enfócate en tareas necesarias para la demo"
```

#### Secuencial
```
"Implementa las tareas 1.1 hasta 1.5 de user-auth"
"Completa todas las subtareas bajo la sección 2"
"Trabaja en las tareas de configuración en orden"
```

### Estrategias de Implementación

#### Dirigido por Pruebas
```
"Para la tarea 1.2, escribe pruebas primero luego implementa"
"Implementa la tarea 2.1 con cobertura completa de pruebas"
"Crea pruebas unitarias mientras implementas la tarea de servicio"
```

#### Con Documentación
```
"Implementa la tarea 1.3 y documenta el API"
"Completa la tarea de autenticación con comentarios en línea"
"Implementa y crea ejemplos de uso para la tarea 2.2"
```

## Documentos de Orientación

### Crear Orientación

#### Conjunto Completo
```
"Crea documentos de orientación para mi proyecto de e-commerce"
"Configura orientación para una aplicación SaaS"
"Crea guía de proyecto para una app móvil"
```

#### Documentos Individuales
```
"Crea un documento de orientación de producto enfocado en experiencia de usuario"
"Crea orientación técnica para una arquitectura de microservicios"
"Crea orientación de estructura para una configuración monorepo"
```

#### Desde Contexto
```
"Crea documentos de orientación basados en @brief-proyecto.md"
"Genera orientación desde nuestras decisiones técnicas en @arquitectura.md"
```

### Actualizar Orientación

```
"Actualiza orientación de producto para incluir características B2B"
"Revisa orientación técnica para usar GraphQL en lugar de REST"
"Actualiza orientación de estructura para el nuevo sistema de módulos"
```

## Flujos de Trabajo de Aprobación

### Solicitar Retroalimentación

#### Con Preocupaciones Específicas
```
"Solicita aprobación para requisitos de user-auth - verifica particularmente la sección de seguridad"
"Pide revisión del diseño de pagos - enfócate en el manejo de errores"
"Solicita retroalimentación sobre el desglose de tareas - ¿está demasiado granular?"
```

#### Solicitudes de Revisión
```
"Los requisitos necesitan más detalle sobre:
- Escenarios de manejo de errores
- Requisitos de rendimiento
- Consideraciones de seguridad
Por favor revisa y reenvía"
```

### Decisiones de Aprobación

#### Aprobar
```
"Aprueba los requisitos de user-auth"
"El diseño se ve bien, apruébalo"
"Acepta el desglose de tareas tal como está"
```

#### Solicitar Cambios
```
"Solicita cambios a los requisitos:
- Agregar soporte multi-tenant
- Incluir limitación de tasa
- Especificar política de retención de datos"
```

#### Rechazar
```
"Rechaza el diseño actual - necesitamos usar arquitectura dirigida por eventos en su lugar"
"Comienza de nuevo con los requisitos - el alcance es demasiado amplio"
```

## Flujo de Trabajo de Bugs

### Reportar Bugs

#### Reporte Detallado
```
"Crea un reporte de bug:
Título: Login falla con caracteres especiales
Pasos: 1) Ingresa email con '+' 2) Envía formulario 3) Ve error
Esperado: Login tiene éxito
Actual: Error 500
Prioridad: Alta
Ambiente: Producción"
```

#### Desde Logs de Errores
```
"Crea un reporte de bug desde este error: [pegar stack trace]"
"Documenta este bug desde la alerta de Sentry: [enlace]"
```

### Resolución de Bugs

#### Investigación
```
"Investiga la causa raíz del bug #45"
"Analiza por qué el webhook de pagos está fallando"
"Depura el problema de rendimiento en el endpoint de búsqueda"
```

#### Implementación de Corrección
```
"Crea una corrección para el bug #45 en autenticación de usuarios"
"Implementa una solución para el problema de timeout de pagos"
"Corrige la fuga de memoria en el servicio de notificaciones"
```

## Cambios Durante la Implementación

### Cuando las Especificaciones Cambian Durante el Desarrollo

Los requisitos y diseños a menudo evolucionan durante la implementación. Cuando esto sucede, necesitas mantener tasks.md alineado con la especificación actual mientras preservas el trabajo completado.

### Usar la Característica de Actualización de Tareas

La IA tiene acceso a instrucciones completas de actualización de tareas a través del prompt refresh-tasks. Simplemente informa a la IA sobre tus cambios:

#### Actualización Básica de Tareas
```
"Los requisitos han sido actualizados. Por favor actualiza tasks.md para alinearlo con los requirements.md y design.md actuales."
```

#### Actualización Detallada de Tareas con Contexto
```
"He actualizado la especificación con los siguientes cambios:
- Eliminado el módulo de reportes
- Cambiada base de datos de MongoDB a PostgreSQL
- Agregada característica de login social

Por favor actualiza tasks.md siguiendo el proceso de actualización de tareas:
1. Preserva todas las tareas completadas y en progreso
2. Agrega tareas de migración para el cambio de base de datos
3. Elimina tareas pendientes para el módulo de reportes
4. Agrega nuevas tareas para login social"
```

#### Cambio de Arquitectura Requiriendo Migración
```
"Estamos cambiando de API REST a GraphQL. Varios endpoints REST ya están implementados. Por favor actualiza tasks.md con:
1. Todo el trabajo REST completado preservado
2. Tareas de migración para envolver lógica REST en resolvers GraphQL
3. Nuevas tareas de implementación GraphQL
4. Tareas de limpieza para eliminar REST después de que GraphQL sea verificado"
```

### Comportamiento Esperado de la IA

Cuando solicitas una actualización de tareas, la IA:

1. **Analiza Estado Actual**
   - Lee requirements.md y design.md para especificación actual
   - Identifica tareas completadas, en progreso y pendientes
   - Determina qué características han sido agregadas, eliminadas o cambiadas

2. **Preserva Trabajo Completado**
   - Mantiene todas las tareas [x] completadas sin cambios
   - Mantiene todas las tareas [-] en progreso sin cambios
   - Agrega notas cuando trabajo completado es para características eliminadas

3. **Maneja Cambios de Arquitectura**
   - Agrega tareas de migración después de trabajo completado que necesita actualización
   - Crea tareas de transición para migración progresiva
   - Incluye tareas de verificación antes de eliminar implementación antigua

4. **Actualiza Tareas Pendientes**
   - Elimina tareas pendientes para características eliminadas
   - Actualiza tareas pendientes para requisitos cambiados
   - Agrega nuevas tareas para nuevas características

5. **Mantiene Estructura de Tareas**
   - Mantiene numeración secuencial
   - Preserva formato de tareas
   - Incluye referencias de requisitos
   - Mantiene orden de dependencias

### Escenarios de Ejemplo

#### Eliminación de Característica
```
"Hemos decidido eliminar el módulo de reportes de la especificación. Actualiza tasks.md en consecuencia."
```

Comportamiento esperado de la IA:
- Mantiene todas las tareas de reportes completadas con su estado [x]
- Mantiene todas las tareas de reportes en progreso con su estado [-]
- Elimina solo tareas de reportes pendientes [ ]
- Agrega nota: "_Nota: Característica de reportes eliminada de la especificación pero trabajo completado preservado_"

#### Cambio de Arquitectura con Trabajo Completado
```
"Estamos cambiando de MongoDB a PostgreSQL. Actualiza las tareas de base de datos pendientes. Nota que ya hemos implementado esquemas MongoDB y lógica de conexión."
```

Comportamiento esperado de la IA:
- Preserva todas las tareas MongoDB completadas exactamente como están escritas
- Preserva todas las tareas MongoDB en progreso exactamente como están escritas
- Agrega nuevas tareas de migración inmediatamente después del trabajo MongoDB completado:
  - Migrar esquemas MongoDB a tablas PostgreSQL
  - Reemplazar lógica de conexión MongoDB con cliente PostgreSQL
  - Actualizar consultas de base de datos de sintaxis MongoDB a PostgreSQL
  - Migrar datos MongoDB existentes a PostgreSQL
  - Actualizar configuración de ambiente para PostgreSQL
  - Eliminar dependencias MongoDB después de que migración sea verificada
- Actualiza tareas de base de datos pendientes restantes para usar PostgreSQL
- Mantiene secuencia de numeración de tareas

#### Adición de Característica
```
"Agrega login social a la especificación de autenticación. Los requisitos y diseño han sido actualizados."
```

Comportamiento esperado de la IA:
- Analiza estructura de tarea actual para punto de inserción lógico
- Agrega nuevas tareas de login social con numeración apropiada
- Referencia los requisitos específicos para login social
- Asegura que nuevas tareas mantengan orden de dependencias
- Si autenticación básica ya está implementada, agrega tareas de integración

### Manejo de Migraciones de Arquitectura

Cuando cambios de arquitectura afectan código ya implementado:

#### Migración de REST a GraphQL
```
"Estamos cambiando de REST a GraphQL. Varios endpoints REST ya están implementados."
```

Adiciones de tareas esperadas:
- Preserva tareas de endpoint REST completadas
- Agrega tareas de definición de esquema GraphQL
- Agrega tareas de implementación de resolvers
- Agrega tareas de migración para envolver lógica REST existente en resolvers GraphQL
- Agrega tareas para actualizar código cliente para usar GraphQL
- Agrega tareas de limpieza para eliminar endpoints REST después de que GraphQL sea verificado

#### División de Monolito a Microservicios
```
"Estamos dividiendo el servicio de usuario monolítico en servicios separados de autenticación y perfil."
```

Adiciones de tareas esperadas:
- Preserva tareas de servicio monolítico completadas
- Agrega tareas de separación de servicios
- Agrega tareas de comunicación inter-servicios
- Agrega tareas de migración de datos si bases de datos se están dividiendo
- Agrega tareas de configuración de despliegue para nuevos servicios
- Agrega tareas de limpieza para eliminar código monolítico después de que servicios sean verificados

### Formato de Tareas para Migraciones

Las tareas de migración deben indicar claramente su propósito:

```
"Después de actualizar tareas, veo que has agregado:
- [ ] 2.4 Migrar esquemas MongoDB a tablas PostgreSQL
  - Archivo: src/database/migrations/mongo-to-postgres.ts
  - Convertir esquemas de documentos a tablas relacionales
  - Mapear documentos embebidos a relaciones de clave foránea
  - Preservar todas las relaciones de datos existentes
  - Propósito: Transición de capa de base de datos a nueva arquitectura
  - _Aprovechar: Esquemas MongoDB completados en tareas 2.1-2.3_
  - _Requisitos: Sección de diseño 3.2_"
```

### Comunicar Cambios a la IA

Al informar a la IA sobre cambios de especificación:

#### Ser Específico sobre Cambios e Impacto
```
"Los requisitos de procesamiento de pagos han cambiado. Ahora se requiere Stripe en lugar de PayPal. Ya hemos implementado manejadores de webhook de PayPal. Por favor actualiza tasks.md para reflejar este cambio, incluyendo tareas de migración."
```

#### Proporcionar Contexto para Preservación y Migración
```
"Aunque estamos moviéndonos de MongoDB a PostgreSQL, mantén todas las tareas MongoDB completadas ya que ese trabajo ya está hecho. Agrega tareas de migración para transicionar el código MongoDB implementado a PostgreSQL."
```

#### Solicitar Validación
```
"Después de actualizar tasks.md, confirma que todos los requisitos en requirements.md tienen tareas correspondientes, existen rutas de migración para cambios de arquitectura, y que no existen tareas pendientes para características eliminadas."
```

### Estrategia de Migración Progresiva

Para cambios importantes de arquitectura, la IA debe crear tareas que soporten migración progresiva:

1. Implementar nueva arquitectura junto con existente
2. Agregar tareas de capa de compatibilidad
3. Migrar funcionalidad incrementalmente
4. Verificar cada paso de migración
5. Eliminar implementación antigua solo después de verificación completa

Esto asegura que la aplicación permanezca funcional durante toda la transición.

### Usar el Prompt de Actualización de Tareas

También puedes invocar explícitamente el prompt de actualización de tareas:

```
"Usa el prompt refresh-tasks para la especificación user-auth. Los cambios son: cambiado de JWT a OAuth2 para autenticación."
```

La IA entonces seguirá las instrucciones completas de actualización para actualizar tus tareas mientras preserva todo el trabajo completado.

## Patrones Avanzados

### Flujos de Trabajo Multi-Especificación

#### Especificaciones Relacionadas
```
"Crea una especificación para panel-de-administración que se integre con:
- especificación de gestión-de-usuarios
- especificación de analíticas
- especificación de reportes"
```

#### Dependencias de Especificación
```
"Crea una especificación para notificaciones que dependa de:
- user-auth esté completo
- message-queue esté implementado
- email-service esté disponible"
```

### Desarrollo Incremental

#### MVP Primero
```
"Crea una especificación MVP para perfiles-de-usuario con solo:
- Creación de perfil básico
- Nombre para mostrar y avatar
- Vista de perfil público
(Agregaremos características sociales más tarde)"
```

#### Especificaciones de Mejora
```
"Crea una especificación de mejora para user-auth agregando:
- Login social (Google, GitHub)
- Autenticación biométrica
- Gestión de sesión mejorada
- Vinculación de cuentas"
```

### Escenarios Complejos

#### Especificaciones de Migración
```
"Crea una especificación para migrar de MongoDB a PostgreSQL:
- Documenta esquema actual
- Diseña nueva estructura relacional
- Planea migración sin tiempo de inactividad
- Incluye procedimientos de rollback"
```

#### Especificaciones de Refactorización
```
"Crea una especificación de refactorización para:
- Dividir el monolito en servicios
- Extraer componentes compartidos
- Mejorar cobertura de pruebas a 80%
- Mantener compatibilidad hacia atrás"
```

#### Especificaciones de Rendimiento
```
"Crea una especificación de optimización de rendimiento:
- Perfilar cuellos de botella actuales
- Diseñar estrategia de caché
- Planear indexación de base de datos
- Implementar monitoreo"
```

## Combinaciones de Flujo de Trabajo

### Flujo de Característica Completo
```
1. "Crea documentos de orientación para el proyecto"
2. "Crea una especificación para autenticación de usuarios"
3. "Revisa y aprueba requisitos"
4. "Revisa y aprueba diseño"
5. "Implementa tarea 1.1 - esquema de base de datos"
6. "Implementa tarea 1.2 - servicio de autenticación"
7. "Crea pruebas para el flujo de autenticación"
8. "Marca todas las tareas como completas"
```

### Desarrollo Paralelo
```
"Mientras reviso los requisitos, comienza a bosquejar el diseño del API"
"Crea especificaciones para frontend y backend en paralelo"
"Trabaja en tareas de UI mientras el equipo de backend hace tareas de API"
```

### Refinamiento Iterativo
```
1. "Crea especificación inicial para búsqueda"
2. "Implementa búsqueda básica (tareas 1-3)"
3. "Crea especificación de mejora para búsqueda avanzada"
4. "Agrega características de filtrado y ordenamiento"
5. "Crea especificación de optimización para rendimiento de búsqueda"
```

## Prompts Conscientes del Contexto

### Usar Contexto del Proyecto
```
"Crea una especificación que siga nuestros patrones existentes"
"Implementa esta tarea consistente con nuestra base de código"
"Diseña esta característica para integrarse con nuestra arquitectura actual"
```

### Referenciar Otras Especificaciones
```
"Crea una especificación similar a user-auth pero para autenticación de admin"
"Usa los mismos patrones de diseño que en la especificación de pagos"
"Sigue la estructura de tareas de nuestra especificación de notificaciones"
```

### Construir sobre Trabajo Previo
```
"Extiende la especificación user-auth para incluir gestión de equipos"
"Agrega soporte GraphQL a la especificación de API REST existente"
"Mejora la especificación de búsqueda con características de machine learning"
```

## Consejos para Prompts Efectivos

### Ser Específico
❌ **Vago**: "Crea una especificación de login"
✅ **Específico**: "Crea una especificación para login email/contraseña con 2FA, recordarme y restablecimiento de contraseña"

### Proporcionar Contexto
❌ **Sin contexto**: "Implementa la tarea"
✅ **Con contexto**: "Implementa la tarea 1.2 usando nuestro middleware Express existente y base de datos PostgreSQL"

### Establecer Expectativas Claras
❌ **Poco claro**: "Hazlo mejor"
✅ **Claro**: "Mejora el diseño para manejar 10x el tráfico actual con tiempos de respuesta bajo 200ms"

### Usar Solicitudes Incrementales
❌ **Demasiado**: "Crea 5 especificaciones e implementa todo"
✅ **Incremental**: "Crea primero la especificación user-auth, luego revisaremos antes de pasar a la siguiente"

### Referenciar Trabajo Existente
❌ **Comenzar de cero**: "Crea un nuevo sistema de pagos"
✅ **Construir sobre**: "Mejora nuestra especificación de pagos para agregar facturación de suscripciones"

## Biblioteca de Patrones Comunes

### Operaciones CRUD
```
"Crea una especificación para operaciones CRUD en productos incluyendo:
- Crear con validación
- Leer con paginación y filtrado
- Actualizar con bloqueo optimista
- Eliminación suave con opción de recuperación"
```

### Autenticación y Autorización
```
"Crea una especificación de autenticación con:
- Autenticación basada en JWT
- Control de acceso basado en roles
- Gestión de claves API
- Manejo de sesiones
- Rotación de tokens de actualización"
```

### Características en Tiempo Real
```
"Crea una especificación para chat en tiempo real:
- Conexiones WebSocket
- Persistencia de mensajes
- Indicadores de escritura
- Recibos de lectura
- Cola de mensajes sin conexión"
```

### Gestión de Archivos
```
"Crea una especificación de carga de archivos:
- Cargas fragmentadas para archivos grandes
- Seguimiento de progreso
- Capacidad de reanudar
- Escaneo de virus
- Integración con CDN"
```

### Analíticas y Reportes
```
"Crea una especificación de analíticas:
- Seguimiento de eventos
- Dimensiones personalizadas
- Paneles en tiempo real
- Reportes programados
- Opciones de exportación de datos"
```

## Prompts de Solución de Problemas

### Cuando las Cosas Van Mal
```
"¿Por qué esta especificación no aparece?"
"Depura por qué la tarea no se está completando"
"¿Qué está bloqueando la aprobación?"
"Ayúdame a entender este error"
```

### Desatascarse
```
"¿Qué debería hacer después?"
"Muéstrame qué está bloqueando el progreso"
"¿Qué tareas puedo trabajar mientras espero?"
"¿Cómo resuelvo esta dependencia?"
```

## Documentación Relacionada

- [Guía del Usuario](USER-GUIDE.es.md) - Instrucciones generales de uso
- [Proceso de Flujo de Trabajo](WORKFLOW.es.md) - Entendiendo el flujo de trabajo
- [Referencia de Herramientas](TOOLS-REFERENCE.es.md) - Documentación completa de herramientas
- [Solución de Problemas](TROUBLESHOOTING.es.md) - Resolver problemas comunes
