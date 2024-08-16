import { openDB } from 'idb';

// Open IndexedDB
const dbPromise = openDB('exam-auth-db', 1, {
  upgrade(db) {
    // Create object stores with key paths
    db.createObjectStore('users', { keyPath: 'email' });
    db.createObjectStore('candidates', { keyPath: 'email' });
  },
});

// Add or update a user
export const addUser = async (user) => {
  const db = await dbPromise;

  // Ensure the user object has an email property
  if (!user.email) {
    throw new Error('User object must have an email property.');
  }

  await db.put('users', user);
};

// Retrieve a user
export const getUser = async (email) => {
  const db = await dbPromise;
  return db.get('users', email);
};

// Add or update a candidate
export const addCandidate = async (candidate) => {
  const db = await dbPromise;

  // Ensure the candidate object has an email property
  if (!candidate.email) {
    throw new Error('Candidate object must have an email property.');
  }

  // Ensure faceDescriptors is an array
  candidate.faceDescriptors = candidate.faceDescriptors || [];
  await db.put('candidates', candidate);
};

// Retrieve a candidate
export const getCandidate = async (email) => {
  const db = await dbPromise;
  return db.get('candidates', email);
};

// Retrieve all candidates
export const getAllCandidates = async () => {
  const db = await dbPromise;
  return db.getAll('candidates');
};

// Delete a candidate
export const deleteCandidate = async (email) => {
  const db = await dbPromise;
  await db.delete('candidates', email);
};
