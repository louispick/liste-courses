import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';

export const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('checked', '==', false), // Only show unchecked items in main list
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(parsed);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addItem = async (itemData) => {
    // Check for duplicates handled in UI or here? UI is better for user confirmation.
    // This function just adds.
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

  return { items, loading, addItem, toggleItem, deleteItem };
};
