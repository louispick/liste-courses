import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const { user, login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-off-white">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8 soft-shadow text-center">
        <div className="flex justify-center mb-6">
            <div className="bg-sun-yellow/20 p-4 rounded-full">
                <Sun className="text-sun-yellow w-10 h-10" />
            </div>
        </div>
        <h1 className="text-2xl font-bold text-deep-blue mb-2">
          {isLogin ? 'Bon retour !' : 'Bienvenue'}
        </h1>
        <p className="text-gray-500 mb-8">
          L'Attrape-Rêves Courses
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input-soft"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="input-soft"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-deep-blue text-white font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
          >
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 text-sm text-gray-500 hover:text-deep-blue underline"
        >
          {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
