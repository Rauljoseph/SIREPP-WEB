# Fixes para los 22 errores de compilación del backend

Ejecutar estos cambios en el proyecto `sirepp-api`:

## 1. tsconfig.json — Agregar `strictPropertyInitialization: false`

En `compilerOptions`:

```json
"strictPropertyInitialization": false
```

Esto resuelve los 15 errores TS2564 en los DTOs (class-validator maneja la inicialización).

## 2. src/infrastructure/audit/audit-logger.prisma-adapter.ts (línea 17)

```typescript
// ANTES:
detalle: log.detalle ?? undefined,

// DESPUÉS:
detalle: (log.detalle ?? undefined) as any,
```

## 3. src/infrastructure/persistence/evento-dominio.prisma-repository.ts (línea 18)

```typescript
// ANTES:
payload: evento.payload,

// DESPUÉS:
payload: evento.payload as any,
```

## 4. src/interfaces/http/interfaces.module.ts — Crear el módulo faltante

Crear archivo `src/interfaces/http/consulta/consulta.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConsultaController } from './consulta.controller';

@Module({
  controllers: [ConsultaController],
})
export class ConsultaModule {}
```

## 5. src/shared/interceptors/audit.interceptor.ts

```typescript
// ANTES (línea 38):
response?.id ?? request.params?.id ?? null;

// DESPUÉS:
(response as any)?.id ?? request.params?.id ?? null;

// ANTES (línea 48):
userAgent,

// DESPUÉS:
userAgent: userAgent ?? undefined,
```

---

Total: 5 cambios resuelven los 22 errores.
