import { useState } from 'react';
import { usePacking } from '../hooks/usePacking';
import { Luggage, Plus, Trash2, CheckCircle2, RotateCcw, User, Users, Baby } from 'lucide-react';
import clsx from 'clsx';

export default function Packing() {
  const { items, loading, addItem, toggleItem, deleteItem, resetAll, CATEGORIES } = usePacking();
  const [newItem, setNewItem] = useState('');
  const [selectedCat, setSelectedCat] = useState('Général');

  const handleAdd = (e) => {
    e.preventDefault();
    addItem(newItem, selectedCat);
    setNewItem('');
    // On garde la catégorie sélectionnée pour enchainer les ajouts
  };

  // Helper pour les icônes de catégorie
  const getCatIcon = (cat) => {
      switch(cat) {
          case 'Isao': return <Baby className="w-4 h-4" />;
          case 'Général': return <Users className="w-4 h-4" />;
          default: return <User className="w-4 h-4" />;
      }
  };

  return (
    <div className="pb-24 pt-2">
      {/* Header */}
      <header className="mb-6 px-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          Valises <span className="text-sun-yellow">Prêtes ?</span>
        </h1>
        <button 
            onClick={resetAll}
            className="text-xs font-bold text-deep-blue bg-blue-50 px-3 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition-colors"
        >
            <RotateCcw className="w-3 h-3" />
            Nouveau départ
        </button>
      </header>

      {/* Input Zone */}
      <div className="bg-white p-4 rounded-3xl soft-shadow mb-8 sticky top-4 z-20">
          <form onSubmit={handleAdd}>
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
                  {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCat(cat)}
                        className={clsx(
                            "px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2",
                            selectedCat === cat 
                                ? "bg-deep-blue text-white shadow-md" 
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                        )}
                      >
                          {getCatIcon(cat)}
                          {cat}
                      </button>
                  ))}
              </div>
              <div className="relative">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder={`Ajouter pour ${selectedCat}...`}
                    className="input-soft pr-12 bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={!newItem.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-sun-yellow text-deep-blue rounded-xl w-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <Plus className="w-5 h-5" />
                  </button>
              </div>
          </form>
      </div>

      {/* Listes par catégorie */}
      <div className="space-y-6">
          {CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.category === cat);
              if (catItems.length === 0) return null;

              const finished = catItems.every(i => i.checked);

              return (
                  <div key={cat} className="bg-white rounded-3xl p-5 soft-shadow">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                          <h2 className="text-deep-blue font-bold text-lg flex items-center gap-2">
                              <span className={clsx("p-2 rounded-lg", finished ? "bg-green-100 text-green-600" : "bg-sun-yellow/20 text-deep-blue")}>
                                {getCatIcon(cat)}
                              </span>
                              {cat}
                          </h2>
                          <span className="text-xs font-medium text-gray-400">
                              {catItems.filter(i => i.checked).length}/{catItems.length}
                          </span>
                      </div>

                      <ul className="space-y-2">
                          {catItems.map(item => (
                              <li key={item.id} className="flex items-center group">
                                  <button
                                    onClick={() => toggleItem(item.id, item.checked)}
                                    className={clsx(
                                        "flex-1 flex items-center gap-3 text-left transition-all p-2 rounded-xl",
                                        item.checked ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"
                                    )}
                                  >
                                      <div className={clsx(
                                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                          item.checked ? "bg-green-500 border-green-500" : "border-gray-300"
                                      )}>
                                          {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                                      </div>
                                      <span className={clsx("font-medium", item.checked ? "line-through text-gray-400" : "text-gray-700")}>
                                          {item.name}
                                      </span>
                                  </button>
                                  
                                  <button
                                    onClick={() => deleteItem(item.id)}
                                    className="p-2 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
              );
          })}

          {items.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                  <Luggage className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucune affaire prévue.</p>
                  <p className="text-sm">Commence par ajouter des indispensables !</p>
              </div>
          )}
      </div>
    </div>
  );
}
