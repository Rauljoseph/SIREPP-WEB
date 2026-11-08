# React + TypeScript + Vite

## Ejecutar SIREPP Web

Con la API y Keycloak en ejecución, instala las dependencias y arranca el frontend:

```powershell
npm ci
npm run dev
```

Abre `http://localhost:5173`. Si usas otro puerto, autoriza ese origen y sus URLs de redirección en el cliente de Keycloak.

### Variables de entorno

Define las variables en `.env.local` para desarrollo o en el proyecto de Vercel antes de compilar el frontend.

| Variable | Ejemplo local | Qué configurar en Vercel |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000` | URL HTTPS de la API, sin el sufijo `/api` |
| `VITE_KEYCLOAK_URL` | `http://localhost:8080` | URL HTTPS de Keycloak, sin el sufijo `/realms/...` |
| `VITE_KEYCLOAK_REALM` | `sirepp` | Nombre del realm configurado |
| `VITE_KEYCLOAK_CLIENT_ID` | `sirepp-web` | Client ID público del frontend |

Estas variables son públicas para el navegador. Para configurar el realm, el segundo factor, el perfil y la recuperación por correo, consulta `keycloak/README.md` en el repositorio `SIREPP-API`.


This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
