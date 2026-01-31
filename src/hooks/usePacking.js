import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';

export const usePacking = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Catégories fixes demandées
  const CATEGORIES = ["Général", "Mathilde", "Louis", "Isao"];

  useEffect(() => {
    const q = query(
      collection(db, 'packing'),
      orderBy('createdAt', 'asc') // On garde l'ordre d'ajout, plus logique pour une liste fixe
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(parsed);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const addItem = async (name, category) => {
    if (!name.trim()) return;
    
    // On permet les doublons de noms (ex: "Pantalon" pour Louis et "Pantalon" pour Isao)
    // Mais on évite les doublons stricts (Même nom DANS la même catégorie)
    const exists = items.some(i => i.name.toLowerCase() === name.toLowerCase() && i.category === category);
    
    if (!exists) {
        await addDoc(collection(db, 'packing'), {
          name: name.trim(),
          category,
          checked: false,
          createdAt: serverTimestamp()
        });
    }
  };

  const toggleItem = async (id, currentStatus) => {
    await updateDoc(doc(db, 'packing', id), {
      checked: !currentStatus
    });
  };

  const deleteItem = async (id) => {
    if(confirm("Supprimer définitivement cet objet de la liste type ?")) {
        await deleteDoc(doc(db, 'packing', id));
    }
  };

  const resetAll = async () => {
    if(!confirm("Tout décocher pour préparer le prochain voyage ?")) return;

    const batch = writeBatch(db);
    // On ne prend que ceux qui sont cochés pour économiser des écritures
    const checkedItems = items.filter(i => i.checked);
    
    checkedItems.forEach(item => {
      batch.update(doc(db, 'packing', item.id), { checked: false });
    });

    await batch.commit();
  };

  return { items, loading, addItem, toggleItem, deleteItem, resetAll, CATEGORIES };
};
