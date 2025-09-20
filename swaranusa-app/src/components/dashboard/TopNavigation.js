'use client';

export default function TopNavigation({ user, onSignOut }) {
  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
      <div className="text-sm">Selamat Datang, {user?.firstName || 'Willy'}</div>
      <button 
        onClick={onSignOut}
        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        Keluar
      </button>
    </nav>
  );
}
