import { useAuth } from '../hooks/useAuth';
import { LogOut, User } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div className="pt-10 px-4 text-center">
      <div className="bg-white rounded-3xl p-8 soft-shadow max-w-sm mx-auto">
        <div className="bg-sun-yellow/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <User className="text-sun-yellow w-10 h-10" />
        </div>
        
        <h2 className="text-2xl font-bold text-deep-blue mb-2">Mon Profil</h2>
        <p className="text-gray-500 mb-8">{user?.email}</p>

        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
