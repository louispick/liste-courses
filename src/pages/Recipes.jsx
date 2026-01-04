import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useShoppingList } from '../hooks/useShoppingList';
import { parseInput } from '../lib/parser';
import { Plus, Trash2, ChefHat, ArrowRight } from 'lucide-react';

export default function Recipes() {
  const { recipes, addRecipe, deleteRecipe } = useRecipes();
  const { addItem } = useShoppingList();
  
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState(''); // Text area input

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIngredients.trim()) return;

    // Parse ingredients line by line
    const lines = newIngredients.split('\n');
    const ingredients = lines
      .map(line => parseInput(line))
      .filter(item => item !== null);

    if (ingredients.length === 0) return;

    await addRecipe(newTitle, ingredients);
    setNewTitle('');
    setNewIngredients('');
    setShowForm(false);
  };

  const handleAddToList = async (recipe) => {
    // Add all ingredients to shopping list
    // Note: We're not doing duplicate checks here for simplicity in this MVP version
    // but the system handles multiple items fine.
    for (const ingredient of recipe.ingredients) {
      await addItem(ingredient);
    }
    alert(`Ingrédients de "${recipe.title}" ajoutés !`);
  };

  return (
    <div className="pb-20">
      <header className="mb-6 mt-2 px-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          Recettes
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-sun-yellow text-deep-blue p-2 rounded-xl"
        >
          <Plus />
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl soft-shadow mb-6 animate-in slide-in-from-top-4">
          <input
            type="text"
            placeholder="Titre (ex: Pâtes Carbo)"
            className="input-soft mb-4 bg-gray-50"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Ingrédients (un par ligne)&#10;500g pâtes&#10;200g lardons&#10;3 oeufs"
            className="input-soft mb-4 bg-gray-50 min-h-[150px]"
            value={newIngredients}
            onChange={e => setNewIngredients(e.target.value)}
          />
          <button type="submit" className="w-full bg-deep-blue text-white font-bold py-3 rounded-xl">
            Sauvegarder
          </button>
        </form>
      )}

      <div className="space-y-4">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-3xl p-5 soft-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <ChefHat className="text-sun-yellow w-6 h-6" />
                <h3 className="font-bold text-lg text-deep-blue">{recipe.title}</h3>
              </div>
              <button onClick={() => deleteRecipe(recipe.id)} className="text-gray-300 hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-500 text-sm mb-4">
              {recipe.ingredients.length} ingrédients
            </p>

            <button 
              onClick={() => handleAddToList(recipe)}
              className="w-full bg-gray-100 hover:bg-sun-yellow hover:text-deep-blue transition-colors text-gray-700 font-semibold py-2 rounded-xl flex items-center justify-center gap-2"
            >
              <span>Tout ajouter à la liste</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
