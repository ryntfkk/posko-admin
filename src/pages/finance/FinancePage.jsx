import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { financeService } from '../../services/financeService';
import { DollarSign, Percent, TrendingUp, ShoppingCart, ArrowDownRight, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, payments, payouts
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [stats, setStats] = useState(null);
  const [config, setConfig] = useState({ adminFee: 0, platformCommissionPercent: 0 });
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  // Fetch data berdasarkan tab aktif
  useEffect(() => {
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'payouts') fetchPayouts();
  }, [activeTab]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const [statsRes, configRes] = await Promise.all([
        financeService.getPlatformStats(),
        financeService.getSettings()
      ]);
      setStats(statsRes.data);
      setConfig(configRes.data);
    } catch (error) {
      toast.error('Gagal memuat ringkasan keuangan');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await financeService.getAllPayments({ limit: 50 });
      setPayments(res.data);
    } catch (error) {
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      // Ambil yang status 'completed' (siap cair) dan 'paid_out'
      const res = await financeService.getAllEarnings({ limit: 50 });
      setPayouts(res.data);
    } catch (error) {
      toast.error('Gagal memuat data pencairan');
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

  const handleProcessPayout = async (id) => {
    if (!window.confirm('Tandai pendapatan ini sebagai SUDAH DITRANSFER manual ke rekening mitra?')) return;
    try {
      await financeService.processPayout(id);
      toast.success('Status berhasil diubah');
      fetchPayouts();
    } catch (error) {
      toast.error('Gagal memproses');
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

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
        <div className="flex bg-white border p-1 rounded-lg">
          {['overview', 'payments', 'payouts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                activeTab === tab ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {tab === 'overview' ? 'Ringkasan & Config' : 
               tab === 'payments' ? 'Transaksi Masuk' : 'Pencairan Mitra'}
            </button>
          ))}
        </div>
      </div>

      {/* --- TAB 1: OVERVIEW & CONFIG --- */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Total Transaksi (Gross)" 
              value={`Rp ${stats?.totalTransactionValue?.toLocaleString() || 0}`} 
              icon={ShoppingCart} color="bg-blue-500" 
            />
            <StatCard 
              title="Pendapatan Komisi" 
              value={`Rp ${stats?.totalPlatformRevenue?.toLocaleString() || 0}`} 
              icon={Percent} color="bg-purple-500" 
            />
            <StatCard 
              title="Pendapatan Admin Fee" 
              value={`Rp ${stats?.totalAdminFees?.toLocaleString() || 0}`} 
              icon={DollarSign} color="bg-orange-500" 
            />
            <StatCard 
              title="Net Revenue Platform" 
              value={`Rp ${stats?.netRevenue?.toLocaleString() || 0}`} 
              icon={TrendingUp} color="bg-green-500" 
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Konfigurasi Global</h2>
            <form onSubmit={handleUpdateConfig} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Fee (Rp)</label>
                  <input type="number" value={config.adminFee} onChange={e => setConfig({...config, adminFee: Number(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Komisi Platform (%)</label>
                  <input type="number" value={config.platformCommissionPercent} onChange={e => setConfig({...config, platformCommissionPercent: Number(e.target.value)})}
                    className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition">Simpan Config</button>
            </form>
          </div>
        </>
      )}

      {/* --- TAB 2: TRANSAKSI MASUK (PAYMENTS) --- */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold">Order ID</th>
                <th className="p-4 text-sm font-semibold">Pembayar</th>
                <th className="p-4 text-sm font-semibold">Metode</th>
                <th className="p-4 text-sm font-semibold">Jumlah</th>
                <th className="p-4 text-sm font-semibold">Status</th>
                <th className="p-4 text-sm font-semibold">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : 
               payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono">{p.orderId?.orderNumber || '-'}</td>
                  <td className="p-4 text-sm">{p.orderId?.userId?.fullName || 'User'}</td>
                  <td className="p-4 text-sm capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="p-4 text-sm font-medium text-green-600">+ Rp {p.amount.toLocaleString()}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status.toUpperCase()}</span></td>
                  <td className="p-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- TAB 3: PENCAIRAN MITRA (EARNINGS) --- */}
      {activeTab === 'payouts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-sm font-semibold">Mitra</th>
                <th className="p-4 text-sm font-semibold">Info Bank</th>
                <th className="p-4 text-sm font-semibold">Total Order</th>
                <th className="p-4 text-sm font-semibold">Pendapatan Bersih</th>
                <th className="p-4 text-sm font-semibold">Status</th>
                <th className="p-4 text-sm font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr> : 
               payouts.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm">
                    <p className="font-bold">{e.providerId?.userId?.fullName || 'Mitra'}</p>
                    <p className="text-xs text-gray-500">{e.providerId?.userId?.email}</p>
                  </td>
                  <td className="p-4 text-sm">
                    <p>{e.providerId?.bankAccount?.bankName}</p>
                    <p className="font-mono text-xs">{e.providerId?.bankAccount?.accountNumber}</p>
                    <p className="text-xs text-gray-500">{e.providerId?.bankAccount?.accountHolderName}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">Rp {e.totalAmount.toLocaleString()}</td>
                  <td className="p-4 text-sm font-bold text-blue-600">Rp {e.earningsAmount.toLocaleString()}</td>
                  <td className="p-4">
                    {e.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded text-xs font-bold w-fit">
                        <Clock size={12}/> Menunggu Transfer
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold w-fit">
                        <CheckCircle size={12}/> Sudah Ditransfer
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {e.status === 'completed' && (
                      <button 
                        onClick={() => handleProcessPayout(e._id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 transition"
                      >
                        <ArrowDownRight size={14}/> Tandai Cair
                      </button>
                    )}
                    {e.status === 'paid_out' && <span className="text-xs text-gray-400 italic">Selesai: {new Date(e.paidOutAt).toLocaleDateString()}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}