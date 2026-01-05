import { useShoppingList } from '../hooks/useShoppingList';
import { useAuth } from '../hooks/useAuth';
import SmartInput from '../components/SmartInput';
import CategoryList from '../components/CategoryList';
import { Loader2, LogOut } from 'lucide-react';

export default function Home() {
  const { items, loading, error, addItem, updateItem, toggleItem, deleteItem, clearCheckedItems } = useShoppingList();
  const { logout } = useAuth();

  const handleAdd = async (parsedItem) => {
    try {
        await addItem(parsedItem);
    } catch (e) {
        alert("Erreur lors de l'ajout: " + e.message);
    }
  };

  const handleLogout = () => {
      if(confirm("Se déconnecter ?")) {
          logout();
      }
  };

  return (
    <div>
      <header className="mb-6 mt-2 px-2 flex justify-between items-start">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight leading-none">
          Mathilde & Louis <br/>
          <span className="text-sun-yellow">Courses</span>
        </h1>
        
        <button 
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-400 p-2"
            title="Se déconnecter"
        >
            <LogOut className="w-5 h-5" />
        </button>
      </header>

      <SmartInput onAdd={handleAdd} existingItems={items} />

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm">
            <p className="font-bold">Erreur : {error.code}</p>
            <p>{error.message}</p>
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
          onUpdate={updateItem}
          onClearChecked={clearCheckedItems}
        />
      )}
    </div>
  );
}
