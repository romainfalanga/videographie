import { CLIENT_ID, SCOPES } from '../config.js';

let accessToken = null;
let tokenClient = null;
let onAuthChangeCallback = null;
let silentLoginAttempted = false;

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
    const maxWait = 10000;
    const start = Date.now();

    const check = () => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        try {
          tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (response) => {
              if (response.error) {
                console.warn('OAuth token error:', response.error);
                if (!silentLoginAttempted) {
                  accessToken = null;
                  notifyAuthChange(false);
                }
                silentLoginAttempted = false;
                return;
              }
              if (response.access_token) {
                accessToken = response.access_token;
                silentLoginAttempted = false;
                notifyAuthChange(true);
              }
            },
            error_callback: (error) => {
              console.warn('OAuth error:', error);
              // Silent login failures should not trigger auth change
              if (silentLoginAttempted) {
                silentLoginAttempted = false;
                return;
              }
              accessToken = null;
              notifyAuthChange(false);
            },
          });
          resolve();
        } catch (err) {
          console.error('Failed to init OAuth client:', err);
          resolve();
        }
      } else if (Date.now() - start > maxWait) {
        console.error('Google Identity Services failed to load');
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
  silentLoginAttempted = false;
  tokenClient.requestAccessToken({ prompt: '' });
}

export function loginWithConsent() {
  if (!tokenClient) return;
  silentLoginAttempted = false;
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

export function trySilentLogin() {
  if (!tokenClient) return;
  silentLoginAttempted = true;
  try {
    tokenClient.requestAccessToken({ prompt: 'none' });
  } catch (err) {
    console.warn('Silent login failed:', err);
    silentLoginAttempted = false;
  }
}

export function logout() {
  if (accessToken) {
    try {
      google.accounts.oauth2.revoke(accessToken, () => {
        accessToken = null;
        notifyAuthChange(false);
      });
    } catch (err) {
      accessToken = null;
      notifyAuthChange(false);
    }
  } else {
    accessToken = null;
    notifyAuthChange(false);
  }
}
