# Guía de Desarrollo

Esta guía cubre la configuración de un entorno de desarrollo, construcción del proyecto, contribución de código y comprensión de la arquitectura de Spec Workflow MCP.

## Requisitos Previos

### Software Requerido

- **Node.js** 18.0 o superior
- **npm** 9.0 o superior
- **Git** para control de versiones
- **TypeScript** conocimiento útil

### Herramientas Recomendadas

- **VSCode** con extensiones de TypeScript
- **Chrome/Edge DevTools** para depuración del panel
- **Postman/Insomnia** para pruebas de API

## Configuración del Entorno de Desarrollo

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Pimzino/spec-workflow-mcp.git
cd spec-workflow-mcp
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instala:
- MCP SDK
- TypeScript y herramientas de construcción
- Express para servidor del panel
- Librerías WebSocket
- Frameworks de pruebas

### 3. Construir el Proyecto

```bash
npm run build
```

Esto compila archivos TypeScript a JavaScript en el directorio `dist/`.

## Comandos de Desarrollo

### Comandos Principales

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Iniciar en modo desarrollo con auto-recarga |
| `npm run build` | Construir paquete de producción |
| `npm start` | Ejecutar servidor de producción |
| `npm test` | Ejecutar suite de pruebas |
| `npm run clean` | Eliminar artefactos de construcción |
| `npm run lint` | Ejecutar linter de código |
| `npm run format` | Formatear código con Prettier |

### Modo de Desarrollo

```bash
npm run dev
```

Características:
- Auto-recompilación en cambios de archivo
- Recarga en caliente para panel
- Mensajes de error detallados
- Source maps para depuración

### Construcción para Producción

```bash
npm run clean && npm run build
```

Optimizaciones:
- JavaScript minificado
- Tamaño de paquete optimizado
- Manejo de errores de producción
- Mejoras de rendimiento

## Estructura del Proyecto

```
spec-workflow-mcp/
├── src/                    # Código fuente
│   ├── index.ts           # Punto de entrada del servidor MCP
│   ├── server.ts          # Servidor del panel
│   ├── tools/             # Implementaciones de herramientas MCP
│   ├── prompts/           # Plantillas de prompts
│   ├── utils/             # Funciones de utilidad
│   └── types/             # Definiciones de tipos TypeScript
├── dist/                   # JavaScript compilado
├── dashboard/             # Archivos del panel web
│   ├── index.html         # UI del panel
│   ├── styles.css         # Estilos del panel
│   └── script.js          # JavaScript del panel
├── vscode-extension/      # Extensión VSCode
│   ├── src/               # Código fuente de extensión
│   └── package.json       # Manifiesto de extensión
├── tests/                 # Archivos de prueba
├── docs/                  # Documentación
└── package.json           # Configuración del proyecto
```

## Descripción General de la Arquitectura

### Arquitectura del Servidor MCP

```
Cliente (IA) ↔ Protocolo MCP ↔ Servidor ↔ Sistema de Archivos
                              ↓
                          Panel de Control
```

### Componentes Clave

#### 1. Servidor MCP (`src/index.ts`)
- Maneja comunicación del protocolo MCP
- Procesa solicitudes de herramientas
- Gestiona estado del proyecto
- Operaciones del sistema de archivos

#### 2. Servidor del Panel (`src/server.ts`)
- Sirve panel web
- Conexiones WebSocket
- Actualizaciones en tiempo real
- Endpoints HTTP API

#### 3. Herramientas (`src/tools/`)
Cada herramienta es un módulo separado:
- Validación de entrada
- Lógica de negocio
- Operaciones de archivos
- Formateo de respuesta

#### 4. Prompts (`src/prompts/`)
Cadenas de plantilla para:
- Generación de documentos
- Guía de flujo de trabajo
- Mensajes de error
- Instrucciones de usuario

## Implementación de Nuevas Características

### Agregar una Nueva Herramienta

1. **Crear archivo de herramienta** en `src/tools/`:

