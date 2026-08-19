/**
 * Session store — in-memory per-session event queue for SSE.
 * Each session holds a queue of SSE events and a list of connected response objects.
 * TTL: 10 minutes.
 */

const sessions = new Map();
const SESSION_TTL_MS = 10 * 60 * 1000;

export function createSession(sessionId) {
  const session = {
    id: sessionId,
    events: [],
    listeners: [],
    createdAt: Date.now(),
    complete: false,
  };
  sessions.set(sessionId, session);

  // Auto-cleanup
  setTimeout(() => sessions.delete(sessionId), SESSION_TTL_MS);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

/**
 * Push an event to the session — immediately dispatches to all connected listeners.
 */
export function pushEvent(sessionId, event) {
  const session = sessions.get(sessionId);
  if (!session) return;

  session.events.push(event);

  // Dispatch to all active SSE listeners
  for (const res of session.listeners) {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (_) {
      // listener disconnected — will be pruned on next attach
    }
  }
}

/**
 * Attach a response object as an SSE listener. Replays missed events first.
 */
export function attachListener(sessionId, res) {
  const session = sessions.get(sessionId);
  if (!session) return false;

  // Replay events the client missed
  for (const event of session.events) {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch (_) {
      return false;
    }
  }

  session.listeners.push(res);
  return true;
}

export function detachListener(sessionId, res) {
  const session = sessions.get(sessionId);
  if (!session) return;
  session.listeners = session.listeners.filter(l => l !== res);
}
