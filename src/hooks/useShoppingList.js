import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp, limit } from 'firebase/firestore';

export const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SIMPLIFICATION : On ne filtre plus par 'checked' ici pour éviter le besoin d'index composite.
    // On trie juste par date. Le tri "Coché/Pas coché" se fera côté client.
    const q = query(
      collection(db, 'items'),
      orderBy('createdAt', 'desc'),
      limit(100) // Sécurité pour ne pas charger 1000 items
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const parsed = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(parsed);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const addItem = async (itemData) => {
    await addDoc(collection(db, 'items'), {
      ...itemData,
      checked: false,
      createdAt: serverTimestamp()
    });
  };

  const toggleItem = async (id, currentStatus) => {
    await updateDoc(doc(db, 'items', id), {
      checked: !currentStatus
    });
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const clearCheckedItems = async () => {
    const batch = writeBatch(db);
    const checkedItems = items.filter(i => i.checked);
    
    checkedItems.forEach(item => {
      batch.delete(doc(db, 'items', item.id));
    });

    await batch.commit();
  };

  return { items, loading, error, addItem, toggleItem, deleteItem, clearCheckedItems };
};
