import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, where, serverTimestamp } from 'firebase/firestore';

export const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      where('checked', '==', false), // Only show unchecked items in main list
      orderBy('createdAt', 'desc')
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
    try {
      await addDoc(collection(db, 'items'), {
        ...itemData,
        checked: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Add Item Error:", err);
      throw err;
    }
  };

  const toggleItem = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'items', id), {
        checked: !currentStatus
      });
    } catch (err) {
      console.error("Toggle Item Error:", err);
      throw err;
    }
  };

  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, 'items', id));
    } catch (err) {
      console.error("Delete Item Error:", err);
      throw err;
    }
  };

  return { items, loading, error, addItem, toggleItem, deleteItem };
};
