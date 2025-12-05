import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { voucherService } from '../../services/voucherService';
import { serviceService } from '../../services/serviceService';
import { Plus, Trash2, Edit, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function VoucherList() {
  const [vouchers, setVouchers] = useState([]);
  const [services, setServices] = useState([]); // List semua layanan untuk dropdown
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'fixed', // or percentage
    discountValue: '',
    minPurchase: 0,
    maxDiscount: 0, 
    quota: '',
    expiryDate: '',
    description: '',
    isActive: true, 
    applicableServices: [],
    image: null, // File Object untuk upload
    imageUrl: '' // URL untuk preview edit
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchVouchers();
    fetchServices();
  }, []);

  const fetchVouchers = async () => {
    try {
      const res = await voucherService.getAll();
      setVouchers(res.data);
    } catch (error) {
      toast.error('Gagal memuat voucher');
    }
  };

  const fetchServices = async () => {
    try {
      const res = await serviceService.getAll();
      setServices(res.data);
    } catch (error) {
      console.error('Gagal memuat layanan', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gunakan FormData untuk upload file
      const payload = new FormData();
      payload.append('code', formData.code);
      payload.append('discountType', formData.discountType);
      payload.append('discountValue', formData.discountValue);
      payload.append('minPurchase', formData.minPurchase);
      payload.append('maxDiscount', formData.maxDiscount);
      payload.append('quota', formData.quota);
      payload.append('expiryDate', formData.expiryDate);
      payload.append('description', formData.description);
      payload.append('isActive', formData.isActive);
      
      // Append services (sebagai string JSON atau loop array)
      // Backend controller sudah diupdate untuk menghandle string JSON
      payload.append('applicableServices', JSON.stringify(formData.applicableServices));

      if (formData.image) {
        payload.append('image', formData.image);
      }

      if (editingId) {
        await voucherService.update(editingId, payload);
        toast.success('Voucher diperbarui');
      } else {
        await voucherService.create(payload);
        toast.success('Voucher dibuat');
      }
      setIsModalOpen(false);
      fetchVouchers();
      resetForm();
    } catch (error) {
      console.error(error);
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
      minPurchase: v.minPurchase || 0,
      maxDiscount: v.maxDiscount || 0,
      quota: v.quota,
      expiryDate: v.expiryDate.split('T')[0], // Format date input
      description: v.description,
      isActive: v.isActive !== undefined ? v.isActive : true,
      // Map populated objects back to IDs for form
      applicableServices: v.applicableServices ? v.applicableServices.map(s => s._id || s) : [],
      image: null,
      imageUrl: v.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      code: '', discountType: 'fixed', discountValue: '',
      minPurchase: 0, maxDiscount: 0, quota: '', expiryDate: '', description: '',
      isActive: true, applicableServices: [], image: null, imageUrl: ''
    });
  };

  // Helper untuk handle checkbox layanan
  const toggleService = (serviceId) => {
    setFormData(prev => {
      const exists = prev.applicableServices.includes(serviceId);
      if (exists) {
        return { ...prev, applicableServices: prev.applicableServices.filter(id => id !== serviceId) };
      } else {
        return { ...prev, applicableServices: [...prev.applicableServices, serviceId] };
      }
    });
  };

  // Helper untuk file input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  // Helper URL Gambar
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return `${apiUrl.replace('/api', '')}${path}`;
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
              <th className="p-4">Gambar</th>
              <th className="p-4">Status</th>
              <th className="p-4">Diskon</th>
              <th className="p-4">Min. Belanja</th>
              <th className="p-4">Layanan</th>
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
                  {v.imageUrl ? (
                    <img 
                      src={getImageUrl(v.imageUrl)} 
                      alt={v.code} 
                      className="w-10 h-10 object-cover rounded border" 
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                      <ImageIcon size={16} />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  {v.isActive ? 
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle size={14}/> Aktif</span> : 
                    <span className="text-red-600 flex items-center gap-1"><XCircle size={14}/> Nonaktif</span>
                  }
                </td>
                <td className="p-4">
                  {v.discountType === 'percentage' ? `${v.discountValue}%` : `Rp ${v.discountValue.toLocaleString()}`}
                </td>
                <td className="p-4">Rp {v.minPurchase.toLocaleString()}</td>
                <td className="p-4 text-xs max-w-[150px]">
                  {v.applicableServices && v.applicableServices.length > 0 ? 
                    v.applicableServices.map(s => s.name || 'Unknown').join(', ') 
                    : <span className="text-gray-400 italic">Semua Layanan</span>
                  }
                </td>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Voucher' : 'Buat Voucher Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Gambar Upload */}
              <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                {formData.image ? (
                  <img src={URL.createObjectURL(formData.image)} className="h-32 object-cover rounded mb-2" />
                ) : formData.imageUrl ? (
                  <img src={getImageUrl(formData.imageUrl)} className="h-32 object-cover rounded mb-2" />
                ) : (
                  <div className="h-32 w-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded text-gray-400">
                    Preview Gambar
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Kode Voucher</label>
                  <input required type="text" className="w-full border p-2 rounded uppercase" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                </div>
                <div className="w-32">
                  <label className="block text-sm font-medium">Status</label>
                  <select className="w-full border p-2 rounded"
                    value={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
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
                    <label className="block text-sm font-medium">Max. Potongan (Rp)</label>
                    <input type="number" className="w-full border p-2 rounded" placeholder="0 = No Limit"
                      value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})} 
                      disabled={formData.discountType === 'fixed'}
                    />
                    <p className="text-xs text-gray-500 mt-1">Hanya berlaku untuk tipe Persentase</p>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium">Kuota</label>
                    <input required type="number" className="w-full border p-2 rounded" 
                      value={formData.quota} onChange={e => setFormData({...formData, quota: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium">Berlaku Sampai</label>
                    <input required type="date" className="w-full border p-2 rounded" 
                      value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} />
                 </div>
              </div>

              {/* SERVICE SELECTION */}
              <div>
                <label className="block text-sm font-medium mb-2">Berlaku Untuk Layanan:</label>
                <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b">
                    <input 
                      type="checkbox" 
                      id="all_services"
                      checked={formData.applicableServices.length === 0}
                      onChange={() => setFormData({...formData, applicableServices: []})}
                    />
                    <label htmlFor="all_services" className="text-sm font-bold text-gray-700">Semua Layanan (Global)</label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {services.map(svc => (
                      <div key={svc._id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`svc_${svc._id}`}
                          checked={formData.applicableServices.includes(svc._id)}
                          onChange={() => toggleService(svc._id)}
                        />
                        <label htmlFor={`svc_${svc._id}`} className="text-sm text-gray-600 truncate">{svc.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.applicableServices.length === 0 ? 'Voucher ini bisa digunakan untuk semua layanan.' : `Terpilih: ${formData.applicableServices.length} layanan spesifik.`}
                </p>
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