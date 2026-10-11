import { useState, useRef, useEffect } from 'react';
import { parseMany, formatQuantity } from '../lib/parser';
import { Plus, AlertTriangle, Check } from 'lucide-react';

export default function SmartInput({ onAdd }) {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  // Doublons à trancher, un par un : [{ parsed, type, item }]
  const [queue, setQueue] = useState([]);
  const [toast, setToast] = useState('');
  const inputRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const parsedItems = parseMany(input);
    if (parsedItems.length === 0) return;

    setBusy(true);
    const pending = [];
    const mergedMessages = [];
    try {
      for (const parsed of parsedItems) {
        const result = await onAdd(parsed);
        if (result?.status === 'duplicate') pending.push({ parsed, ...result });
        if (result?.status === 'merged') {
          mergedMessages.push(`${result.item.name} → ${formatQuantity(result.qty, result.item.unit)}`);
        }
      }
      setInput('');
      if (mergedMessages.length) showToast(`Déjà dans la liste : ${mergedMessages.join(', ')}`);
      setQueue(pending);
    } catch (err) {
      alert("Erreur lors de l'ajout : " + err.message);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const resolve = async (choice) => {
    const [current, ...rest] = queue;
    setQueue(rest);
    if (!current || choice === 'skip') return;
    try {
      const result = await onAdd(
        current.parsed,
        choice === 'merge' ? { mergeWith: current.item } : { force: true }
      );
      if (result?.status === 'merged') {
        showToast(`${result.item.name} → ${formatQuantity(result.qty, result.item.unit)}`);
      }
    } catch (err) {
      alert("Erreur lors de l'ajout : " + err.message);
    }
  };

  const current = queue[0];

  return (
    <div className="mb-6 sticky top-4 z-10">
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          enterKeyHint="done"
          autoComplete="off"
          autoCapitalize="sentences"
          aria-label="Ajouter un article"
          className="input-soft pr-14 shadow-lg shadow-deep-blue/10 border-2 focus:border-sun-yellow"
          placeholder="Ajouter : 2kg tomates, lait, 6 œufs…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy}
          aria-label="Ajouter"
          className="absolute right-2 top-2 bottom-2 bg-sun-yellow text-deep-blue rounded-xl w-12 flex items-center justify-center font-bold hover:bg-yellow-300 transition-colors disabled:opacity-60"
        >
          <Plus />
        </button>
      </form>

      {toast && (
        <div
          role="status"
          className="mt-2 mx-2 bg-deep-blue text-white text-sm rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg"
        >
          <Check className="w-4 h-4 text-sun-yellow shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {current && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xs text-center">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="text-orange-500 w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {current.type === 'exact' ? 'Déjà dans la liste' : 'Même article ?'}
            </h3>
            <p className="text-gray-600 mb-6">
              Tu as déjà <strong>{formatItem(current.item)}</strong>.
              <br />
              Tu veux ajouter <strong>{formatItem(current.parsed)}</strong> :
              même article ou article différent ?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => resolve('merge')}
                className="py-3 rounded-xl bg-deep-blue font-semibold text-white hover:bg-blue-800"
              >
                C'est le même (additionner)
              </button>
              <button
                onClick={() => resolve('new')}
                className="py-3 rounded-xl bg-gray-100 font-semibold text-gray-700 hover:bg-gray-200"
              >
                Article différent
              </button>
              <button
                onClick={() => resolve('skip')}
                className="py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatItem(item) {
  const hasQty = item.qty > 1 || item.unit;
  return hasQty ? `${formatQuantity(item.qty, item.unit)} ${item.name}` : item.name;
}
