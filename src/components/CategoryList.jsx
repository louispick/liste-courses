import { useState, useRef, useEffect } from 'react';
import { CATEGORY_NAMES, findCategory } from '../lib/categories';
import { parseInput, formatQuantity, itemToText } from '../lib/parser';
import { Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';

// La catégorie est recalculée à l'affichage (le dictionnaire s'améliore sans migrer les anciennes
// données), sauf si l'utilisateur l'a choisie lui-même (categoryManual).
const categoryOf = (item) =>
  item.categoryManual && item.category ? item.category : findCategory(item.name);

export default function CategoryList({ items, onToggle, onUpdate, onClearChecked }) {
  const activeItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  const grouped = {};
  for (const item of activeItems) {
    const cat = categoryOf(item);
    (grouped[cat] ||= []).push(item);
  }

  // Ordre "rayons" ; les catégories inconnues (anciennes données) sont ajoutées à la fin
  const knownFirst = CATEGORY_NAMES.filter((c) => grouped[c]);
  const unknown = Object.keys(grouped).filter((c) => !CATEGORY_NAMES.includes(c));
  const sortedCategories = [...knownFirst, ...unknown];

  return (
    <div className="space-y-6 pb-24">
      {activeItems.length === 0 && checkedItems.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Frigo vide ? 😱</p>
          <p className="text-sm mt-2">Ajoute des articles ci-dessus !</p>
        </div>
      )}

      {sortedCategories.map((cat) => (
        <div key={cat} className="bg-white rounded-3xl p-5 soft-shadow">
          <h2 className="text-deep-blue font-bold text-lg mb-4 px-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-sun-yellow rounded-full block"></span>
            {cat}
          </h2>
          <ul className="space-y-3">
            {grouped[cat].map((item) => (
              <ListItem key={item.id} item={item} category={cat} onToggle={onToggle} onUpdate={onUpdate} />
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
              onClick={() => {
                if (confirm(`Retirer les ${checkedItems.length} articles déjà pris ?`)) onClearChecked();
              }}
              className="text-red-400 text-xs font-bold bg-red-50 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Tout vider
            </button>
          </div>

          <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
            <ul className="space-y-3 opacity-60">
              {checkedItems.map((item) => (
                <ListItem key={item.id} item={item} category={categoryOf(item)} onToggle={onToggle} onUpdate={onUpdate} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ListItem({ item, category, onToggle, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [editCategory, setEditCategory] = useState(category);
  const inputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const startEdit = () => {
    if (item.checked) return;
    setEditText(itemToText(item));
    setEditCategory(category);
    setIsEditing(true);
  };

  const save = async () => {
    setIsEditing(false);
    const parsed = parseInput(editText);
    if (!parsed) return;

    const categoryChanged = editCategory !== category;
    const updates = {
      name: parsed.name,
      qty: parsed.qty,
      unit: parsed.unit,
      category: categoryChanged || item.categoryManual ? editCategory : parsed.category,
      categoryManual: categoryChanged || !!item.categoryManual,
    };
    try {
      await onUpdate(item.id, updates);
    } catch (err) {
      alert('Modification impossible : ' + err.message);
    }
  };

  // On ne sauvegarde que si le focus sort du formulaire (le select reste dans le formulaire)
  const handleBlur = (e) => {
    if (formRef.current && !formRef.current.contains(e.relatedTarget)) save();
  };

  const hasQty = item.qty > 1 || item.unit;

  return (
    <li className="flex items-center group relative pl-1 min-h-[40px]">
      <button
        onClick={() => onToggle(item.id, item.checked)}
        aria-label={item.checked ? `Remettre ${item.name} dans la liste` : `Cocher ${item.name}`}
        className={clsx(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all focus:outline-none shrink-0',
          item.checked ? 'bg-sun-yellow border-sun-yellow' : 'border-gray-300 hover:border-sun-yellow'
        )}
      >
        {item.checked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <form
            ref={formRef}
            onSubmit={(e) => { e.preventDefault(); save(); }}
            onBlur={handleBlur}
            onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
            className="space-y-1"
          >
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full bg-white border-b-2 border-sun-yellow focus:outline-none text-lg font-medium text-deep-blue px-1"
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1"
              aria-label="Rayon"
            >
              {CATEGORY_NAMES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </form>
        ) : (
          <div
            onClick={startEdit}
            className={clsx(
              'cursor-text py-1 rounded select-none',
              item.checked ? 'text-gray-400 line-through' : 'text-gray-800 font-medium active:bg-gray-100'
            )}
          >
            <span className="text-lg">{item.name}</span>
            {hasQty && (
              <span className="text-sm ml-2 font-normal opacity-80 bg-gray-100 px-2 py-0.5 rounded-lg inline-block text-gray-600">
                {formatQuantity(item.qty, item.unit)}
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
