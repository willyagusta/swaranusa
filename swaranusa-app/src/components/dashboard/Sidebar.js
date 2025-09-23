'use client';

import Image from 'next/image';

export default function Sidebar({ 
  sidebarMinimized, 
  setSidebarMinimized, 
  activeTab, 
  onTabChange 
}) {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Warga',
      icon: (
        <div className="w-5 h-5 flex-shrink-0 relative">
          <Image 
            src="/icon/dashboard.png" 
            alt="Dashboard" 
            width={20}
            height={20}
            className={`transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'filter brightness-100 opacity-100'  
                : 'filter brightness-0 opacity-60'
            }`}
          />
        </div>
      )
    },
    {
      id: 'submit-feedback',
      label: 'Kirim Masukan',
      icon: (
        <div className="w-5 h-5 flex-shrink-0 relative">
          <Image 
            src="/icon/add.png" 
            alt="send-feedback" 
            width={20}
            height={20}
            className={`transition-all duration-200 ${
              activeTab === 'submit-feedback' 
                ? 'filter brightness-100 opacity-100' 
                : 'filter brightness-0 opacity-60'
            }`}
          />
        </div>
      )
    },
    {
      id: 'my-feedbacks',
      label: 'Masukan Saya',
      icon: (
        <div className="w-5 h-5 flex-shrink-0 relative">
          <Image 
            src="/icon/smartdoc.png" 
            alt="feedback" 
            width={20}
            height={20}
            className={`transition-all duration-200 ${
              activeTab === 'my-feedbacks' 
                ? 'filter brightness-100 opacity-100' 
                : 'filter brightness-0 opacity-60'
            }`}
          />
        </div>
      )
    },
    {
      id: 'clusters',
      label: 'Lihat Cluster',
      icon: (
        <div className="w-5 h-5 flex-shrink-0 relative">
          <Image 
            src="/icon/cluster.png" 
            alt="Cluster" 
            width={20}
            height={20}
            className={`transition-all duration-200 ${
              activeTab === 'clusters' 
                ? 'filter brightness-100 opacity-100'  
                : 'filter brightness-0 opacity-60'
            }`}
          />
        </div>
      )
    },
    {
      id: 'verify',
      label: 'Verifikasi Blockchain',
      icon: (
        <div className="w-5 h-5 flex-shrink-0 relative">
          <Image 
            src="/icon/blockchain.png" 
            alt="blockchain" 
            width={20}
            height={20}
            className={`transition-all duration-200 ${
              activeTab === 'verify' 
                ? 'filter brightness-100 opacity-100'  
                : 'filter brightness-0 opacity-60'
            }`}
          />
        </div>
      )
    }
  ];

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarMinimized ? 'w-16' : 'w-64'} min-h-screen`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Image 
            src="/logosquare.png" 
            alt="Swaranusa Logo" 
            width={32} 
            height={32}
            className="object-contain flex-shrink-0"
          />
          {!sidebarMinimized && (
            <span className="font-bold text-red-600">SWARANUSA</span>
          )}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <div className="p-4">
        <button 
          onClick={() => setSidebarMinimized(!sidebarMinimized)}
          className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarMinimized ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors ${
              activeTab === item.id
                ? 'text-red-600 bg-red-50'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {!sidebarMinimized && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
