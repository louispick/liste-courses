import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Sun } from 'lucide-react';

export default function Login() {
  const { user, login, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (user) return <Navigate to="/" />;

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError("Saisis d'abord ton e-mail ci-dessus.");
      return;
    }
    try {
      await resetPassword(email.trim());
    } catch (err) {
      // Compte inconnu : on ne le révèle pas. Toute autre erreur est affichée.
      if (err.code !== 'auth/user-not-found') {
        setError(
          err.code === 'auth/invalid-email'
            ? 'Adresse e-mail invalide.'
            : `Impossible d'envoyer l'e-mail (${err.code || err.message}).`
        );
        return;
      }
    }
    setInfo('Si ce compte existe, un e-mail de réinitialisation vient d\'être envoyé (pense aux spams).');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await login(email.trim(), password);
    } catch (err) {
      const wrong = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
      setError(wrong.includes(err.code) ? 'Email ou mot de passe incorrect.' : `Connexion impossible (${err.code || err.message}).`);
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
          {info && <p className="text-green-600 text-sm">{info}</p>}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-deep-blue text-white font-bold text-lg hover:bg-blue-800 transition-colors shadow-lg shadow-blue-900/20"
          >
            Se connecter
          </button>
        </form>

        <button
          type="button"
          onClick={handleReset}
          className="mt-6 text-sm text-gray-500 hover:text-deep-blue underline"
        >
          Mot de passe oublié ?
        </button>

      </div>
    </div>
  );
}
