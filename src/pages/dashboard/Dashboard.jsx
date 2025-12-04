import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { financeService } from '../../services/financeService';
import { providerService } from '../../services/providerService';
import { orderService } from '../../services/orderService';
import { Users, ShoppingBag, DollarSign, Briefcase, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [stats, setStats] = useState({
    income: 0,
    orders: 0,
    providers: 0,
    pendingProviders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch data secara paralel agar cepat
        const [financeRes, providerRes, orderRes] = await Promise.all([
          financeService.getPlatformStats(),
          providerService.getAll({ limit: 1 }), // Kita hanya butuh total count jika backend support, atau ambil semua
          orderService.getAll()
        ]);

        // Hitung manual ringkasan (ideally backend menyediakan endpoint khusus dashboard)
        const pendingProv = providerRes.data.filter(p => p.verificationStatus === 'pending').length;
        
        setStats({
          income: financeRes.data?.netRevenue || 0,
          orders: orderRes.data?.length || 0,
          providers: providerRes.data?.length || 0,
          pendingProviders: pendingProv
        });
      } catch (error) {
        console.error("Gagal memuat dashboard", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const Card = ({ title, value, icon: Icon, color, link, subtext }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-white-100 relative overflow-hidden">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-white-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white-800">{loading ? '...' : value}</h3>
          {subtext && <p className="text-xs text-orange-600 mt-1 font-medium">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon size={24} />
        </div>
      </div>
      {link && (
        <Link to={link} className="absolute bottom-0 left-0 w-full bg-white-50 px-6 py-2 text-xs font-medium text-white-600 hover:text-primary flex items-center justify-between border-t border-white-100 transition-colors">
          Lihat Detail <ArrowUpRight size={14} />
        </Link>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white-800">Dashboard Overview</h1>
        <p className="text-white-500">Ringkasan aktivitas platform Posko.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          title="Total Pendapatan" 
          value={`Rp ${stats.income.toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-green-500"
          link="/settings"
        />
        <Card 
          title="Total Pesanan" 
          value={stats.orders} 
          icon={ShoppingBag} 
          color="bg-blue-500"
          link="/orders"
        />
        <Card 
          title="Total Mitra" 
          value={stats.providers} 
          icon={Briefcase} 
          color="bg-purple-500"
          link="/providers"
          subtext={stats.pendingProviders > 0 ? `${stats.pendingProviders} Perlu Verifikasi` : null}
        />
        <Card 
          title="Total User" 
          value="-" // Backend belum ada endpoint count user, bisa ditambahkan nanti
          icon={Users} 
          color="bg-orange-500"
          link="/users"
        />
      </div>

      {/* Quick Actions / Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-2">Selamat Datang, Admin!</h2>
        <p className="text-slate-300 max-w-2xl mb-6">
          Anda memiliki kontrol penuh atas aplikasi. Pastikan untuk memeriksa Mitra yang menunggu verifikasi dan memantau pesanan yang sedang berjalan.
        </p>
        <div className="flex gap-4">
          <Link to="/providers" className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-white-100 transition">
            Verifikasi Mitra
          </Link>
          <Link to="/services" className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition">
            Kelola Layanan
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}