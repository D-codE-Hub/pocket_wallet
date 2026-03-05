/**
 * Frappe API call helper.
 * Sends POST requests to /api/method/{method} with JSON body.
 * Handles CSRF, error parsing, and auth redirects.
 */

declare global {
  interface Window {
    csrf_token?: string;
  }
}

export default async function call(method: string, args: Record<string, unknown> = {}): Promise<any> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Frappe-Site-Name': window.location.hostname,
  };

  if (window.csrf_token && window.csrf_token !== '{{ csrf_token }}') {
    headers['X-Frappe-CSRF-Token'] = window.csrf_token;
  }

  const res = await fetch(`/api/method/${method}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
  });

  if (res.ok) {
    const data = await res.json();
    // login and doc-returning endpoints return the full payload
    if (data.docs || method === 'login') {
      return data;
    }
    return data.message;
  }

  // --- Error handling ---
  let response: string;
  try {
    response = await res.text();
  } catch {
    response = '';
  }

  let error: any = {};
  try {
    error = JSON.parse(response);
  } catch {
    // not JSON — leave error empty
  }

  const errorParts: string[] = [
    [method, error.exc_type, error._error_message].filter(Boolean).join(' '),
  ];

  let exception: string | undefined;
  if (error.exc) {
    exception = error.exc;
    try {
      exception = JSON.parse(exception as string)[0];
    } catch {
      // keep as-is
    }
    errorParts.push(exception as string);
  }

  const e: any = new Error(errorParts.join('\n'));
  e.exc_type = error.exc_type;
  e.exc = exception;

  // Parse server messages
  e.messages = error._server_messages
    ? JSON.parse(error._server_messages)
    : [];
  e.messages = e.messages.concat(error.message);
  e.messages = e.messages
    .map((m: string) => {
      try {
        return JSON.parse(m).message;
      } catch {
        return m;
      }
    })
    .filter(Boolean);

  if (!e.messages.length) {
    e.messages = error._error_message
      ? [error._error_message]
      : ['Internal Server Error'];
  }

  // Redirect to login on auth failure
  if ([401, 403].includes(res.status) && !window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }

  throw e;
}
