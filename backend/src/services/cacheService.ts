import NodeCache from 'node-cache';

class CacheService {
  private cache: NodeCache;

  constructor(ttlSeconds = 300) {
    this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2, useClones: false });
  }

  get<T>(key: string): T | undefined {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl?: number): boolean {
    if (ttl !== undefined) {
      return this.cache.set(key, value, ttl);
    }
    return this.cache.set(key, value);
  }

  del(key: string | string[]): number {
    return this.cache.del(key);
  }

  /**
   * Delete all cache keys starting with a specific prefix.
   * Enables targeted cache invalidation without flushing the entire cache.
   */
  delByPrefix(prefix: string): number {
    const keys = this.cache.keys();
    const matching = keys.filter((k) => k.startsWith(prefix));
    if (matching.length > 0) {
      return this.cache.del(matching);
    }
    return 0;
  }

  flush(): void {
    this.cache.flushAll();
  }
}

export const cacheService = new CacheService();
