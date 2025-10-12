'use client';

export default function TopNavigation({ user, onSignOut, onMobileMenuToggle }) {
  return (
    <nav className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-md hover:bg-red-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="text-sm truncate">
          <span className="hidden sm:inline">Selamat Datang, </span>
          {user?.firstName || 'Swaranusa User'}
        </div>
      </div>
      
      <button 
        onClick={onSignOut}
        className="bg-white text-red-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <span className="hidden sm:inline">Keluar</span>
        <span className="sm:hidden">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </span>
      </button>
    </nav>
  );
}
