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
          currentSession: 1, // Nouvelle propriété
          sessionHistory: [] // [{ id: 1, hearts: 15, errors: 5, date: ... }]
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
      
      // On archive la session et on passe à la suivante
      // On utilise arrayUnion pour ajouter à l'historique
      // On incrémente currentSession
      
      // Note: Pour éviter que les deux cliquent en même temps et incrémentent 2 fois,
      // on vérifie si la session actuelle en base est bien celle qu'on veut fermer.
      // Mais avec Firestore increment, c'est atomique. On va juste check côté UI.
      
      await updateDoc(gameRef, {
          sessionHistory: arrayUnion(sessionData),
          currentSession: increment(1)
      });
  };

  const resetGame = async () => {
      if(!confirm("⚠️ Attention : Cela va effacer TOUS les scores et recommencer le jeu à zéro pour vous deux. Continuer ?")) return;
      
      const gameRef = doc(db, 'games', GAME_ID);
      await setDoc(gameRef, {
          answers: {},
          lastSeen: {},
          currentSession: 1,
          sessionHistory: []
      });
      window.location.reload();
  };

  return { gameState, loading, submitAnswer, updateLastSeen, completeSession, resetGame, user };
};
