import Sidebar from './Sidebar';
import { useAuthStore } from '../../store/authStore';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }) {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-white-50 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white-800">
              Halo, {user?.fullName || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <img 
              src={user?.profilePictureUrl || "https://via.placeholder.com/40"} 
              alt="Profile" 
              className="w-10 h-10 rounded-full border border-white-200 object-cover"
            />
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}