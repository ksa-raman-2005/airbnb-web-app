'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/api';

interface UserContextType {
  currentUser: User | null;
  allUsers: User[];
  setCurrentUser: (user: User) => void;
  switchUser: (userId: number) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const users = await api.getUsers();
        setAllUsers(users);

        // Check localStorage for saved user
        const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('airbnb_active_user_id') : null;
        if (savedUserId) {
          const found = users.find(u => u.id === parseInt(savedUserId, 10));
          if (found) {
            setCurrentUser(found);
            setIsLoading(false);
            return;
          }
        }

        // Default to Alex Morgan (guest) or first user
        if (users.length > 0) {
          const defaultUser = users.find(u => u.name.includes('Alex')) || users[0];
          setCurrentUser(defaultUser);
        }
      } catch (err) {
        console.error('Failed to load demo users:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadUsers();
  }, []);

  const switchUser = (userId: number) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('airbnb_active_user_id', target.id.toString());
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchUser,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
