import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Sun } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      const wrong = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
      setError(wrong.includes(err.code) ? 'Email ou mot de passe incorrect.' : 'Connexion impossible, réessaie dans un instant.');
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
          Bon retour !
        </h1>
        <p className="text-gray-500 mb-8">
          Mathilde & Louis
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            autoComplete="username"
            placeholder="Email"
            className="input-soft"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            autoComplete="current-password"
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
            Se connecter
          </button>
        </form>

      </div>
    </div>
  );
}
