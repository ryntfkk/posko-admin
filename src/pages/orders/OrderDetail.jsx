import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../services/orderService';
import { ArrowLeft, MapPin, Briefcase, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getById(id);
      setOrder(res.data);
    } catch (error) {
      toast.error('Pesanan tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    const actionName = newStatus === 'cancelled' ? 'membatalkan' : 'menyelesaikan';
    if (!window.confirm(`Apakah Anda yakin ingin ${actionName} pesanan ini secara paksa? Tindakan ini tidak dapat dibatalkan.`)) return;

    try {
      // Menggunakan endpoint existing yang sudah diperbarui di backend untuk support Admin override
      await orderService.updateStatus(id, newStatus);
      toast.success(`Pesanan berhasil di-${newStatus}`);
      fetchOrder(); // Refresh data
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal mengubah status');
    }
  };

  if (loading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  if (!order) return <AdminLayout><div className="p-8">Data tidak ditemukan</div></AdminLayout>;

  const isActive = !['completed', 'cancelled', 'failed'].includes(order.status);

  return (
    <AdminLayout>
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/orders')} className="mb-6 flex items-center text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={18} className="mr-2"/> Kembali
        </button>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
             <div>
               <p className="text-sm text-gray-500 mb-1">Order ID: {order.orderNumber || order._id}</p>
               <h1 className="text-2xl font-bold text-gray-800">
                  {order.orderType === 'direct' ? 'Direct Order' : 'Basic Order'}
               </h1>
             </div>
             <div className="text-right">
                <span className="block text-2xl font-bold text-primary">Rp {order.totalAmount.toLocaleString()}</span>
                <span className="inline-block mt-1 px-3 py-1 bg-white border rounded-full text-sm font-medium text-gray-600 capitalize">
                  {order.status.replace('_', ' ')}
                </span>
             </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Info Pelanggan */}
             <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Informasi Pengiriman
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 border border-gray-100">
                   <p><span className="font-medium text-gray-600">Nama:</span> {order.customerContact?.name || order.userId?.fullName}</p>
                   <p><span className="font-medium text-gray-600">Telepon:</span> {order.customerContact?.phone || order.userId?.phoneNumber}</p>
                   <p><span className="font-medium text-gray-600">Alamat:</span> {order.shippingAddress?.detail}, {order.shippingAddress?.city}</p>
                   <p><span className="font-medium text-gray-600">Jadwal:</span> {new Date(order.scheduledAt).toLocaleString('id-ID')}</p>
                </div>
             </div>

             {/* Info Mitra */}
             <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                   <Briefcase size={18} className="text-blue-600" /> Mitra Penanggung Jawab
                </h3>
                {order.providerId ? (
                   <div className="bg-blue-50 p-4 rounded-lg text-sm flex items-center gap-4 border border-blue-100">
                      <img src={order.providerId.userId?.profilePictureUrl || "https://via.placeholder.com/50"} 
                           className="w-12 h-12 rounded-full bg-white object-cover" />
                      <div>
                         <p className="font-bold text-blue-900">{order.providerId.userId?.fullName}</p>
                         <p className="text-blue-700">{order.providerId.userId?.phoneNumber}</p>
                      </div>
                   </div>
                ) : (
                   <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 border border-yellow-100 flex gap-2">
                      <AlertTriangle size={16} />
                      Belum ada mitra yang mengambil pesanan ini.
                   </div>
                )}
             </div>
          </div>

          {/* Item List */}
          <div className="p-6 border-t border-gray-100">
             <h3 className="font-semibold text-gray-800 mb-4">Rincian Layanan</h3>
             <table className="w-full text-sm">
                <thead>
                   <tr className="border-b text-gray-500">
                      <th className="text-left py-2 font-medium">Layanan</th>
                      <th className="text-center py-2 font-medium">Qty</th>
                      <th className="text-right py-2 font-medium">Harga</th>
                      <th className="text-right py-2 font-medium">Subtotal</th>
                   </tr>
                </thead>
                <tbody>
                   {order.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                         <td className="py-3">{item.name} <br/><span className="text-xs text-gray-400">{item.note}</span></td>
                         <td className="text-center py-3">{item.quantity}</td>
                         <td className="text-right py-3">Rp {item.price.toLocaleString()}</td>
                         <td className="text-right py-3 font-medium">Rp {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>

          {/* Admin Actions */}
          {isActive && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3">
              <div className="text-sm text-gray-500 flex items-center mr-auto">
                <AlertTriangle size={16} className="mr-2 text-orange-500"/>
                Admin Zone: Aksi Paksa
              </div>
              <button 
                onClick={() => handleStatusUpdate('cancelled')}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 bg-white hover:bg-red-50 rounded-lg transition-colors"
              >
                <XCircle size={18} /> Batalkan Paksa
              </button>
              <button 
                onClick={() => handleStatusUpdate('completed')}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors shadow-sm"
              >
                <CheckCircle size={18} /> Selesaikan Paksa
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}