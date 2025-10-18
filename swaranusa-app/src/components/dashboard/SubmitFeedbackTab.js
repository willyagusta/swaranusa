'use client';

import { useState, useEffect, useCallback } from 'react';
import { getProvinces, getCitiesAndRegencies, getRegenciesForCity } from '@/data/indonesia-locations';

export default function SubmitFeedbackTab({ user, onFeedbackSubmitted }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    provinsi: '',
    kota: '',
    kabupaten: '',
    location: '' // Optional specific location
  });
  const [availableCities, setAvailableCities] = useState([]);
  const [availableRegencies, setAvailableRegencies] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingState, setLoadingState] = useState('');
  const [error, setError] = useState('');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [processingVoice, setProcessingVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [processingStage, setProcessingStage] = useState('');

  
  // AI Suggestions state
  const [aiEnabled, setAiEnabled] = useState(true); // Default: AI suggestions active
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [contentSuggestions, setContentSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);
  

  // Update available cities/regencies when province changes
  useEffect(() => {
    if (formData.provinsi) {
      const { cities, regencies } = getCitiesAndRegencies(formData.provinsi);
      setAvailableCities(cities);
      setAvailableRegencies(regencies);
      // Reset kota and kabupaten when province changes
      setFormData(prev => ({
        ...prev,
        kota: '',
        kabupaten: ''
      }));
    } else {
      setAvailableCities([]);
      setAvailableRegencies([]);
    }
  }, [formData.provinsi]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'id-ID'; // Indonesian language
      
      let finalTranscript = '';
      
      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript = transcript;
          }
        }
        
        setVoiceTranscript(finalTranscript + interimTranscript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError('Gagal merekam suara: ' + event.error);
        setIsRecording(false);
      };
      
      recognitionInstance.onend = async () => {
        setIsRecording(false);
        
        // Process the final transcript with AI
        if (finalTranscript.trim().length > 10) {
          await processVoiceWithAI(finalTranscript.trim());
        }
        
        finalTranscript = ''; // Reset for next recording
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);
  
  // Process voice transcript with AI
  const processVoiceWithAI = async (transcript) => {
    setProcessingVoice(true);
    setProcessingStage('analyzing');
    setLoadingState('🔍 Menganalisis rekaman suara Anda...');
    
    try {
      // Stage 1: Analyzing
      await new Promise(resolve => setTimeout(resolve, 800));
      setProcessingStage('extracting');
      setLoadingState('📝 Mengekstrak informasi penting (judul, lokasi, masalah)...');
      
      const response = await fetch('/api/ai/process-voice-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });
      
      // Stage 2: Processing
      setProcessingStage('structuring');
      setLoadingState('✨ AI menyusun masukan Anda...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Stage 3: Finalizing
        setProcessingStage('finalizing');
        setLoadingState('✅ Hampir selesai...');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Auto-fill form fields with AI-processed data
        setFormData(prev => ({
          ...prev,
          title: result.data.title,
          location: result.data.location !== 'Tidak disebutkan' ? result.data.location : '',
          content: result.data.content
        }));
        
        setError('');
        setLoadingState('✓ Masukan berhasil diproses! Silakan pilih Provinsi, Kota, dan Kabupaten.');
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setLoadingState('');
        }, 5000);
      } else {
        setError(result.error || 'Gagal memproses rekaman');
        setLoadingState('');
      }
      
    } catch (error) {
      console.error('Error processing voice:', error);
      setError('Terjadi kesalahan saat memproses rekaman');
      setLoadingState('');
    } finally {
      setProcessingVoice(false);
      setProcessingStage('');
      setVoiceTranscript('');
    }
  };
  
  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognition) {
      setError('Speech recognition tidak didukung di browser ini. Gunakan Chrome atau Edge.');
      return;
    }
    
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setVoiceTranscript('');
      recognition.start();
      setIsRecording(true);
      setError('');
    }
  };

  // Update available cities/regencies when kota changes
  useEffect(() => {
    if (formData.kota && formData.provinsi) {
      // Get regencies specific to the selected city
      const cityRegencies = getRegenciesForCity(formData.provinsi, formData.kota);
      setAvailableRegencies(cityRegencies);
      // Reset kabupaten when kota changes
      setFormData(prev => ({ ...prev, kabupaten: '' }));
    } else if (formData.provinsi && !formData.kota) {
      // Show all standalone regencies when no city is selected
      const { regencies } = getCitiesAndRegencies(formData.provinsi);
      setAvailableRegencies(regencies);
    }
  }, [formData.kota, formData.provinsi]);

  // Debounced AI suggestions
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchAISuggestions = async (text, type) => {
    if (!aiEnabled || !text.trim() || text.length < 5) return;
    
    console.log('Fetching AI suggestions for:', { text, type }); // Debug log
    
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          type: type, // 'title' or 'content'
          context: {
            location: `${formData.provinsi}, ${formData.kota}, ${formData.kabupaten}`.replace(/^,\s*|,\s*$/g, ''),
            specificLocation: formData.location
          }
        }),
      });

      console.log('Response status:', response.status); // Debug log

      const data = await response.json();
      console.log('Response data:', data); // Debug log
      
      if (response.ok && data.suggestions) {
        if (type === 'title') {
          setTitleSuggestions(data.suggestions);
          setShowTitleSuggestions(true);
        } else if (type === 'content') {
          setContentSuggestions(data.suggestions);
          setShowContentSuggestions(true);
        }
      } else {
        console.error('API error:', data);
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const debouncedTitleSuggestions = useCallback(
    debounce((text) => fetchAISuggestions(text, 'title'), 1000),
    [formData.provinsi, formData.kota, formData.kabupaten, formData.location]
  );

  const debouncedContentSuggestions = useCallback(
    debounce((text) => fetchAISuggestions(text, 'content'), 1500),
    [formData.provinsi, formData.kota, formData.kabupaten, formData.location]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || 
        !formData.provinsi || (!formData.kota && !formData.kabupaten)) {
      setError('Harap isi semua field yang wajib diisi (minimal pilih Kota atau Kabupaten)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Step 1: Preparing submission
      setLoadingState('Mempersiapkan pengiriman...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 2: Processing with AI
      setLoadingState('Memproses dengan AI...');
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
        
        // Clear suggestions
        setTitleSuggestions([]);
        setContentSuggestions([]);
        setShowTitleSuggestions(false);
        setShowContentSuggestions(false);
        
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
    console.log('Input changed:', { name, value, length: value.length }); // Debug log
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Trigger AI suggestions only if enabled
    if (aiEnabled) {
      if (name === 'title' && value.length > 5) {
        console.log('Triggering title suggestions for:', value); // Debug log
        debouncedTitleSuggestions(value);
      } else if (name === 'content' && value.length > 10) {
        console.log('Triggering content suggestions for:', value); // Debug log
        debouncedContentSuggestions(value);
      }
    }
  };

  const applySuggestion = (suggestion, type) => {
    if (type === 'title') {
      setFormData(prev => ({ ...prev, title: suggestion }));
      setShowTitleSuggestions(false);
    } else if (type === 'content') {
      setFormData(prev => ({ ...prev, content: suggestion }));
      setShowContentSuggestions(false);
    }
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
    <div className="max-w-6xl mx-auto">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Kirim Masukan</h2>
        <p className="text-lg text-gray-600 max-w-3xl">
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
          {/* Title with AI Suggestions */}
          <div className="relative">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Judul Masukan *
              {loadingSuggestions && aiEnabled && (
                <span className="ml-2 text-blue-600 text-xs">
                  <div className="inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                  AI sedang menganalisis...
                </span>
              )}
              {!aiEnabled && (
                <span className="ml-2 text-gray-500 text-xs">
                  (AI suggestions dinonaktifkan)
                </span>
              )}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onFocus={() => titleSuggestions.length > 0 && setShowTitleSuggestions(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
              placeholder="Ringkas masalah atau saran Anda"
              required
            />
            
            {/* Title Suggestions Dropdown */}
            {showTitleSuggestions && titleSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <span className="text-xs text-blue-600 font-medium">💡 Saran AI untuk judul yang lebih jelas:</span>
                </div>
                {titleSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applySuggestion(suggestion, 'title')}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <span className="text-sm text-gray-800">{suggestion}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowTitleSuggestions(false)}
                  className="w-full p-2 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100"
                >
                  Tutup saran
                </button>
              </div>
            )}
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
                Kota
              </label>
              <select
                id="kota"
                name="kota"
                value={formData.kota}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                disabled={!formData.provinsi}
              >
                <option value="">Pilih Kota</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Regency */}
            <div>
              <label htmlFor="kabupaten" className="block text-sm font-medium text-gray-700 mb-2">
                Kabupaten
              </label>
              <select
                id="kabupaten"
                name="kabupaten"
                value={formData.kabupaten}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                disabled={!formData.provinsi}
              >
                <option value="">Pilih Kabupaten</option>
                {availableRegencies.map((regency) => (
                  <option key={regency} value={regency}>
                    {regency}
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

          {/* Content with AI Suggestions */}
          <div className="relative">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Isi Masukan *
              {loadingSuggestions && aiEnabled && (
                <span className="ml-2 text-blue-600 text-xs">
                  <div className="inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                  AI sedang menganalisis...
                </span>
              )}
              {!aiEnabled && (
                <span className="ml-2 text-gray-500 text-xs">
                  (AI suggestions dinonaktifkan)
                </span>
              )}
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              value={formData.content}
              onChange={handleChange}
              onFocus={() => contentSuggestions.length > 0 && setShowContentSuggestions(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
              placeholder="Jelaskan masalah, keluhan, atau saran Anda secara detail..."
              required
            />
            
            {/* Content Suggestions Dropdown */}
            {showContentSuggestions && contentSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                <div className="p-2 border-b border-gray-100">
                  <span className="text-xs text-purple-600 font-medium">💡 Saran AI untuk penjelasan yang lebih detail:</span>
                </div>
                {contentSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applySuggestion(suggestion, 'content')}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <span className="text-sm text-gray-800 whitespace-pre-wrap">{suggestion}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowContentSuggestions(false)}
                  className="w-full p-2 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100"
                >
                  Tutup saran
                </button>
              </div>
            )}
          </div>

          {/* AI Toggle and Enhancement Tip */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-purple-800 mb-1">💡 Bantuan AI</h4>
                  <p className="text-sm text-purple-700">
                    {aiEnabled 
                      ? "AI akan memberikan saran untuk membantu Anda mengungkapkan masalah dengan lebih jelas dan terstruktur."
                      : "Bantuan AI dinonaktifkan. Anda dapat mengetik sendiri tanpa saran AI."
                    }
                  </p>
                </div>
              </div>
              
              {/* AI Toggle Button */}
              <div className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setAiEnabled(!aiEnabled);
                    // Clear suggestions when disabling AI
                    if (aiEnabled) {
                      setTitleSuggestions([]);
                      setContentSuggestions([]);
                      setShowTitleSuggestions(false);
                      setShowContentSuggestions(false);
                      setLoadingSuggestions(false);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    aiEnabled ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <span className="sr-only">Toggle AI suggestions</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="ml-2 text-xs text-purple-700 font-bold">
                  {aiEnabled ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
            </div>
            
            {aiEnabled && (
              <div className="text-xs text-purple-600 bg-purple-100 rounded px-2 py-1">
                Mulai mengetik untuk mendapatkan saran AI otomatis
              </div>
            )}
          </div>

          {/* Voice Recording Button */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={processingVoice}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isRecording ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="6" width="8" height="8" rx="1"/>
                  </svg>
                  <span>Berhenti Merekam</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span>Rekam Suara</span>
                </>
              )}
            </button>
            
            {isRecording && (
              <span className="text-sm text-gray-600 animate-pulse">
                🎤 Sedang merekam... Silakan berbicara
              </span>
            )}
          </div>

          {/* Success Notification */}
          {!processingVoice && loadingState.includes('✓') && (
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-400 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-green-900">Berhasil! 🎉</h4>
                  <p className="text-green-700 font-medium">{loadingState}</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Processing Indicator */}
          {processingVoice && (
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-300 shadow-lg animate-fadeIn">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-purple-900">AI Sedang Bekerja</h4>
                  <p className="text-purple-700 font-medium">{loadingState}</p>
                </div>
              </div>
              
              {/* Processing Stages */}
              <div className="space-y-3 bg-white/50 p-4 rounded-lg">
                <div className={`flex items-center gap-3 transition-all ${processingStage === 'analyzing' ? 'text-purple-700 font-semibold transform scale-105' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${processingStage === 'analyzing' ? 'bg-purple-600 text-white animate-pulse shadow-lg' : processingStage !== '' && processingStage !== 'analyzing' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {processingStage === 'analyzing' ? '⏳' : processingStage !== '' && processingStage !== 'analyzing' ? '✓' : '1'}
                  </span>
                  <span>🔍 Menganalisis rekaman suara</span>
                </div>
                
                <div className={`flex items-center gap-3 transition-all ${processingStage === 'extracting' ? 'text-purple-700 font-semibold transform scale-105' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${processingStage === 'extracting' ? 'bg-purple-600 text-white animate-pulse shadow-lg' : ['structuring', 'finalizing'].includes(processingStage) ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {processingStage === 'extracting' ? '⏳' : ['structuring', 'finalizing'].includes(processingStage) ? '✓' : '2'}
                  </span>
                  <span>📝 Mengekstrak informasi (judul, lokasi, masalah)</span>
                </div>
                
                <div className={`flex items-center gap-3 transition-all ${processingStage === 'structuring' ? 'text-purple-700 font-semibold transform scale-105' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${processingStage === 'structuring' ? 'bg-purple-600 text-white animate-pulse shadow-lg' : processingStage === 'finalizing' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {processingStage === 'structuring' ? '⏳' : processingStage === 'finalizing' ? '✓' : '3'}
                  </span>
                  <span>✨ Menyusun masukan dengan struktur profesional</span>
                </div>
                
                <div className={`flex items-center gap-3 transition-all ${processingStage === 'finalizing' ? 'text-purple-700 font-semibold transform scale-105' : 'text-gray-500'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${processingStage === 'finalizing' ? 'bg-purple-600 text-white animate-pulse shadow-lg' : 'bg-gray-300 text-gray-600'}`}>
                    {processingStage === 'finalizing' ? '⏳' : '4'}
                  </span>
                  <span>✅ Mengisi formulir secara otomatis</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded border border-purple-200">
                <p className="text-xs text-gray-600">
                  💡 <strong>Tip:</strong> Proses ini biasanya memerlukan waktu 3-5 detik tergantung panjang rekaman.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting || processingVoice}
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
              ) : processingVoice ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>AI Memproses...</span>
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