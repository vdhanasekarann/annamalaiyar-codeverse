const DB_NAME = "cv_assets";
const STORE_NAME = "backgrounds";

function openDb() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("IndexedDB not supported"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

function runTransaction(mode, work) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        work(store, resolve, reject);
        tx.oncomplete = () => db.close();
        tx.onerror = () => reject(tx.error || new Error("IndexedDB transaction failed"));
      })
  );
}

export async function saveBackground(email, file) {
  if (!email || !file) return;
  const key = `bg_${email}`;

  await runTransaction("readwrite", (store, resolve, reject) => {
    const req = store.put(file, key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error("Failed to store background"));
  });
}

export async function getBackgroundObjectUrl(email) {
  if (!email) return null;
  const key = `bg_${email}`;

  const blob = await runTransaction("readonly", (store, resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error || new Error("Failed to load background"));
  });

  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function clearBackground(email) {
  if (!email) return;
  const key = `bg_${email}`;

  await runTransaction("readwrite", (store, resolve, reject) => {
    const req = store.delete(key);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error || new Error("Failed to clear background"));
  });
}
