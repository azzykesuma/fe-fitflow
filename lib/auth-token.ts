const AUTH_TOKEN_KEY = "fitflow_access_token";
const REFRESH_TOKEN_KEY = "fitflow_refresh_token";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getAuthToken() {
  if (!canUseStorage()) {
    return undefined;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) ?? undefined;
}

export function setAuthToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getRefreshToken() {
  if (!canUseStorage()) {
    return undefined;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY) ?? undefined;
}

export function setRefreshToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setAuthTokens(tokens: { access_token?: string; refresh_token?: string }) {
  if (tokens.access_token) {
    setAuthToken(tokens.access_token);
  }

  if (tokens.refresh_token) {
    setRefreshToken(tokens.refresh_token);
  }
}

export function clearAuthToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthTokens() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