```typescript
// src/tools/my-new-tool.ts
import { Tool } from '@anthropic/mcp-sdk';

export const myNewTool: Tool = {
  name: 'my-new-tool',
  description: 'Descripción de lo que hace la herramienta',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Descripción del parámetro' },
      param2: { type: 'number', optional: true }
    },
    required: ['param1']
  },
  handler: async (params) => {
    // Implementación de la herramienta
    const { param1, param2 = 0 } = params;

    // Lógica de negocio aquí

    return {
      success: true,
      data: 'Respuesta de la herramienta'
    };
  }
};
```

2. **Registrar en index** (`src/tools/index.ts`):

```typescript
export { myNewTool } from './my-new-tool';
```

3. **Agregar al servidor** (`src/index.ts`):

```typescript
import { myNewTool } from './tools';

server.registerTool(myNewTool);
```

### Agregar Características al Panel

1. **Actualizar HTML** (`dashboard/index.html`):

```html
<div class="new-feature">
  <h3>Nueva Característica</h3>
  <button id="new-action">Acción</button>
</div>
```

2. **Agregar JavaScript** (`dashboard/script.js`):

```javascript
document.getElementById('new-action').addEventListener('click', () => {
  // Lógica de la característica
  ws.send(JSON.stringify({
    type: 'new-action',
    data: { /* ... */ }
  }));
});
```

3. **Manejar en servidor** (`src/server.ts`):

```typescript
ws.on('message', (message) => {
  const { type, data } = JSON.parse(message);
  if (type === 'new-action') {
    // Manejar nueva acción
  }
});
```

## Pruebas

### Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar archivo de prueba específico
npm test -- src/tools/my-tool.test.ts

# Ejecutar con cobertura
npm run test:coverage

# Modo vigilancia
npm run test:watch
```

### Escribir Pruebas

Crear archivos de prueba junto a archivos fuente:

```typescript
// src/tools/my-tool.test.ts
import { describe, it, expect } from 'vitest';
import { myTool } from './my-tool';

