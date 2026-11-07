import Keycloak from 'keycloak-js';

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'sirepp',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sirepp-web',
});

export function startSession() {
  return keycloak.init({
    onLoad: 'login-required',
    pkceMethod: 'S256',
  });
}

export function endSession() {
  return keycloak.logout({ redirectUri: window.location.origin + '/' });
}
