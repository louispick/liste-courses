import { useState, useRef } from 'react';
import { parseInput } from '../lib/parser';
import Fuse from 'fuse.js';
import { Plus, AlertTriangle } from 'lucide-react';

export default function SmartInput({ onAdd, existingItems }) {
  const [input, setInput] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingItem, setPendingItem] = useState(null);
  const [duplicateMatch, setDuplicateMatch] = useState(null);
  
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = parseInput(input);
    if (!parsed) return;

    // Fuzzy Check
    const fuse = new Fuse(existingItems, {
      keys: ['name'],
      threshold: 0.4
    });

    const results = fuse.search(parsed.name);
    
    if (results.length > 0) {
      setDuplicateMatch(results[0].item);
      setPendingItem(parsed);
      setShowDuplicateModal(true);
    } else {
      onAdd(parsed);
      setInput('');
    }
  };

  const confirmAdd = () => {
    if (pendingItem) {
      // Merge logic could go here (e.g. update quantity), but simpler to just add for now
      // or maybe the user wants to add "another" pack.
      onAdd(pendingItem); 
      setInput('');
      setShowDuplicateModal(false);
      setPendingItem(null);
      setDuplicateMatch(null);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="mb-6 sticky top-4 z-10">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input-soft pr-14 shadow-lg shadow-deep-blue/10 border-2 focus:border-sun-yellow"
          placeholder="Qu'est-ce qu'on mange ?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-sun-yellow text-deep-blue rounded-xl w-12 flex items-center justify-center font-bold hover:bg-yellow-300 transition-colors"
        >
          <Plus />
        </button>
      </form>

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center animate-in zoom-in-95 duration-200">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="text-orange-500 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Doublon détecté !</h3>
            <p className="text-gray-600 mb-6">
              Tu as déjà <strong>{duplicateMatch?.name}</strong> dans ta liste.
              Veux-tu quand même ajouter <strong>{pendingItem?.name}</strong> ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmAdd}
                className="flex-1 py-3 rounded-xl bg-deep-blue font-semibold text-white hover:bg-blue-800"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
