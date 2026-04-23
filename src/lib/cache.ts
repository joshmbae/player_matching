interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const TTL_MS = 1000 * 60 * 60; // 1 hour

class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > TTL_MS) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.store.clear();
  }
}

export const cache = new InMemoryCache();
