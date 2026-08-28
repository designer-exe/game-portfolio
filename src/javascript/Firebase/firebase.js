import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

/**
 * Firebase Client Initialization
 * Reads credentials strictly from Vite environment variables.
 * Designed to gracefully degrade if environment variables are not yet provided.
 */

function sanitizeEnv(val)
{
    if(!val) return ''
    return String(val).trim().replace(/^["']|["',]+$/g, '').trim()
}

const firebaseConfig = {
    apiKey: sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: sanitizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: sanitizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID)
}

// Check if credentials are present and not default placeholders
export const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_') &&
    firebaseConfig.apiKey !== ''
)

let app = null
let db = null
let auth = null

if(isFirebaseConfigured)
{
    try
    {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        db = getFirestore(app)
        auth = getAuth(app)
    }
    catch(err)
    {
        console.warn('Firebase initialization error:', err)
    }
}
else
{
    console.info('Firebase Realtime Song Suggestions: Configuration pending. Set VITE_FIREBASE_* in .env to activate Firestore & Auth.')
}

export { app, db, auth }
