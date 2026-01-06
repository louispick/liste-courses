import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp, limit, getDocs, where } from 'firebase/firestore';

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

  // INTELLIGENCE HISTORIQUE : Gestion de la fréquence
  const addToHistory = async (itemData) => {
    try {
        // 1. On normalise le nom pour la recherche (minuscule)
        const normalizedName = itemData.name.toLowerCase().trim();

        // 2. On cherche si cet item existe déjà dans l'historique
        const q = query(collection(db, 'history'), where('nameLowerCase', '==', normalizedName));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            // IL EXISTE : On incrémente la fréquence
            const docRef = snapshot.docs[0].ref;
            const currentFreq = snapshot.docs[0].data().frequency || 1;
            
            await updateDoc(docRef, {
                frequency: currentFreq + 1,
                lastBought: serverTimestamp(),
                defaultUnit: itemData.unit || snapshot.docs[0].data().defaultUnit // On garde l'unité la plus récente si dispo
            });
        } else {
            // NOUVEAU : On crée l'entrée avec fréquence 1
            await addDoc(collection(db, 'history'), {
                name: itemData.name,
                nameLowerCase: normalizedName, // Champ utile pour la recherche insensible à la casse
                category: itemData.category,
                defaultUnit: itemData.unit || '',
                frequency: 1,
                lastBought: serverTimestamp()
            });
        }
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
    
    // On traite l'historique un par un (nécessaire pour la vérification d'existence)
    // On ne le fait pas dans le batch car lecture requise avant écriture
    for (const item of checkedItems) {
        await addToHistory(item);
    }

    checkedItems.forEach(item => {
      batch.delete(doc(db, 'items', item.id));
    });

    await batch.commit();
  };

  return { items, loading, error, addItem, updateItem, toggleItem, deleteItem, clearCheckedItems };
};
