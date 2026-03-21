'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * Initializes Firebase services with strict adherence to the provided config.
 * Ensures persistence is set globally to avoid session loss across redirects.
 */
export function initializeFirebase() {
  const apps = getApps();
  // Always prefer existing app, but force use of our specific config on first init
  const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  
  const sdks = getSdks(app);
  
  // Set global persistence once
  if (apps.length === 0) {
    setPersistence(sdks.auth, browserLocalPersistence).catch(err => {
      console.warn("Persistence could not be set:", err);
    });
  }
  
  return sdks;
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';