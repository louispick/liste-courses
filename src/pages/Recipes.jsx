import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useShoppingList } from '../hooks/useShoppingList';
import { parseInput } from '../lib/parser';
import { Plus, Trash2, ChefHat, ChevronDown, ChevronUp, Check } from 'lucide-react';
import clsx from 'clsx';

export default function Recipes() {
  const { recipes, addRecipe, deleteRecipe } = useRecipes();
  const { addItem } = useShoppingList();
  
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  
  // Track expanded recipe card
  const [expandedId, setExpandedId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIngredients.trim()) return;

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

  const handleAddAll = async (e, recipe) => {
    e.stopPropagation();
    // Suppression de la confirmation
    for (const ingredient of recipe.ingredients) {
        await addItem(ingredient);
    }
  };

  const handleAddOne = async (e, ingredient) => {
    e.stopPropagation();
    await addItem(ingredient);
    // Visual feedback usually needed, but generic alert is intrusive.
    // Ideally use a toast, for now we assume it works.
  };

  return (
    <div className="pb-20">
      <header className="mb-6 mt-2 px-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          Recettes
        </h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-sun-yellow text-deep-blue p-2 rounded-xl shadow-md active:scale-95 transition-transform"
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
        {recipes.map(recipe => {
            const isExpanded = expandedId === recipe.id;

            return (
                <div 
                    key={recipe.id} 
                    className="bg-white rounded-3xl soft-shadow overflow-hidden transition-all duration-300"
                >
                    <div 
                        onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                        className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-sun-yellow/20 p-2 rounded-xl text-deep-blue">
                                <ChefHat className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-deep-blue">{recipe.title}</h3>
                                <p className="text-gray-400 text-sm">
                                    {recipe.ingredients.length} ingrédients
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                             {/* Delete Button (Small) */}
                             <button 
                                onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }} 
                                className="p-2 text-gray-300 hover:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                        </div>
                    </div>

                    {/* EXPANDED CONTENT */}
                    {isExpanded && (
                        <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100 pt-4">
                            <button 
                                onClick={(e) => handleAddAll(e, recipe)}
                                className="w-full mb-4 bg-deep-blue text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Tout ajouter à la liste
                            </button>

                            <ul className="space-y-2">
                                {recipe.ingredients.map((ing, idx) => (
                                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                        <span className="text-gray-700 font-medium">
                                            {ing.name} <span className="text-gray-400 font-normal text-sm ml-1">{ing.qty > 1 ? `(${ing.qty} ${ing.unit})` : ''}</span>
                                        </span>
                                        <button 
                                            onClick={(e) => handleAddOne(e, ing)}
                                            className="text-sun-yellow hover:text-orange-400 bg-yellow-50 p-1.5 rounded-lg active:scale-95 transition-transform"
                                            title="Ajouter cet ingrédient"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}
