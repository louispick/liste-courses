import { CATEGORIES } from '../lib/categories';
import { Check, Trash2 } from 'lucide-react';

export default function CategoryList({ items, onToggle, onDelete }) {
  // Group items by category
  const grouped = items.reduce((acc, item) => {
    const cat = item.category || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Sort categories based on the definition order
  const sortedCategories = Object.keys(CATEGORIES).filter(c => grouped[c]);
  // Add 'Autre' if it exists and wasn't in the definition keys (though it is)
  if (grouped['Autre'] && !sortedCategories.includes('Autre')) {
    sortedCategories.push('Autre');
  }

  return (
    <div className="space-y-6 pb-24">
      {items.length === 0 && (
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
              <li key={item.id} className="flex items-center group">
                <button
                  onClick={() => onToggle(item.id, item.checked)}
                  className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center mr-4 transition-colors hover:border-sun-yellow focus:outline-none"
                >
                  {item.checked && <div className="w-4 h-4 bg-sun-yellow rounded-full" />}
                </button>
                
                <div className="flex-1">
                  <span className="text-gray-800 font-medium text-lg">
                    {item.name}
                  </span>
                  {(item.qty > 1 || item.unit) && (
                    <span className="text-gray-400 text-sm ml-2">
                      {item.qty} {item.unit}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onDelete(item.id)}
                  className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
