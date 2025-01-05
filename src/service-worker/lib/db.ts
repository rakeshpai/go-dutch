import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { Group } from './groups';
import { GroupId } from '../utils/branded-types';

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
}

type MigrationStep = (db: IDBPDatabase<AppDB>) => void;

const migrations: MigrationStep[] = [
  db => {
    const kvStore = db.createObjectStore('kvStore');
    kvStore.createIndex('by-key', 'key', { unique: true });

    const groups = db.createObjectStore('groups', { keyPath: 'id' });
    groups.createIndex('by-id', 'id', { unique: true });
  },
];

export const dbPromise = openDB<AppDB>('app-db', 1, {
  upgrade(database, oldVersion) {
    for (const migrateStep of migrations.slice(oldVersion)) {
      migrateStep(database);
    }
  },
});
