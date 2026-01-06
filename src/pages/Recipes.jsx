import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useShoppingList } from '../hooks/useShoppingList';
import { parseInput } from '../lib/parser';
import { Plus, Trash2, ChefHat, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react';
import clsx from 'clsx';

export default function Recipes() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { addItem } = useShoppingList();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // ID de la recette en cours d'édition (null si création)
  
  const [newTitle, setNewTitle] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  
  const [expandedId, setExpandedId] = useState(null);

  const resetForm = () => {
      setNewTitle('');
      setNewIngredients('');
      setEditingId(null);
      setShowForm(false);
  };

  const startEdit = (e, recipe) => {
      e.stopPropagation();
      setEditingId(recipe.id);
      setNewTitle(recipe.title);
      
      // Reconversion des ingrédients en texte pour l'édition
      const textIngredients = recipe.ingredients.map(i => {
          let line = i.name;
          // Formatage simple : "Qty Unit Name" ou "Name"
          if (i.qty && i.qty !== 1) {
              line = `${i.qty}${i.unit ? i.unit : ''} ${i.name}`; 
          } else if (i.unit) {
              line = `${i.qty}${i.unit} ${i.name}`;
          }
          return line;
      }).join('\n');

      setNewIngredients(textIngredients);
      setShowForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newIngredients.trim()) return;

    const lines = newIngredients.split('\n');
    const ingredients = lines
      .map(line => parseInput(line))
      .filter(item => item !== null);

    if (ingredients.length === 0) return;

    if (editingId) {
        await updateRecipe(editingId, newTitle, ingredients);
    } else {
        await addRecipe(newTitle, ingredients);
    }

    resetForm();
  };

  const handleAddAll = async (e, recipe) => {
    e.stopPropagation();
    for (const ingredient of recipe.ingredients) {
        await addItem(ingredient);
    }
  };

  const handleAddOne = async (e, ingredient) => {
    e.stopPropagation();
    await addItem(ingredient);
  };

  return (
    <div className="pb-20">
      <header className="mb-6 mt-2 px-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-deep-blue tracking-tight">
          Recettes
        </h1>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-sun-yellow text-deep-blue p-2 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          {showForm ? <X /> : <Plus />}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl soft-shadow mb-6 animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-deep-blue mb-4">
              {editingId ? 'Modifier la recette' : 'Nouvelle recette'}
          </h2>
          
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
          <div className="flex gap-2">
            <button 
                type="button" 
                onClick={resetForm}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl"
            >
                Annuler
            </button>
            <button 
                type="submit" 
                className="flex-1 bg-deep-blue text-white font-bold py-3 rounded-xl"
            >
                {editingId ? 'Mettre à jour' : 'Sauvegarder'}
            </button>
          </div>
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
                             {/* Edit Button */}
                             <button 
                                onClick={(e) => startEdit(e, recipe)} 
                                className="p-2 text-gray-300 hover:text-deep-blue"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>

                             {/* Delete Button */}
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
