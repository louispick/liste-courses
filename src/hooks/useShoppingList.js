import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp, limit } from 'firebase/firestore';

export const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'items'),
      orderBy('createdAt', 'desc'),
      limit(100)
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

  const addToHistory = async (itemData) => {
    try {
        await addDoc(collection(db, 'history'), {
            name: itemData.name,
            category: itemData.category,
            defaultUnit: itemData.unit || '',
            lastBought: serverTimestamp()
        });
    } catch (e) {
        console.error("History add failed", e);
    }
  };

  const addItem = async (newItem) => {
    try {
      const existingItem = items.find(i => 
        i.name.toLowerCase() === newItem.name.toLowerCase() && 
        i.unit === newItem.unit
      );

      if (existingItem) {
        const newQty = (parseFloat(existingItem.qty) || 0) + (parseFloat(newItem.qty) || 1);
        await updateDoc(doc(db, 'items', existingItem.id), {
          qty: newQty,
          checked: false,
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'items'), {
          ...newItem,
          checked: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Add Item Error:", err);
      throw err;
    }
  };

  const updateItem = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'items', id), updates);
    } catch (err) {
      console.error("Update Item Error:", err);
      throw err;
    }
  };

  const toggleItem = async (id, currentStatus) => {
    await updateDoc(doc(db, 'items', id), {
      checked: !currentStatus
    });
  };

  const deleteItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (item) await addToHistory(item);
    await deleteDoc(doc(db, 'items', id));
  };

  const clearCheckedItems = async () => {
    const batch = writeBatch(db);
    const checkedItems = items.filter(i => i.checked);
    
    checkedItems.forEach(item => addToHistory(item));
    checkedItems.forEach(item => {
      batch.delete(doc(db, 'items', item.id));
    });

    await batch.commit();
  };

  return { items, loading, error, addItem, updateItem, toggleItem, deleteItem, clearCheckedItems };
};
