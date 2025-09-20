import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { text, type, context } = await request.json();

    if (!text || !type) {
      return NextResponse.json(
        { error: 'Text and type are required' },
        { status: 400 }
      );
    }

    // Generate AI suggestions based on type
    let suggestions = [];

    if (type === 'title') {
      suggestions = await generateTitleSuggestions(text, context);
    } else if (type === 'content') {
      suggestions = await generateContentSuggestions(text, context);
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('AI Suggestions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateTitleSuggestions(userTitle, context) {
  // Enhanced title suggestions based on common feedback patterns
  const suggestions = [];
  const lowerTitle = userTitle.toLowerCase();
  
  // Location context
  const location = context?.location || '';
  const specificLocation = context?.specificLocation || '';
  
  // Pattern-based suggestions
  if (lowerTitle.includes('jalan') || lowerTitle.includes('rusak')) {
    suggestions.push(
      `Perbaikan Jalan Rusak di ${specificLocation || location}`,
      `Kerusakan Infrastruktur Jalan di Area ${location}`,
      `Permintaan Perbaikan Jalan yang Berlubang di ${specificLocation || location}`
    );
  }
  
  if (lowerTitle.includes('air') || lowerTitle.includes('pdam')) {
    suggestions.push(
      `Masalah Pasokan Air Bersih di ${location}`,
      `Gangguan Layanan PDAM di ${specificLocation || location}`,
      `Permintaan Perbaikan Sistem Air Bersih di ${location}`
    );
  }
  
  if (lowerTitle.includes('sampah') || lowerTitle.includes('kebersihan')) {
    suggestions.push(
      `Masalah Pengelolaan Sampah di ${location}`,
      `Permintaan Peningkatan Kebersihan Lingkungan di ${specificLocation || location}`,
      `Keluhan Sistem Pengangkutan Sampah di ${location}`
    );
  }
  
  if (lowerTitle.includes('listrik') || lowerTitle.includes('lampu')) {
    suggestions.push(
      `Gangguan Penerangan Jalan di ${specificLocation || location}`,
      `Permintaan Perbaikan Lampu Jalan di ${location}`,
      `Masalah Pasokan Listrik di ${specificLocation || location}`
    );
  }
  
  if (lowerTitle.includes('sekolah') || lowerTitle.includes('pendidikan')) {
    suggestions.push(
      `Masalah Fasilitas Pendidikan di ${location}`,
      `Permintaan Perbaikan Sekolah di ${specificLocation || location}`,
      `Keluhan Layanan Pendidikan di ${location}`
    );
  }
  
  if (lowerTitle.includes('kesehatan') || lowerTitle.includes('puskesmas')) {
    suggestions.push(
      `Masalah Layanan Kesehatan di ${location}`,
      `Keluhan Fasilitas Puskesmas di ${specificLocation || location}`,
      `Permintaan Peningkatan Layanan Kesehatan di ${location}`
    );
  }
  
  if (lowerTitle.includes('kerja') || lowerTitle.includes('pekerjaan')) {
    suggestions.push(
      `Masalah Ketersediaan Lapangan Kerja di ${location}`,
      `Permintaan Program Pelatihan Kerja di ${specificLocation || location}`,
      `Keluhan Tingkat Pengangguran di ${location}`
    );
  }
  
  if (lowerTitle.includes('transportasi') || lowerTitle.includes('angkot')) {
    suggestions.push(
      `Masalah Transportasi Umum di ${location}`,
      `Permintaan Peningkatan Layanan Angkutan Umum di ${specificLocation || location}`,
      `Keluhan Sistem Transportasi di ${location}`
    );
  }
  
  // Generic improvements if no specific patterns match
  if (suggestions.length === 0) {
    const cleanTitle = userTitle.charAt(0).toUpperCase() + userTitle.slice(1);
    suggestions.push(
      `${cleanTitle} di ${location}`,
      `Masalah ${cleanTitle} di ${specificLocation || location}`,
      `Permintaan Perbaikan: ${cleanTitle} di ${location}`
    );
  }
  
  // Remove duplicates and limit to 3 suggestions
  return [...new Set(suggestions)].slice(0, 3);
}

async function generateContentSuggestions(userContent, context) {
  const suggestions = [];
  const lowerContent = userContent.toLowerCase();
  
  // Location context
  const location = context?.location || '';
  const specificLocation = context?.specificLocation || '';
  
  // Analyze user intent and provide specific, predictive suggestions
  
  // ROAD/INFRASTRUCTURE ISSUES
  if (lowerContent.includes('jalan') && (lowerContent.includes('rusak') || lowerContent.includes('berlubang') || lowerContent.includes('hancur'))) {
    suggestions.push(
      `Jalan di ${specificLocation || location} mengalami kerusakan parah dengan lubang-lubang besar yang membahayakan pengendara. Kondisi ini menyebabkan:
- Kecelakaan motor dan mobil karena menghindari lubang
- Kerusakan kendaraan (ban pecah, velg bengkok, shock breaker rusak)
- Kemacetan karena kendaraan melambat dan berganti jalur
- Air menggenang saat hujan sehingga jalan tidak bisa dilalui

Dampak ekonomi: Biaya perbaikan kendaraan warga meningkat, akses ke tempat kerja terhambat, dan nilai properti di area ini menurun.

Solusi yang diharapkan: Perbaikan aspal dengan teknologi yang tahan lama, pemasangan drainase yang baik, dan pemeliharaan rutin setiap 6 bulan.`
    );
    
    suggestions.push(
      `Kondisi jalan di ${specificLocation || location} sangat memprihatinkan. Sejak ${new Date().getMonth() > 6 ? 'awal tahun' : 'bulan lalu'}, jalan ini semakin rusak dan menimbulkan masalah serius:

KONDISI SAAT INI:
- Lubang dengan kedalaman 10-20 cm di beberapa titik
- Lebar lubang mencapai 1-2 meter yang memaksa kendaraan zigzag
- Saat hujan, lubang terisi air sehingga tidak terlihat kedalamannya
- Debu beterbangan saat kering, mengganggu pernapasan warga

DAMPAK YANG DIRASAKAN:
- Anak-anak sekolah kesulitan naik angkot karena sopir menghindari jalan ini
- Ibu-ibu ke pasar harus memutar jauh atau jalan kaki
- Ambulans dan pemadam kebakaran sulit akses darurat
- Bisnis warung dan toko di sepanjang jalan sepi pembeli

Mohon segera diperbaiki sebelum musim hujan tiba agar tidak semakin parah.`
    );
  }
  
  // WATER/PDAM ISSUES  
  else if (lowerContent.includes('air') && (lowerContent.includes('pdam') || lowerContent.includes('bersih') || lowerContent.includes('mati'))) {
    suggestions.push(
      `Pasokan air PDAM di ${specificLocation || location} sering mati tanpa pemberitahuan. Masalah ini terjadi:
- 3-4 kali seminggu, biasanya pagi hari (06:00-10:00) dan sore (16:00-20:00)  
- Air keruh kecoklatan saat pertama kali mengalir kembali
- Tekanan air sangat lemah, tidak sampai ke lantai 2

Dampak pada keluarga:
- Anak-anak terlambat sekolah karena tidak bisa mandi
- Ibu rumah tangga kesulitan memasak dan mencuci
- Harus beli air galon yang menambah pengeluaran Rp 50.000/minggu
- Tangki penampungan sering kosong karena air mati mendadak

Solusi diharapkan: Perbaikan pipa distribusi, peningkatan tekanan pompa, dan jadwal maintenance yang tidak mengganggu jam sibuk warga.`
    );
    
    suggestions.push(
      `Kualitas air PDAM di ${specificLocation || location} sangat buruk dan tidak layak konsumsi:

MASALAH KUALITAS:
- Air berwarna kuning kecoklatan bahkan setelah didiamkan
- Bau amis dan rasa pahit yang tidak hilang meski dimasak
- Endapan lumpur di bak mandi dan ember penampungan
- pH air terlalu asam, merusak pipa dan keran di rumah

DAMPAK KESEHATAN:
- Beberapa warga mengalami gatal-gatal setelah mandi
- Anak-anak sering sakit perut setelah minum air masakan
- Pakaian yang dicuci menjadi kusam dan berbau

KERUGIAN EKONOMI:
- Terpaksa beli air galon untuk minum dan masak (Rp 200.000/bulan)
- Keran dan shower cepat rusak karena endapan
- Biaya berobat meningkat

Mohon dilakukan uji laboratorium dan perbaikan sistem filtrasi PDAM.`
    );
  }
  
  // WASTE/CLEANLINESS ISSUES
  else if (lowerContent.includes('sampah') || lowerContent.includes('kotor') || lowerContent.includes('bau')) {
    suggestions.push(
      `Pengelolaan sampah di ${specificLocation || location} sangat buruk dan mengganggu kehidupan warga:

KONDISI SAAT INI:
- Sampah menumpuk di TPS selama 4-5 hari tanpa diangkut
- Bau busuk menyengat terutama saat cuaca panas
- Lalat dan tikus berkeliaran di sekitar rumah warga
- Air lindi mengalir ke selokan dan mencemari lingkungan

DAMPAK KESEHATAN:
- Anak-anak sering batuk dan sesak napas karena bau
- Warga tua mengeluh pusing dan mual
- Penyakit diare meningkat di RT ini
- Air sumur warga mulai berbau dan keruh

DAMPAK SOSIAL:
- Tamu dan keluarga enggan berkunjung
- Nilai jual rumah menurun drastis
- Konflik antar warga karena saling menyalahkan

Solusi: Jadwal pengangkutan sampah 2 hari sekali, penambahan armada, dan sosialisasi pemilahan sampah organik-anorganik.`
    );
  }
  
  // ELECTRICITY/LIGHTING ISSUES
  else if (lowerContent.includes('listrik') || lowerContent.includes('lampu') || lowerContent.includes('gelap')) {
    suggestions.push(
      `Penerangan jalan di ${specificLocation || location} sangat minim dan membahayakan keselamatan warga:

KONDISI LAMPU JALAN:
- 8 dari 12 lampu jalan sudah mati sejak 3 bulan lalu
- Jarak antar lampu yang menyala terlalu jauh (100-150 meter)
- Beberapa tiang lampu condong dan berbahaya
- Kabel-kabel terlihat kusut dan tidak terawat

DAMPAK KEAMANAN:
- 3 kasus penjambretan dalam 2 bulan terakhir
- Pengendara motor sering terjatuh karena tidak melihat lubang
- Anak sekolah takut pulang sore karena gelap
- Ibu-ibu tidak berani keluar rumah setelah Maghrib

DAMPAK EKONOMI:
- Warung tutup lebih cepat karena sepi pembeli
- Ojek online jarang mau masuk gang karena gelap
- Warga harus beli senter dan lampu emergency sendiri

Mohon segera diperbaiki sebelum terjadi kecelakaan atau kejahatan serius.`
    );
  }
  
  // HEALTH SERVICES ISSUES
  else if (lowerContent.includes('puskesmas') || lowerContent.includes('dokter') || lowerContent.includes('obat')) {
    suggestions.push(
      `Layanan Puskesmas di ${specificLocation || location} sangat tidak memadai untuk kebutuhan warga:

MASALAH PELAYANAN:
- Antrian panjang dari jam 5 pagi, baru dilayani jam 9
- Hanya ada 1 dokter untuk 500+ pasien per hari  
- Obat sering kosong, terutama obat diabetes dan hipertensi
- Alat kesehatan rusak: tensimeter, timbangan, termometer

DAMPAK PADA WARGA:
- Lansia harus menginap di puskesmas karena antri dari subuh
- Ibu hamil sering tidak kebagian pemeriksaan
- Anak sakit terpaksa ke dokter praktek yang mahal
- Penyakit ringan jadi parah karena terlambat ditangani

KERUGIAN FINANSIAL:
- Biaya ke dokter swasta Rp 150.000 vs gratis di puskesmas
- Beli obat di apotek 3x lebih mahal
- Kehilangan upah karena antri seharian

Solusi: Tambah dokter dan perawat, perpanjang jam layanan, stok obat yang cukup.`
    );
  }
  
  // JOB/EMPLOYMENT ISSUES  
  else if (lowerContent.includes('kerja') || lowerContent.includes('pengangguran') || lowerContent.includes('usaha')) {
    suggestions.push(
      `Tingkat pengangguran di ${specificLocation || location} sangat tinggi dan membutuhkan perhatian serius:

KONDISI SAAT INI:
- 60% pemuda lulusan SMA/SMK menganggur lebih dari 1 tahun
- Banyak usaha kecil tutup karena sepi pembeli dan modal habis
- Tidak ada pelatihan kerja atau program keterampilan dari pemerintah
- Akses informasi lowongan kerja sangat terbatas

DAMPAK SOSIAL:
- Pemuda frustasi dan mulai terjerumus hal negatif
- Orang tua stress karena harus menanggung anak dewasa
- Tingkat kejahatan kecil (pencurian) meningkat
- Banyak keluarga terlilit hutang

POTENSI YANG BISA DIKEMBANGKAN:
- Lokasi strategis dekat pasar tradisional untuk usaha kuliner
- Banyak ibu-ibu terampil membuat kerajinan tangan
- Lahan kosong bisa untuk urban farming atau peternakan kecil
- Akses transportasi baik untuk usaha jasa online

Solusi: Program pelatihan wirausaha, bantuan modal UMKM, job fair rutin, dan pendampingan bisnis.`
    );
  }
  
  // GENERIC ENHANCEMENT for unmatched patterns
  else {
    // More intelligent generic enhancement based on keywords
    const keywords = extractKeywords(lowerContent);
    const enhancedContent = enhanceGenericContent(userContent, keywords, location, specificLocation);
    suggestions.push(enhancedContent);
  }
  
  // If no specific patterns matched, add one generic but intelligent suggestion
  if (suggestions.length === 0) {
    suggestions.push(improveContentStructure(userContent, location, specificLocation));
  }
  
  return suggestions.slice(0, 2); // Limit to 2 more focused suggestions
}

function extractKeywords(content) {
  const problemKeywords = ['rusak', 'buruk', 'kotor', 'mati', 'macet', 'mahal', 'sulit', 'tidak', 'kurang'];
  const locationKeywords = ['jalan', 'rumah', 'sekolah', 'pasar', 'kantor', 'gang', 'rt', 'rw'];
  const timeKeywords = ['hari', 'minggu', 'bulan', 'tahun', 'pagi', 'siang', 'sore', 'malam'];
  
  return {
    problems: problemKeywords.filter(word => content.includes(word)),
    locations: locationKeywords.filter(word => content.includes(word)),
    timeRefs: timeKeywords.filter(word => content.includes(word))
  };
}

function enhanceGenericContent(userContent, keywords, location, specificLocation) {
  return `${userContent}

DETAIL SITUASI:
Masalah ini terjadi di ${specificLocation || location} dan berdampak langsung pada kehidupan sehari-hari warga. ${keywords.problems.length > 0 ? `Kondisi yang ${keywords.problems.join(', ')} ini` : 'Situasi ini'} memerlukan penanganan segera.

DAMPAK YANG DIRASAKAN:
- Mengganggu aktivitas rutin warga sekitar
- Mempengaruhi kenyamanan dan keamanan lingkungan
- Berpotensi menimbulkan masalah yang lebih besar jika dibiarkan

HARAPAN PENYELESAIAN:
Kami berharap pihak terkait dapat segera menindaklanjuti laporan ini dengan melakukan survei langsung ke lokasi dan mengambil tindakan perbaikan yang tepat.

Terima kasih atas perhatian dan tindak lanjutnya.`;
}

function improveContentStructure(userContent, location, specificLocation) {
  return `${userContent}

Masalah ini perlu mendapat perhatian khusus karena berdampak pada banyak warga di ${specificLocation || location}.

KRONOLOGI:
Kondisi ini sudah berlangsung cukup lama dan semakin memburuk. Warga sudah mencoba mengatasi sendiri namun memerlukan bantuan pemerintah.

DAMPAK:
- Mengganggu aktivitas sehari-hari masyarakat
- Mempengaruhi kualitas hidup warga sekitar
- Berpotensi menimbulkan masalah lain jika tidak segera ditangani

PERMINTAAN:
Mohon kiranya pihak terkait dapat melakukan peninjauan langsung dan mengambil tindakan yang diperlukan.

Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.`;
}
