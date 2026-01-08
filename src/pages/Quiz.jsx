import { useState, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../lib/questions';
import { Heart, Loader2, ArrowRight, Hourglass, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export default function Quiz() {
  const { gameState, loading, submitAnswer, user } = useQuiz();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // États temporaires pour le formulaire de réponse
  const [step, setStep] = useState('self'); // 'self' (pour moi) -> 'partner' (pour l'autre) -> 'result'
  const [myChoice, setMyChoice] = useState(null);
  const [prediction, setPrediction] = useState(null);

  // Calculer l'état du jeu
  useEffect(() => {
    if (!gameState || !user) return;
    
    // Trouver la première question non répondue par MOI
    const userKey = user.email.replace(/\./g, '_');
    let firstUnanswered = 0;
    
    // On parcourt les questions dans l'ordre
    for (let i = 0; i < QUESTIONS.length; i++) {
        const qId = QUESTIONS[i].id;
        const answers = gameState.answers?.[qId];
        if (!answers?.[userKey]) {
            firstUnanswered = i;
            break;
        }
    }
    setCurrentQIndex(firstUnanswered);
  }, [gameState, user]);

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-sun-yellow" /></div>;

  const currentQuestion = QUESTIONS[currentQIndex];
  const userKey = user.email.replace(/\./g, '_');
  
  // Calcul du score global
  let totalHearts = 0;
  let opponentProgress = 0;
  
  if (gameState && gameState.answers) {
      Object.keys(gameState.answers).forEach(qId => {
          const qAnswers = gameState.answers[qId];
          const users = Object.keys(qAnswers);
          
          if (users.length === 2) {
              const u1 = qAnswers[users[0]];
              const u2 = qAnswers[users[1]];
              
              // Points : 
              // u1 a bien prédit u2 ? (+1)
              // u2 a bien prédit u1 ? (+1)
              if (u1.partner === u2.self) totalHearts++;
              if (u2.partner === u1.self) totalHearts++;
          }
      });
      
      // Trouver la progression de l'adversaire (optimiste)
      // On cherche une clé qui n'est pas la mienne
      const otherKey = Object.keys(gameState.answers?.[1] || {}).find(k => k !== userKey); // Check question 1 pour trouver l'email de l'autre
      if(otherKey) {
          // Compter combien de réponses a l'autre
          opponentProgress = Object.values(gameState.answers).filter(a => a[otherKey]).length;
      }
  }
  
  const myProgress = currentQIndex;
  const diff = myProgress - opponentProgress;

  const handleSelfChoice = (choice) => {
      setMyChoice(choice);
      setStep('partner');
  };

  const handlePartnerChoice = async (choice) => {
      setPrediction(choice);
      setStep('sending');
      await submitAnswer(currentQuestion.id, myChoice, choice);
      // Reset pour la suivante (le useEffect va nous faire passer à la suivante automatiquement)
      setStep('self');
      setMyChoice(null);
      setPrediction(null);
  };

  if (!currentQuestion) return (
      <div className="pt-10 text-center px-4">
          <h2 className="text-2xl font-bold text-deep-blue mb-4">Bravo ! 🎉</h2>
          <p className="text-gray-600">Vous avez terminé toutes les questions disponibles !</p>
          <div className="mt-8 bg-white p-6 rounded-3xl soft-shadow inline-block">
              <Heart className="w-12 h-12 text-red-500 mx-auto mb-2 fill-red-500" />
              <span className="text-4xl font-black text-deep-blue">{totalHearts}</span>
              <p className="text-sm text-gray-400 mt-1">Coeurs cumulés</p>
          </div>
      </div>
  );

  return (
    <div className="pt-4 pb-24 px-4 max-w-sm mx-auto h-[80vh] flex flex-col">
      {/* Header Score */}
      <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl soft-shadow">
          <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              <span className="font-bold text-xl text-deep-blue">{totalHearts}</span>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
              Question {currentQIndex + 1}
          </div>
      </div>

      {/* Carte Question */}
      <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 soft-shadow text-center relative overflow-hidden">
            {/* Barre de progression relative */}
            {diff > 0 && (
                <div className="absolute top-0 left-0 right-0 bg-orange-100 py-1 text-[10px] text-orange-600 font-bold">
                    Tu as {diff} questions d'avance ! Attends Mathilde ⏳
                </div>
            )}
            {diff < 0 && (
                <div className="absolute top-0 left-0 right-0 bg-green-100 py-1 text-[10px] text-green-600 font-bold">
                    Tu as {Math.abs(diff)} questions de retard ! Rattrape-la 🏃
                </div>
            )}

            <h2 className="text-2xl font-bold text-deep-blue mb-8 mt-4">
                {currentQuestion.text}
            </h2>

            {step === 'self' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
                        Pour toi ?
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleSelfChoice('A')}
                            className="w-full py-4 rounded-xl bg-off-white hover:bg-sun-yellow/20 border-2 border-transparent hover:border-sun-yellow transition-all font-bold text-lg text-deep-blue"
                        >
                            {currentQuestion.a}
                        </button>
                        <div className="text-gray-300 text-sm font-bold">OU</div>
                        <button 
                            onClick={() => handleSelfChoice('B')}
                            className="w-full py-4 rounded-xl bg-off-white hover:bg-sun-yellow/20 border-2 border-transparent hover:border-sun-yellow transition-all font-bold text-lg text-deep-blue"
                        >
                            {currentQuestion.b}
                        </button>
                    </div>
                </div>
            )}

            {step === 'partner' && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                    <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
                        Pour Elle/Lui ?
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => handlePartnerChoice('A')}
                            className="w-full py-4 rounded-xl bg-off-white hover:bg-deep-blue/10 border-2 border-transparent hover:border-deep-blue transition-all font-bold text-lg text-deep-blue"
                        >
                            {currentQuestion.a}
                        </button>
                        <div className="text-gray-300 text-sm font-bold">OU</div>
                        <button 
                            onClick={() => handlePartnerChoice('B')}
                            className="w-full py-4 rounded-xl bg-off-white hover:bg-deep-blue/10 border-2 border-transparent hover:border-deep-blue transition-all font-bold text-lg text-deep-blue"
                        >
                            {currentQuestion.b}
                        </button>
                    </div>
                </div>
            )}
            
            {step === 'sending' && (
                <div className="py-10">
                    <Loader2 className="w-10 h-10 text-sun-yellow animate-spin mx-auto" />
                </div>
            )}
          </div>
      </div>
      
      {/* Footer Info */}
      <div className="mt-6 text-center text-xs text-gray-400">
          Répondez spontanément ! ❤️
      </div>
    </div>
  );
}
