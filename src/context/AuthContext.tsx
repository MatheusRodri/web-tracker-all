'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Authentication context structure defining the shape of shared auth state and methods
interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider component that wraps the application.
 * Manages the client-side Firebase Auth lifecycle and provides user state to children.
 *
 * @param props - React props containing children node
 * @returns React context provider wrapping the children
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize state with Firebase Auth on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Log in a user with their email and password credentials.
   *
   * @param email - The user's email address
   * @param pass - The user's password
   * @returns Promise resolving on successful authentication
   */
  async function loginWithEmail(email: string, pass: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, pass);
  }

  /**
   * Register a new user account with email and password credentials.
   *
   * @param email - The email address for the new account
   * @param pass - The password for the new account
   * @returns Promise resolving on successful account creation
   */
  async function registerWithEmail(email: string, pass: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, pass);
  }

  /**
   * Log in or register a user using their Google account via a pop-up window.
   *
   * @returns Promise resolving on successful authentication
   */
  async function loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  /**
   * Log out the currently authenticated user.
   *
   * @returns Promise resolving on successful logout
   */
  async function logout(): Promise<void> {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to consume the AuthContext state and functions.
 * Ensures the hook is only used within an AuthProvider wrapper.
 *
 * @returns The active AuthContext values
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
