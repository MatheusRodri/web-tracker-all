import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface TrackedShow {
  id: string;
  userId: string;
  imdbID: string;
  title: string;
  type: 'movie' | 'series';
  year: string;
  poster: string;
  genre: string;
  director: string;
  runtime: string;
  production: string;
  country: string;
  status: 'Unwatched' | 'Watching' | 'Watched';
  rating: number;
  platform: string;
  timesWatched: number;
  seasonsCount?: number;
  episodesCount?: number;
  currentSeason?: number;
  currentEpisode?: number;
  createdAt: any;
}

/**
 * Adds a new movie or series to the user's tracked list in Firestore.
 *
 * @param userId - The ID of the authenticated user
 * @param showData - The movie/series details to save
 * @returns Promise resolving to the created document's ID
 */
export async function addShow(
  userId: string, 
  showData: Omit<TrackedShow, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'shows'), {
    ...showData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an existing tracked show's fields in Firestore.
 *
 * @param docId - The Firestore document ID to update
 * @param updateData - The fields to be updated
 * @returns Promise resolving when update is successful
 */
export async function updateShow(
  docId: string,
  updateData: Partial<Omit<TrackedShow, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'shows', docId);
  await updateDoc(docRef, updateData);
}

/**
 * Deletes a tracked show document from Firestore.
 *
 * @param docId - The Firestore document ID to delete
 * @returns Promise resolving when deletion is successful
 */
export async function deleteShow(docId: string): Promise<void> {
  const docRef = doc(db, 'shows', docId);
  await deleteDoc(docRef);
}

/**
 * Creates a real-time listener for the user's tracked shows.
 * Calls the callback function whenever shows are added, updated, or deleted.
 *
 * @param userId - The ID of the authenticated user
 * @param callback - Function called with the updated array of shows
 * @returns The unsubscribe function to stop listening to updates
 */
export function subscribeToShows(
  userId: string,
  callback: (shows: TrackedShow[]) => void
) {
  const q = query(
    collection(db, 'shows'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const shows: TrackedShow[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      shows.push({
        id: doc.id,
        ...data,
      } as TrackedShow);
    });
    callback(shows);
  }, (error) => {
    console.error("Firestore Subscribe Error:", error);
  });
}
