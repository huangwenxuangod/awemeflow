import type { DouyinCache } from './types';

export function createKvCache(
  namespace?: KVNamespace
): DouyinCache | undefined {
  if (!namespace) {
    return undefined;
  }

  return {
    async get<T>(key: string) {
      return namespace.get<T>(key, 'json');
    },
    async put<T>(key: string, value: T, ttlSeconds: number) {
      await namespace.put(key, JSON.stringify(value), {
        expirationTtl: ttlSeconds,
      });
    },
    async delete(key: string) {
      await namespace.delete(key);
    },
  };
}
