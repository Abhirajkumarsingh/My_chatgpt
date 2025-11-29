import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 font-bold text-xl tracking-tight hidden md:block">LLM Chat</div>
        <nav className="flex-1 p-2 space-y-2">
          <Link to="/" className="flex items-center p-2 rounded hover:bg-slate-800">
            <MessageSquare className="w-6 h-6" />
            <span className="ml-3 hidden md:block">Chat</span>
          </Link>
          <Link to="/settings" className="flex items-center p-2 rounded hover:bg-slate-800">
            <Settings className="w-6 h-6" />
            <span className="ml-3 hidden md:block">Settings</span>
          </Link>
          {user?.is_admin && (
            <Link to="/admin" className="flex items-center p-2 rounded hover:bg-slate-800">
              <LayoutDashboard className="w-6 h-6" />
              <span className="ml-3 hidden md:block">Admin</span>
            </Link>
          )}
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button onClick={handleLogout} className="flex items-center p-2 w-full text-left hover:bg-slate-800 rounded">
            <LogOut className="w-5 h-5" />
            <span className="ml-3 hidden md:block">Logout</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-0">
            <Outlet />
        </main>
      </div>
    </div>
  );
};