import { ImageHistoryItem } from '../types';

const DB_NAME = 'nexora_image_studio_db';
const DB_VERSION = 1;
const STORE_NAME = 'image_history';
const LEGACY_STORAGE_KEY = 'nexora_image_studio_history';

/**
 * Open or initialize the IndexedDB instance for image storage.
 * IndexedDB provides several gigabytes of local storage capacity,
 * completely preventing the browser localStorage 5MB quota exhaustion.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

/**
 * Safely retrieves all image history items.
 * Seamlessly migrates existing records from localStorage to IndexedDB and cleans localStorage.
 */
export async function loadHistoryFromStorage(): Promise<ImageHistoryItem[]> {
  try {
    const db = await openDB();
    const items = await new Promise<ImageHistoryItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const result = (req.result as ImageHistoryItem[]) || [];
        // Sort descending by timestamp
        result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(result);
      };

      req.onerror = () => {
        reject(req.error);
      };
    });

    if (items && items.length > 0) {
      // Clean up legacy localStorage if it still contains data to free quota
      cleanLegacyLocalStorage();
      return items;
    }

    // If IndexedDB is empty, check for legacy localStorage data to migrate
    const legacy = getLegacyHistory();
    if (legacy && legacy.length > 0) {
      await saveHistoryToIndexedDB(legacy);
      cleanLegacyLocalStorage();
      return legacy;
    }

    return [];
  } catch (err) {
    console.warn('IndexedDB not available or failed, using safe fallback:', err);
    return getLegacyHistory();
  }
}

/**
 * Persists the entire image history to IndexedDB asynchronously.
 * Completely immune to QuotaExceededError from localStorage.
 */
export async function persistHistoryToStorage(items: ImageHistoryItem[]): Promise<void> {
  // Always clean bloated base64 from localStorage
  cleanLegacyLocalStorage();

  try {
    await saveHistoryToIndexedDB(items);
  } catch (err) {
    console.warn('Failed to persist image history to IndexedDB:', err);
    // Safe memory/compact fallback: never throw QuotaExceededError to window
    trySaveSafeMetadata(items);
  }
}

/**
 * Internal helper to write items into IndexedDB
 */
async function saveHistoryToIndexedDB(items: ImageHistoryItem[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear and re-populate (capped to latest 100 items for optimal speed)
    const clearReq = store.clear();
    clearReq.onsuccess = () => {
      const boundedItems = items.slice(0, 100);
      for (const item of boundedItems) {
        store.put(item);
      }
    };

    tx.oncomplete = () => {
      resolve();
    };

    tx.onerror = () => {
      reject(tx.error);
    };
  });
}

/**
 * Deletes a single item by id
 */
export async function deleteHistoryItemFromStorage(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (e) {
    console.warn('Failed to delete item from IndexedDB:', e);
  }
}

/**
 * Clears all image history records
 */
export async function clearAllHistoryFromStorage(): Promise<void> {
  cleanLegacyLocalStorage();
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (e) {
    console.warn('Failed to clear IndexedDB:', e);
  }
}

/**
 * Safely reads legacy items from localStorage if available
 */
function getLegacyHistory(): ImageHistoryItem[] {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Safely removes legacy key from localStorage to guarantee quota is freed
 */
function cleanLegacyLocalStorage(): void {
  try {
    if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  } catch {
    // Ignore any localStorage access issues
  }
}

/**
 * Fallback metadata saving that guarantees no QuotaExceededError
 */
function trySaveSafeMetadata(items: ImageHistoryItem[]): void {
  try {
    // Keep only URLs or tiny data (strip heavy base64 strings if ever storing to localStorage)
    const safeSubset = items.slice(0, 10).map(item => ({
      ...item,
      imageUrl: item.imageUrl.startsWith('data:') ? '' : item.imageUrl
    }));
    localStorage.setItem('nexora_image_meta_cache', JSON.stringify(safeSubset));
  } catch {
    // Silently drop if localStorage is entirely blocked
  }
}
