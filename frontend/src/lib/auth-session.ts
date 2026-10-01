"use client";

import { createContext, useContext, useSyncExternalStore } from "react";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useFitReferenceStore } from "@/stores/fitReferenceStore";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import { getQueryClient } from "@/lib/queryClient";
import { resetSessionCache } from "@/lib/reset-session-cache";
import { AUTH_STORAGE_KEYS, getAccessToken, tokenExpired } from "@/lib/auth-storage";
export { AUTH_STORAGE_KEYS, getAccessToken } from "@/lib/auth-storage";

export const AUTH_CHANGED_EVENT = "project-s-auth-changed";
const OWNER_KEY = "project-s-state-owner";
let initialized = false;
let currentIdentity: string | null = null;
export const AuthReadyContext = createContext(false);

function resetUserState() {
  useAnalysisHistoryStore.setState({ lastResult: null, history: [] });
  useUserProfileStore.setState({ profile: { ...useUserProfileStore.getInitialState().profile } });
  useFitReferenceStore.setState({ myFit: useFitReferenceStore.getInitialState().myFit });
  useFlowBootstrapStore.setState({ introAcknowledged: false });
  resetSessionCache(getQueryClient());
}

export function readSessionIdentity(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  return token && !tokenExpired(token) ? localStorage.getItem(AUTH_STORAGE_KEYS.email) : null;
}

export function endSession() {
  if (typeof window === "undefined") return;
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(OWNER_KEY);
  currentIdentity = null;
  initialized = true;
  resetUserState();
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function startSession(data: { accessToken: string; tokenType: string; email: string; nickname: string }) {
  if (currentIdentity !== data.email || localStorage.getItem(OWNER_KEY) !== data.email) resetUserState();
  for (const field of Object.keys(AUTH_STORAGE_KEYS) as Array<keyof typeof AUTH_STORAGE_KEYS>) {
    localStorage.setItem(AUTH_STORAGE_KEYS[field], data[field]);
  }
  localStorage.setItem(OWNER_KEY, data.email);
  currentIdentity = data.email;
  initialized = true;
  useFlowBootstrapStore.getState().acknowledgeIntro();
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function synchronizeSession() {
  const identity = readSessionIdentity();
  if (!identity) {
    if (!initialized || currentIdentity || localStorage.getItem(OWNER_KEY) || localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)) endSession();
    initialized = true;
    return;
  }
  // The owner marker is shared across tabs; each tab must also track its own
  // last identity so an account switch elsewhere clears this tab's memory.
  if ((initialized && currentIdentity !== identity) || localStorage.getItem(OWNER_KEY) !== identity) {
    resetUserState();
    localStorage.setItem(OWNER_KEY, identity);
    useFlowBootstrapStore.getState().acknowledgeIntro();
  }
  currentIdentity = identity;
  initialized = true;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(AUTH_CHANGED_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(AUTH_CHANGED_EVENT, listener);
  };
}

export function useSessionIdentity() {
  const ready = useContext(AuthReadyContext);
  const identity = useSyncExternalStore(subscribe, readSessionIdentity, () => null);
  return ready ? identity : null;
}

export function safeReturnTo(path: string | null): string {
  return path && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "/products";
}