describe('myTool', () => {
  it('debería procesar la entrada correctamente', async () => {
    const result = await myTool.handler({
      param1: 'test'
    });

    expect(result.success).toBe(true);
    expect(result.data).toContain('expected');
  });

  it('debería manejar errores', async () => {
    const result = await myTool.handler({
      param1: null
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

### Pruebas de Integración

Probar flujos de trabajo completos:

```typescript
// tests/integration/workflow.test.ts
describe('Flujo de Trabajo Completo', () => {
  it('debería crear especificación de principio a fin', async () => {
    // Crear requisitos
    // Aprobar requisitos
    // Crear diseño
    // Aprobar diseño
    // Crear tareas
    // Verificar estructura
  });
});
```

## Depuración

### Depurar Servidor MCP

1. **Agregar salida de depuración**:

```typescript
console.error('[DEBUG]', 'Herramienta llamada:', toolName, params);
```

2. **Usar depurador de VSCode**:

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Depurar Servidor MCP",
  "program": "${workspaceFolder}/dist/index.js",
  "args": ["/ruta/a/proyecto/prueba"],
  "console": "integratedTerminal"
}
```

### Depurar Panel

1. **DevTools del Navegador**:
   - Abrir panel en navegador
   - Presionar F12 para DevTools
   - Verificar Consola para errores
   - Monitorear pestaña Network para WebSocket

2. **Agregar logging**:

```javascript
console.log('Mensaje WebSocket:', message);
console.log('Actualización de estado:', newState);
```

## Estilo de Código y Estándares

### Guías de TypeScript

- Usar modo estricto
- Definir interfaces para estructuras de datos
- Evitar tipo `any`
- Usar async/await sobre callbacks

### Organización de Archivos

- Un componente por archivo
- Agrupar funcionalidad relacionada
- Convenciones de nomenclatura claras
- Comentarios completos

### Convenciones de Nomenclatura

- **Archivos**: kebab-case (`my-tool.ts`)
- **Clases**: PascalCase (`SpecManager`)
- **Funciones**: camelCase (`createSpec`)
- **Constantes**: UPPER_SNAKE (`MAX_RETRIES`)

## Contribución

### Proceso de Contribución

1. **Fork del repositorio**
2. **Crear rama de característica**:
   ```bash
   git checkout -b feature/mi-caracteristica
   ```
3. **Hacer cambios**
4. **Escribir pruebas**
5. **Ejecutar pruebas y lint**:
   ```bash
   npm test
   npm run lint
   ```
6. **Confirmar cambios**:
   ```bash
   git commit -m "feat: agregar nueva característica"
   ```
7. **Push de rama**:
   ```bash
   git push origin feature/mi-caracteristica
   ```
8. **Crear Pull Request**

### Formato de Mensaje de Commit

Seguir commits convencionales:

- `feat:` Nueva característica
- `fix:` Corrección de error
- `docs:` Documentación
- `style:` Formateo
- `refactor:` Reestructuración de código
- `test:` Pruebas
- `chore:` Mantenimiento

Ejemplos:
```
feat: agregar flujo de trabajo de revisión de aprobación
fix: resolver problema de reconexión WebSocket del panel
docs: actualizar guía de configuración
```

### Guías de Pull Request

- Descripción clara
- Referenciar issues relacionados
- Incluir capturas de pantalla para cambios de UI
- Asegurar que todas las pruebas pasen
- Actualizar documentación

## Publicación

### Paquete NPM

1. **Actualizar versión**:
   ```bash
   npm version patch|minor|major
   ```

2. **Construir paquete**:
   ```bash
   npm run build
   ```

3. **Publicar**:
   ```bash
   npm publish
   ```

### Extensión VSCode

1. **Actualizar versión de extensión** en `vscode-extension/package.json`

2. **Construir extensión**:
   ```bash
   cd vscode-extension
   npm run package
   ```

3. **Publicar en marketplace**:
   ```bash
   vsce publish
   ```

## Optimización de Rendimiento

### Rendimiento del Servidor

- Usar caché para lecturas de archivos
- Implementar debouncing para observadores de archivos
- Optimizar agrupación de mensajes WebSocket
- Carga diferida de documentos grandes

### Rendimiento del Panel

- Minimizar actualizaciones DOM
- Usar desplazamiento virtual para listas largas
- Implementar renderizado progresivo
- Optimizar reconexión WebSocket

## Consideraciones de Seguridad

### Validación de Entrada

Siempre validar entradas de herramientas:

```typescript
if (!params.specName || typeof params.specName !== 'string') {
  throw new Error('Nombre de especificación inválido');
}

// Sanitizar rutas de archivos
const safePath = path.normalize(params.path);
if (safePath.includes('..')) {
  throw new Error('Ruta inválida');
}
```

### Seguridad del Sistema de Archivos

- Restringir operaciones al directorio del proyecto
- Validar todas las rutas de archivos
- Usar operaciones de archivos seguras
- Implementar verificaciones de permisos

## Solución de Problemas de Desarrollo

### Errores Comunes de Construcción

| Error | Solución |
|-------|----------|
| Errores de TypeScript | Ejecutar `npm run build` para ver errores detallados |
| Módulo no encontrado | Verificar imports y ejecutar `npm install` |
| Puerto ya en uso | Cambiar puerto o terminar proceso existente |
| Conexión WebSocket fallida | Verificar que el servidor esté ejecutándose y el puerto sea correcto |

### Consejos de Desarrollo

1. **Usar modo estricto de TypeScript** para mejor seguridad de tipos
2. **Habilitar source maps** para depuración más fácil
3. **Usar nodemon** para auto-reinicio durante desarrollo
4. **Probar operaciones de archivos** en directorio aislado
5. **Monitorear rendimiento** con Chrome DevTools

## Recursos

- [Documentación MCP SDK](https://github.com/anthropics/mcp-sdk)
- [Manual de TypeScript](https://www.typescriptlang.org/docs/)
- [Mejores Prácticas Node.js](https://github.com/goldbergyoni/nodebestpractices)
- [API de Extensión VSCode](https://code.visualstudio.com/api)

## Documentación Relacionada

- [Guía de Configuración](CONFIGURATION.es.md) - Configuración del servidor
- [Guía del Usuario](USER-GUIDE.es.md) - Usando el servidor
- [Referencia de Herramientas](TOOLS-REFERENCE.es.md) - Documentación de herramientas
- [Solución de Problemas](TROUBLESHOOTING.es.md) - Problemas comunes
