import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { providerService } from '../../services/providerService';
import { Check, X, ArrowLeft, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ProviderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await providerService.getById(id);
      setProvider(res.data);
    } catch (error) {
      toast.error('Gagal memuat detail mitra');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (status) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengubah status menjadi ${status}?`)) return;
    
    setProcessing(true);
    try {
      let reason = '';
      if (status === 'rejected') {
        reason = window.prompt("Masukkan alasan penolakan:") || 'Dokumen tidak valid';
      }

      await providerService.verify(id, status, reason);
      toast.success(`Mitra berhasil di-${status}`);
      fetchDetail(); // Refresh data
    } catch (error) {
      toast.error('Gagal memproses verifikasi');
    } finally {
      setProcessing(false);
    }
  };

  // Helper aman untuk URL gambar
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/100?text=No+Image";
    if (path.startsWith('http')) return path;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return `${apiUrl.replace('/api', '')}${path}`;
  };

  if (loading) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;
  if (!provider) return <AdminLayout><div className="p-8">Data tidak ditemukan</div></AdminLayout>;

  // Safety check untuk status (Mencegah Crash .toUpperCase())
  const status = provider.verificationStatus || 'pending';

  // Helper component untuk dokumen
  const DocumentCard = ({ title, url }) => {
    const fullUrl = url ? getImageUrl(url) : null;
    return (
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
          <FileText size={16} /> {title}
        </h3>
        {fullUrl ? (
          <a href={fullUrl} target="_blank" rel="noreferrer">
            <img 
              src={fullUrl} 
              alt={title} 
              className="w-full h-48 object-cover rounded-md hover:opacity-90 transition-opacity cursor-pointer border bg-gray-50"
              onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error+Loading"; }}
            />
          </a>
        ) : (
          <div className="h-48 bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded-md border border-dashed">
            Tidak ada dokumen
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <Toaster />
      <div className="max-w-5xl mx-auto">
        {/* Header Nav */}
        <button onClick={() => navigate('/providers')} className="flex items-center text-gray-500 hover:text-primary mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Kembali ke Daftar
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4">
              <img 
                src={getImageUrl(provider.userId?.profilePictureUrl)} 
                className="w-20 h-20 rounded-full object-cover bg-gray-100 border"
                alt="Profile" 
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{provider.userId?.fullName || 'Nama Tidak Tersedia'}</h1>
                <p className="text-gray-500">{provider.userId?.email || '-'}</p>
                <div className="mt-2 flex gap-2">
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {provider.details?.experienceYears || 0} Tahun Pengalaman
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    status === 'verified' ? 'bg-green-100 text-green-700' : 
                    status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleVerify('rejected')}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X size={18} /> Tolak
                </button>
                <button
                  onClick={() => handleVerify('verified')}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Check size={18} /> Setujui Mitra
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Documents Grid - Handle structure variations */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">Dokumen Persyaratan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DocumentCard title="KTP" url={provider.documents?.ktpUrl || provider.documents?.['ktp']?.url} />
          <DocumentCard title="Selfie dengan KTP" url={provider.documents?.selfieKtpUrl || provider.documents?.['selfieKtp']?.url} />
          <DocumentCard title="SKCK" url={provider.documents?.skckUrl || provider.documents?.['skck']?.url} />
          <DocumentCard title="Sertifikat" url={provider.documents?.certificateUrl || provider.documents?.['certificate']?.url} />
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Detail Tambahan</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Kategori Layanan Utama</p>
              <p className="font-medium">{provider.details?.serviceCategory || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Kendaraan</p>
              <p className="font-medium">{provider.details?.vehicleType || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-500 mb-1">Deskripsi Diri / Bio</p>
              <p className="font-medium text-gray-700">{provider.details?.description || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}