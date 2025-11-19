# Swaranusa

**Platform Advokasi Warga Berbasis AI & Blockchain**

Swaranusa adalah platform inovatif yang memberdayakan warga Indonesia untuk mengubah keluhan dan masukan menjadi dokumen profesional yang dapat ditindaklanjuti oleh pemerintah. Platform ini menggunakan teknologi AI untuk memproses masukan warga dan blockchain untuk memverifikasi autentisitas dokumen.

## 🎯 Fitur Utama

### Untuk Warga
- **Kirim Masukan**: Kirim keluhan dalam bahasa sehari-hari dengan dukungan teks, suara, dan gambar
- **Pemrosesan AI**: AI secara otomatis membersihkan, mengkategorikan, dan memformat masukan menjadi dokumen profesional
- **Verifikasi Blockchain**: Setiap masukan diverifikasi dan diberi timestamp di blockchain Ethereum (Sepolia) untuk memastikan autentisitas
- **Pelacakan Status**: Pantau status masukan Anda dari "Belum Dilihat" hingga "Selesai"
- **Klaster Masukan**: Lihat masukan serupa dari warga lain dan gabungkan menjadi klaster isu
- **Verifikasi Publik**: Verifikasi autentisitas masukan Anda dengan link blockchain publik

### Untuk Pemerintah
- **Dashboard Analitik**: Lihat statistik dan tren masukan warga
- **Manajemen Masukan**: Kelola dan ubah status masukan warga
- **Laporan AI**: Generate laporan profesional otomatis dari klaster masukan menggunakan AI
- **Ekspor PDF**: Download laporan dalam format PDF profesional
- **Pelacakan Transparan**: Lihat siapa yang membaca dan menindaklanjuti masukan

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework dengan App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM** - Database ORM
- **PostgreSQL (Neon)** - Serverless PostgreSQL database
- **JWT** - Authentication dengan jsonwebtoken
- **bcryptjs** - Password hashing

### AI & Machine Learning
- **Ollama** - Local LLM inference server
- **Llama 3.2** - Language model untuk:
  - Pemrosesan dan pembersihan teks masukan
  - Ekstraksi metadata (kategori, urgensi, sentimen, tags)
  - Analisis gambar
  - Clustering masukan serupa
  - Generasi nama klaster
  - Generasi laporan profesional

### Blockchain
- **Ethereum Sepolia** - Testnet untuk verifikasi
- **Hardhat** - Development environment untuk smart contracts
- **Ethers.js 6** - Ethereum library
- **Solidity** - Smart contract language
- **FeedbackVerification.sol** - Smart contract untuk verifikasi masukan

### Tools & Utilities
- **jsPDF** - PDF generation
- **Axios** - HTTP client
- **Zod** - Schema validation

## 📁 Struktur Project

```
swaranusa-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API endpoints
│   │   │   ├── ai/             # AI processing endpoints
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── blockchain/     # Blockchain verification
│   │   │   ├── feedback/       # Feedback CRUD operations
│   │   │   └── government/     # Government dashboard APIs
│   │   ├── dashboard/          # Citizen dashboard page
│   │   ├── government/          # Government dashboard page
│   │   └── clusters/           # Cluster detail pages
│   ├── components/              # React components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── AuthModal.js        # Authentication modal
│   │   └── RoleGuard.js        # Role-based access control
│   ├── contexts/                # React contexts
│   │   └── AuthContext.js      # Authentication context
│   ├── lib/                     # Utility libraries
│   │   ├── auth.js             # Authentication utilities
│   │   ├── blockchain.js       # Blockchain service
│   │   ├── db.js               # Database connection
│   │   ├── ollama.js           # AI/LLM service
│   │   ├── reportGenerator.js  # Report generation
│   │   ├── schema.js           # Database schema (Drizzle)
│   │   └── validations.js      # Input validation
│   └── data/
│       └── indonesia-locations.js  # Location data
├── public/                      # Static assets
├── hardhat/                     # Blockchain smart contracts
│   ├── contracts/
│   │   └── FeedbackVerification.sol
│   └── test/
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ dan npm/yarn/pnpm
- **PostgreSQL database** (Neon atau self-hosted)
- **Ollama** dengan model Llama 3.2 terinstall
- **Ethereum wallet** dengan Sepolia ETH (untuk blockchain verification)
- **Hardhat** (untuk development smart contracts)

### Installation

1. **Clone repository**
```bash
git clone <repository-url>
cd swaranusa-app
```

2. **Install dependencies**
```bash
npm install
# atau
yarn install
# atau
pnpm install
```

3. **Setup environment variables**

Buat file `.env.local` di root `swaranusa-app/`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-secret-key-here

# Blockchain
SEPOLIA_URL=https://ethereum-sepolia-rpc.publicnode.com
ADMIN_WALLET_PRIVATE_KEY=your-private-key-here
FEEDBACK_CONTRACT_ADDRESS=your-contract-address-here

# AI/LLM
OLLAMA_HOST=http://localhost:11434
# Set to 'disabled' to disable Ollama and use fallback processing
# OLLAMA_HOST=disabled
```

