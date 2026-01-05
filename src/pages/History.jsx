import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useShoppingList } from '../hooks/useShoppingList';
import { Clock, Plus, Loader2, Check } from 'lucide-react';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useShoppingList();
  
  // Track visual feedback per item
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'history'), orderBy('lastBought', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        
        if (!isMounted) return;

        const rawData = snapshot.docs.map(d => d.data());

        const uniqueMap = new Map();
        rawData.forEach(item => {
          // Normalisation très basique pour éviter "Tomates" et "tomates"
          const key = item.name.toLowerCase().trim();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });

        setHistoryItems(Array.from(uniqueMap.values()));
      } catch (error) {
        console.error("Erreur chargement historique:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuickAdd = async (item, index) => {
    try {
        // Feedback immédiat
        setAddedItems(prev => ({ ...prev, [index]: true }));

        await addItem({
            name: item.name,
            category: item.category,
            qty: 1, 
            unit: item.defaultUnit
        });
        
        // Reset feedback après 1.5s
        setTimeout(() => {
            setAddedItems(prev => ({ ...prev, [index]: false }));
        }, 1500);

    } catch (e) {
        console.error("Erreur ajout rapide", e);
        setAddedItems(prev => ({ ...prev, [index]: false }));
    }
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
        <div className="space-y-3">
            {historyItems.map((item, idx) => {
                const isAdded = addedItems[idx];
                
                return (
                    <button
                        key={idx}
                        onClick={() => handleQuickAdd(item, idx)}
                        className="w-full bg-white p-4 rounded-2xl soft-shadow flex items-center justify-between hover:bg-gray-50 transition-all active:scale-[0.98]"
                    >
                        <div className="flex flex-col items-start text-left">
                            <span className="font-bold text-gray-800 text-lg">
                                {item.name}
                            </span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                                {item.category}
                            </span>
                        </div>

                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${isAdded ? 'bg-green-500 text-white scale-110' : 'bg-sun-yellow text-deep-blue'}
                        `}>
                            {isAdded ? (
                                <Check className="w-6 h-6" strokeWidth={3} />
                            ) : (
                                <Plus className="w-6 h-6" />
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
      )}
    </div>
  );
}
