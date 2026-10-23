import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { seedPosts } from '../mocks/data';

const KEY = 'boomerang:v1';

const defaults = () => ({
  user: null,
  onboarded: false,
  posts: seedPosts(),
  searches: [],
  unlocked: [],
  attempts: {},
  notifications: true,
});

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    return defaults();
  }
}

const AppCtx = createContext(null);

export function AppProvider({ children }) {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: the app still works for this session */
    }
  }, [state]);

  const value = useMemo(
    () => ({
      ...state,
      signIn: (user) => setState((s) => ({ ...s, user })),
      signOut: () => setState((s) => ({ ...s, user: null })),
      finishOnboarding: () => setState((s) => ({ ...s, onboarded: true })),
      addPost: (post) => setState((s) => ({ ...s, posts: [post, ...s.posts] })),
      markReturned: (id) =>
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) => (p.id === id ? { ...p, status: 'returned' } : p)),
        })),
      addSearch: (search) => setState((s) => ({ ...s, searches: [search, ...s.searches].slice(0, 20) })),
      unlock: (id) => setState((s) => (s.unlocked.includes(id) ? s : { ...s, unlocked: [...s.unlocked, id] })),
      recordFail: (id) =>
        setState((s) => ({ ...s, attempts: { ...s.attempts, [id]: (s.attempts[id] || 0) + 1 } })),
      setNotifications: (on) => setState((s) => ({ ...s, notifications: on })),
      resetDemo: () => setState({ ...defaults(), user: state.user, onboarded: true }),
    }),
    [state]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export const useApp = () => useContext(AppCtx);
