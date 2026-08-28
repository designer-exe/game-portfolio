import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'

const COLLECTION_NAME = 'songSuggestions'

/**
 * Service to manage song suggestions in Firebase Firestore.
 */

export async function submitSongSuggestion({ songName, artist = '', songUrl = '', message = '' })
{
    if(!isFirebaseConfigured || !db)
    {
        throw new Error('Firebase is not configured. Please check your environment variables.')
    }

    const trimmedName = (songName || '').trim()
    const trimmedArtist = (artist || '').trim()
    const trimmedUrl = (songUrl || '').trim()
    const trimmedMsg = (message || '').trim()

    if(!trimmedName)
    {
        throw new Error('Song name is required.')
    }

    if(trimmedName.length > 150)
    {
        throw new Error('Song name must be under 150 characters.')
    }

    if(trimmedArtist.length > 150)
    {
        throw new Error('Artist must be under 150 characters.')
    }

    if(trimmedUrl.length > 1000)
    {
        throw new Error('URL must be under 1000 characters.')
    }

    if(trimmedMsg.length > 500)
    {
        throw new Error('Message must be under 500 characters.')
    }

    const docData = {
        songName: trimmedName,
        artist: trimmedArtist || null,
        songUrl: trimmedUrl || null,
        message: trimmedMsg || null,
        createdAt: serverTimestamp(),
        status: 'pending',
        source: 'portfolio_music_player'
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), docData)
    return { success: true, id: docRef.id }
}

export function subscribeToSongSuggestions(onUpdate, onError)
{
    if(!isFirebaseConfigured || !db)
    {
        if(onError) onError(new Error('Firebase is not configured.'))
        return () => {}
    }

    try
    {
        const colRef = collection(db, COLLECTION_NAME)
        const unsubscribe = onSnapshot(colRef, (snapshot) =>
        {
            const suggestions = []
            snapshot.forEach((docSnap) =>
            {
                suggestions.push({
                    id: docSnap.id,
                    ...docSnap.data()
                })
            })

            // Sort descending by createdAt (newest first) in JavaScript for complete query compatibility
            suggestions.sort((a, b) =>
            {
                const getMillis = (val) =>
                {
                    if(!val) return 0
                    if(typeof val.toMillis === 'function') return val.toMillis()
                    if(typeof val.seconds === 'number') return val.seconds * 1000
                    if(val instanceof Date) return val.getTime()
                    const parsed = new Date(val).getTime()
                    return isNaN(parsed) ? 0 : parsed
                }
                return getMillis(b.createdAt) - getMillis(a.createdAt)
            })

            onUpdate(suggestions)
        }, (err) =>
        {
            console.error('Firestore onSnapshot error:', err)
            if(onError) onError(err)
        })

        return unsubscribe
    }
    catch(err)
    {
        console.error('subscribeToSongSuggestions error:', err)
        if(onError) onError(err)
        return () => {}
    }
}

export async function updateSuggestionStatus(id, newStatus)
{
    if(!isFirebaseConfigured || !db)
    {
        throw new Error('Firebase is not configured.')
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
    })
    return { success: true }
}

export async function deleteSuggestion(id)
{
    if(!isFirebaseConfigured || !db)
    {
        throw new Error('Firebase is not configured.')
    }

    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
    return { success: true }
}
