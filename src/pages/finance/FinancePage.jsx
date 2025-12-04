import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { financeService } from '../../services/financeService';
import { DollarSign, Percent, TrendingUp, ShoppingCart } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function FinancePage() {
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({ adminFee: 0, platformCommissionPercent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, configRes] = await Promise.all([
        financeService.getPlatformStats(),
        financeService.getSettings()
      ]);
      setStats(statsRes.data);
      setConfig(configRes.data);
    } catch (error) {
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      await financeService.updateSettings(config);
      toast.success('Pengaturan diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui pengaturan');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  if (loading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Toaster />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Laporan & Pengaturan Keuangan</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Transaksi (Gross)" 
          value={`Rp ${stats?.totalTransactionValue?.toLocaleString() || 0}`} 
          icon={ShoppingCart} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Pendapatan Komisi (%)" 
          value={`Rp ${stats?.totalPlatformRevenue?.toLocaleString() || 0}`} 
          icon={Percent} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Pendapatan Admin Fee" 
          value={`Rp ${stats?.totalAdminFees?.toLocaleString() || 0}`} 
          icon={DollarSign} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Pendapatan Bersih" 
          value={`Rp ${stats?.netRevenue?.toLocaleString() || 0}`} 
          icon={TrendingUp} 
          color="bg-green-500" 
        />
      </div>

      {/* Global Config Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Pengaturan Potongan Global</h2>
        <form onSubmit={handleUpdateConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Biaya Layanan Aplikasi (Admin Fee)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                <input 
                  type="number" 
                  value={config.adminFee}
                  onChange={e => setConfig({...config, adminFee: Number(e.target.value)})}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Dibebankan ke user per transaksi.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Komisi Platform (%)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={config.platformCommissionPercent}
                  onChange={e => setConfig({...config, platformCommissionPercent: Number(e.target.value)})}
                  className="w-full pl-4 pr-10 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                />
                <span className="absolute right-3 top-2 text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Potongan dari pendapatan mitra.</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}