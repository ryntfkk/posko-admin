import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { orderService } from '../../services/orderService';
import { ArrowLeft, MapPin, Phone, CreditCard } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await orderService.getById(id);
        setOrder(res.data);
      } catch (error) {
        toast.error('Pesanan tidak ditemukan');
      }
    };
    fetch();
  }, [id]);

  if (!order) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/orders')} className="mb-6 flex items-center text-gray-500 hover:text-primary">
          <ArrowLeft size={18} className="mr-2"/> Kembali
        </button>

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
                <span className="text-sm text-gray-500 capitalize">{order.status.replace('_', ' ')}</span>
             </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
             {/* Info Pelanggan */}
             <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={18} /> Informasi Pengiriman
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                   <p><span className="font-medium">Nama:</span> {order.customerContact?.name || order.userId.fullName}</p>
                   <p><span className="font-medium">Telepon:</span> {order.customerContact?.phone || order.userId.phoneNumber}</p>
                   <p><span className="font-medium">Alamat:</span> {order.shippingAddress?.detail}, {order.shippingAddress?.city}</p>
                   <p><span className="font-medium">Jadwal:</span> {new Date(order.scheduledAt).toLocaleString()}</p>
                </div>
             </div>

             {/* Info Mitra */}
             <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                   <Briefcase size={18} /> Mitra Penanggung Jawab
                </h3>
                {order.providerId ? (
                   <div className="bg-blue-50 p-4 rounded-lg text-sm flex items-center gap-4">
                      <img src={order.providerId.userId.profilePictureUrl || "https://via.placeholder.com/50"} 
                           className="w-12 h-12 rounded-full bg-white" />
                      <div>
                         <p className="font-bold text-blue-900">{order.providerId.userId.fullName}</p>
                         <p className="text-blue-700">{order.providerId.userId.phoneNumber}</p>
                      </div>
                   </div>
                ) : (
                   <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 border border-yellow-100">
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
                      <th className="text-left py-2">Layanan</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Harga</th>
                      <th className="text-right py-2">Subtotal</th>
                   </tr>
                </thead>
                <tbody>
                   {order.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                         <td className="py-3">{item.name}</td>
                         <td className="text-center py-3">{item.quantity}</td>
                         <td className="text-right py-3">Rp {item.price.toLocaleString()}</td>
                         <td className="text-right py-3 font-medium">Rp {(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper component icon
const Briefcase = ({size, className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);