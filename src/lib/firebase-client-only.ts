// Client-only Firebase utilities for Vercel deployment
'use client';

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Client-only auth state management
export function useFirebaseAuth() {
  if (typeof window === 'undefined') {
    return { user: null, loading: true };
  }
  
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Client-only Firestore operations
export async function getClientDoc(collection: string, docId: string) {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const docRef = doc(db, collection, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

// Environment validation for client
export function validateFirebaseConfig() {
  if (typeof window === 'undefined') return true;
  
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing Firebase environment variables:', missing);
    return false;
  }
  
  return true;
}