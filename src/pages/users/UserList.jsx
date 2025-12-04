import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { userService } from '../../services/userService';
import { Search, Ban, CheckCircle, User, Edit, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import clsx from 'clsx';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: ''
  });

  // Debounce search agar tidak spam request
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1); // Reset ke halaman 1 saat search berubah
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data saat halaman berubah
  useEffect(() => {
    fetchUsers(pagination.page);
  }, [pagination.page]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await userService.getAll({
        page,
        limit: pagination.limit,
        search
      });
      setUsers(res.data);
      setPagination(prev => ({
        ...prev,
        page: res.meta.page,
        total: res.meta.total,
        totalPages: res.meta.totalPages
      }));
    } catch (error) {
      console.error(error);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'memblokir' : 'mengaktifkan';
    if (!window.confirm(`Yakin ingin ${action} pengguna ${user.fullName}?`)) return;

    try {
      await userService.toggleStatus(user._id, user.status);
      toast.success(`Berhasil ${action} pengguna`);
      fetchUsers(pagination.page); // Refresh data
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  // --- EDIT HANDLERS ---
  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      bio: user.bio || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await userService.update(editingUser._id, editForm);
      toast.success('Data pengguna diperbarui');
      setIsEditModalOpen(false);
      fetchUsers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal update user');
    }
  };

  const StatusBadge = ({ status }) => (
    <span className={clsx(
      "px-2 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1 w-fit",
      status === 'active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
    )}>
      {status === 'active' ? <CheckCircle size={12} /> : <Ban size={12} />}
      {status}
    </span>
  );

  return (
    <AdminLayout>
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-500 text-sm">Kelola akses customer dan mitra</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Pengguna</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Bergabung</th>
                <th className="p-4 text-sm font-semibold text-gray-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Memuat data...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-gray-500">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {user.roles.map(role => (
                          <span key={role} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={clsx(
                          "px-3 py-1.5 rounded-md text-xs font-medium transition-colors border",
                          user.status === 'active' 
                            ? "border-red-200 text-red-600 hover:bg-red-50" 
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        )}
                      >
                        {user.status === 'active' ? 'Blokir' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="text-sm text-gray-500">
            Halaman {pagination.page} dari {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Sebelumnya
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Edit Data Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  value={editForm.fullName}
                  onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input 
                  type="text" 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  value={editForm.phoneNumber}
                  onChange={e => setEditForm({...editForm, phoneNumber: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-primary focus:border-primary"
                  rows="3"
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}