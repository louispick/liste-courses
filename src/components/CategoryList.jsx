import { useState, useRef, useEffect } from 'react';
import { CATEGORIES } from '../lib/categories';
import { parseInput } from '../lib/parser';
import { Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function CategoryList({ items, onToggle, onDelete, onUpdate, onClearChecked }) {
  const activeItems = items.filter(i => !i.checked);
  const checkedItems = items.filter(i => i.checked);

  const grouped = activeItems.reduce((acc, item) => {
    const cat = item.category || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(CATEGORIES).filter(c => grouped[c]);
  if (grouped['Autre'] && !sortedCategories.includes('Autre')) sortedCategories.push('Autre');

  return (
    <div className="space-y-6 pb-24">
      
      {activeItems.length === 0 && checkedItems.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Frigo vide ? 😱</p>
          <p className="text-sm mt-2">Ajoute des articles ci-dessus !</p>
        </div>
      )}

      {sortedCategories.map(cat => (
        <div key={cat} className="bg-white rounded-3xl p-5 soft-shadow">
          <h2 className="text-deep-blue font-bold text-lg mb-4 px-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-sun-yellow rounded-full block"></span>
            {cat}
          </h2>
          <ul className="space-y-3">
            {grouped[cat].map(item => (
              <ListItem 
                key={item.id} 
                item={item} 
                onToggle={onToggle} 
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        </div>
      ))}

      {checkedItems.length > 0 && (
        <div className="mt-8">
            <div className="flex justify-between items-center px-4 mb-4">
                <h3 className="text-gray-400 font-bold uppercase text-sm tracking-wider">
                    Déjà pris ({checkedItems.length})
                </h3>
                <button 
                    onClick={onClearChecked}
                    className="text-red-400 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
                >
                    <Trash2 className="w-3 h-3" />
                    Tout vider
                </button>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
                <ul className="space-y-3 opacity-60">
                    {checkedItems.map(item => (
                    <ListItem 
                        key={item.id} 
                        item={item} 
                        onToggle={onToggle} 
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                    />
                    ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
}

function ListItem({ item, onToggle, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const inputRef = useRef(null);

    // Initialiser le texte d'édition quand on ouvre le mode édition
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleStartEdit = (e) => {
        e.stopPropagation(); // Empêche de cocher la case si on clique sur le texte
        if (item.checked) return; // On n'édite pas les items cochés pour garder ça simple

        // Reconstruire la chaîne lisible (ex: "2kg Tomates")
        let text = item.name;
        if (item.qty > 1 || item.unit) {
             // Si on a une unité, on met "2kg Tomates"
             // Sinon si juste quantité > 1, on met "2 Tomates"
             const prefix = item.qty > 1 ? item.qty : (item.unit ? item.qty : '');
             if (prefix) {
                 text = `${prefix}${item.unit} ${item.name}`;
             }
        }
        setEditText(text);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        if (!editText.trim()) {
            // Si vide, on supprime ? Non, on annule juste.
            return;
        }

        // On utilise le parseur pour ré-analyser la chaîne modifiée
        // Ex: "Oeuf" devient "6 Oeufs" -> parseInput("6 Oeufs")
        const parsed = parseInput(editText);
        if (parsed) {
            onUpdate(item.id, {
                name: parsed.name,
                qty: parsed.qty,
                unit: parsed.unit,
                category: parsed.category // On met à jour la catégorie au cas où le nom change drastiquement
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        }
    };

    return (
        <li className="flex items-center group relative pl-1 min-h-[40px]">
            {/* Checkbox */}
            <button
                onClick={() => onToggle(item.id, item.checked)}
                className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all focus:outline-none shrink-0",
                    item.checked 
                        ? "bg-sun-yellow border-sun-yellow" 
                        : "border-gray-300 hover:border-sun-yellow"
                )}
            >
                {item.checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </button>
            
            {/* Content (Text or Input) */}
            <div className="flex-1 transition-all mr-8">
                {isEditing ? (
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white border-b-2 border-sun-yellow focus:outline-none text-lg font-medium text-deep-blue px-1"
                    />
                ) : (
                    <div 
                        onClick={handleStartEdit}
                        className={clsx(
                            "cursor-text py-1 rounded select-none", // select-none pour éviter le highlight bleu natif sur mobile au tap
                            item.checked ? "text-gray-400 line-through" : "text-gray-800 font-medium active:bg-gray-100"
                        )}
                    >
                        <span className="text-lg">{item.name}</span>
                        {(item.qty > 1 || item.unit) && (
                            <span className="text-sm ml-2 font-normal opacity-80 bg-gray-100 px-2 py-0.5 rounded-lg inline-block text-gray-600">
                                {item.qty}{item.unit}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Delete Button */}
            {!isEditing && (
                <button
                    onClick={() => onDelete(item.id)}
                    className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/80 backdrop-blur-sm rounded-lg"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </li>
    );
}
