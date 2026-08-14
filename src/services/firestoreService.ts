import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Participant, PoopEntry } from '../types';
import { INITIAL_PARTICIPANTS, generateSeedEntries } from '../data/initialData';

const PARTICIPANTS_COLLECTION = 'participants';
const ENTRIES_COLLECTION = 'entries';

/**
 * Subscribe to real-time participants list
 */
export function subscribeToParticipants(
  onData: (participants: Participant[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, PARTICIPANTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: Participant[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: data.id || docSnap.id,
            name: data.name,
            nickname: data.nickname,
            avatar: data.avatar,
            color: data.color,
            createdAt: data.createdAt,
            userId: data.userId,
            email: data.email,
            photoURL: data.photoURL,
          });
        });
        // Sort by createdAt ascending
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, PARTICIPANTS_COLLECTION);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PARTICIPANTS_COLLECTION);
    return () => {};
  }
}

/**
 * Subscribe to real-time entries list
 */
export function subscribeToEntries(
  onData: (entries: PoopEntry[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const colRef = collection(db, ENTRIES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const list: PoopEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: data.id || docSnap.id,
            participantId: data.participantId,
            timestamp: data.timestamp,
            effortLevel: data.effortLevel,
            durationMinutes: data.durationMinutes,
            location: data.location,
            notes: data.notes,
            createdBy: data.createdBy,
          });
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onData(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, ENTRIES_COLLECTION);
        } catch (wrappedErr) {
          if (onError && wrappedErr instanceof Error) {
            onError(wrappedErr);
          }
        }
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ENTRIES_COLLECTION);
    return () => {};
  }
}

/**
 * Initialize Firestore data if collections are completely empty
 */
export async function seedInitialFirestoreData(fallbackParticipants?: Participant[], fallbackEntries?: PoopEntry[]) {
  try {
    const partSnap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    if (partSnap.empty) {
      console.log('Seeding initial participants into Firestore...');
      const batch = writeBatch(db);
      const toSeedParticipants = fallbackParticipants && fallbackParticipants.length > 0 ? fallbackParticipants : INITIAL_PARTICIPANTS;
      for (const p of toSeedParticipants) {
        const docRef = doc(db, PARTICIPANTS_COLLECTION, p.id);
        const dataToSave: Record<string, unknown> = {
          id: p.id,
          name: p.name,
          avatar: p.avatar,
          color: p.color,
          createdAt: p.createdAt || new Date().toISOString(),
        };
        if (p.nickname) dataToSave.nickname = p.nickname;
        batch.set(docRef, dataToSave);
      }

      const toSeedEntries = fallbackEntries && fallbackEntries.length > 0 ? fallbackEntries : generateSeedEntries();
      for (const e of toSeedEntries) {
        const docRef = doc(db, ENTRIES_COLLECTION, e.id);
        const entryData: Record<string, unknown> = {
          id: e.id,
          participantId: e.participantId,
          timestamp: e.timestamp,
          effortLevel: Number(e.effortLevel),
        };
        if (e.durationMinutes) entryData.durationMinutes = Number(e.durationMinutes);
        if (e.location) entryData.location = e.location;
        if (e.notes) entryData.notes = e.notes;
        batch.set(docRef, entryData);
      }

      await batch.commit();
      console.log('Initial seed committed to Firestore.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed_data');
  }
}

/**
 * Add or update a participant
 */
export async function saveParticipantToFirestore(participant: Participant) {
  const path = `${PARTICIPANTS_COLLECTION}/${participant.id}`;
  try {
    const docRef = doc(db, PARTICIPANTS_COLLECTION, participant.id);
    const dataToSave: Record<string, unknown> = {
      id: participant.id,
      name: participant.name,
      avatar: participant.avatar,
      color: participant.color,
      createdAt: participant.createdAt || new Date().toISOString(),
    };
    if (participant.nickname) dataToSave.nickname = participant.nickname;
    if (participant.userId) dataToSave.userId = participant.userId;
    if (participant.email) dataToSave.email = participant.email;
    if (participant.photoURL) dataToSave.photoURL = participant.photoURL;
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete a participant and optionally their entries
 */
export async function deleteParticipantFromFirestore(participantId: string) {
  const path = `${PARTICIPANTS_COLLECTION}/${participantId}`;
  try {
    await deleteDoc(doc(db, PARTICIPANTS_COLLECTION, participantId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Add or update an entry
 */
export async function saveEntryToFirestore(entry: PoopEntry) {
  const path = `${ENTRIES_COLLECTION}/${entry.id}`;
  try {
    const docRef = doc(db, ENTRIES_COLLECTION, entry.id);
    const dataToSave: Record<string, unknown> = {
      id: entry.id,
      participantId: entry.participantId,
      timestamp: entry.timestamp,
      effortLevel: Math.round(Number(entry.effortLevel)),
    };
    if (entry.durationMinutes) dataToSave.durationMinutes = Math.round(Number(entry.durationMinutes));
    if (entry.location) dataToSave.location = entry.location;
    if (entry.notes) dataToSave.notes = entry.notes;
    if (entry.createdBy) dataToSave.createdBy = entry.createdBy;

    await setDoc(docRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete an entry
 */
export async function deleteEntryFromFirestore(entryId: string) {
  const path = `${ENTRIES_COLLECTION}/${entryId}`;
  try {
    await deleteDoc(doc(db, ENTRIES_COLLECTION, entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Reset / Re-seed sample data in Firestore
 */
export async function resetFirestoreToSample() {
  try {
    // Delete existing
    const partSnap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    const entriesSnap = await getDocs(collection(db, ENTRIES_COLLECTION));

    const batch = writeBatch(db);
    partSnap.forEach((d) => batch.delete(d.ref));
    entriesSnap.forEach((d) => batch.delete(d.ref));

    for (const p of INITIAL_PARTICIPANTS) {
      const docRef = doc(db, PARTICIPANTS_COLLECTION, p.id);
      const dataToSave: Record<string, unknown> = {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        color: p.color,
        createdAt: p.createdAt,
      };
      if (p.nickname) dataToSave.nickname = p.nickname;
      batch.set(docRef, dataToSave);
    }

    for (const e of generateSeedEntries()) {
      const docRef = doc(db, ENTRIES_COLLECTION, e.id);
      const entryData: Record<string, unknown> = {
        id: e.id,
        participantId: e.participantId,
        timestamp: e.timestamp,
        effortLevel: Number(e.effortLevel),
      };
      if (e.durationMinutes) entryData.durationMinutes = Number(e.durationMinutes);
      if (e.location) entryData.location = e.location;
      if (e.notes) entryData.notes = e.notes;
      batch.set(docRef, entryData);
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'reset_data');
  }
}

/**
 * Clear ALL participants and entries in Firestore (zero the database completely)
 */
export async function clearAllFirestoreData() {
  try {
    const partSnap = await getDocs(collection(db, PARTICIPANTS_COLLECTION));
    const entriesSnap = await getDocs(collection(db, ENTRIES_COLLECTION));
    const batch = writeBatch(db);
    partSnap.forEach((d) => batch.delete(d.ref));
    entriesSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'clear_all');
  }
}

/**
 * Clear all entries in Firestore
 */
export async function clearAllEntriesFromFirestore() {
  try {
    const entriesSnap = await getDocs(collection(db, ENTRIES_COLLECTION));
    const batch = writeBatch(db);
    entriesSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, ENTRIES_COLLECTION);
  }
}
