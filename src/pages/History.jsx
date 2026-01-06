import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, writeBatch } from 'firebase/firestore';
import { useShoppingList } from '../hooks/useShoppingList';
import { Clock, Plus, Loader2, Trash2 } from 'lucide-react';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useShoppingList();

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        const q = query(collection(db, 'history'), orderBy('lastBought', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        if (!isMounted) return;

        const rawData = snapshot.docs.map(d => d.data());

        const uniqueMap = new Map();
        rawData.forEach(item => {
          const key = item.name.toLowerCase();
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

  const handleQuickAdd = async (item) => {
    try {
        await addItem({
            name: item.name,
            category: item.category,
            qty: 1, 
            unit: item.defaultUnit
        });
    } catch (e) {
        console.error("Erreur ajout rapide", e);
    }
  };

  const handleDeleteFromHistory = async (itemName, e) => {
    e.stopPropagation(); 
    
    // Suppression immédiate sans confirmation (Fluidité demandée)
    try {
        // Mise à jour locale optimiste (pour que ce soit instantané visuellement)
        setHistoryItems(prev => prev.filter(i => i.name !== itemName));

        const q = query(collection(db, 'history'), where('name', '==', itemName));
        const snapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

    } catch (error) {
        console.error("Erreur suppression historique:", error);
        // Si erreur, on pourrait recharger la liste, mais c'est rare.
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
        <div className="text-center py-10 text-gray-400 bg-white rounded-3xl p-8 soft-shadow">
            <p className="text-lg mb-2">Historique vide</p>
            <p className="text-sm">Les articles que tu supprimes de ta liste de courses apparaîtront ici pour les retrouver plus vite.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
            {historyItems.map((item, idx) => (
                <div
                    key={idx}
                    onClick={() => handleQuickAdd(item)}
                    className="bg-white p-4 rounded-2xl soft-shadow text-left hover:bg-gray-50 transition-colors flex flex-col justify-between group h-28 relative cursor-pointer"
                >
                    <div className="flex justify-between items-start">
                        <span className="font-semibold text-gray-800 line-clamp-2 pr-6">
                            {item.name}
                        </span>
                        
                        <button
                            onClick={(e) => handleDeleteFromHistory(item.name, e)}
                            className="text-gray-300 hover:text-red-400 absolute top-2 right-2 p-2 bg-white/50 rounded-full"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md max-w-[70%] truncate">
                            {item.category}
                        </span>
                        <div className="bg-sun-yellow text-deep-blue p-1.5 rounded-full shadow-sm active:scale-90 transition-transform">
                            <Plus className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
