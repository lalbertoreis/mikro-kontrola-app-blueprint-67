
import { CachedItem } from './types';

// Cache storage for different data types
export const CACHE = {
  shifts: new Map<string, CachedItem<any>>(),
  services: new Map<string, CachedItem<any>>(),
  appointments: new Map<string, CachedItem<any[]>>(),
  timeIntervals: new Map<string, CachedItem<number>>(),
  timeSlots: new Map<string, CachedItem<string[]>>(),
  holidays: new Map<string, CachedItem<any[]>>()
};

/**
 * Generic cache function to get or set data
 */
export function getFromCache<T>(
  cacheMap: Map<string, CachedItem<T>>, 
  key: string, 
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = cacheMap.get(key);
  
  if (cached && (Date.now() - cached.timestamp < 5 * 60 * 1000)) {
    console.log(`Cache hit for ${key}`);
    return Promise.resolve(cached.data);
  }
  
  return fetchFn().then(data => {
    cacheMap.set(key, {
      data,
      timestamp: Date.now()
    });
    return data;
  });
}
