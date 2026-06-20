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

export interface TrackedBook {
  id: string;
  userId: string;
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  format: string; // e.g., 'Physical', 'Kindle', 'PDF', 'Audiobook'
  status: 'PlanToRead' | 'Reading' | 'Read';
  currentPage: number;
  rating: number;
  timesRead: number;
  createdAt: any;
}

export interface TrackedCourse {
  id: string;
  userId: string;
  title: string;
  platform: string; // e.g., 'Udemy', 'Coursera', 'YouTube', 'Alura'
  status: 'PlanToStart' | 'Studying' | 'Completed';
  rating: number;
  timesCompleted: number;
  progressType: 'lessons' | 'hours';
  totalLessons?: number;
  currentLesson?: number;
  totalHours?: number;
  currentHours?: number;
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
    console.error("Firestore Subscribe Shows Error:", error);
  });
}

/**
 * Adds a new book to the user's tracked list in Firestore.
 *
 * @param userId - The ID of the authenticated user
 * @param bookData - The book details to save
 * @returns Promise resolving to the created document's ID
 */
export async function addBook(
  userId: string,
  bookData: Omit<TrackedBook, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'books'), {
    ...bookData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an existing tracked book's fields in Firestore.
 *
 * @param docId - The Firestore document ID to update
 * @param updateData - The fields to be updated
 * @returns Promise resolving when update is successful
 */
export async function updateBook(
  docId: string,
  updateData: Partial<Omit<TrackedBook, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'books', docId);
  await updateDoc(docRef, updateData);
}

/**
 * Deletes a tracked book document from Firestore.
 *
 * @param docId - The Firestore document ID to delete
 * @returns Promise resolving when deletion is successful
 */
export async function deleteBook(docId: string): Promise<void> {
  const docRef = doc(db, 'books', docId);
  await deleteDoc(docRef);
}

/**
 * Creates a real-time listener for the user's tracked books.
 *
 * @param userId - The ID of the authenticated user
 * @param callback - Function called with the updated array of books
 * @returns The unsubscribe function to stop listening to updates
 */
export function subscribeToBooks(
  userId: string,
  callback: (books: TrackedBook[]) => void
) {
  const q = query(
    collection(db, 'books'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const books: TrackedBook[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      books.push({
        id: doc.id,
        ...data,
      } as TrackedBook);
    });
    callback(books);
  }, (error) => {
    console.error("Firestore Subscribe Books Error:", error);
  });
}

/**
 * Adds a new course to the user's tracked list in Firestore.
 *
 * @param userId - The ID of the authenticated user
 * @param courseData - The course details to save
 * @returns Promise resolving to the created document's ID
 */
export async function addCourse(
  userId: string,
  courseData: Omit<TrackedCourse, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...courseData,
    userId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Updates an existing tracked course's fields in Firestore.
 *
 * @param docId - The Firestore document ID to update
 * @param updateData - The fields to be updated
 * @returns Promise resolving when update is successful
 */
export async function updateCourse(
  docId: string,
  updateData: Partial<Omit<TrackedCourse, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docRef = doc(db, 'courses', docId);
  await updateDoc(docRef, updateData);
}

/**
 * Deletes a tracked course document from Firestore.
 *
 * @param docId - The Firestore document ID to delete
 * @returns Promise resolving when deletion is successful
 */
export async function deleteCourse(docId: string): Promise<void> {
  const docRef = doc(db, 'courses', docId);
  await deleteDoc(docRef);
}

/**
 * Creates a real-time listener for the user's tracked courses.
 *
 * @param userId - The ID of the authenticated user
 * @param callback - Function called with the updated array of courses
 * @returns The unsubscribe function to stop listening to updates
 */
export function subscribeToCourses(
  userId: string,
  callback: (courses: TrackedCourse[]) => void
) {
  const q = query(
    collection(db, 'courses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const courses: TrackedCourse[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      courses.push({
        id: doc.id,
        ...data,
      } as TrackedCourse);
    });
    callback(courses);
  }, (error) => {
    console.error("Firestore Subscribe Courses Error:", error);
  });
}
