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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-600 hover:text-red-600 transition-colors font-medium"
                  >
                    Masuk
                  </button>
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-5xl mx-auto">
            <div className="text-white animate-slide-in-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-10 leading-tight">
                AI & Blockchain yang Bikin Curhatan Warga
                <span className="block text-purple-900 min-h-[1.2em]">
                  <TypingAnimation />
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-4xl leading-relaxed font-medium mx-auto">
                Swaranusa mengonversi keluhan warga mentah menjadi dokumen profesional terstruktur menggunakan AI. 
                Dari umpatan emosional menjadi laporan formal dengan verifikasi blockchain - memberdayakan warga 
                untuk didengar pemerintah dan media dengan dokumentasi otentik anti-manipulasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-400">
                <button 
                  onClick={() => user ? window.location.href = '/dashboard' : openAuthModal('signup')}
                  className="bg-white text-red-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Kirim Keluhan Anda
                </button>
                <button 
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Advokasi Warga Berbasis AI & Blockchain
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              Segala yang dibutuhkan warga untuk mengubah keluhan menjadi dokumen profesional yang dapat ditindaklanjuti
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* AI Document Creation */}
            <div className="relative fade-in-section">
              <div className="bg-white rounded-2xl p-8 lg:p-12 h-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                  Generasi Dokumen Cerdas
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed font-medium">
                  AI membersihkan keluhan mentah Anda, menghapus profanitas, mengekstrak detail kunci, 
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
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Dukungan multi-media (gambar, video, suara)
                  </li>
                </ul>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="relative fade-in-section">
              <div className="bg-white rounded-2xl p-8 lg:p-12 h-full border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
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
                  <li className="flex items-center font-medium">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                    Sistem upvoting warga
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 fade-in-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Laporan dalam Hitungan Menit
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-medium">
              Ubah frustrasi Anda menjadi dokumentasi profesional yang mendapat hasil
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                step: "01",
                title: "Kirim Keluhan",
                description: "Tulis keluhan Anda dalam bahasa sehari-hari. Tambahkan foto, video, atau rekaman suara. Tidak perlu penulisan formal.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )
              },
              {
                step: "02", 
                title: "Pemrosesan AI",
                description: "AI membersihkan profanitas, mengekstrak isu kunci, mengidentifikasi lokasi dan urgensi, serta menyusun konten secara profesional.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                step: "03",
                title: "Generasi Dokumen",
                description: "Dapatkan laporan semi-formal profesional dengan judul, ringkasan, penilaian dampak dan tindakan yang diminta.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                step: "04",
                title: "Bukti Blockchain",
                description: "Dokumen di-hash dan diberi timestamp di blockchain. Unduh PDF atau bagikan link verifikasi dengan otoritas.",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Memberdayakan Partisipasi Demokratis
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto font-medium">
              Swaranusa menjembatani kesenjangan antara frustrasi warga dan tindakan pemerintah melalui teknologi dan transparansi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Pemberdayaan Warga",
                description: "Ubah keluhan emosional menjadi dokumen profesional yang mendapat perhatian dan rasa hormat"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Transparansi & Kepercayaan",
                description: "Verifikasi blockchain memastikan autentisitas dan mencegah manipulasi keluhan warga"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
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
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Suarakan Aspirasi Anda
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-red-600 to-red-700 text-white py-12 fade-in-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <li><a href="#" className="hover:text-white transition-colors font-medium">Akses API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-white/80">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Hubungi Kami</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Kebijakan Privasi</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Syarat Layanan</a></li>
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