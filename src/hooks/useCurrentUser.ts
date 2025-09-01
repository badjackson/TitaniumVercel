'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { logoutFromFirebase } from '@/lib/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'judge';
  sector?: string | null;
  loginTime: string;
}

export function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!mounted) return;
      
      if (user) {
        try {
          // Get judge data from Firestore
          const judgeDoc = await getDoc(doc(db, 'judges', user.uid));
          const judgeData = judgeDoc.exists() ? judgeDoc.data() : null;
          
          if (judgeData && judgeData.status === 'active') {
            const userSession: UserSession = {
              id: user.uid,
              name: judgeData.name,
              username: judgeData.username,
              role: judgeData.role,
              sector: judgeData.sector,
              loginTime: new Date().toISOString()
            };
            
            if (mounted) {
              setCurrentUser(userSession);
            }
            
            // Store in localStorage for compatibility
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUserSession', JSON.stringify(userSession));
            }
          } else {
            // Fallback - try to determine from email
            let role: 'admin' | 'judge' = 'judge';
            let sector: string | null = 'A';
            
            if (user.email?.includes('admin@')) {
              role = 'admin';
              sector = null;
            } else if (user.email?.includes('juge.')) {
              const sectorMatch = user.email.match(/juge\.([a-f])/i);
              sector = sectorMatch ? sectorMatch[1].toUpperCase() : 'A';
            }
            
            const userSession: UserSession = {
              id: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Unknown',
              username: user.email?.split('@')[0] || 'unknown',
              role,
              sector,
              loginTime: new Date().toISOString()
            };
            
            if (mounted) {
              setCurrentUser(userSession);
            }
            
            // Store in localStorage for compatibility
            if (typeof window !== 'undefined') {
              localStorage.setItem('currentUserSession', JSON.stringify(userSession));
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          if (mounted) {
            setCurrentUser(null);
          }
        }
      } else {
        if (mounted) {
          setCurrentUser(null);
        }
        // Clear localStorage when logged out
        if (typeof window !== 'undefined') {
          localStorage.removeItem('currentUserSession');
        }
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userSession') {
        if (e.newValue) {
          try {
            const user = JSON.parse(e.newValue);
            setCurrentUser(user);
          } catch (error) {
            console.error('Error parsing user session:', error);
          }
        } else {
          setCurrentUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = async () => {
    try {
      await logoutFromFirebase();
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    currentUser,
    isLoading,
    logout,
    isAuthenticated: !!currentUser,
    isAdmin: currentUser?.role === 'admin',
    isJudge: currentUser?.role === 'judge',
    assignedSector: currentUser?.sector
  };
}