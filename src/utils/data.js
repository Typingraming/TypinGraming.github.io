import { load, save } from './storage';

const KEY = 'threads_v1';

// Generated master key for owner provisioning. Change this value if you want a different master key.
export const DEFAULT_MASTER_KEY = 'MASTER-5G7K9Z2H';

export const loadThreads = () => {
  const raw = load(KEY, []);
  // Normalize: treat explicit white '#ffffff' theme as null to avoid white cards
  return raw.map(t => ({ ...t, themeColor: (t.themeColor === '#ffffff' ? null : t.themeColor) }));
};

export const saveThreads = (threads) => save(KEY, threads);

export const createThread = (thread) => {
  const threads = loadThreads();
  const newThread = {
    id: Date.now(),
    title: thread.title || 'Sin título',
    posts: thread.posts || [],
    collaborators: thread.collaborators || [],
    tags: thread.tags || [],
    themeColor: thread.themeColor || null,
    headerImage: thread.headerImage || null
  };
  const updated = [newThread, ...threads];
  saveThreads(updated);
  return newThread;
};

export const addPost = (threadId, post) => {
  const threads = loadThreads();
  const updated = threads.map(t => t.id === threadId ? { ...t, posts: [...t.posts, { id: Date.now(), ...post }] } : t);
  saveThreads(updated);
  return updated.find(t=>t.id===threadId);
};

export const updateThread = (threadId, updates) => {
  const threads = loadThreads();
  const updated = threads.map(t => t.id === threadId ? { ...t, ...updates } : t);
  saveThreads(updated);
  return updated.find(t=>t.id===threadId);
};

export const deleteThread = (threadId) => {
  const threads = loadThreads();
  const updated = threads.filter(t => t.id !== threadId);
  saveThreads(updated);
  return updated;
};

// --- key management ---
const KEY_STORE = 'access_keys_v1';

export const loadKeys = () => load(KEY_STORE, [
  // default master key (change in production) - single-use owner key
  { key: DEFAULT_MASTER_KEY, role: 'owner', daysValid: null, singleUse: true, used: false, createdAt: Date.now() }
]);

export const saveKeys = (keys) => save(KEY_STORE, keys);

export const createAccessKey = ({ daysValid = 7, singleUse = false, role = 'user' } = {}) => {
  // keys for normal users are reusable for daysValid days starting at time of use
  const keys = loadKeys();
  // generate a longer, mixed-case, numeric and symbol-containing key for diversity
  const rand = () => Math.random().toString(36).substring(2);
  const k = (rand() + '-' + rand() + '-' + Date.now().toString(36)).slice(0, 40).replace(/[^A-Za-z0-9\-]/g, '').toUpperCase();
  const keyObj = { key: k, role, daysValid: daysValid || null, singleUse: !!singleUse, used: false, createdAt: Date.now() };
  const updated = [keyObj, ...keys];
  saveKeys(updated);
  return keyObj;
};

export const validateAndUseKey = (key) => {
  const keys = loadKeys();
  const found = keys.find(k => k.key === key);
  if (!found) return { valid: false, reason: 'Key not found' };
  // singleUse key: check used flag
  if (found.singleUse && found.used) return { valid: false, reason: 'Key already usado (sin permisos)' };
  // mark used if singleUse
  if (found.singleUse) {
    const updated = keys.map(k => k.key === key ? { ...k, used: true } : k);
    saveKeys(updated);
  }

  // For reusable keys (daysValid), we treat expiry as starting at time of use for each user.
  const expiresAt = found.daysValid ? (Date.now() + found.daysValid * 24 * 3600 * 1000) : null;
  return { valid: true, role: found.role, expiresAt, daysValid: found.daysValid };
};