4. **Setup database**

Pastikan database PostgreSQL sudah dibuat, kemudian jalankan migrasi:

```bash
npx drizzle-kit push
```

5. **Setup Ollama**

Install Ollama dan download model:

```bash
# Install Ollama (lihat https://ollama.ai)
ollama pull llama3.2:latest
```

6. **Setup Blockchain (Optional)**

Untuk development smart contracts:

```bash
cd hardhat
npm install
npx hardhat compile
npx hardhat deploy
```

### Running Development Server

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Building for Production

```bash
npm run build
npm start
```

## 🔐 Authentication & Roles

Platform mendukung tiga role:

1. **Citizen** (`citizen`) - Warga yang dapat mengirim masukan
2. **Government** (`government`) - Pejabat pemerintah yang dapat mengelola masukan dan membuat laporan
3. **Admin** (`admin`) - Administrator sistem

## 📊 Database Schema

### Tables
- `users` - User accounts dengan role-based access
- `feedbacks` - Masukan warga dengan status tracking
- `clusters` - Klaster masukan serupa
- `feedback_status_history` - History perubahan status
- `blockchain_verifications` - Data verifikasi blockchain
- `government_reports` - Laporan yang dihasilkan AI

Lihat `src/lib/schema.js` untuk detail lengkap.

## 🤖 AI Features

### Feedback Processing
- **Text Cleaning**: Membersihkan bahasa informal menjadi formal
- **Category Classification**: 10 kategori (infrastruktur, kesehatan, pendidikan, dll)
- **Sentiment Analysis**: Positif, negatif, atau netral
- **Urgency Detection**: Low, medium, atau high
- **Tag Extraction**: Keyword extraction untuk clustering
- **Location Extraction**: Identifikasi lokasi dari teks

### Media Processing
- **Image Analysis**: Analisis gambar untuk ekstraksi informasi
- **Voice Processing**: Transkripsi dan analisis rekaman suara

### Clustering
- **Similarity Detection**: Mencari masukan serupa berdasarkan kategori, lokasi, dan konten
- **Cluster Generation**: Generate nama dan deskripsi klaster otomatis

### Report Generation
- **Executive Summary**: Ringkasan eksekutif otomatis
- **Key Findings**: Temuan kunci dari analisis masukan
- **Recommendations**: Rekomendasi tindakan dengan prioritas dan timeline

## ⛓️ Blockchain Integration

### Smart Contract
- **FeedbackVerification.sol**: Smart contract untuk menyimpan hash masukan
- **Network**: Ethereum Sepolia testnet
- **Features**:
  - Store feedback hash dengan timestamp
  - Verify feedback hash exists
  - Get verification details
  - Public verification links

### Verification Flow
1. Masukan dibuat dan diproses
2. Hash dibuat dari data masukan
3. Hash disimpan di blockchain via smart contract
4. Transaction hash disimpan di database
5. Link verifikasi publik dibuat (Etherscan)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user baru
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout
- `GET /api/auth/me` - Get current user

### Feedback
- `POST /api/feedback/submit` - Submit feedback baru
- `GET /api/feedback/my-submissions` - Get user's feedbacks
- `GET /api/feedback/view` - View feedback detail
- `POST /api/feedback/verify` - Verify feedback on blockchain
- `GET /api/feedback/status` - Get feedback status
- `GET /api/feedback/clusters` - Get all clusters
- `GET /api/feedback/clusters/[id]` - Get cluster detail

### Government
- `GET /api/government/dashboard` - Get dashboard statistics
- `GET /api/government/feedbacks` - Get all feedbacks
- `GET /api/government/reports` - Get all reports
- `POST /api/government/reports` - Generate new report
- `POST /api/government/reports/update-status` - Update feedback status
- `GET /api/government/statistics` - Get statistics

### AI
- `POST /api/ai/process-media-feedback` - Process image/voice feedback
- `POST /api/ai/process-voice-feedback` - Process voice feedback
- `GET /api/ai/suggestions` - Get AI suggestions

### Blockchain
- `GET /api/blockchain/status` - Check blockchain connection status

## 🧪 Testing

```bash
# Run linter
npm run lint

# Test smart contracts
cd hardhat
npx hardhat test
```

## 📦 Deployment

### Vercel (Recommended)

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

### Environment Variables untuk Production

Pastikan semua environment variables di `.env.local` juga diset di platform deployment.

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

[Specify your license here]

## 🙏 Acknowledgments

- Ollama untuk LLM inference
- Ethereum Foundation untuk blockchain infrastructure
- Next.js team untuk framework yang powerful
- Komunitas open source Indonesia

Untuk pertanyaan atau dukungan, silakan buat issue di repository ini.

---

**Swaranusa** - Memberdayakan Partisipasi Demokratis dengan Teknologi AI & Blockchain
