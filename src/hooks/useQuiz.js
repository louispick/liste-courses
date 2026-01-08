import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './useAuth';

export const useQuiz = () => {
  const { user } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);

  // ID unique pour le jeu de couple (on pourrait utiliser un ID combiné des userIds, 
  // mais pour simplifier on utilise un ID fixe "couple_game_1" car il n'y a qu'un couple)
  const GAME_ID = "couple_game_1";

  useEffect(() => {
    if (!user) return;

    const gameRef = doc(db, 'games', GAME_ID);
    
    const unsubscribe = onSnapshot(gameRef, (docSnap) => {
      if (docSnap.exists()) {
        setGameState(docSnap.data());
      } else {
        // Initialiser le jeu si inexistant
        setDoc(gameRef, {
          scores: { total: 0 },
          answers: {}, // Structure: { questionId: { userEmail: { self: 'A', partner: 'B' } } }
          progress: {} // Structure: { userEmail: lastQuestionIndex }
        });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const submitAnswer = async (questionId, selfAnswer, partnerPrediction) => {
    if (!user || !gameState) return;

    const gameRef = doc(db, 'games', GAME_ID);
    const userEmail = user.email;

    // 1. Enregistrer la réponse
    const answerPath = `answers.${questionId}.${userEmail.replace(/\./g, '_')}`; // Firebase n'aime pas les points dans les clés
    
    await updateDoc(gameRef, {
      [answerPath]: {
        self: selfAnswer,
        partner: partnerPrediction,
        timestamp: Date.now()
      }
    });

    // 2. Vérifier si l'autre a déjà répondu pour calculer les points
    // On doit le faire côté serveur idéalement, mais ici on le fait en optimiste ou à la lecture
    // Pour simplifier, on stocke juste les réponses brutes.
    // Le calcul des points se fera à l'affichage (computed).
  };

  return { gameState, loading, submitAnswer, user };
};
