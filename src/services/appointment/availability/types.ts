
// Types for better readability and testability
export interface Shift {
  start_time: string;
  end_time: string;
}

export interface CachedItem<T> {
  data: T;
  timestamp: number;
}

// Cache configuration
export const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
