import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { serviceService } from '../../services/serviceService';
import { Plus, Pencil, Trash2, Tag, DollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ServiceList() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', category: '', basePrice: '', unit: 'unit', description: '', iconUrl: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await serviceService.getAll();
      setServices(res.data);
    } catch (error) {
      toast.error('Gagal memuat layanan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basePrice: Number(formData.basePrice)
      };

      if (editingService) {
        await serviceService.update(editingService._id, payload);
        toast.success('Layanan diperbarui');
      } else {
        await serviceService.create(payload);
        toast.success('Layanan ditambahkan');
      }
      
      setIsModalOpen(false);
      fetchServices();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus layanan ini?')) return;
    try {
      await serviceService.delete(id);
      toast.success('Layanan dihapus');
      fetchServices();
    } catch (error) {
      toast.error('Gagal menghapus');
    }
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      basePrice: service.basePrice,
      unit: service.unit,
      description: service.description || '',
      iconUrl: service.iconUrl || ''
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ name: '', category: '', basePrice: '', unit: 'unit', description: '', iconUrl: '' });
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Master Layanan</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition"
        >
          <Plus size={18} /> Tambah Layanan
        </button>
      </div>

      {/* Grid Card Layout untuk Layanan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <p>Loading...</p> : services.map((svc) => (
          <div key={svc._id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-2xl">
                {/* Placeholder Icon jika iconUrl kosong */}
                {svc.iconUrl ? <img src={svc.iconUrl} className="w-8 h-8" /> : '🛠️'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(svc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDelete(svc._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-gray-800 text-lg mb-1">{svc.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{svc.description || 'Tidak ada deskripsi'}</p>
            
            <div className="flex items-center gap-4 text-sm font-medium text-gray-600 border-t pt-4">
              <div className="flex items-center gap-1">
                <Tag size={14} className="text-accent" /> {svc.category}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign size={14} className="text-green-600" /> 
                Rp {svc.basePrice.toLocaleString()} / {svc.unit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">{editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Layanan</label>
                <input required type="text" className="w-full border rounded-lg px-3 py-2" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <input required type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Cleaning"
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Harga Dasar (Rp)</label>
                  <input required type="number" className="w-full border rounded-lg px-3 py-2" 
                    value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Satuan</label>
                <select className="w-full border rounded-lg px-3 py-2"
                  value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                  {['unit', 'jam', 'hari', 'meter', 'kg', 'paket', 'orang', 'ruangan', 'kendaraan'].map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea className="w-full border rounded-lg px-3 py-2" rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Batal</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-gray-800">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}