import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { QUESTIONS } from '../lib/questions';

const BATCH_SIZE = 20;

export const useQuiz = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  // v2 : nouvelle banque de questions (ids repartis de 1). L'ancienne partie reste intacte dans
  // Firestore sous "couple_game_1" ; repasser à cet identifiant la fait réapparaître (avec l'ancien
  // fichier de questions).
  const GAME_ID = "couple_game_2";

  useEffect(() => {
    if (!user) return;

    const gameRef = doc(db, 'games', GAME_ID);
    
    const unsubscribe = onSnapshot(
      gameRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setGameState(docSnap.data());
        } else {
          // merge : si les deux joueurs ouvrent le jeu en même temps, on n'écrase rien
          setDoc(gameRef, { answers: {}, lastSeen: {}, currentSession: 1, sessionHistory: {} }, { merge: true });
        }
        setLoading(false);
      },
      (err) => {
        console.error('Quiz Firestore error:', err);
        setLoading(false);
      }
    );

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
      
      // On sauvegarde la session ET on incrémente currentSession
      // Utilisation de la syntaxe Map pour ne pas perdre l'historique existant
      await updateDoc(gameRef, {
          [`sessionHistory.s${sessionData.id}`]: sessionData,
          currentSession: sessionData.id + 1
      });
  };

  // Réinitialiser UNIQUEMENT la session ciblée (pour "Rejouer" ou "Reset Current")
  const resetSessionData = async (sessionIdToReset) => {
      if (!gameState) return;
      const gameRef = doc(db, 'games', GAME_ID);
      
      const start = (sessionIdToReset - 1) * BATCH_SIZE;
      const end = sessionIdToReset * BATCH_SIZE;
      
      // 1. On supprime les réponses de cette plage
      const updates = {};
      for (let i = start; i < end; i++) {
          if (i >= QUESTIONS.length) break;
          const qId = QUESTIONS[i].id;
          // Note: deleteField() sur une map nested marche avec dot notation
          updates[`answers.${qId}`] = deleteField();
      }

      // 2. On définit cette session comme la courante
      updates['currentSession'] = sessionIdToReset;

      // 3. (Optionnel) On supprime l'entrée historique si on la rejoue ? 
      // Non, on garde l'ancien score jusqu'à ce qu'il soit écrasé par le nouveau 'completeSession'
      // C'est plus sympa de voir "Ah j'avais fait 15/20 avant".

      await updateDoc(gameRef, updates);
  };

  return { gameState, loading, submitAnswer, updateLastSeen, completeSession, resetSessionData, user };
};
