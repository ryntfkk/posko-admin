import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { providerService } from '../../services/providerService';
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function ProviderList() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, verified

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await providerService.getAll({ limit: 100 });
      setProviders(res.data);
    } catch (error) {
      toast.error('Gagal memuat data mitra');
    } finally {
      setLoading(false);
    }
  };

  // Filter Client-side (karena endpoint backend listProviders belum support filter by status verification secara native di query param, kecuali kita tambahkan logic filter di backend juga)
  const filteredProviders = providers.filter(p => {
    if (filter === 'all') return true;
    return p.verificationStatus === filter;
  });

  const getStatusBadge = (status) => {
    const styles = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-gray-100 text-gray-800',
    };
    
    const labels = {
      verified: 'Terverifikasi',
      pending: 'Menunggu',
      rejected: 'Ditolak',
      suspended: 'Ditangguhkan'
    };

    return (
      <span className={clsx("px-2 py-1 rounded-full text-xs font-semibold", styles[status] || styles.pending)}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Mitra</h1>
        <div className="flex gap-2">
           {['all', 'pending', 'verified'].map((status) => (
             <button
               key={status}
               onClick={() => setFilter(status)}
               className={clsx(
                 "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                 filter === status ? "bg-primary text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
               )}
             >
               {status === 'all' ? 'Semua' : status.charAt(0).toUpperCase() + status.slice(1)}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">Nama Mitra</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Email</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Layanan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
            ) : filteredProviders.length === 0 ? (
               <tr><td colSpan="5" className="p-8 text-center text-gray-500">Belum ada data mitra.</td></tr>
            ) : (
              filteredProviders.map((provider) => (
                <tr key={provider._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={provider.userId.profilePictureUrl || "https://via.placeholder.com/40"} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover bg-gray-200"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{provider.userId.fullName}</p>
                        <p className="text-xs text-gray-500">{provider.userId.phoneNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{provider.userId.email}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {provider.services?.length || 0} Layanan
                  </td>
                  <td className="p-4">
                    {getStatusBadge(provider.verificationStatus)}
                  </td>
                  <td className="p-4">
                    <Link 
                      to={`/providers/${provider._id}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                    >
                      <Eye size={16} /> Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}