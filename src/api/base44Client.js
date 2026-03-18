// Local mock – no Base44 account needed. Data is stored in localStorage.

const LOCAL_USER = { id: 'local-user-1', email: 'user@local.app', full_name: 'Local User' };

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
      const newItem = {
        ...data,
        id: uid(),
        created_date: new Date().toISOString(),
        created_by: LOCAL_USER.email,
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
    me: () => Promise.resolve(LOCAL_USER),
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
