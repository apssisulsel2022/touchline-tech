import type { Role } from "./rbac";

/**
 * Session store for the frontend foundation.
 *
 * No backend is connected yet, so the session is persisted locally behind a
 * narrow interface. When Lovable Cloud auth is enabled, replace the bodies of
 * `signIn` / `signOut` / `readSession` with Supabase calls — every consumer
 * (providers, guards, navigation) reads through this module only.
 */

export const SESSION_STORAGE_KEY = "touchline.session";

export interface Session {
  userId: string;
  email: string;
  displayName: string;
  role: Role;
  organizationName: string;
}

type Listener = (session: Session | null) => void;

const listeners = new Set<Listener>();

function isBrowser() {
  return typeof window !== "undefined";
}

export function readSession(): Session | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function write(session: Session | null) {
  if (!isBrowser()) return;
  if (session) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  }
  listeners.forEach((listener) => listener(session));
}

export function onSessionChange(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function signIn(input: { email: string; role: Role }): Session {
  const name = input.email.split("@")[0]?.replace(/[._-]+/g, " ") ?? "User";
  const session: Session = {
    userId: `local-${input.role}`,
    email: input.email,
    displayName: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    role: input.role,
    organizationName: "Touchline Demo Organisation",
  };
  write(session);
  return session;
}

export function signOut() {
  write(null);
}
