import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

export const useQuiz = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  const GAME_ID = "couple_game_1";

  useEffect(() => {
    if (!user) return;

    const gameRef = doc(db, 'games', GAME_ID);
    
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        // Init si vide
        setDoc(gameRef, {
          answers: {}, 
          lastSeen: {} // { 'louis_gmail_com': 12 } (index de la dernière question vue)
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const submitAnswer = async (questionId, selfAnswer, partnerPrediction) => {
    if (!user) return;
    const gameRef = doc(db, 'games', GAME_ID);
    const userEmail = user.email.replace(/\./g, '_'); // Firebase key safe

    // Update deep nested object
    const answerPath = `answers.${questionId}.${userEmail}`;
    
    await updateDoc(gameRef, {
      [answerPath]: {
        self: selfAnswer,
        partner: partnerPrediction,
        timestamp: Date.now()
      }
    });
  };

  const updateLastSeen = async (questionIndex) => {
      if (!user) return;
      const gameRef = doc(db, 'games', GAME_ID);
      const userEmail = user.email.replace(/\./g, '_');
      
      // On met à jour seulement si on avance
      await updateDoc(gameRef, {
          [`lastSeen.${userEmail}`]: questionIndex
      });
  };

  const resetGame = async () => {
      if(!confirm("⚠️ Attention : Cela va effacer TOUS les scores et recommencer le jeu à zéro pour vous deux. Continuer ?")) return;
      
      const gameRef = doc(db, 'games', GAME_ID);
      await setDoc(gameRef, {
          answers: {},
          lastSeen: {}
      });
      window.location.reload();
  };

  return { gameState, loading, submitAnswer, updateLastSeen, resetGame, user };
};
