export const AUTH_STORAGE_KEYS = {
  accessToken: "project-s-access-token", tokenType: "project-s-token-type",
  email: "project-s-member-email", nickname: "project-s-member-nickname",
} as const;

export function tokenExpired(token: string): boolean {
  if (token === "demo-access-token") return process.env.NEXT_PUBLIC_DEMO_MODE !== "true";
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch { return true; }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  return token && !tokenExpired(token) ? token : null;
}
