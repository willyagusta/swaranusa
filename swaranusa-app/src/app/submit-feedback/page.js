'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getProvinces, getAllCitiesAndRegencies } from '@/data/indonesia-locations';

export default function SubmitFeedback() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    provinsi: '',
    kota: '',
    kabupaten: '',
    location: '' // Optional specific location
  });
  const [availableLocations, setAvailableLocations] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
  }, [user, loading, router]);

  // Update available cities/regencies when province changes
  useEffect(() => {
    if (formData.provinsi) {
      const locations = getAllCitiesAndRegencies(formData.provinsi);
      setAvailableLocations(locations);
      // Reset kota and kabupaten when province changes
      setFormData(prev => ({
        ...prev,
        kota: '',
        kabupaten: ''
      }));
    } else {
      setAvailableLocations([]);
    }
  }, [formData.provinsi]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || 
        !formData.provinsi || !formData.kota || !formData.kabupaten) {
      setError('Harap isi semua field yang wajib diisi');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard?submitted=true');
      } else {
        setError(data.error || 'Gagal mengirim masukan');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Terjadi kesalahan saat mengirim masukan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => router.push('/dashboard')}
                className="text-2xl font-bold text-onyx hover:text-emerald transition-colors"
              >
                Swaranusa
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-onyx mb-4">Kirim Masukan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your concerns and we&apos;ll transform them into a professional document. 
            Your feedback will be processed by AI and stored securely on the blockchain.
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-100 shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul Masukan *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors"
                placeholder="Ringkas masalah atau saran Anda"
                required
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Province */}
              <div>
                <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi *
                </label>
                <select
                  id="provinsi"
                  name="provinsi"
                  value={formData.provinsi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Pilih Provinsi</option>
                  {getProvinces().map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label htmlFor="kota" className="block text-sm font-medium text-gray-700 mb-2">
                  Kota *
                </label>
                <select
                  id="kota"
                  name="kota"
                  value={formData.kota}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors"
                  required
                  disabled={!formData.provinsi}
                >
                  <option value="">Pilih Kota</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regency */}
              <div>
                <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700 mb-2">
                  Kabupaten *
                </label>
                <select
                  id="kabupaten"
                  name="kabupaten"
                  value={formData.kabupaten}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors"
                  required
                  disabled={!formData.provinsi}
                >
                  <option value="">Pilih Kabupaten</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Specific Location (Optional) */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi Spesifik (Opsional)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors"
                placeholder="Contoh: Jl. Sudirman No. 123, Kelurahan ABC"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Isi Masukan *
              </label>
              <textarea
                id="content"
                name="content"
                rows={8}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-colors resize-none"
                placeholder="Jelaskan masalah, keluhan, atau saran Anda secara detail..."
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald hover:bg-sage text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Kirim Masukan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
