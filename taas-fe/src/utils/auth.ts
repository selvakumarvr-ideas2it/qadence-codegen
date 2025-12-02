/**
 * Retrieves the authentication token from storage
 * @returns {string | null} The authentication token if present, null otherwise
 */
const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Checks if the user is currently logged in by verifying token existence
 * @returns {boolean} True if user is logged in (token exists), false otherwise
 */
const isLoggedIn = (): boolean => {
  return !!getToken();
};

/**
 * Clears all data from localStorage, including the authentication token
 * @returns {void}
 */
const logout = (): void => {
  localStorage.clear();
};

/**
 * Stores access and refresh tokens
 * @param accessToken string
 * @param refreshToken string
 */
const saveTokensToLocalStorage = (
  accessToken: string,
  refreshToken: string
): void => {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const decodeJwt = (token: string): Record<string, unknown> | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const claims = JSON.parse(json);

    // store tenant id if present
    const candidate =
      (claims?.tenantId as string) || (claims?.tid as string) || null;
    if (candidate) {
      localStorage.setItem('tenant_id', candidate);
    }

    const roles = Array.isArray(claims?.roles)
      ? ((claims.roles as unknown[]).filter(
          (r) => typeof r === 'string'
        ) as string[])
      : [];

    if (roles.length > 0) {
      // stores ALL roles
      localStorage.setItem('roles', JSON.stringify(roles));
    }

    return claims;
  } catch {
    return null;
  }
};

export { decodeJwt, getToken, isLoggedIn, logout, saveTokensToLocalStorage };
