import { Outlet, useLocation, Link } from 'react-router-dom';
import { List, ChefHat, History, User, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', icon: List, label: 'Liste' },
    { path: '/recipes', icon: ChefHat, label: 'Recettes' },
    { path: '/quiz', icon: Heart, label: 'Jeu' },
    { path: '/history', icon: History, label: 'Historique' },
  ];

  return (
    <div className="min-h-screen bg-off-white font-sans pb-20">
      {/* Content */}
      <main className="max-w-md mx-auto p-4 min-h-screen">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 rounded-t-3xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)] z-40 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={clsx(
                  "flex flex-col items-center gap-1 transition-colors min-w-[64px]",
                  isActive ? "text-deep-blue" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <div className={clsx(
                  "p-2 rounded-2xl transition-all",
                  isActive ? "bg-sun-yellow text-deep-blue" : "bg-transparent"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
