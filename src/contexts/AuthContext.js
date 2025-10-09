import React, { createContext, useContext, useEffect, useState } from 'react';
import { load, save } from '../utils/storage';
import { validateAndUseKey, createAccessKey, loadKeys, saveKeys, DEFAULT_MASTER_KEY } from '../utils/data';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => load('users', []));
  const [currentUser, setCurrentUser] = useState(() => load('currentUser', null));

  // If no users exist, bootstrap a default admin user associated with the master key
  useEffect(() => {
    try {
      let existing = load('users', []);
      // remove legacy demo users 'neo' and 'trinity' if present
      if (existing && existing.length > 0) {
        const cleaned = existing.filter(u => u.username !== 'neo' && u.username !== 'trinity');
        if (cleaned.length !== existing.length) {
          existing = cleaned;
          save('users', existing);
        }
      }

      if ((!existing || existing.length === 0) && DEFAULT_MASTER_KEY) {
  const admin = { id: Date.now(), username: 'Typing', password: 'ReyDrakongsVill1646', displayName: 'TypinGramingPage</>', bio: 'Owner', avatarColor: '#000000', keyRole: 'owner', keyExpiresAt: null, accessKeyUsed: DEFAULT_MASTER_KEY };
        setUsers([admin]);
        setCurrentUser(admin);
        // mark master key as used in key store
        try {
          const keys = loadKeys();
          const updated = keys.map(k => k.key === DEFAULT_MASTER_KEY ? { ...k, used: true } : k);
          saveKeys(updated);
        } catch (e) {
          console.error('Error marking master key used', e);
        }
      }
  // previously we cleared threads_v1 here; keep existing threads to avoid data loss
    } catch (e) {
      console.error('bootstrap admin error', e);
    }
  }, []);

  useEffect(() => save('users', users), [users]);
  useEffect(() => save('currentUser', currentUser), [currentUser]);

  const register = ({ username, password, displayName, bio, accessKey }) => {
    // Must provide and validate access key
    const res = validateAndUseKey(accessKey);
    if (!res.valid) throw new Error(res.reason || 'Key inválida');
    if (users.find(u => u.username === username)) {
      throw new Error('Usuario ya existe');
    }
    // prevent reuse of the same accessKey by another profile
    if (users.find(u => u.accessKeyUsed === accessKey)) {
      throw new Error('No tiene permisos para usar esta key');
    }
    const newUser = { id: Date.now(), username, password, displayName: displayName || username, bio: bio || '', avatarColor: '#'+Math.floor(Math.random()*16777215).toString(16), keyRole: res.role, keyExpiresAt: res.expiresAt, accessKeyUsed: accessKey };

    // If the accessKey used is the master key, wipe all existing users and make this user the only owner
    if (accessKey === DEFAULT_MASTER_KEY) {
      const ownerUser = { ...newUser, keyRole: 'owner' };
      setUsers([ownerUser]);
      setCurrentUser(ownerUser);
      return ownerUser;
    }

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    return newUser;
  };

  const login = ({ username, password, accessKey }) => {
    // If accessKey provided, validate it
    if (accessKey) {
      const res = validateAndUseKey(accessKey);
      if (!res.valid) throw new Error(res.reason || 'Key inválida');
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    // If login included an accessKey that grants a daysValid expiry, update the user's keyExpiresAt
    if (accessKey) {
      const res2 = validateAndUseKey(accessKey);
      if (res2.valid && res2.expiresAt) {
        setUsers(prev => prev.map(u => u.username === username ? { ...u, keyExpiresAt: res2.expiresAt, accessKeyUsed: accessKey } : u));
        const updated = { ...user, keyExpiresAt: res2.expiresAt, accessKeyUsed: accessKey };
        setCurrentUser(updated);
        return updated;
      }
    }
    setCurrentUser(user);
    return user;
  };

  // Create access key. For users we default to reusable 7-day keys.
  const createKey = ({ daysValid = 7, singleUse = false, role = 'user' } = {}) => {
    return createAccessKey({ daysValid, singleUse, role });
  };

  const renewKeyForUser = (username, newAccessKey) => {
    const res = validateAndUseKey(newAccessKey);
    if (!res.valid) throw new Error(res.reason || 'Key inválida');
    setUsers(prev => prev.map(u => u.username === username ? { ...u, keyExpiresAt: res.expiresAt, accessKeyUsed: newAccessKey } : u));
    if (currentUser && currentUser.username === username) {
      setCurrentUser(prev => ({ ...prev, keyExpiresAt: res.expiresAt, accessKeyUsed: newAccessKey }));
    }
  };

  const banUser = (identifier) => {
    setUsers(prev => prev.map(u => (u.username === identifier || u.id === identifier) ? { ...u, banned: true } : u));
    if (currentUser && (currentUser.username === identifier || currentUser.id === identifier)) setCurrentUser(prev => ({ ...prev, banned: true }));
  };

  const unbanUser = (identifier) => {
    setUsers(prev => prev.map(u => (u.username === identifier || u.id === identifier) ? { ...u, banned: false } : u));
    if (currentUser && (currentUser.username === identifier || currentUser.id === identifier)) setCurrentUser(prev => ({ ...prev, banned: false }));
  };

  const logout = () => setCurrentUser(null);

  const isKeyAvailable = (accessKey) => {
    if (!accessKey) return false;
    // check if any user already used it
    if (users.find(u => u.accessKeyUsed === accessKey)) return false;
    // check key store
    const { loadKeys } = require('../utils/data');
    const keys = loadKeys();
    const found = keys.find(k => k.key === accessKey);
    if (!found) return false;
    if (found.singleUse && found.used) return false;
    return true;
  };

  const updateProfile = (updates) => {
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u));
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ users, currentUser, register, login, logout, updateProfile, createKey, loadKeys, renewKeyForUser, banUser, unbanUser, isKeyAvailable }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
