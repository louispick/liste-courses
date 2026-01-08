import { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../lib/questions';
import { Heart, Loader2, RefreshCw, HeartCrack, Sparkles, Hourglass, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';

export default function Quiz() {
  const { gameState, loading, submitAnswer, updateLastSeen, resetGame, user } = useQuiz();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // États UI
  const [step, setStep] = useState('self'); 
  const [myChoice, setMyChoice] = useState(null);
  const [newHearts, setNewHearts] = useState(0); 
  const [showNewHearts, setShowNewHearts] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false); // Célébration temps réel

  // Identification
  const myName = user?.email.includes('louis') ? 'Louis' : (user?.email.includes('mathilde') ? 'Mathilde' : 'Toi');
  const partnerName = myName === 'Louis' ? 'Mathilde' : (myName === 'Mathilde' ? 'Louis' : 'Partenaire');

  // Refs pour comparaison (détection changement score)
  const prevHeartsRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // --- CALCUL DU SCORE & PROGRESSION ---
  let totalHearts = 0;
  let totalErrors = 0;
  let myProgress = 0;
  let partnerProgress = 0;

  if (gameState && gameState.answers) {
      const userKey = user.email.replace(/\./g, '_');
      
      // 1. Calcul des points
      Object.keys(gameState.answers).forEach(qId => {
          const qAnswers = gameState.answers[qId];
          const users = Object.keys(qAnswers);
          
          if (users.length === 2) {
              const u1 = Object.values(qAnswers)[0];
              const u2 = Object.values(qAnswers)[1];
              
              const match1 = u1.partner === u2.self;
              const match2 = u2.partner === u1.self;

              if (match1 && match2) {
                  totalHearts++;
              } else {
                  totalErrors++;
              }
          }
      });

      // 2. Calcul de l'avancement
      for (let i = 0; i < QUESTIONS.length; i++) {
          const qId = QUESTIONS[i].id;
          if (!gameState.answers[qId]?.[userKey]) {
              myProgress = i;
              break;
          }
          if (i === QUESTIONS.length - 1) myProgress = QUESTIONS.length;
      }

      const otherKey = Object.keys(gameState.answers?.[1] || {}).find(k => k !== userKey) 
                       || Object.keys(gameState.answers?.[QUESTIONS[0].id] || {}).find(k => k !== userKey);
      if (otherKey) {
          partnerProgress = Object.values(gameState.answers).filter(a => a[otherKey]).length;
      }

      // 3. Détection "Pendant ton absence" (Au chargement seulement)
      if (isFirstLoadRef.current) {
          const lastSeenIndex = gameState.lastSeen?.[userKey] || 0;
          if (myProgress > lastSeenIndex) {
              let heartsBefore = 0;
              Object.keys(gameState.answers).forEach((qId) => {
                  const qIndex = QUESTIONS.findIndex(q => q.id === parseInt(qId));
                  if (qIndex < lastSeenIndex) {
                      const qa = gameState.answers[qId];
                      if (Object.keys(qa).length === 2) {
                          const v = Object.values(qa);
                          if (v[0].partner === v[1].self && v[1].partner === v[0].self) heartsBefore++;
                      }
                  }
              });
              
              const diff = totalHearts - heartsBefore;
              if (diff > 0) {
                  setNewHearts(diff);
                  setShowNewHearts(true);
              }
          }
          isFirstLoadRef.current = false;
      }
  }

  // --- EFFET CÉLÉBRATION (Temps Réel) ---
  useEffect(() => {
      // Si le score augmente et que ce n'est pas le premier chargement
      if (!isFirstLoadRef.current && totalHearts > prevHeartsRef.current) {
          setShowCelebration(true);
          const timer = setTimeout(() => setShowCelebration(false), 2500);
          return () => clearTimeout(timer);
      }
      prevHeartsRef.current = totalHearts;
  }, [totalHearts]);

  // --- NAVIGATION AUTO (Mise à jour index) ---
  useEffect(() => {
      if (!gameState) return;
      // On ne met à jour l'index automatiquement QUE si on avance (pour éviter de gêner le bouton retour)
      // Ou si c'est l'init
      if (myProgress > currentQIndex || (currentQIndex === 0 && myProgress > 0)) {
          setCurrentQIndex(myProgress);
      }

      if (!showNewHearts && myProgress > (gameState.lastSeen?.[user.email.replace(/\./g, '_')] || 0)) {
           updateLastSeen(myProgress);
      }
  }, [gameState, myProgress, showNewHearts]);

  // ACTIONS
  const handleSelfChoice = (choice) => {
      setMyChoice(choice);
      setStep('partner');
  };

  const handlePartnerChoice = async (choice) => {
      setStep('sending');
      await submitAnswer(QUESTIONS[currentQIndex].id, myChoice, choice);
      setStep('self');
      setMyChoice(null);
  };

  const handleBack = () => {
      if (step === 'partner') {
          // Annuler l'étape 2, revenir à l'étape 1
          setStep('self');
          setMyChoice(null);
      } else if (currentQIndex > 0) {
          // Revenir à la question précédente
          setCurrentQIndex(prev => prev - 1);
          setStep('self');
          setMyChoice(null);
      }
  };

  const closeNewHearts = () => {
      setShowNewHearts(false);
      updateLastSeen(myProgress);
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-sun-yellow" /></div>;

  const diff = myProgress - partnerProgress;

  return (
    <div className="pt-4 pb-24 px-4 max-w-sm mx-auto h-[80vh] flex flex-col relative">
      
      {/* CÉLÉBRATION TEMPS RÉEL */}
      {showCelebration && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="animate-float-up">
                  <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl" />
                  <div className="text-center mt-2 font-black text-white text-xl bg-red-500 px-4 py-1 rounded-full shadow-lg">
                      MATCH !
                  </div>
              </div>
          </div>
      )}

      {/* MODALE RETOUR */}
      {showNewHearts && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
              <div className="bg-white rounded-3xl p-8 soft-shadow text-center border-4 border-sun-yellow transform animate-in zoom-in duration-300">
                  <Sparkles className="w-12 h-12 text-sun-yellow mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-deep-blue mb-2">Pendant ton absence...</h3>
                  <div className="text-6xl font-black text-red-500 mb-2 drop-shadow-sm">
                      +{newHearts}
                  </div>
                  <p className="text-xl font-bold text-red-400 mb-8">Nouveaux Cœurs !</p>
                  <button onClick={closeNewHearts} className="w-full bg-deep-blue text-white font-bold py-3 rounded-xl">
                      Continuer
                  </button>
              </div>
          </div>
      )}

      {/* HEADER SCORE */}
      <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl soft-shadow relative">
          {/* Bouton Retour */}
          {(currentQIndex > 0 || step === 'partner') && (
              <button 
                onClick={handleBack}
                className="absolute left-[-16px] bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-deep-blue"
              >
                  <ArrowLeft className="w-5 h-5" />
              </button>
          )}

          <div className={clsx("flex gap-4", (currentQIndex > 0 || step === 'partner') && "ml-8")}>
            <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <span className="font-bold text-xl text-deep-blue">{totalHearts}</span>
            </div>
            <div className="flex items-center gap-2 opacity-50">
                <HeartCrack className="w-6 h-6 text-gray-400" />
                <span className="font-bold text-xl text-gray-500">{totalErrors}</span>
            </div>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
              Q{currentQIndex + 1}
          </div>
      </div>

      {/* CARTE QUESTION */}
      <div className="flex-1 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 soft-shadow text-center relative overflow-hidden transition-all duration-500">
            
            {/* Indicateur Avance/Retard */}
            {diff > 0 && (
                <div className="absolute top-0 left-0 right-0 bg-orange-100 py-2 text-[11px] text-orange-600 font-bold flex items-center justify-center gap-2">
                    <Hourglass className="w-3 h-3" />
                    Attends {partnerName}, tu as {diff} questions d'avance !
                </div>
            )}
            {diff < 0 && (
                <div className="absolute top-0 left-0 right-0 bg-deep-blue py-2 text-[11px] text-white font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-sun-yellow" />
                    Rattrape {partnerName}, tu as {Math.abs(diff)} questions de retard !
                </div>
            )}

            <h2 className="text-2xl font-bold text-deep-blue mb-8 mt-6 min-h-[64px] flex items-center justify-center">
                {QUESTIONS[currentQIndex]?.text || "Fini !"}
            </h2>

            {QUESTIONS[currentQIndex] ? (
                <>
                    {step === 'self' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
                                Pour toi ?
                            </p>
                            <div className="space-y-3">
                                <ChoiceBtn onClick={() => handleSelfChoice(QUESTIONS[currentQIndex].a)} label={QUESTIONS[currentQIndex].a} selected={myChoice === QUESTIONS[currentQIndex].a} />
                                <div className="text-gray-300 text-xs font-bold my-1">OU</div>
                                <ChoiceBtn onClick={() => handleSelfChoice(QUESTIONS[currentQIndex].b)} label={QUESTIONS[currentQIndex].b} selected={myChoice === QUESTIONS[currentQIndex].b} />
                            </div>
                        </div>
                    )}

                    {step === 'partner' && (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                            <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">
                                Pour {partnerName} ?
                            </p>
                            <div className="space-y-3">
                                <ChoiceBtn onClick={() => handlePartnerChoice(QUESTIONS[currentQIndex].a)} label={QUESTIONS[currentQIndex].a} variant="partner" />
                                <div className="text-gray-300 text-xs font-bold my-1">OU</div>
                                <ChoiceBtn onClick={() => handlePartnerChoice(QUESTIONS[currentQIndex].b)} label={QUESTIONS[currentQIndex].b} variant="partner" />
                            </div>
                        </div>
                    )}
                    
                    {step === 'sending' && (
                        <div className="py-10">
                            <Loader2 className="w-10 h-10 text-sun-yellow animate-spin mx-auto" />
                        </div>
                    )}
                </>
            ) : (
                <div className="py-10">
                    <p className="text-gray-500">Plus de questions !</p>
                    <p className="text-sm text-gray-400 mt-2">Revenez plus tard.</p>
                </div>
            )}
          </div>
      </div>
      
      {/* Footer Reset */}
      <div className="mt-8 text-center">
          <button 
            onClick={resetGame}
            className="text-[10px] text-gray-300 hover:text-red-400 flex items-center justify-center gap-1 mx-auto"
          >
              <RefreshCw className="w-3 h-3" />
              Réinitialiser la partie
          </button>
      </div>
    </div>
  );
}

function ChoiceBtn({ onClick, label, selected, variant = 'self' }) {
    const baseClass = "w-full py-4 rounded-xl border-2 transition-all font-bold text-lg relative overflow-hidden group";
    const selfClass = selected 
        ? "bg-sun-yellow border-sun-yellow text-deep-blue shadow-md scale-[1.02]" 
        : "bg-off-white border-transparent text-deep-blue hover:border-sun-yellow hover:bg-white";
    
    const partnerClass = "bg-off-white border-transparent text-deep-blue hover:border-deep-blue hover:bg-deep-blue/5";

    return (
        <button 
            onClick={onClick}
            className={clsx(baseClass, variant === 'self' ? selfClass : partnerClass)}
        >
            {label}
        </button>
    );
}
