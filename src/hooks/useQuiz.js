import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
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
        setDoc(gameRef, {
          answers: {}, 
          lastSeen: {},
          currentSession: 1,
          sessionHistory: {} // Changement: Object/Map au lieu d'Array pour éviter les doublons
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const submitAnswer = async (questionId, selfAnswer, partnerPrediction) => {
    if (!user) return;
    const gameRef = doc(db, 'games', GAME_ID);
    const userEmail = user.email.replace(/\./g, '_');
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
      await updateDoc(gameRef, {
          [`lastSeen.${userEmail}`]: questionIndex
      });
  };

  const completeSession = async (sessionData) => {
      const gameRef = doc(db, 'games', GAME_ID);
      
      // Utilisation d'une clé map pour éviter les doublons (idempotence)
      // Si Mathilde et Louis envoient la même chose, ça écrase au lieu d'ajouter
      await updateDoc(gameRef, {
          [`sessionHistory.s${sessionData.id}`]: sessionData,
          currentSession: sessionData.id + 1 // On force la valeur suivante explicitement
      });
  };

  const resetGame = async () => {
      if(!confirm("⚠️ Attention : Cela va effacer TOUS les scores et recommencer le jeu à zéro pour vous deux. Continuer ?")) return;
      
      const gameRef = doc(db, 'games', GAME_ID);
      await setDoc(gameRef, {
          answers: {},
          lastSeen: {},
          currentSession: 1,
          sessionHistory: {}
      });
      window.location.reload();
  };

  return { gameState, loading, submitAnswer, updateLastSeen, completeSession, resetGame, user };
};
