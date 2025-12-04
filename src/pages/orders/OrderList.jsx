import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../services/orderService';
import { Eye, Calendar, User, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import toast from 'react-hot-toast';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, completed, cancelled, all

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAll();
      setOrders(res.data);
    } catch (error) {
      toast.error('Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'accepted':
      case 'on_the_way':
      case 'working': return 'bg-purple-100 text-purple-800';
      case 'waiting_approval': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Grouping logic untuk filter
  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'completed') return o.status === 'completed';
    if (filter === 'cancelled') return ['cancelled', 'failed'].includes(o.status);
    if (filter === 'active') return !['completed', 'cancelled', 'failed'].includes(o.status);
    return true;
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Monitoring Pesanan</h1>
        <div className="flex bg-white rounded-lg p-1 border">
          {['active', 'completed', 'cancelled', 'all'].map(f => (
             <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition",
                  filter === f ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
             >
               {f.charAt(0).toUpperCase() + f.slice(1)}
             </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-600">ID Pesanan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Pelanggan</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Mitra</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Total</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Tanggal</th>
              <th className="p-4 text-sm font-semibold text-gray-600">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
               <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="p-4 font-mono text-xs text-gray-500">
                   {order.orderNumber || order._id.substring(0,8).toUpperCase()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-400" />
                    <span className="text-sm font-medium">{order.userId?.fullName || 'User Terhapus'}</span>
                  </div>
                </td>
                <td className="p-4">
                  {order.providerId ? (
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-gray-400" />
                      <span className="text-sm text-gray-700">{order.providerId.userId?.fullName || 'Mitra'}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Mencari...</span>
                  )}
                </td>
                <td className="p-4 text-sm font-medium">
                  Rp {order.totalAmount.toLocaleString()}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase().replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                   <div className="flex items-center gap-2">
                     <Calendar size={14} />
                     {new Date(order.scheduledAt).toLocaleDateString()}
                   </div>
                </td>
                <td className="p-4">
                  <Link to={`/orders/${order._id}`} className="text-gray-400 hover:text-primary">
                    <Eye size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}