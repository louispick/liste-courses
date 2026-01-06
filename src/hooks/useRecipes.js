import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parsed = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecipes(parsed);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const addRecipe = async (title, ingredients) => {
    await addDoc(collection(db, 'recipes'), {
      title,
      ingredients
    });
  };

  const updateRecipe = async (id, title, ingredients) => {
    await updateDoc(doc(db, 'recipes', id), {
        title,
        ingredients
    });
  };

  const deleteRecipe = async (id) => {
    await deleteDoc(doc(db, 'recipes', id));
  };

  return { recipes, loading, addRecipe, updateRecipe, deleteRecipe };
};
