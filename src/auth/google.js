import { CLIENT_ID, SCOPES } from '../config.js';

let accessToken = null;
let tokenClient = null;
let onAuthChangeCallback = null;

export function getToken() {
  return accessToken;
}

export function isAuthenticated() {
  return accessToken !== null;
}

export function onAuthChange(callback) {
  onAuthChangeCallback = callback;
}

function notifyAuthChange(authenticated) {
  if (onAuthChangeCallback) {
    onAuthChangeCallback(authenticated);
  }
}

export function initAuth() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.google && window.google.accounts) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.access_token) {
              accessToken = response.access_token;
              notifyAuthChange(true);
            }
          },
          error_callback: (error) => {
            console.error('Auth error:', error);
            accessToken = null;
            notifyAuthChange(false);
          },
        });
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

export function login() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: '' });
}

export function loginWithConsent() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

export function trySilentLogin() {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: 'none' });
}

export function logout() {
  if (accessToken) {
    google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
      notifyAuthChange(false);
    });
  }
}
