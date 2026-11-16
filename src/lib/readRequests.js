// Memory only: scoped by signed-in company/session, with no persisted customer data.
export function createReadRequests({freshMs = 0, maxEntries = 30, now = Date.now} = {}) {
  const entries = new Map();
  let scope = null;
  function clear() { entries.clear(); }
  function canceled() { return Object.assign(new Error('Request canceled'), {name: 'AbortError', code: 'ERR_CANCELED'}); }
  function load(session, key, fetcher, {signal, force = false} = {}) {
    if (session !== scope) { clear(); scope = session; }
    if (signal?.aborted) return Promise.reject(canceled());
    let entry = entries.get(key);
    if (entry?.settled && (force || now() - entry.time >= freshMs)) entry = null;
    if (entry?.settled) return Promise.resolve(entry.value);
    if (!entry) {
      const controller = new AbortController();
      entry = {controller, subscribers: new Set()};
      const current = entry;
      entry.promise = Promise.resolve().then(() => {
        if (!current.subscribers.size || controller.signal.aborted) throw canceled();
        return fetcher(controller.signal);
      }).then(value => {
        current.value = value;
        current.time = now();
        current.settled = true;
        if (freshMs <= 0 && entries.get(key) === current) entries.delete(key);
        return value;
      }, error => {
        current.settled = true;
        if (entries.get(key) === current) entries.delete(key);
        throw error;
      });
      if (entries.size >= maxEntries) {
        const oldest = [...entries].find(([, candidate]) => candidate.settled);
        if (oldest) entries.delete(oldest[0]);
      }
      entries.set(key, entry);
    }
    return new Promise((resolve, reject) => {
      const current = entry;
      const subscriber = {};
      current.subscribers.add(subscriber);
      function cleanup() {
        signal?.removeEventListener('abort', abort);
        current.subscribers.delete(subscriber);
      }
      function abort() {
        cleanup();
        reject(canceled());
        // Effect cleanup/setup can happen in the same turn (StrictMode). Give
        // the next subscriber a chance to join before canceling the transport.
        queueMicrotask(() => {
          if (!current.settled && !current.subscribers.size) {
            if (entries.get(key) === current) entries.delete(key);
            current.controller.abort();
          }
        });
      }
      signal?.addEventListener('abort', abort, {once: true});
      current.promise.then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
    });
  }
  return {load, clear};
}
