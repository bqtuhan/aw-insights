/**
 * IndexedDB persistence layer backed by the `idb` library.
 * All database logic lives here — no other file touches IndexedDB directly.
 *
 * Database: aw-insights-db
 * Version 1
 *   Object stores:
 *     - dataset      (key: "primary")
 *     - preferences  (key: "primary")
 *
 * @module lib/db
 */

import { openDB, type IDBPDatabase } from 'idb';
import type { Dataset, UserPreferences } from '@/types';

/** Database name constant. */
const DB_NAME = 'aw-insights-db';
/** Current version (increment when schema changes). */
const DB_VERSION = 1;

/** Singleton database instance. Initialised lazily. */
let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Opens (or returns the cached) IndexedDB database instance.
 * Uses idb's `openDB` with an upgrade callback that creates stores.
 *
 * @returns Promise resolving to the database handle.
 */
function getDB(): Promise<IDBPDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('dataset')) {
        db.createObjectStore('dataset', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('preferences')) {
        db.createObjectStore('preferences', { keyPath: 'id' });
      }
    },
  });

  return dbPromise;
}

/** Fixed key used for the single dataset record. */
const DATASET_KEY = 'primary';
/** Fixed key used for the single preferences record. */
const PREFERENCES_KEY = 'primary';

// ────────────────────────────────────────────────────
// Dataset CRUD
// ────────────────────────────────────────────────────

/**
 * Persists the entire dataset to IndexedDB, overwriting the previous record.
 *
 * @param data - The complete dataset object.
 */
export async function saveDataset(data: Dataset): Promise<void> {
  const db = await getDB();
  await db.put('dataset', { id: DATASET_KEY, ...data });
}

/**
 * Retrieves the stored dataset, or `null` if none has been saved.
 *
 * @returns The dataset, or null.
 */
export async function getDataset(): Promise<Dataset | null> {
  const db = await getDB();
  const record = await db.get('dataset', DATASET_KEY);
  if (!record) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...data } = record as { id: string } & Dataset;
  return data as Dataset;
}

/**
 * Deletes the stored dataset.
 */
export async function clearDataset(): Promise<void> {
  const db = await getDB();
  await db.delete('dataset', DATASET_KEY);
}

// ────────────────────────────────────────────────────
// Preferences CRUD
// ────────────────────────────────────────────────────

/**
 * Persists user preferences to IndexedDB.
 *
 * @param prefs - The complete preferences object.
 */
export async function savePreferences(prefs: UserPreferences): Promise<void> {
  const db = await getDB();
  await db.put('preferences', { id: PREFERENCES_KEY, ...prefs });
}

/**
 * Retrieves stored user preferences, or `null` if none exist.
 *
 * @returns The preferences, or null.
 */
export async function getPreferences(): Promise<UserPreferences | null> {
  const db = await getDB();
  const record = await db.get('preferences', PREFERENCES_KEY);
  if (!record) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...prefs } = record as { id: string } & UserPreferences;
  return prefs as UserPreferences;
}