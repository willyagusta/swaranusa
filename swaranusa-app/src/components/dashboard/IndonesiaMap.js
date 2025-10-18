'use client';

// Simplified Indonesia provinces SVG paths (approximate coordinates)
// These are simplified paths based on real Indonesia geography
const indonesiaProvinces = [
  // Sumatra
  { id: 'aceh', name: 'Aceh', path: 'M 95,20 L 115,15 L 125,25 L 120,40 L 105,45 L 90,35 Z' },
  { id: 'sumut', name: 'Sumatera Utara', path: 'M 90,45 L 105,50 L 125,45 L 135,60 L 125,75 L 105,80 L 85,70 Z' },
  { id: 'sumbar', name: 'Sumatera Barat', path: 'M 70,85 L 85,80 L 95,95 L 85,110 L 70,105 Z' },
  { id: 'riau', name: 'Riau', path: 'M 95,80 L 125,75 L 145,85 L 145,105 L 130,115 L 110,110 L 95,95 Z' },
  { id: 'jambi', name: 'Jambi', path: 'M 85,115 L 110,115 L 120,130 L 105,140 L 85,135 Z' },
  { id: 'sumsel', name: 'Sumatera Selatan', path: 'M 85,140 L 110,140 L 125,155 L 115,170 L 90,165 L 80,150 Z' },
  { id: 'bengkulu', name: 'Bengkulu', path: 'M 65,145 L 80,150 L 80,165 L 65,170 L 55,160 Z' },
  { id: 'lampung', name: 'Lampung', path: 'M 90,170 L 110,175 L 115,190 L 100,200 L 85,195 Z' },
  
  // Java
  { id: 'banten', name: 'Banten', path: 'M 105,205 L 125,205 L 130,218 L 120,228 L 105,225 Z' },
  { id: 'jakarta', name: 'DKI Jakarta', path: 'M 125,208 L 135,208 L 137,218 L 130,223 L 125,218 Z' },
  { id: 'jabar', name: 'Jawa Barat', path: 'M 120,228 L 160,225 L 175,235 L 170,250 L 150,255 L 125,250 Z' },
  { id: 'jateng', name: 'Jawa Tengah', path: 'M 175,235 L 230,235 L 245,245 L 240,260 L 215,265 L 190,260 L 170,250 Z' },
  { id: 'yogya', name: 'DI Yogyakarta', path: 'M 210,260 L 225,260 L 227,268 L 218,273 L 210,268 Z' },
  { id: 'jatim', name: 'Jawa Timur', path: 'M 240,245 L 305,250 L 325,260 L 320,275 L 290,280 L 260,275 L 240,265 Z' },
  
  // Kalimantan
  { id: 'kalbar', name: 'Kalimantan Barat', path: 'M 190,100 L 230,95 L 250,110 L 245,135 L 220,145 L 195,135 Z' },
  { id: 'kalteng', name: 'Kalimantan Tengah', path: 'M 245,140 L 285,135 L 300,150 L 295,175 L 270,180 L 250,170 Z' },
  { id: 'kalsel', name: 'Kalimantan Selatan', path: 'M 270,180 L 295,180 L 305,195 L 295,210 L 275,210 L 265,195 Z' },
  { id: 'kaltim', name: 'Kalimantan Timur', path: 'M 300,95 L 345,90 L 365,110 L 365,140 L 345,155 L 315,150 L 300,135 Z' },
  { id: 'kaltara', name: 'Kalimantan Utara', path: 'M 315,70 L 350,65 L 360,80 L 350,90 L 320,85 Z' },
  
  // Sulawesi
  { id: 'sulut', name: 'Sulawesi Utara', path: 'M 420,80 L 445,75 L 455,90 L 445,105 L 425,100 Z' },
  { id: 'gorontalo', name: 'Gorontalo', path: 'M 410,105 L 430,105 L 435,118 L 425,125 L 410,120 Z' },
  { id: 'sulteng', name: 'Sulawesi Tengah', path: 'M 405,125 L 435,125 L 445,145 L 435,165 L 410,160 Z' },
  { id: 'sulbar', name: 'Sulawesi Barat', path: 'M 390,170 L 410,170 L 415,188 L 405,200 L 390,195 Z' },
  { id: 'sulsel', name: 'Sulawesi Selatan', path: 'M 405,200 L 445,200 L 460,220 L 450,245 L 420,245 L 405,225 Z' },
  { id: 'sultra', name: 'Sulawesi Tenggara', path: 'M 450,220 L 475,220 L 485,240 L 475,258 L 455,253 L 450,240 Z' },
  
  // Bali & Nusa Tenggara
  { id: 'bali', name: 'Bali', path: 'M 330,280 L 350,280 L 355,292 L 345,300 L 330,295 Z' },
  { id: 'ntb', name: 'Nusa Tenggara Barat', path: 'M 355,285 L 385,285 L 395,298 L 385,310 L 360,308 Z' },
  { id: 'ntt', name: 'Nusa Tenggara Timur', path: 'M 395,295 L 460,295 L 480,305 L 475,320 L 440,325 L 405,315 Z' },
  
  // Maluku & Papua
  { id: 'maluku', name: 'Maluku', path: 'M 485,185 L 520,180 L 535,195 L 530,215 L 505,220 L 485,205 Z' },
  { id: 'malut', name: 'Maluku Utara', path: 'M 495,155 L 525,150 L 540,165 L 530,180 L 505,175 Z' },
  { id: 'papbar', name: 'Papua Barat', path: 'M 540,170 L 585,165 L 610,180 L 605,210 L 575,220 L 545,210 Z' },
  { id: 'papdaya', name: 'Papua Barat Daya', path: 'M 545,215 L 575,220 L 585,240 L 570,255 L 545,250 Z' },
  { id: 'papua', name: 'Papua', path: 'M 605,175 L 670,165 L 710,180 L 720,210 L 705,245 L 670,255 L 630,250 L 605,230 Z' },
  { id: 'papteng', name: 'Papua Tengah', path: 'M 630,210 L 660,210 L 670,228 L 655,240 L 635,235 Z' },
  { id: 'papsel', name: 'Papua Selatan', path: 'M 605,245 L 640,245 L 655,265 L 640,280 L 610,275 Z' },
  { id: 'pappeg', name: 'Papua Pegunungan', path: 'M 660,185 L 690,180 L 700,195 L 690,210 L 665,205 Z' }
];

