import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, where, writeBatch } from 'firebase/firestore';
import { useShoppingList } from '../hooks/useShoppingList';
import { Clock, Plus, Loader2, Trash2, TrendingUp } from 'lucide-react';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useShoppingList();

  useEffect(() => {
    let isMounted = true;

    const fetchHistory = async () => {
      try {
        // TRI PAR FRÉQUENCE (frequency desc), PUIS PAR DATE (lastBought desc)
        // Note: Cela nécessite un index composite dans Firestore si on combine les deux orderBy.
        // Pour éviter l'erreur d'index bloquante maintenant, on trie par fréquence en JS.
        // On charge tout (limit 200) et on trie côté client, c'est plus robuste pour l'instant.
        
        const q = query(collection(db, 'history'), limit(200)); 
        const snapshot = await getDocs(q);
        
        if (!isMounted) return;

        const rawData = snapshot.docs.map(d => {
            const data = d.data();
            // Fallback pour les vieux items qui n'ont pas de fréquence
            return {
                id: d.id,
                ...data,
                frequency: data.frequency || 1
            };
        });

        // Dédoublonnage visuel (au cas où il reste des doublons en base)
        const uniqueMap = new Map();
        rawData.forEach(item => {
          const key = item.name.toLowerCase();
          // On garde celui avec la plus haute fréquence ou le plus récent
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          } else {
             // Si doublon, on prend le meilleur (logique de fusion visuelle)
             const existing = uniqueMap.get(key);
             if (item.frequency > existing.frequency) {
                 uniqueMap.set(key, item);
             }
          }
        });

        let sortedItems = Array.from(uniqueMap.values());

        // LE TRI MAGIQUE
        sortedItems.sort((a, b) => {
            // 1. Fréquence d'abord
            if (b.frequency !== a.frequency) {
                return b.frequency - a.frequency;
            }
            // 2. Date ensuite (le plus récent en premier)
            const dateA = a.lastBought?.seconds || 0;
            const dateB = b.lastBought?.seconds || 0;
            return dateB - dateA;
        });

        setHistoryItems(sortedItems);
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
    try {
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
            <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-deep-blue">
          Top Produits
        </h1>
      </header>

      {historyItems.length === 0 ? (
        <div className="text-center py-10 text-gray-400 bg-white rounded-3xl p-8 soft-shadow">
            <p className="text-lg mb-2">Historique vide</p>
            <p className="text-sm">Tes achats fréquents apparaîtront ici automatiquement.</p>
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
                        <span className="font-semibold text-gray-800 line-clamp-2 pr-6 leading-tight">
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
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md truncate">
                                {item.category}
                            </span>
                            {/* Indicateur visuel de fréquence */}
                            {item.frequency > 1 && (
                                <span className="text-[10px] text-sun-yellow font-bold pl-1">
                                    ★ {item.frequency}
                                </span>
                            )}
                        </div>
                        
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
