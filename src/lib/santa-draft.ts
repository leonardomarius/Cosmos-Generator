// Personnalisation de la vidéo du Père Noël, gardée dans le navigateur du client
// pendant le paiement sur Mollie : la photo d'un enfant n'arrive sur le serveur
// qu'une fois la vidéo payée. Si le navigateur la perd (mode privé, retour dans
// un autre navigateur), l'achat reste valable : le client remplit à nouveau le
// formulaire. Aucune de ces fonctions ne lève d'erreur.
const DATABASE = "cosmos-santa";
const STORE = "drafts";
const KEY = "current";
// Au-delà, le paiement a été abandonné : on ne garde pas la photo plus longtemps.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type SantaDraft = {
  // Email du compte : un autre compte, sur le même ordinateur, n'y a pas accès.
  owner: string;
  childName: string;
  gifts: string[];
  photo: File;
  savedAt: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function saveSantaDraft(draft: Omit<SantaDraft, "savedAt">): Promise<void> {
  await withStore("readwrite", (store) => store.put({ ...draft, savedAt: Date.now() }, KEY)).catch(console.error);
}

export async function clearSantaDraft(): Promise<void> {
  await withStore("readwrite", (store) => store.delete(KEY)).catch(console.error);
}

// La commande en attente de ce compte. Toute autre est effacée.
export async function loadSantaDraft(owner: string): Promise<SantaDraft | null> {
  const draft = await withStore<SantaDraft | undefined>("readonly", (store) => store.get(KEY)).catch((err) => {
    console.error(err);
    return undefined;
  });
  if (!draft) return null;
  if (draft.owner !== owner || Date.now() - draft.savedAt > MAX_AGE_MS) {
    await clearSantaDraft();
    return null;
  }
  return draft;
}
