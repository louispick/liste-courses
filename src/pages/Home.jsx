import { useShoppingList } from '../hooks/useShoppingList';
import SmartInput from '../components/SmartInput';
import CategoryList from '../components/CategoryList';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { items, loading, addItem, toggleItem, deleteItem } = useShoppingList();

  const handleAdd = async (parsedItem) => {
    // Add logic handled in SmartInput calling this
    await addItem(parsedItem);
  };

  return (
    <div>
      <header className="mb-6 mt-2 px-2">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          L'Attrape-Rêves <span className="text-sun-yellow">Courses</span>
        </h1>
      </header>

      <SmartInput onAdd={handleAdd} existingItems={items} />

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
