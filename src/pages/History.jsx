import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useShoppingList } from '../hooks/useShoppingList';
import { Clock, Plus, Loader2 } from 'lucide-react';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useShoppingList();

  useEffect(() => {
    const fetchHistory = async () => {
      // On récupère les 50 derniers achats
      const q = query(collection(db, 'history'), orderBy('lastBought', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const rawData = snapshot.docs.map(d => d.data());

      // DÉDOUBLONNAGE INTELLIGENT
      // On garde une seule entrée par nom d'article
      const uniqueMap = new Map();
      rawData.forEach(item => {
        const key = item.name.toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, item);
        }
      });

      setHistoryItems(Array.from(uniqueMap.values()));
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const handleQuickAdd = async (item) => {
    await addItem({
      name: item.name,
      category: item.category,
      qty: 1, // Par défaut 1 quand on réajoute depuis l'historique
      unit: item.defaultUnit
    });
    // Petit feedback visuel ou juste laisser faire car c'est rapide
    alert(`${item.name} ajouté !`); 
  };

  if (loading) return (
    <div className="flex justify-center pt-20">
      <Loader2 className="w-8 h-8 text-sun-yellow animate-spin" />
    </div>
  );

  return (
    <div className="pt-6 pb-20">
      <header className="mb-6 px-2 flex items-center gap-3">
        <div className="bg-sun-yellow/20 p-2 rounded-xl text-deep-blue">
            <Clock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-deep-blue">
          Produits fréquents
        </h1>
      </header>

      {historyItems.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-3xl p-8">
            <p>Ton historique est vide pour l'instant.</p>
            <p className="text-sm mt-2">Les articles supprimés apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
            {historyItems.map((item, idx) => (
                <button
                    key={idx}
                    onClick={() => handleQuickAdd(item)}
                    className="bg-white p-4 rounded-2xl soft-shadow text-left hover:bg-gray-50 transition-colors flex flex-col justify-between group h-24"
                >
                    <span className="font-semibold text-gray-800 line-clamp-2">
                        {item.name}
                    </span>
                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                            {item.category}
                        </span>
                        <div className="bg-sun-yellow text-deep-blue p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4" />
                        </div>
                    </div>
                </button>
            ))}
        </div>
      )}
    </div>
  );
}
