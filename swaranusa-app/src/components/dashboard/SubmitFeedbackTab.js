'use client';

import { useState, useEffect } from 'react';
import { getProvinces, getAllCitiesAndRegencies } from '@/data/indonesia-locations';

export default function SubmitFeedbackTab({ user, onFeedbackSubmitted }) {
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
  const [loadingState, setLoadingState] = useState('');
  const [error, setError] = useState('');

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
      // Step 1: Preparing submission
      setLoadingState('Mempersiapkan pengiriman...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Processing with AI
      setLoadingState('Memproses dengan AI (sekitar 1-2 menit)...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch('/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Step 3: Saving to database
      setLoadingState('Menyimpan ke database...');
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await response.json();

      if (data.success) {
        // Step 4: Blockchain verification
        setLoadingState('Verifikasi blockchain...');
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Step 5: Complete
        setLoadingState('Berhasil terkirim!');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          provinsi: '',
          kota: '',
          kabupaten: '',
          location: ''
        });
        
        // Notify parent component
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted();
        }
      } else {
        setError(data.error || 'Gagal mengirim masukan');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Terjadi kesalahan saat mengirim masukan');
    } finally {
      setSubmitting(false);
      setLoadingState('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getLoadingSubtext = () => {
    switch (loadingState) {
      case 'Mempersiapkan pengiriman...':
        return 'Memvalidasi data yang Anda masukkan...';
      case 'Memproses dengan AI (sekitar 1-2 menit)...':
        return 'AI sedang menganalisis dan memformat masukan Anda...';
      case 'Menyimpan ke database...':
        return 'Menyimpan data ke sistem database...';
      case 'Verifikasi blockchain...':
        return 'Mencatat ke blockchain untuk transparansi...';
      case 'Berhasil terkirim!':
        return 'Masukan Anda telah berhasil dikirim dan tercatat!';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kirim Masukan</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Bagikan kekhawatiran Anda dan kami akan mengubahnya menjadi dokumen profesional. 
          Masukan Anda akan diproses oleh AI dan disimpan dengan aman di blockchain.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-lg">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
              placeholder="Jelaskan masalah, keluhan, atau saran Anda secara detail..."
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{loadingState || 'Mengirim...'}</span>
                  </div>
                  {getLoadingSubtext() && (
                    <p className="text-sm text-white/80">
                      {getLoadingSubtext()}
                    </p>
                  )}
                </div>
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
  );
}
