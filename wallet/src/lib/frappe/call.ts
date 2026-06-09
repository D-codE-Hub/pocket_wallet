// Minimal Frappe RPC client. POSTs to /api/method/<method> with the CSRF + site
// headers Frappe expects, and unwraps the standard response / error envelope.
import router from "@/router";

declare global {
  interface Window {
    csrf_token?: string;
  }
}

export interface FrappeCallError extends Error {
  exc_type?: string;
  status?: number;
  messages: string[];
}

export default async function call<T = any>(
  method: string,
  args: Record<string, any> = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "X-Frappe-Site-Name": window.location.hostname,
  };
  // The token is injected server-side into wallet.html; in `vite dev` it stays
  // an unrendered "{{ ... }}" template, which we skip.
  if (window.csrf_token && !window.csrf_token.includes("{{")) {
    headers["X-Frappe-CSRF-Token"] = window.csrf_token;
  }

  const res = await fetch(`/api/method/${method}`, {
    method: "POST",
    headers,
    body: JSON.stringify(args),
  });

  if (res.ok) {
    const data = await res.json();
    // `login` returns the full payload; everything else uses `message`.
    if (method === "login") return data as T;
    return data.message as T;
  }

  // --- error path -----------------------------------------------------------
  let parsed: any = {};
  try {
    parsed = JSON.parse(await res.text());
  } catch {
    /* non-JSON body */
  }

  const error = new Error(
    [method, parsed.exc_type, parsed._error_message].filter(Boolean).join(" "),
  ) as FrappeCallError;
  error.exc_type = parsed.exc_type;
  error.status = res.status;

  let messages: string[] = parsed._server_messages ? JSON.parse(parsed._server_messages) : [];
  messages = messages
    .map((m) => {
      try {
        return JSON.parse(m).message;
      } catch {
        return m;
      }
    })
    .filter(Boolean);
  error.messages = messages.length ? messages : [parsed._error_message || "Something went wrong"];

  // Session expired / not permitted → bounce to login (unless already there).
  if ([401, 403].includes(res.status) && router.currentRoute.value.name !== "Login") {
    router.push({ name: "Login" });
  }
  throw error;
}
