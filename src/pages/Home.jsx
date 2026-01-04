import { useShoppingList } from '../hooks/useShoppingList';
import SmartInput from '../components/SmartInput';
import CategoryList from '../components/CategoryList';
import { Loader2, AlertCircle } from 'lucide-react';

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
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex gap-3 items-start soft-shadow">
            <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
                <h3 className="font-bold">Erreur d'accès</h3>
                <p className="text-sm mt-1">
                    Impossible de charger la liste. Cela vient probablement des règles de sécurité Firebase.
                </p>
                <p className="text-xs mt-2 bg-red-100 p-2 rounded">
                    Code: {error.code}
                </p>
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
