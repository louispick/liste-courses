import { useShoppingList } from '../hooks/useShoppingList';
import SmartInput from '../components/SmartInput';
import CategoryList from '../components/CategoryList';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';

export default function Home() {
  const { items, loading, error, addItem, toggleItem, deleteItem } = useShoppingList();

  const handleAdd = async (parsedItem) => {
    try {
        await addItem(parsedItem);
    } catch (e) {
        alert("Erreur lors de l'ajout: " + e.message);
    }
  };

  return (
    <div>
      <header className="mb-6 mt-2 px-2">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          Mathilde & Louis <span className="text-sun-yellow">Courses</span>
        </h1>
      </header>

      <SmartInput onAdd={handleAdd} existingItems={items} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 soft-shadow">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                  <h3 className="font-bold">Configuration requise</h3>
                  <p className="text-sm mt-1">
                      Une configuration est manquante sur votre base de données.
                  </p>
                  
                  {error.message && error.message.includes("requires an index") ? (
                    <div className="mt-3">
                      <p className="text-sm font-semibold mb-2">Cliquez sur ce lien pour réparer :</p>
                      <a 
                        href={error.message.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-red-100 px-3 py-2 rounded-lg text-xs break-all hover:bg-red-200 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        Créer l'index manquant
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs mt-2 bg-red-100 p-2 rounded">
                        Code: {error.code}
                    </p>
                  )}
              </div>
            </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-sun-yellow animate-spin" />
        </div>
      ) : (
        <CategoryList 
          items={items} 
          onToggle={toggleItem} 
          onDelete={deleteItem} 
        />
      )}
    </div>
  );
}
