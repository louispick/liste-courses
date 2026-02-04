import { useState, useEffect } from 'react';
import { usePictionary } from '../hooks/usePictionary';
import { PICTIONARY_WORDS } from '../lib/pictionaryWords';
import DrawPad from '../components/DrawPad';
import { Loader2, Palette, PenTool, CheckCircle2, XCircle, Shuffle } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti'; // On pourrait l'installer, mais simulons simple pour l'instant

export default function Pictionary() {
  const { gameState, loading, startGame, submitDrawing, submitGuess, user } = usePictionary();
  const [guess, setGuess] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Choix des mots
  const [wordOptions, setWordOptions] = useState([]);

  useEffect(() => {
      // Générer 3 mots au hasard quand on arrive sur l'écran de choix
      if (gameState?.status === 'WAITING_FOR_DRAWING' && wordOptions.length === 0) {
          const shuffled = [...PICTIONARY_WORDS].sort(() => 0.5 - Math.random());
          setWordOptions(shuffled.slice(0, 3));
      }
  }, [gameState]);

  if (loading) return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-sun-yellow" /></div>;

  const myEmail = user.email;
  const isMyTurnToDraw = gameState.currentDrawer === myEmail;
  const isDrawer = gameState.currentDrawer; // Quelqu'un dessine déjà

  // --- ETAT 1 : PERSONNE NE DESSINE (CHOIX DU MOT) ---
  if (gameState.status === 'WAITING_FOR_DRAWING') {
      return (
          <div className="pt-10 px-4 text-center">
              <div className="bg-sun-yellow/20 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Palette className="w-12 h-12 text-deep-blue" />
              </div>
              <h2 className="text-2xl font-bold text-deep-blue mb-2">À toi de dessiner !</h2>
              <p className="text-gray-500 mb-8">Choisis un mot pour commencer</p>

              <div className="grid gap-3">
                  {wordOptions.map(word => (
                      <button
                        key={word}
                        onClick={() => startGame(word)}
                        className="bg-white p-4 rounded-2xl soft-shadow font-bold text-lg text-deep-blue hover:bg-sun-yellow/10 transition-colors border-2 border-transparent hover:border-sun-yellow"
                      >
                          {word}
                      </button>
                  ))}
              </div>
              <button 
                onClick={() => setWordOptions([...PICTIONARY_WORDS].sort(() => 0.5 - Math.random()).slice(0, 3))}
                className="mt-6 text-sm text-gray-400 flex items-center justify-center gap-2 hover:text-deep-blue"
              >
                  <Shuffle className="w-4 h-4" /> D'autres mots
              </button>
          </div>
      );
  }

  // --- ETAT 2 : JE DESSINE ---
  if (gameState.status === 'DRAWING' && isMyTurnToDraw) {
      return (
          <div className="pt-4 px-4 h-[85vh] flex flex-col">
              <div className="text-center mb-4">
                  <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Tu dessines</p>
                  <h2 className="text-2xl font-black text-deep-blue">{gameState.currentWord}</h2>
              </div>
              <DrawPad onSave={submitDrawing} />
          </div>
      );
  }

  // --- ETAT 3 : L'AUTRE DESSINE (ATTENTE) ---
  if (gameState.status === 'DRAWING' && !isMyTurnToDraw) {
      return (
          <div className="pt-20 px-4 text-center">
              <div className="bg-gray-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-pulse">
                  <PenTool className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-600 mb-2">L'artiste est au travail...</h2>
              <p className="text-gray-500">Attends que le dessin soit fini !</p>
          </div>
      );
  }

  // --- ETAT 4 : JE DOIS DEVINER ---
  if (gameState.status === 'WAITING_FOR_GUESS') {
      // Si c'est moi qui ai dessiné, j'attends
      if (isMyTurnToDraw) {
          return (
              <div className="pt-20 px-4 text-center">
                  <h2 className="text-xl font-bold text-deep-blue mb-4">Dessin envoyé ! ✈️</h2>
                  <div className="bg-white p-2 rounded-xl soft-shadow inline-block mb-6 transform -rotate-2">
                      <img src={gameState.currentDrawing} alt="Ton dessin" className="max-w-[200px] rounded-lg opacity-50" />
                  </div>
                  <p className="text-gray-500">Attends qu'on devine ton chef d'oeuvre.</p>
              </div>
          );
      }

      // Sinon, je dois deviner !
      const handleGuess = (e) => {
          e.preventDefault();
          const normalizedGuess = guess.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const normalizedTarget = gameState.currentWord.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

          if (normalizedGuess === normalizedTarget) {
              setSuccess(true);
              confetti({
                  particleCount: 100,
                  spread: 70,
                  origin: { y: 0.6 }
              });
          } else {
              setError(true);
              setTimeout(() => setError(false), 1000);
          }
      };

      const handleContinue = () => {
          submitGuess(true);
          setSuccess(false);
          setGuess('');
      };

      if (success) {
          return (
              <div className="pt-20 px-4 text-center">
                  <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-bounce">
                      <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-black text-deep-blue mb-2">BRAVO !</h2>
                  <p className="text-xl text-gray-600 mb-8">C'était bien <strong>{gameState.currentWord}</strong></p>
                  
                  <div className="bg-white p-2 rounded-xl soft-shadow inline-block mb-8">
                      <img src={gameState.currentDrawing} alt="Le dessin" className="max-w-[250px] rounded-lg" />
                  </div>

                  <button 
                    onClick={handleContinue}
                    className="w-full py-4 bg-deep-blue text-white font-bold rounded-xl shadow-lg"
                  >
                      Tour suivant
                  </button>
              </div>
          );
      }

      return (
          <div className="pt-4 px-4 h-[85vh] flex flex-col">
              <p className="text-center text-sm text-gray-400 uppercase font-bold tracking-wider mb-4">Devine le dessin !</p>
              
              <div className="flex-1 bg-white rounded-2xl border-2 border-gray-100 p-2 flex items-center justify-center shadow-inner mb-6 relative">
                  <img src={gameState.currentDrawing} alt="Dessin à deviner" className="max-w-full max-h-full" />
              </div>

              <form onSubmit={handleGuess} className="relative">
                  <input
                    type="text"
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    placeholder="C'est quoi ?"
                    className={clsx(
                        "input-soft text-center font-bold text-xl uppercase pr-12",
                        error ? "border-red-400 bg-red-50 text-red-500 animate-shake" : "focus:border-sun-yellow"
                    )}
                    autoFocus
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-deep-blue text-white rounded-xl w-12 flex items-center justify-center"
                  >
                      ?
                  </button>
              </form>
              <div className="text-center mt-2 text-xs text-gray-300">
                  {gameState.currentWord.length} lettres
              </div>
          </div>
      );
  }

  return <div>Erreur état jeu</div>;
}
