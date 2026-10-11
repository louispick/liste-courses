import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
  collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc,
  writeBatch, serverTimestamp, limit, setDoc, increment,
} from 'firebase/firestore';
import { itemKey } from '../lib/text';
import { findDuplicate, sameUnit } from '../lib/duplicates';

const ITEMS_LIMIT = 500;

// Identifiant stable pour l'historique : un produit = un document (plus de lecture avant écriture).
const historyId = (name) => itemKey(name).replace(/\s+/g, '_').slice(0, 120) || 'inconnu';

export const useShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'), limit(ITEMS_LIMIT));

    return onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore Error:', err);
        setError(err);
        setLoading(false);
      }
    );
  }, []);

  // Historique : fréquence d'achat par produit (alimente l'onglet "Top produits")
  const addToHistory = useCallback(async (item) => {
    try {
      await setDoc(
        doc(db, 'history', historyId(item.name)),
        {
          name: item.name,
          nameLowerCase: item.name.toLowerCase().trim(),
          category: item.category || 'Autre',
          defaultUnit: item.unit || '',
          frequency: increment(1),
          lastBought: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error('History add failed', e);
    }
  }, []);

  const mergeInto = async (existing, extraQty) => {
    const qty = (parseFloat(existing.qty) || 1) + (parseFloat(extraQty) || 1);
    await updateDoc(doc(db, 'items', existing.id), {
      qty,
      checked: false,
      createdAt: serverTimestamp(),
    });
    return qty;
  };

  /**
   * Ajoute un article.
   * Retourne { status: 'added' | 'merged', qty? } ou { status: 'duplicate', type, item } si une
   * confirmation de l'utilisateur est nécessaire (sauf si `options.force` ou `options.mergeWith`).
   */
  const addItem = async (newItem, options = {}) => {
    const { name, qty = 1, unit = '', category = 'Autre' } = newItem;
    const data = { name, qty, unit, category };

    if (options.mergeWith) {
      const merged = await mergeInto(options.mergeWith, qty);
      return { status: 'merged', qty: merged, item: options.mergeWith };
    }

    if (!options.force) {
      const dup = findDuplicate(name, items);
      if (dup) {
        if (dup.type === 'exact' && sameUnit(dup.item.unit, unit)) {
          const merged = await mergeInto(dup.item, qty);
          return { status: 'merged', qty: merged, item: dup.item };
        }
        return { status: 'duplicate', type: dup.type, item: dup.item };
      }
    }

    await addDoc(collection(db, 'items'), { ...data, checked: false, createdAt: serverTimestamp() });
    return { status: 'added' };
  };

  const updateItem = (id, updates) => updateDoc(doc(db, 'items', id), updates);

  const toggleItem = (id, currentStatus) =>
    updateDoc(doc(db, 'items', id), { checked: !currentStatus });

  const deleteItem = async (id) => {
    const item = items.find((i) => i.id === id);
    if (item) await addToHistory(item);
    await deleteDoc(doc(db, 'items', id));
  };

  const clearCheckedItems = async () => {
    const checked = items.filter((i) => i.checked);
    if (checked.length === 0) return;

    await Promise.all(checked.map(addToHistory));

    // Firestore limite un batch à 500 opérations
    for (let i = 0; i < checked.length; i += 400) {
      const batch = writeBatch(db);
      checked.slice(i, i + 400).forEach((item) => batch.delete(doc(db, 'items', item.id)));
      await batch.commit();
    }
  };

  return { items, loading, error, addItem, updateItem, toggleItem, deleteItem, clearCheckedItems };
};
