import Dexie from 'dexie';

export const db = new Dexie('UmiPlannerDB');

db.version(1).stores({
  groups: '++id, name, order, customPageId',
  objects: '++id, groupId, name, order',
  objectFields: '++id, objectId, type, label, value',
  files: '++id, objectId, name, type, data',
  todos: '++id, text, completed, createdAt',
  settings: 'key, value',
  customPages: '++id, name, icon, order',
  // In your database setup file
  scheduleItems: '++id, groupId, objectId, objectName, day, time'
});