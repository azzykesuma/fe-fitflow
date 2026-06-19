const AUTH_TOKEN_KEY = "fitflow_access_token";
const REFRESH_TOKEN_KEY = "fitflow_refresh_token";

function canUseStorage() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
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
  setCookie("access_token", token);
  setCookie("fitflow_session", "true");
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
  deleteCookie("access_token");
  deleteCookie("fitflow_session");
}

export function clearAuthTokens() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  deleteCookie("access_token");
  deleteCookie("fitflow_session");
}

