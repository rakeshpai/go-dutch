import {
  DBSchema,
  IDBPDatabase,
  IDBPTransaction,
  openDB,
  StoreNames,
} from 'idb';
import { Group } from './groups';
import { GroupId } from '../utils/branded-types';
import { LedgerEntry } from './ledger';

export interface AppDB extends DBSchema {
  kvStore: {
    key: string;
    value: unknown;
    indexes: { 'by-key': string };
  };
  groups: {
    value: Group;
    key: GroupId;
    indexes: { 'by-id': GroupId };
  };
  syncLog: {
    value: {
      id: string;
      loggedAt: Date;
      type: string;
      args: unknown;
    };
    key: string; // Using a unique ID as string to avoid `loggedAt` time clashes
    indexes: { 'by-time': Date };
  };
  ledger: {
    value: LedgerEntry;
    key: string;
    indexes: { 'by-group-and-date': [GroupId, Date] };
  };
}

type MigrationStep = (db: IDBPDatabase<AppDB>) => void;

const migrations: MigrationStep[] = [
  db => {
    const kvStore = db.createObjectStore('kvStore');
    kvStore.createIndex('by-key', 'key', { unique: true });

    const groups = db.createObjectStore('groups', { keyPath: 'id' });
    groups.createIndex('by-id', 'id', { unique: true });
  },
  db => {
    const syncLog = db.createObjectStore('syncLog', { keyPath: 'id' });
    syncLog.createIndex('by-time', 'loggedAt');
  },
  db => {
    const ledger = db.createObjectStore('ledger', { keyPath: 'id' });
    ledger.createIndex('by-group-and-date', ['groupId', 'date']);
  },
];

export const dbPromise = openDB<AppDB>('app-db', migrations.length, {
  upgrade(database, oldVersion) {
    for (const migrateStep of migrations.slice(oldVersion)) {
      migrateStep(database);
    }
  },
});

export type TransactionFor<
  S extends StoreNames<AppDB>,
  Type extends 'readonly' | 'readwrite',
> = IDBPTransaction<
  AppDB,
  (S | StoreNames<AppDB>)[],
  Type extends 'readonly' ? 'readonly' | 'readwrite' : 'readwrite'
>;
