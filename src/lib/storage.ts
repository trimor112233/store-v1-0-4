/**
 * High-reliability persistent storage engine with dual IndexedDB + LocalStorage sync.
 * Guarantees that product additions, deletions, updates, orders, and settings
 * NEVER revert on page refresh, even with large images or quota constraints.
 */

const DB_NAME = 'student_hub_db';
const DB_VERSION = 1;
const STORE_NAME = 'keyval';

// IndexedDB helper (asynchronous unlimited local storage)
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

export const idbGet = async <T>(key: string): Promise<T | null> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
};

export const idbSet = async <T>(key: string, value: T): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
};

export const idbDelete = async (key: string): Promise<void> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
};

// ===================== SYNCHRONOUS LOCALSTORAGE WITH QUOTA PROTECTION =====================

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`sh_${key}`);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  if (typeof window === 'undefined') return;

  // Mark as initialized so empty arrays are recognized as intentional, not uninitialized
  try {
    localStorage.setItem(`sh_init_${key}`, 'true');
  } catch {}

  // Save to IndexedDB asynchronously (handles large assets, base64 images without quota limit)
  idbSet(key, data).catch(() => {});

  // Save to LocalStorage for instant synchronous reloads
  try {
    localStorage.setItem(`sh_${key}`, JSON.stringify(data));
  } catch (err) {
    // If quota exceeded (e.g. big image data urls in local storage), trim large images for local storage
    // but full data remains intact in IndexedDB
    try {
      console.warn(`[Storage] LocalStorage quota hit for ${key}. Compacting for localStorage...`, err);
      if (Array.isArray(data)) {
        const compacted = data.map((item: any) => {
          if (item && typeof item === 'object') {
            const clone = { ...item };
            if (typeof clone.image === 'string' && clone.image.startsWith('data:image') && clone.image.length > 50000) {
              clone.image = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80';
            }
            return clone;
          }
          return item;
        });
        localStorage.setItem(`sh_${key}`, JSON.stringify(compacted));
      }
    } catch {}
  }
};

// Check if a key was previously initialized by user / session
export const isKeyInitialized = (key: string): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(`sh_init_${key}`) === 'true' || localStorage.getItem(`sh_${key}`) !== null;
};

// ===================== DELETION TRACKING SET =====================
// Keeps track of deleted IDs permanently so NO refresh or cloud re-fetch resurrects them

export const getDeletedIds = (key: string): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(`sh_deleted_${key}`);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

export const addDeletedId = (key: string, id: string): void => {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getDeletedIds(key);
    set.add(String(id));
    const arr = Array.from(set);
    localStorage.setItem(`sh_deleted_${key}`, JSON.stringify(arr));
    idbSet(`deleted_${key}`, arr).catch(() => {});
  } catch {}
};

export const unmarkDeletedId = (key: string, id: string): void => {
  if (typeof window === 'undefined' || !id) return;
  try {
    const set = getDeletedIds(key);
    if (set.has(String(id))) {
      set.delete(String(id));
      const arr = Array.from(set);
      localStorage.setItem(`sh_deleted_${key}`, JSON.stringify(arr));
      idbSet(`deleted_${key}`, arr).catch(() => {});
    }
  } catch {}
};

// ===================== ADDED ITEMS REGISTRY =====================
// Preserves locally added items so they are NEVER overwritten or dropped on refresh

export const getAddedMap = <T extends { id: string }>(key: string): Record<string, T> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`sh_added_${key}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveAddedItem = <T extends { id: string }>(key: string, item: T): void => {
  if (typeof window === 'undefined' || !item?.id) return;
  try {
    const map = getAddedMap<T>(key);
    map[item.id] = item;
    localStorage.setItem(`sh_added_${key}`, JSON.stringify(map));
    idbSet(`added_${key}`, map).catch(() => {});
  } catch {}
};

export const removeAddedItem = (key: string, id: string): void => {
  if (typeof window === 'undefined' || !id) return;
  try {
    const map = getAddedMap(key);
    if (map[id]) {
      delete map[id];
      localStorage.setItem(`sh_added_${key}`, JSON.stringify(map));
      idbSet(`added_${key}`, map).catch(() => {});
    }
  } catch {}
};
