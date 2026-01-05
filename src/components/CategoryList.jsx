import { CATEGORIES } from '../lib/categories';
import { Check, Trash2, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

export default function CategoryList({ items, onToggle, onDelete, onClearChecked }) {
  // Split Active vs Checked
  const activeItems = items.filter(i => !i.checked);
  const checkedItems = items.filter(i => i.checked);

  // Group ACTIVE items by category
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
      
      {/* --- ACTIVE ITEMS --- */}
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
              />
            ))}
          </ul>
        </div>
      ))}

      {/* --- CHECKED ITEMS (Grisés en bas) --- */}
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
                    />
                    ))}
                </ul>
            </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for cleaner code
function ListItem({ item, onToggle, onDelete }) {
    return (
        <li className="flex items-center group relative pl-1">
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
            
            <div className={clsx(
                "flex-1 transition-all",
                item.checked ? "text-gray-400 line-through" : "text-gray-800 font-medium"
            )}>
                <span className="text-lg">{item.name}</span>
                {(item.qty > 1 || item.unit) && (
                    <span className="text-sm ml-2 font-normal opacity-80 bg-gray-100 px-2 py-0.5 rounded-lg inline-block">
                        {item.qty} {item.unit}
                    </span>
                )}
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="text-gray-300 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/80 backdrop-blur-sm rounded-lg"
            >
                <Trash2 className="w-5 h-5" />
            </button>
        </li>
    );
}
