import { useState, useEffect, useRef } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QUESTIONS } from '../lib/questions';
import { Heart, Loader2, RefreshCw, HeartCrack, Sparkles, Hourglass, ArrowLeft, X, Check, Eye, Trophy, Lock, Calendar, ChevronRight, RotateCcw, Brain, User } from 'lucide-react';
import clsx from 'clsx';

const BATCH_SIZE = 20;

export default function Quiz() {
  const { gameState, loading, submitAnswer, updateLastSeen, completeSession, resetSessionData, user } = useQuiz();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  
  // États UI
  const [step, setStep] = useState('self'); 
  const [myChoice, setMyChoice] = useState(null);
  const [newHearts, setNewHearts] = useState(0); 
  const [showNewHearts, setShowNewHearts] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState('answers');
  const [viewingSession, setViewingSession] = useState(null);

  // Identification
  const myName = user?.email.includes('louis') ? 'Louis' : (user?.email.includes('mathilde') ? 'Mathilde' : 'Toi');
  const partnerName = myName === 'Louis' ? 'Mathilde' : (myName === 'Mathilde' ? 'Louis' : 'Partenaire');

  // Refs
  const prevHeartsRef = useRef(0);
  const prevErrorsRef = useRef(0);
  const isFirstLoadRef = useRef(true);

  // --- CALCUL DU SCORE & PROGRESSION ---
  let totalHearts = 0;
  let totalErrors = 0;
  let myProgress = 0;
  let partnerProgress = 0;
  let currentSession = gameState?.currentSession || 1;

  const activeSessionStart = (currentSession - 1) * BATCH_SIZE;
  const activeSessionEnd = currentSession * BATCH_SIZE;

  const getSessionHistory = () => {
      if (!gameState?.sessionHistory) return [];
      if (Array.isArray(gameState.sessionHistory)) return gameState.sessionHistory;
      return Object.values(gameState.sessionHistory);
  };

  if (gameState && gameState.answers) {
      const userKey = user.email.replace(/\./g, '_');
      
      // 1. Points Session Courante
      for (let i = activeSessionStart; i < activeSessionEnd; i++) {
          if (i >= QUESTIONS.length) break;
          const qId = QUESTIONS[i].id;
          const qAnswers = gameState.answers[qId];
          if (qAnswers) {
              const users = Object.keys(qAnswers);
              if (users.length === 2) {
                  const u1 = Object.values(qAnswers)[0];
                  const u2 = Object.values(qAnswers)[1];
                  const match1 = u1.partner === u2.self;
                  const match2 = u2.partner === u1.self;
                  if (match1 && match2) totalHearts++;
                  else totalErrors++;
              }
          }
      }

      // 2. Avancement Global
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

      // 3. Détection Nouveautés
      if (isFirstLoadRef.current) {
          const lastSeenIndex = gameState.lastSeen?.[userKey] || 0;
          if (myProgress > lastSeenIndex) {
              let heartsBefore = 0;
              for (let i = activeSessionStart; i < activeSessionEnd; i++) {
                  if (i >= lastSeenIndex) continue;
                  const qId = QUESTIONS[i].id;
                  const qAnswers = gameState.answers[qId];
                  if (qAnswers && Object.keys(qAnswers).length === 2) {
                      const v = Object.values(qAnswers);
                      if (v[0].partner === v[1].self && v[1].partner === v[0].self) heartsBefore++;
                  }
              }
              const diff = totalHearts - heartsBefore;
              if (diff > 0) {
                  setNewHearts(diff);
                  setShowNewHearts(true);
              }
          }
          prevHeartsRef.current = totalHearts;
          prevErrorsRef.current = totalErrors;
          isFirstLoadRef.current = false;
      }
  }

  useEffect(() => {
      if (totalHearts > prevHeartsRef.current) {
          setShowCelebration(true);
          const timer = setTimeout(() => setShowCelebration(false), 2500);
          return () => clearTimeout(timer);
      }
      prevHeartsRef.current = totalHearts;

      if (totalErrors > prevErrorsRef.current) {
          setShowFailure(true);
          const timer = setTimeout(() => setShowFailure(false), 2500);
      }
      prevErrorsRef.current = totalErrors;
  }, [totalHearts, totalErrors]);

  useEffect(() => {
      if (!gameState) return;
      if (currentQIndex < activeSessionStart) setCurrentQIndex(activeSessionStart);
      if (myProgress > currentQIndex && myProgress < activeSessionEnd) setCurrentQIndex(myProgress);
      if (!showNewHearts && myProgress > (gameState.lastSeen?.[user.email.replace(/\./g, '_')] || 0)) {
           updateLastSeen(myProgress);
      }
  }, [gameState, myProgress, showNewHearts, currentSession]);

  const handleSelfChoice = (choice) => { setMyChoice(choice); setStep('partner'); };
  const handlePartnerChoice = async (choice) => { setStep('sending'); await submitAnswer(QUESTIONS[currentQIndex].id, myChoice, choice); setStep('self'); setMyChoice(null); };
  
  const handleBack = () => {
      if (step === 'partner') { setStep('self'); setMyChoice(null); }
      else if (currentQIndex > activeSessionStart) { setCurrentQIndex(prev => prev - 1); setStep('self'); setMyChoice(null); }
  };

  const closeNewHearts = () => { setShowNewHearts(false); updateLastSeen(myProgress); };
  
  const handleStartNextSession = async () => {
      await completeSession({
          id: currentSession,
          hearts: totalHearts,
          errors: totalErrors,
          date: new Date().toISOString()
      });
  };

  const handleResetCurrentSession = async () => {
      if(confirm(`Recommencer la session ${currentSession} à zéro ?`)) {
          await resetSessionData(currentSession);
      }
  };

  const handleReplaySession = async (e, sessionId) => {
      e.stopPropagation();
      if(confirm(`Rejouer la Session ${sessionId} ?\nCela deviendra votre session active.`)) {
          await resetSessionData(sessionId);
      }
  };

  const closeHistory = () => { setShowHistory(false); setViewingSession(null); };

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-sun-yellow" /></div>;

  const isSessionFinishedMe = myProgress >= activeSessionEnd;
  const isSessionFinishedPartner = partnerProgress >= activeSessionEnd;
  const diff = myProgress - partnerProgress;
  const relativeQNumber = (currentQIndex % BATCH_SIZE) + 1;

  let questionsToShow = [];
  if (historyTab === 'sessions' && viewingSession) {
      const start = (viewingSession.id - 1) * BATCH_SIZE;
      const end = viewingSession.id * BATCH_SIZE;
      questionsToShow = QUESTIONS.slice(start, end);
  } else if (historyTab === 'answers') {
      const start = activeSessionStart;
      const end = Math.min(Math.max(myProgress, partnerProgress), activeSessionEnd);
      questionsToShow = QUESTIONS.slice(start, end);
  }

  // --- NOUVEAU DESIGN CLAIR (CARD BASED) ---
  const ResultCard = ({ label, choice, guess, guesserName, isCorrect }) => (
      <div className={clsx(
          "flex justify-between items-center p-2 rounded-lg text-xs mb-1",
          isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      )}>
          <div className="flex flex-col">
              <span className="font-bold mb-0.5">{label}</span>
              <span className="text-gray-600">Choix : <strong className="text-deep-blue">{choice || "?"}</strong></span>
          </div>
          
          <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[10px] uppercase tracking-wide opacity-60">Vu par {guesserName}</span>
                  {isCorrect ? <Check className="w-3 h-3 text-green-600" /> : <X className="w-3 h-3 text-red-500" />}
              </div>
              <span className="font-medium bg-white/50 px-2 rounded">{guess || "?"}</span>
          </div>
      </div>
  );

  const QuestionsList = ({ questions, sessionOffset }) => (
      <div className="space-y-6 pb-8">
          {questions.map((q, idx) => {
              const answers = gameState.answers[q.id];
              if (!answers) return null;
              
              const userKey = user.email.replace(/\./g, '_');
              const myAns = answers[userKey];
              const otherKey = Object.keys(answers).find(k => k !== userKey);
              const partnerAns = otherKey ? answers[otherKey] : null;
              
              const waitingPartner = !partnerAns;
              
              // Calcul des matchs individuels
              const meAboutPartnerMatch = myAns && partnerAns && myAns.partner === partnerAns.self;
              const partnerAboutMeMatch = myAns && partnerAns && partnerAns.partner === myAns.self;
              
              // Statut global
              let globalStatus = 'waiting';
              if (myAns && partnerAns) {
                  globalStatus = (meAboutPartnerMatch && partnerAboutMeMatch) ? 'success' : 'fail';
              }

              return (
                  <div key={q.id} className="relative bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
                      <div className="flex items-center gap-2 mb-3 border-b border-gray-50 pb-2">
                          <div className={clsx(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              globalStatus === 'success' ? "bg-green-500 text-white" :
                              globalStatus === 'fail' ? "bg-red-400 text-white" : "bg-gray-200 text-gray-500"
                          )}>
                              {(sessionOffset || activeSessionStart) + idx + 1}
                          </div>
                          <h3 className="font-bold text-deep-blue text-sm flex-1 leading-tight">{q.text}</h3>
                          
                          {globalStatus === 'success' && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
                          {globalStatus === 'fail' && <HeartCrack className="w-5 h-5 text-gray-300" />}
                      </div>

                      <div className="space-y-2">
                          {/* BLOC MOI (LOUIS) */}
                          {myAns ? (
                              waitingPartner ? (
                                  <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded">En attente de {partnerName}...</div>
                              ) : (
                                  <ResultCard 
                                      label={`À propos de ${myName}`}
                                      choice={myAns.self}
                                      guesserName={partnerName}
                                      guess={partnerAns?.partner}
                                      isCorrect={partnerAboutMeMatch}
                                  />
                              )
                          ) : <div className="text-xs text-gray-300 italic">Pas encore répondu</div>}

                          {/* BLOC PARTENAIRE (MATHILDE) */}
                          {partnerAns ? (
                              waitingPartner ? null : (
                                  <ResultCard 
                                      label={`À propos de ${partnerName}`}
                                      choice={partnerAns.self}
                                      guesserName={myName}
                                      guess={myAns?.partner}
                                      isCorrect={meAboutPartnerMatch}
                                  />
                              )
                          ) : null}
                      </div>
                  </div>
              );
          })}
          {questions.length === 0 && <div className="text-center text-gray-400 py-10">Aucune donnée disponible.</div>}
      </div>
  );

  return (
    <div className="pt-4 pb-24 px-4 max-w-sm mx-auto h-[80vh] flex flex-col relative">
      
      {/* MODALES ET EFFETS (Inchangés) */}
      {showCelebration && (<div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="animate-float-up"><Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl" /><div className="text-center mt-2 font-black text-white text-xl bg-red-500 px-4 py-1 rounded-full shadow-lg">MATCH !</div></div></div>)}
      {showFailure && (<div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"><div className="animate-float-up"><HeartCrack className="w-32 h-32 text-gray-400 drop-shadow-2xl" /><div className="text-center mt-2 font-black text-white text-xl bg-gray-400 px-4 py-1 rounded-full shadow-lg">OUPS...</div></div></div>)}
      {showNewHearts && (<div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-500"><div className="bg-white rounded-3xl p-8 soft-shadow text-center border-4 border-sun-yellow transform animate-in zoom-in duration-300"><Sparkles className="w-12 h-12 text-sun-yellow mx-auto mb-4 animate-pulse" /><h3 className="text-2xl font-bold text-deep-blue mb-2">Pendant ton absence...</h3><div className="text-6xl font-black text-red-500 mb-2 drop-shadow-sm">+{newHearts}</div><p className="text-xl font-bold text-red-400 mb-8">Nouveaux Cœurs !</p><button onClick={closeNewHearts} className="w-full bg-deep-blue text-white font-bold py-3 rounded-xl">Continuer</button></div></div>)}

      {/* HISTORIQUE MODAL (AVEC NAVIGATION DEEP DIVE) */}
      {showHistory && (
          <div className="absolute inset-0 z-50 bg-white rounded-3xl soft-shadow flex flex-col animate-in slide-in-from-bottom-10 duration-300">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                      {viewingSession && <button onClick={() => setViewingSession(null)} className="mr-2 text-deep-blue hover:bg-gray-100 p-1 rounded-full"><ArrowLeft className="w-5 h-5" /></button>}
                      <h2 className="font-bold text-deep-blue text-lg">{viewingSession ? `Session ${viewingSession.id}` : 'Historique'}</h2>
                  </div>
                  <button onClick={closeHistory} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              
              {!viewingSession && (
                  <div className="flex p-2 gap-2 border-b border-gray-100 bg-gray-50">
                      <button onClick={() => setHistoryTab('answers')} className={clsx("flex-1 py-2 rounded-xl text-sm font-bold transition-colors", historyTab === 'answers' ? "bg-white text-deep-blue shadow-sm" : "text-gray-400 hover:text-gray-600")}>En cours (S{currentSession})</button>
                      <button onClick={() => setHistoryTab('sessions')} className={clsx("flex-1 py-2 rounded-xl text-sm font-bold transition-colors", historyTab === 'sessions' ? "bg-white text-deep-blue shadow-sm" : "text-gray-400 hover:text-gray-600")}>Archives</button>
                  </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {/* VUE 1 : LISTE DES SESSIONS (ARCHIVES) */}
                  {historyTab === 'sessions' && !viewingSession && (
                      <div className="space-y-3">
                          {getSessionHistory().length === 0 && <div className="text-center text-gray-400 py-10">Pas encore de session terminée.</div>}
                          {getSessionHistory().sort((a,b) => b.id - a.id).map((session, idx) => (
                              <div 
                                key={idx} 
                                onClick={() => setViewingSession(session)}
                                className="bg-white border-2 border-gray-100 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:border-sun-yellow transition-colors group"
                              >
                                  <div><h3 className="font-bold text-deep-blue">Session {session.id}</h3><p className="text-xs text-gray-400">{new Date(session.date).toLocaleDateString()}</p></div>
                                  <div className="flex items-center gap-4">
                                      <div className="flex flex-col items-center"><Heart className="w-5 h-5 text-red-500 fill-red-500" /><span className="font-bold">{session.hearts}</span></div>
                                      <div className="flex flex-col items-center opacity-50"><HeartCrack className="w-5 h-5 text-gray-400" /><span className="font-bold">{session.errors}</span></div>
                                      <div className="flex items-center gap-2 border-l pl-4 border-gray-100">
                                          <button onClick={(e) => handleReplaySession(e, session.id)} className="p-2 text-gray-300 hover:text-deep-blue hover:bg-gray-50 rounded-full" title="Rejouer cette session"><RotateCcw className="w-4 h-4" /></button>
                                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-deep-blue" />
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}

                  {/* VUE 2 : DÉTAIL D'UNE SESSION (ARCHIVÉE OU COURANTE) */}
                  {(historyTab === 'answers' || viewingSession) && (
                      <QuestionsList 
                        questions={questionsToShow} 
                        sessionOffset={viewingSession ? (viewingSession.id - 1) * BATCH_SIZE : activeSessionStart} 
                      />
                  )}
              </div>
          </div>
      )}

      {/* HEADER SCORE (CLIQUABLE) */}
      <div onClick={() => { setShowHistory(true); setHistoryTab('answers'); }} className="flex justify-between items-center mb-6 bg-white p-3 rounded-2xl soft-shadow relative cursor-pointer active:scale-[0.98] transition-transform hover:bg-gray-50">
          {(currentQIndex > activeSessionStart || step === 'partner') && !isSessionFinishedMe && (
              <button onClick={(e) => { e.stopPropagation(); handleBack(); }} className="absolute left-[-16px] bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-deep-blue z-10"><ArrowLeft className="w-5 h-5" /></button>
          )}
          <div className="flex items-center gap-2 px-2 bg-yellow-50 rounded-lg py-1 border border-yellow-100">
              <Trophy className="w-4 h-4 text-sun-yellow" />
              <span className="font-bold text-deep-blue text-sm">Session {currentSession}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><Heart className="w-6 h-6 text-red-500 fill-red-500" /><span className="font-bold text-xl text-deep-blue">{totalHearts}</span></div>
            <div className="flex items-center gap-2 opacity-50"><HeartCrack className="w-6 h-6 text-gray-400" /><span className="font-bold text-xl text-gray-500">{totalErrors}</span></div>
          </div>
          <div className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-500">
              {isSessionFinishedMe ? 'Fini' : `${relativeQNumber}/${BATCH_SIZE}`}
          </div>
      </div>

      {/* ZONE JEU (CARTE) */}
      <div className="flex-1 flex flex-col justify-center">
          {isSessionFinishedMe && isSessionFinishedPartner ? (
              <div className="bg-white rounded-3xl p-8 soft-shadow text-center animate-in zoom-in duration-300">
                  <Trophy className="w-16 h-16 text-sun-yellow mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-deep-blue mb-2">Session {currentSession} Terminée !</h2>
                  <p className="text-gray-500 mb-8">Beau travail d'équipe ❤️</p>
                  <div className="flex justify-center gap-8 mb-8">
                      <div className="text-center"><div className="text-4xl font-black text-red-500">{totalHearts}</div><div className="text-xs text-gray-400 uppercase font-bold mt-1">Matchs</div></div>
                      <div className="text-center"><div className="text-4xl font-black text-gray-400">{totalErrors}</div><div className="text-xs text-gray-400 uppercase font-bold mt-1">Ratés</div></div>
                  </div>
                  <button onClick={handleStartNextSession} className="w-full bg-deep-blue text-white font-bold py-4 rounded-xl shadow-lg shadow-deep-blue/20 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" /> Lancer la Session {currentSession + 1}
                  </button>
              </div>
          ) : isSessionFinishedMe ? (
              <div className="bg-white rounded-3xl p-8 soft-shadow text-center opacity-80">
                  <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse"><Hourglass className="w-8 h-8 text-gray-400" /></div>
                  <h2 className="text-xl font-bold text-gray-600 mb-2">Session terminée pour toi !</h2>
                  <p className="text-gray-500 mb-6">Attends que {partnerName} termine ses {activeSessionEnd - partnerProgress} dernières questions.</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2"><div className="bg-sun-yellow h-2 rounded-full transition-all duration-1000" style={{ width: `${((partnerProgress % BATCH_SIZE) / BATCH_SIZE) * 100}%` }}></div></div>
                  <p className="text-xs text-gray-400 text-right">{partnerProgress % BATCH_SIZE} / {BATCH_SIZE}</p>
              </div>
          ) : (
              <div className="bg-white rounded-3xl p-8 soft-shadow text-center relative overflow-hidden transition-all duration-500">
                {diff > 0 && <div className="absolute top-0 left-0 right-0 bg-orange-100 py-2 text-[11px] text-orange-600 font-bold flex items-center justify-center gap-2"><Hourglass className="w-3 h-3" />Attends {partnerName}, tu as {diff} questions d'avance !</div>}
                {diff < 0 && <div className="absolute top-0 left-0 right-0 bg-deep-blue py-2 text-[11px] text-white font-bold flex items-center justify-center gap-2"><Sparkles className="w-3 h-3 text-sun-yellow" />Rattrape {partnerName}, tu as {Math.abs(diff)} questions de retard !</div>}
                <h2 className="text-2xl font-bold text-deep-blue mb-8 mt-6 min-h-[64px] flex items-center justify-center">{QUESTIONS[currentQIndex]?.text}</h2>
                {QUESTIONS[currentQIndex] && (
                    <>
                        {step === 'self' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Pour toi ?</p>
                                <div className="space-y-3">
                                    <ChoiceBtn onClick={() => handleSelfChoice(QUESTIONS[currentQIndex].a)} label={QUESTIONS[currentQIndex].a} selected={myChoice === QUESTIONS[currentQIndex].a} />
                                    <div className="text-gray-300 text-xs font-bold my-1">OU</div>
                                    <ChoiceBtn onClick={() => handleSelfChoice(QUESTIONS[currentQIndex].b)} label={QUESTIONS[currentQIndex].b} selected={myChoice === QUESTIONS[currentQIndex].b} />
                                </div>
                            </div>
                        )}
                        {step === 'partner' && (
                            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                                <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Pour {partnerName} ?</p>
                                <div className="space-y-3">
                                    <ChoiceBtn onClick={() => handlePartnerChoice(QUESTIONS[currentQIndex].a)} label={QUESTIONS[currentQIndex].a} variant="partner" />
                                    <div className="text-gray-300 text-xs font-bold my-1">OU</div>
                                    <ChoiceBtn onClick={() => handlePartnerChoice(QUESTIONS[currentQIndex].b)} label={QUESTIONS[currentQIndex].b} variant="partner" />
                                </div>
                            </div>
                        )}
                        {step === 'sending' && <div className="py-10"><Loader2 className="w-10 h-10 text-sun-yellow animate-spin mx-auto" /></div>}
                    </>
                )}
              </div>
          )}
      </div>
      
      {/* Footer Reset */}
      <div className="mt-8 text-center">
          <button onClick={handleResetCurrentSession} className="text-[10px] text-gray-300 hover:text-red-400 flex items-center justify-center gap-1 mx-auto"><RefreshCw className="w-3 h-3" /> Recommencer la session</button>
      </div>
    </div>
  );
}

function ChoiceBtn({ onClick, label, selected, variant = 'self' }) {
    const baseClass = "w-full py-4 rounded-xl border-2 transition-all font-bold text-lg relative overflow-hidden group";
    const selfClass = selected ? "bg-sun-yellow border-sun-yellow text-deep-blue shadow-md scale-[1.02]" : "bg-off-white border-transparent text-deep-blue hover:border-sun-yellow hover:bg-white";
    const partnerClass = "bg-off-white border-transparent text-deep-blue hover:border-deep-blue hover:bg-deep-blue/5";
    return <button onClick={onClick} className={clsx(baseClass, variant === 'self' ? selfClass : partnerClass)}>{label}</button>;
}
