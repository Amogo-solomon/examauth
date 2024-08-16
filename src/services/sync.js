// src/services/sync.js
import { getAllCandidates, addCandidate } from './indexedDB';

const syncData = async () => {
    if (navigator.onLine) {
      // Fetch candidates from local storage
      const candidates = await getAllCandidates();
  
      // Send the candidates to the server
      await fetch('/api/sync-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidates),
      });
    }
  };
  
  // Listen for online status
  window.addEventListener('online', syncData);
  
  // Export the syncData function
  export { syncData };
  