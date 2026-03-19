// Local mock – no Base44 account needed. Data is stored in localStorage.

const LOCAL_USER_STORAGE_KEY = 'ht_local_user';
const DEFAULT_LOCAL_USER = { id: 'local-user-1', email: 'user@local.app', full_name: 'Local User' };

function getLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (!raw) return DEFAULT_LOCAL_USER;
    const parsed = JSON.parse(raw);
    if (!parsed?.email || !parsed?.full_name) return DEFAULT_LOCAL_USER;
    return {
      id: parsed.id || DEFAULT_LOCAL_USER.id,
      email: String(parsed.email),
      full_name: String(parsed.full_name),
    };
  } catch {
    return DEFAULT_LOCAL_USER;
  }
}

function setLocalUser({ full_name, email }) {
  const current = getLocalUser();
  const next = {
    id: current.id || uid(),
    full_name: String(full_name || current.full_name || '').trim(),
    email: String(email || current.email || '').trim().toLowerCase(),
  };

  if (!next.full_name || !next.email) {
    return Promise.reject(new Error('Name und E-Mail sind erforderlich.'));
  }

  localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(next));
  return Promise.resolve(next);
}

function hasCustomLocalUser() {
  return !!localStorage.getItem(LOCAL_USER_STORAGE_KEY);
}

function uid() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function createEntityStore(name) {
  const key = `ht_entity_${name}`;

  const getAll = () => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  };

  const saveAll = (data) => localStorage.setItem(key, JSON.stringify(data));

  return {
    list: (sort, limit, filter) => {
      let items = getAll();
      if (filter) {
        items = items.filter(item =>
          Object.entries(filter).every(([k, v]) => item[k] === v)
        );
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        items = [...items].sort((a, b) => {
          if (a[field] < b[field]) return desc ? 1 : -1;
          if (a[field] > b[field]) return desc ? -1 : 1;
          return 0;
        });
      }
      if (limit) items = items.slice(0, limit);
      return Promise.resolve(items);
    },

    create: (data) => {
      const items = getAll();
      const localUser = getLocalUser();
      const newItem = {
        ...data,
        id: uid(),
        created_date: new Date().toISOString(),
        created_by: localUser.email,
      };
      items.push(newItem);
      saveAll(items);
      return Promise.resolve(newItem);
    },

    update: (id, data) => {
      const items = getAll();
      const idx = items.findIndex(i => i.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        saveAll(items);
        return Promise.resolve(items[idx]);
      }
      return Promise.reject(new Error(`${name} not found: ${id}`));
    },

    delete: (id) => {
      const items = getAll().filter(i => i.id !== id);
      saveAll(items);
      return Promise.resolve();
    },

    // Real-time not available locally – return noop unsubscribe
    subscribe: (_callback) => () => {},
  };
}

export const base44 = {
  auth: {
    me: () => Promise.resolve(getLocalUser()),
    setLocalUser,
    hasCustomLocalUser,
    logout: () => {},
    redirectToLogin: () => {},
  },
  entities: {
    Habit: createEntityStore('Habit'),
    HabitLog: createEntityStore('HabitLog'),
    HabitComment: createEntityStore('HabitComment'),
    ChatMessage: createEntityStore('ChatMessage'),
  },
};
