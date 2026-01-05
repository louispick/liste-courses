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

  // Fonction utilitaire pour ajouter à l'historique
  const addToHistory = async (itemData) => {
    try {
        // On vérifie si l'item existe déjà dans l'historique pour mettre à jour son compteur "frequence"
        // Note: Pour faire simple et économiser les lectures, on ajoute juste brut pour l'instant
        // L'intelligence de regroupement se fera à l'affichage ou via une Cloud Function plus tard.
        // Ici on ajoute juste un doc simple.
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
      // 1. Chercher si l'item existe déjà (Non coché ou Coché)
      // On cherche une correspondance exacte sur le nom et l'unité pour pouvoir fusionner
      const existingItem = items.find(i => 
        i.name.toLowerCase() === newItem.name.toLowerCase() && 
        i.unit === newItem.unit
      );

      if (existingItem) {
        // FUSION : On met à jour la quantité
        const newQty = (parseFloat(existingItem.qty) || 0) + (parseFloat(newItem.qty) || 1);
        
        await updateDoc(doc(db, 'items', existingItem.id), {
          qty: newQty,
          checked: false, // On le remonte en "A acheter" si il était coché
          createdAt: serverTimestamp() // On le remonte en haut de liste
        });
      } else {
        // NOUVEAU
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

  const toggleItem = async (id, currentStatus) => {
    await updateDoc(doc(db, 'items', id), {
      checked: !currentStatus
    });
  };

  const deleteItem = async (id) => {
    const item = items.find(i => i.id === id);
    if (item) await addToHistory(item); // Sauvegarde en historique
    await deleteDoc(doc(db, 'items', id));
  };

  const clearCheckedItems = async () => {
    const batch = writeBatch(db);
    const checkedItems = items.filter(i => i.checked);
    
    // On ajoute tout à l'historique (en background, pas bloquant pour le batch delete)
    checkedItems.forEach(item => addToHistory(item));

    checkedItems.forEach(item => {
      batch.delete(doc(db, 'items', item.id));
    });

    await batch.commit();
  };

  return { items, loading, error, addItem, toggleItem, deleteItem, clearCheckedItems };
};
