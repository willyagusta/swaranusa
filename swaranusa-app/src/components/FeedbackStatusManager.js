'use client';

import { useState } from 'react';

const STATUS_OPTIONS = [
  { value: 'belum_dilihat', label: 'Belum Dilihat', color: 'bg-gray-100 text-gray-800' },
  { value: 'dilihat', label: 'Dilihat', color: 'bg-blue-100 text-blue-800' },
  { value: 'masuk_daftar_bahasan', label: 'Masuk Daftar Bahasan', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'dirapatkan', label: 'Dirapatkan', color: 'bg-orange-100 text-orange-800' },
  { value: 'ditindak_lanjuti', label: 'Ditindak Lanjuti', color: 'bg-purple-100 text-purple-800' },
  { value: 'selesai', label: 'Selesai', color: 'bg-green-100 text-green-800' }
];

export default function FeedbackStatusManager({ feedbackId, currentStatus, onStatusUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [note, setNote] = useState('');

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;

    setSelectedStatus(newStatus);
    setShowNoteInput(true);
  };

  const confirmStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/feedback/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedbackId,
          newStatus: selectedStatus,
          note: note.trim() || null
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onStatusUpdate?.(selectedStatus, data.updatedBy, note);
        setShowNoteInput(false);
        setNote('');
        alert(`Status berhasil diubah! Diperbarui oleh: ${data.updatedBy}`);
      } else {
        alert(data.error || 'Gagal mengubah status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat mengubah status');
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelStatusUpdate = () => {
    setShowNoteInput(false);
    setSelectedStatus('');
    setNote('');
  };

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(option => option.value === status) || STATUS_OPTIONS[0];
  };

  const currentStatusInfo = getStatusInfo(currentStatus);

  return (
    <div className="space-y-4">
      {/* Current Status Display */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Status saat ini:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatusInfo.color}`}>
          {currentStatusInfo.label}
        </span>
      </div>

      {/* Status Update Buttons */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Ubah status ke:</span>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={option.value === currentStatus || isUpdating}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                option.value === currentStatus
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : `${option.color} hover:opacity-80 cursor-pointer`
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note Input Modal */}
      {showNoteInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Ubah Status ke "{getStatusInfo(selectedStatus).label}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (opsional):
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Tambahkan catatan untuk perubahan status ini..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmStatusUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Mengubah...' : 'Konfirmasi'}
                </button>
                <button
                  onClick={cancelStatusUpdate}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}