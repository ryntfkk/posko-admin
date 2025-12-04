import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { voucherService } from '../../services/voucherService';
import { Plus, Trash2, Edit } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function VoucherList() {
  const [vouchers, setVouchers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'fixed', // or percentage
    discountValue: '',
    minPurchase: '',
    quota: '',
    expiryDate: '',
    description: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await voucherService.getAll();
      setVouchers(res.data);
    } catch (error) {
      toast.error('Gagal memuat voucher');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await voucherService.update(editingId, formData);
        toast.success('Voucher diperbarui');
      } else {
        await voucherService.create(formData);
        toast.success('Voucher dibuat');
      }
      setIsModalOpen(false);
      fetchVouchers();
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan voucher');
    }
  };

  const handleDelete = async (id) => {
    if(!confirm('Hapus voucher ini?')) return;
    try {
      await voucherService.delete(id);
      toast.success('Voucher dihapus');
      fetchVouchers();
    } catch (error) {
      toast.error('Gagal menghapus');
    }
  };

  const handleEdit = (v) => {
    setEditingId(v._id);
    setFormData({
      code: v.code,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minPurchase: v.minPurchase,
      quota: v.quota,
      expiryDate: v.expiryDate.split('T')[0], // Format date input
      description: v.description
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '', discountType: 'fixed', discountValue: '',
      minPurchase: '', quota: '', expiryDate: '', description: ''
    });
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Voucher</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Buat Voucher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Kode</th>
              <th className="p-4">Diskon</th>
              <th className="p-4">Min. Belanja</th>
              <th className="p-4">Kuota</th>
              <th className="p-4">Berlaku Sampai</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v._id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono font-bold text-primary">{v.code}</td>
                <td className="p-4">
                  {v.discountType === 'percentage' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString()}`}
                </td>
                <td className="p-4">Rp {v.minPurchase.toLocaleString()}</td>
                <td className="p-4">{v.quota}</td>
                <td className="p-4">{new Date(v.expiryDate).toLocaleDateString()}</td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => handleEdit(v)} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(v._id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Voucher' : 'Buat Voucher Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Kode Voucher</label>
                <input required type="text" className="w-full border p-2 rounded uppercase" 
                  value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Tipe Diskon</label>
                    <select className="w-full border p-2 rounded" 
                      value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value})}>
                      <option value="fixed">Nominal (Rp)</option>
                      <option value="percentage">Persentase (%)</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium">Nilai Diskon</label>
                    <input required type="number" className="w-full border p-2 rounded" 
                      value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Min. Belanja (Rp)</label>
                    <input required type="number" className="w-full border p-2 rounded" 
                      value={formData.minPurchase} onChange={e => setFormData({...formData, minPurchase: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium">Kuota</label>
                    <input required type="number" className="w-full border p-2 rounded" 
                      value={formData.quota} onChange={e => setFormData({...formData, quota: Number(e.target.value)})} />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Berlaku Sampai</label>
                <input required type="date" className="w-full border p-2 rounded" 
                  value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium">Deskripsi</label>
                <textarea className="w-full border p-2 rounded" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}