export default function IndonesiaMap({ 
  data = [], 
  onProvinceClick, 
  onProvinceHover,
  hoveredProvince,
  selectedProvince,
  getProvinceColor,
  getProvinceStats
}) {
  
  // Merge province paths with data
  const enrichedProvinces = indonesiaProvinces.map(province => {
    const stats = data.find(d => 
      d.province?.toLowerCase().includes(province.name.toLowerCase()) ||
      province.name.toLowerCase().includes(d.province?.toLowerCase())
    );
    
    return {
      ...province,
      stats: stats || { feedbacks: 0, high_urgency: 0 }
    };
  });

  const getColor = (province) => {
    if (hoveredProvince === province.id) {
      return '#fca5a5';
    }
    
    if (getProvinceColor && province.stats) {
      return getProvinceColor(province.stats.feedbacks || 0);
    }
    
    return '#94a3b8'; // Default gray
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-8 overflow-x-auto">
      <svg viewBox="0 0 750 350" className="w-full h-auto min-w-[600px]">
        {/* Ocean background */}
        <defs>
          <pattern id="waves" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 Q 10 15, 20 20 T 40 20" stroke="#bfdbfe" strokeWidth="1" fill="none" opacity="0.3"/>
          </pattern>
          <filter id="shadow">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* Ocean */}
        <rect x="0" y="0" width="750" height="350" fill="#e0f2fe" />
        <rect x="0" y="0" width="750" height="350" fill="url(#waves)" />
        
        {/* Provinces */}
        {enrichedProvinces.map((province) => (
          <g key={province.id}>
            <path
              d={province.path}
              fill={getColor(province)}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-200 cursor-pointer hover:opacity-90"
              style={{ filter: hoveredProvince === province.id ? 'url(#shadow)' : 'none' }}
              onMouseEnter={() => onProvinceHover && onProvinceHover(province.id)}
              onMouseLeave={() => onProvinceHover && onProvinceHover(null)}
              onClick={() => onProvinceClick && onProvinceClick(province)}
            />
            
            {/* Province label for larger provinces */}
            {province.stats.feedbacks > 0 && (
              <text
                x={province.path.match(/M\s+([\d.]+)/)?.[1] || 0}
                y={province.path.match(/M\s+[\d.]+\s*,?\s*([\d.]+)/)?.[1] || 0}
                className="text-[7px] font-bold pointer-events-none select-none"
                fill="#1f2937"
                opacity="0.8"
              >
                {province.stats.feedbacks}
              </text>
            )}
          </g>
        ))}
        
        {/* Compass */}
        <g transform="translate(700, 30)">
          <circle cx="0" cy="0" r="20" fill="white" opacity="0.9" stroke="#64748b" strokeWidth="1"/>
          <path d="M 0,-15 L 3,0 L 0,15 L -3,0 Z" fill="#ef4444" />
          <text x="0" y="-18" textAnchor="middle" className="text-[10px] font-bold" fill="#1f2937">N</text>
        </g>
      </svg>

      {/* Hover Tooltip */}
      {hoveredProvince && (() => {
        const province = enrichedProvinces.find(p => p.id === hoveredProvince);
        if (!province) return null;
        
        return (
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-xl border-2 border-red-500 z-10 min-w-[250px]">
            <h4 className="font-bold text-lg text-gray-900 mb-2">{province.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Feedback:</span>
                <span className="font-bold text-blue-600">{province.stats.feedbacks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Prioritas Tinggi:</span>
                <span className="font-bold text-red-600">{province.stats.high_urgency || 0}</span>
              </div>
              {getProvinceStats && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Rate:</span>
                  <span className="font-bold text-green-600">
                    {getProvinceStats(province.stats)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

