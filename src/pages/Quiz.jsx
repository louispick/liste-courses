import { useState, useEffect } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../lib/questions';
import { Heart, Loader2, RefreshCw, HeartCrack, Sparkles, Hourglass } from 'lucide-react';
import clsx from 'clsx';

export default function Quiz() {
  const { gameState, loading, submitAnswer, updateLastSeen, resetGame, user } = useQuiz();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // États UI
  const [step, setStep] = useState('self'); 
  const [myChoice, setMyChoice] = useState(null);
  const [newHearts, setNewHearts] = useState(0); // Pour la notif "Pendant ton absence"
  const [showNewHearts, setShowNewHearts] = useState(false);

  // Identification des prénoms (Basique sur l'email)
  const myName = user?.email.includes('louis') ? 'Louis' : (user?.email.includes('mathilde') ? 'Mathilde' : 'Toi');
  const partnerName = myName === 'Louis' ? 'Mathilde' : (myName === 'Mathilde' ? 'Louis' : 'Partenaire');

  // --- CALCUL DU SCORE & PROGRESSION ---
  // On recalcule tout à chaque rendu pour être sûr d'être synchro
  let totalHearts = 0;
  let totalErrors = 0;
  let myProgress = 0;
  let partnerProgress = 0;
  let computedLastSeenIndex = 0;

  if (gameState && gameState.answers) {
      const userKey = user.email.replace(/\./g, '_');
      
      // 1. Calcul des points
      Object.keys(gameState.answers).forEach(qId => {
          const qAnswers = gameState.answers[qId];
          const users = Object.keys(qAnswers);
          
          if (users.length === 2) {
              const u1 = Object.values(qAnswers)[0];
              const u2 = Object.values(qAnswers)[1];
              
              // RÈGLE D'OR : DOUBLE MATCH REQUIS
              // Ma prédiction == Son choix  ET  Sa prédiction == Mon choix
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
      // Quelle est la première question où JE n'ai pas répondu ?
      for (let i = 0; i < QUESTIONS.length; i++) {
          const qId = QUESTIONS[i].id;
          if (!gameState.answers[qId]?.[userKey]) {
              myProgress = i;
              break;
          }
          // Si j'ai répondu à tout
          if (i === QUESTIONS.length - 1) myProgress = QUESTIONS.length;
      }

      // Avancement du partenaire (nombre de réponses totales qu'il a donné)
      // On cherche une clé qui n'est pas la mienne
      const otherKey = Object.keys(gameState.answers?.[1] || {}).find(k => k !== userKey) 
                       || Object.keys(gameState.answers?.[QUESTIONS[0].id] || {}).find(k => k !== userKey);
      
      if (otherKey) {
          partnerProgress = Object.values(gameState.answers).filter(a => a[otherKey]).length;
      }

      // 3. Détection des "Nouveaux Coeurs" (Depuis la dernière visite)
      // On compare le score actuel avec le score qu'on aurait eu à l'index "lastSeen"
      const lastSeenIndex = gameState.lastSeen?.[userKey] || 0;
      computedLastSeenIndex = lastSeenIndex;
      
      if (myProgress > lastSeenIndex) {
          // Il y a eu du mouvement. Calculons combien de coeurs on avait avant.
          let heartsBefore = 0;
          Object.keys(gameState.answers).forEach((qId, idx) => {
              // On compte les coeurs uniquement sur les questions AVANT lastSeen
              // Note: idx n'est pas fiable ici car les clés sont non ordonnées, 
              // mais QUESTIONS est ordonné. On check l'ID.
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
          if (diff > 0 && !showNewHearts && newHearts === 0) {
              setNewHearts(diff);
              setShowNewHearts(true);
          }
      }
  }

  // Mise à jour du "Last Seen" et de l'index courant
  useEffect(() => {
      if (!gameState) return;
      setCurrentQIndex(myProgress);

      // Si on arrive sur la page et qu'on a vu les résultats, on met à jour la "Tête de lecture"
      // pour que la prochaine fois on ne re-notifie pas.
      // On le fait seulement si on n'affiche pas la modale de surprise
      if (!showNewHearts && myProgress > (gameState.lastSeen?.[user.email.replace(/\./g, '_')] || 0)) {
           updateLastSeen(myProgress);
      }
  }, [gameState, myProgress, showNewHearts]);

  // FONCTION MANQUANTE RESTAURÉE
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

  const closeNewHearts = () => {
      setShowNewHearts(false);
      updateLastSeen(myProgress);
  };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-sun-yellow" /></div>;

  // Calcul du retard/avance
  const diff = myProgress - partnerProgress;

  return (
    <div className="pt-4 pb-24 px-4 max-w-sm mx-auto h-[80vh] flex flex-col relative">
      
      {/* MODALE "PENDANT TON ABSENCE" */}
      {showNewHearts && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500">
              <div className="bg-white rounded-3xl p-8 soft-shadow text-center border-4 border-sun-yellow transform animate-in zoom-in duration-300">
                  <Sparkles className="w-12 h-12 text-sun-yellow mx-auto mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-deep-blue mb-2">Pendant ton absence...</h3>
                  <p className="text-gray-500 mb-6">Vous avez validé</p>
                  <div className="text-6xl font-black text-red-500 mb-2 drop-shadow-sm">
                      +{newHearts}
                  </div>
                  <p className="text-xl font-bold text-red-400 mb-8">Nouveaux Cœurs !</p>
                  <button 
                      onClick={closeNewHearts}
                      className="w-full bg-deep-blue text-white font-bold py-3 rounded-xl hover:scale-105 transition-transform"
                  >
                      Continuer
                  </button>
              </div>
          </div>
      )}

      {/* HEADER SCORE */}
      <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl soft-shadow">
          <div className="flex gap-4">
            <div className="flex items-center gap-2" title="Matchs Parfaits">
                <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                <span className="font-bold text-xl text-deep-blue">{totalHearts}</span>
            </div>
            <div className="flex items-center gap-2 opacity-50" title="Erreurs">
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
                            <button 
                                onClick={() => { setStep('self'); setMyChoice(null); }}
                                className="mt-6 text-sm text-gray-400 underline"
                            >
                                Retour
                            </button>
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
