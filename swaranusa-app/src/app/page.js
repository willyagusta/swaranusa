"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

// Typing Animation Component
function TypingAnimation() {
  const phrases = [
    "Naik Level",
    "Didengar Pemerintah",
    "Jadi Laporan Profesional",
    "Terus Dikawal"
  ];
  
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex];
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        // Pause after completing a word
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      } else {
        if (currentText.length < currentPhrase.length) {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        } else {
          setIsPaused(true);
        }
      }
    }, isPaused ? 1500 : isDeleting ? 40 : 75);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases]);

  return (
    <span className="relative">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { user, signOut } = useAuth();

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm animate-fade-in-down">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Image 
                    src="/logo.png" 
                    alt="Swaranusa Logo" 
                    width={200} 
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#fitur" className="text-gray-600 hover:text-red-600 transition-colors font-medium">FITUR</a>
                <a href="#cara-kerja" className="text-gray-600 hover:text-red-600 transition-colors font-medium">CARA KERJA</a>
                <a href="#dampak" className="text-gray-600 hover:text-red-600 transition-colors font-medium">DAMPAK</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
                {user ? (
              <>
                {user.role === "citizen" && (
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-red-600 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "government" && (
                  <Link 
                    href="/government" 
                    className="text-gray-600 hover:text-red-600 transition-colors font-medium"
                  >
                    Laporan Warga
                  </Link>
                )}
                  <span className="text-gray-600 font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <button 
                    onClick={signOut}
                    className="text-gray-600 hover:text-red-600 transition-colors font-medium"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Masuk
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section  */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero.png" 
            alt="Swaranusa Hero Background" 
            fill
            className="object-cover object-center w-full h-full"
            priority
          />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <div className="text-white animate-slide-in-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-10 leading-tight -mt-15">
                AI & Blockchain yang Bikin Curhatan Warga
                <span className="block text-purple-900 min-h-[1.2em]">
                  <TypingAnimation />
                </span>
              </h1>
              <p className="text-medium md:text-lg text-white/95 mb-8 max-w-4xl leading-relaxed font-light mx-auto">
                Swaranusa mengonversi keluhan warga mentah menjadi dokumen profesional terstruktur menggunakan AI & memverifikasi laporan dengan Blockchain. 
                Masyarakat tidak lagi merasa bingung bagaimana menjangkau & menyampaikan keluhan pada wakil rakyat.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-400">
                <button 
                  onClick={() => user ? window.location.href = '/dashboard' : openAuthModal('signup')}
                  className="bg-purple-800 text-white hover:bg-gray-100 hover:text-red-600 px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Kirim Keluhan Anda
                </button>
                <button 
                  onClick={() => document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-2xl font-bold text-xl transition-all duration-300"
                >
                  Lihat Cara Kerja
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white fade-in-section">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Advokasi Warga Berbasis AI & Blockchain
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Segala yang dibutuhkan warga untuk mengubah keluhan menjadi dokumen profesional yang dapat ditindaklanjuti
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            {/* AI Document Creation */}
            <div className="relative fade-in-section">
              <div className="bg-white rounded-2xl p-8 lg:p-12 h-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <Image 
                      src="/icon/smartdoc.png" 
                      alt="Smart Document" 
                      width={32} 
                      height={32} 
                      className="filter brightness-0 invert"
                    />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Penyusunan Dokumen Cerdas
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed font-medium">
                  AI mengolah keluhan Anda, mengekstrak kata kunci, 
                  dan membuat dokumen semi-formal profesional yang dapat ditanggapi serius oleh pemerintah dan media.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Pembersihan konten bertenaga NLP
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Ekstraksi metadata otomatis
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Format profesional
                  </li>
                </ul>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="relative fade-in-section">
              <div className="bg-white rounded-2xl p-8 lg:p-12 h-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Image 
                      src="/icon/protection.png" 
                      alt="Smart Document" 
                      width={32} 
                      height={32} 
                      className="filter brightness-0 invert"
                    />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Autentikasi Blockchain
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed font-medium">
                  Setiap dokumen diberi timestamp dan disimpan di blockchain untuk autentisitas. 
                  Dapatkan link verifikasi publik yang membuktikan keluhan Anda asli dan tidak diubah.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Hash dokumen yang tidak dapat diubah
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Link verifikasi publik
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Sertifikat anti-manipulasi
                  </li>
                </ul>
              </div>
            </div>

            {/* Report */}
            <div className="relative fade-in-section">
              <div className="bg-white rounded-2xl p-8 lg:p-12 h-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Image 
                      src="/icon/progress.png" 
                      alt="Smart Document" 
                      width={32} 
                      height={32} 
                      className="filter brightness-0 invert"
                    />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Pantau Perkembangan Laporan
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed font-medium">
                Warga dapat memantau dan mengikuti setiap laporan, termasuk melihat pejabat yang membaca, menanggapi, dan menindaklanjutinya.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Lihat siapa saja pejabat yang membaca
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Ikuti status laporan yang masuk
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Ketahui siapa pejabat yang bertanggung jawab atas laporan
                  </li>
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Akses statistik kinerja pejabat terkait
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 fade-in-section">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Laporan dalam Hitungan Menit
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-medium">
              Ubah rasa ketidakpuasan Anda menjadi laporan resmi yang akan diproses pemerintah
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                step: "01",
                title: "Kirim Keluhan",
                description: "Tulis keluhan Anda dalam bahasa sehari-hari. Tambahkan foto, video, atau rekaman suara. Tidak perlu penulisan formal.",
                icon: (
                  <Image 
                    src="/icon/report.png" 
                    alt="Smart Document" 
                    width={28} 
                    height={28} 
                    className="filter brightness-0 invert"
                  />
                )
              },
              {
                step: "02", 
                title: "Pengolahan Dokumen oleh AI",
                description: "AI mengolah masukan, mengekstrak isu kunci, mengidentifikasi lokasi dan urgensi, serta menyusun kategori konten secara profesional.",
                icon: (
                  <Image 
                    src="/icon/ai.png" 
                    alt="Smart Document" 
                    width={32} 
                    height={32} 
                    className="filter brightness-0 invert"
                  />
                )
              },
              {
                step: "03",
                title: "Pembuatan Dokumen",
                description: "AI menyusun laporan semi-formal profesional dengan judul, ringkasan, penilaian dampak dan tindakan yang diminta.",
                icon: (
                  <Image 
                      src="/icon/aidocs.png" 
                      alt="Smart Document" 
                      width={36} 
                      height={36} 
                      className="filter brightness-0 invert"
                    />
                )
              },
              {
                step: "04",
                title: "Bukti Blockchain",
                description: "Dokumen di-hash dan diberi timestamp di blockchain. Hal ini memastikan laporan yang dikirimkan asli dan tidak diubah.",
                icon: (
                  <Image 
                      src="/icon/blockchain.png" 
                      alt="Smart Document" 
                      width={32} 
                      height={32} 
                      className="filter brightness-0 invert"
                    />
                )
              }
            ].map((item, index) => (
              <div key={index} className="text-center fade-in-section">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg backdrop-blur-sm">
                    {item.icon}
                  </div>
                  <div className="inline-block px-3 py-1 bg-white/20 text-white text-sm font-bold rounded-full mb-3 backdrop-blur-sm">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-white/90 leading-relaxed text-sm font-medium">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="dampak" className="py-20 bg-white fade-in-section">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Memberdayakan Partisipasi Demokratis
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
              Swaranusa menjembatani kesenjangan antara rasa ketidakpuasan warga dan tindakan pemerintah melalui teknologi dan transparansi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: (
                  <Image 
                      src="/icon/people.png" 
                      alt="Smart Document" 
                      width={32}
                      height={32}
                      className="text-red-600 font-bold"
                    />
                ),
                title: "Pemberdayaan Warga",
                description: "Ubah keluhan emosional menjadi dokumen profesional yang mendapat perhatian dan rasa hormat"
              },
              {
                icon: (
                  <Image 
                      src="/icon/transparent.png" 
                      alt="Smart Document" 
                      width={32}
                      height={32}
                      className="text-red-600 font-bold"
                    />
                ),
                title: "Transparansi & Kepercayaan",
                description: "Verifikasi blockchain memastikan autentisitas dan mencegah manipulasi keluhan warga"
              },
              {
                icon: (
                  <Image 
                      src="/icon/collection.png" 
                      alt="Smart Document" 
                      width={32}
                      height={32}
                      className="text-red-600 font-bold"
                    />
                ),
                title: "Dampak Kolektif",
                description: "Kumpulkan keluhan populer menjadi petisi dan lacak respons pemerintah terhadap isu warga"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center fade-in-section">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600 hover:bg-red-200 transition-colors duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed font-medium">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => user ? window.location.href = '/dashboard' : openAuthModal('signup')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Suarakan Aspirasi Anda
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 fade-in-section">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/logo.png" 
                  alt="Swaranusa Logo" 
                  width={200} 
                  height={80}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <p className="text-white/90 leading-relaxed font-medium">
                Memberdayakan warga untuk mengubah keluhan menjadi dokumen profesional dengan teknologi AI dan blockchain. 
                Membuat demokrasi lebih mudah diakses, transparan, dan efektif untuk semua.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Verifikasi Blockchain</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Template Dokumen</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Kebijakan Privasi</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p className="font-medium">&copy; 2025 Swaranusa. Hak cipta dilindungi. | Memberdayakan Partisipasi Demokratis</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        defaultMode={authMode} 
      />
    </div>
  );
}