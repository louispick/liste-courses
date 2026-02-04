import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { PICTIONARY_WORDS } from '../lib/pictionaryWords';

export const usePictionary = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  const GAME_ID = "pictionary_v1";

  useEffect(() => {
    if (!user) return;

    const gameRef = doc(db, 'games', GAME_ID);
    
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        // Init
        setDoc(gameRef, {
          status: 'WAITING_FOR_DRAWING', // 'WAITING_FOR_DRAWING' | 'WAITING_FOR_GUESS'
          currentDrawer: null, // email
          currentWord: null,
          currentDrawing: null, // base64
          history: [] // [{ word, drawer, guesser, success: true }]
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const startGame = async (word) => {
      if (!user) return;
      const gameRef = doc(db, 'games', GAME_ID);
      
      await updateDoc(gameRef, {
          status: 'DRAWING', // État intermédiaire local
          currentDrawer: user.email,
          currentWord: word,
          currentDrawing: null
      });
  };

  const submitDrawing = async (base64Image) => {
      const gameRef = doc(db, 'games', GAME_ID);
      await updateDoc(gameRef, {
          status: 'WAITING_FOR_GUESS',
          currentDrawing: base64Image,
          timestamp: Date.now()
      });
  };

  const submitGuess = async (success) => {
      const gameRef = doc(db, 'games', GAME_ID);
      
      // On archive le tour
      // Et on remet à zéro pour que l'AUTRE dessine (idéalement)
      // Ici on repasse juste en WAITING_FOR_DRAWING, premier arrivé premier servi pour dessiner
      
      await updateDoc(gameRef, {
          status: 'WAITING_FOR_DRAWING',
          currentDrawer: null,
          currentWord: null,
          currentDrawing: null
      });
  };

  return { gameState, loading, startGame, submitDrawing, submitGuess, user };
};
