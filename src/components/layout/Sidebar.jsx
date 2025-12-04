import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  ShoppingBag, 
  Ticket, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import clsx from 'clsx';

const menus = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Mitra (Providers)', path: '/providers', icon: Briefcase },
  { name: 'Pengguna', path: '/users', icon: Users },
  { name: 'Pesanan', path: '/orders', icon: ShoppingBag },
  { name: 'Voucher', path: '/vouchers', icon: Ticket },
  { name: 'Pengaturan', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="w-64 bg-primary text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-white-700">
        <h1 className="text-2xl font-bold text-accent">Posko Admin</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menus.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive 
                  ? "bg-accent text-white shadow-lg" 
                  : "text-white-400 hover:bg-white-800 hover:text-white"
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}