"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const { user, signOut } = useAuth();

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-onyx">Swaranusa</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-600 hover:text-emerald transition-colors">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-emerald transition-colors">How It Works</a>
                <a href="#impact" className="text-gray-600 hover:text-emerald transition-colors">Impact</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 hover:text-emerald transition-colors font-medium">
                    Dashboard
                  </Link>
                  <span className="text-gray-600">
                    {user.firstName} {user.lastName}
                  </span>
                  <button 
                    onClick={signOut}
                    className="text-gray-600 hover:text-emerald transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => openAuthModal('signin')}
                    className="text-gray-600 hover:text-emerald transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => openAuthModal('signup')}
                    className="bg-emerald hover:bg-sage text-white px-6 py-2 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-emerald/5 via-white to-sage/10 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-2 h-2 bg-emerald/20 rounded-full"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-sage/30 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-emerald/25 rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-copper/20 rounded-full"></div>
          <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-sage/20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald/30 rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-onyx mb-6 leading-tight">
              Transform Citizen Complaints
              <span className="block text-emerald">Into Professional Documents</span>
              with AI Power
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Swaranusa converts raw citizen complaints into professional, structured documents using AI. 
              From emotional rants to formal reports with blockchain verification - empowering citizens 
              to be heard by government and media with authentic, tamper-proof documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => user ? window.location.href = '/dashboard' : openAuthModal('signup')}
                className="bg-emerald hover:bg-sage text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Submit Your Complaint
              </button>
              <button className="border-2 border-emerald text-emerald hover:bg-emerald hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300">
                See How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-onyx mb-6">
              AI-Powered Citizen Advocacy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything citizens need to transform complaints into actionable, professional documents
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* AI Document Creation */}
            <div className="relative">
              <div className="bg-gradient-to-br from-emerald/10 via-emerald/5 to-sage/10 rounded-3xl p-8 lg:p-12 h-full border border-emerald/10 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald to-sage rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-onyx mb-4">
                  Smart Document Generation
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  AI cleans your raw complaint, removes profanity, extracts key details, and creates 
                  a professional semi-formal document that government and media can take seriously.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald rounded-full mr-3"></div>
                    NLP-powered content cleaning
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald rounded-full mr-3"></div>
                    Automatic metadata extraction
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald rounded-full mr-3"></div>
                    Professional formatting
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-emerald rounded-full mr-3"></div>
                    Multi-media support (images, video, voice)
                  </li>
                </ul>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="relative">
              <div className="bg-gradient-to-br from-copper/10 via-sand/5 to-copper/5 rounded-3xl p-8 lg:p-12 h-full border border-copper/20 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-copper to-brown rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-onyx mb-4">
                  Blockchain Authentication
                </h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                  Every document is timestamped and stored on blockchain for authenticity. 
                  Get a public verification link that proves your complaint is genuine and unaltered.
                </p>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-copper rounded-full mr-3"></div>
                    Immutable document hashing
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-copper rounded-full mr-3"></div>
                    Public verification links
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-copper rounded-full mr-3"></div>
                    Tamper-proof certificates
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-copper rounded-full mr-3"></div>
                    Citizen upvoting system
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-jungle/5 via-gray-50 to-onyx/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-onyx mb-6">
              From Rant to Report in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your frustration into professional documentation that gets results
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 lg:gap-6">
            {[
              {
                step: "01",
                title: "Submit Complaint",
                description: "Write your complaint in plain language. Add photos, videos, or voice recordings. No formal writing required.",
                color: "emerald",
                bgColor: "from-emerald/10 to-sage/5",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )
              },
              {
                step: "02", 
                title: "AI Processing",
                description: "AI cleans profanity, extracts key issues, identifies location and urgency, and structures the content professionally.",
                color: "sage",
                bgColor: "from-sage/10 to-emerald/5",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )
              },
              {
                step: "03",
                title: "Document Generation",
                description: "Get a professional semi-formal report with title, summary, impact assessment, and requested actions.",
                color: "copper",
                bgColor: "from-copper/10 to-sand/5",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )
              },
              {
                step: "04",
                title: "Blockchain Proof",
                description: "Document is hashed and timestamped on blockchain. Download PDF or share verification link with authorities.",
                color: "forest",
                bgColor: "from-forest/10 to-jungle/5",
                icon: (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )
              }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`bg-gradient-to-br ${item.bgColor} rounded-2xl p-6 mb-6 border border-${item.color}/20`}>
                  <div className={`w-16 h-16 bg-${item.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className={`inline-block px-3 py-1 bg-${item.color} text-white text-sm font-bold rounded-full mb-3`}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-onyx mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-gradient-to-r from-forest via-emerald to-sage">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Empowering Democratic Participation
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
              Swaranusa bridges the gap between citizen frustration and government action through technology and transparency.
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
                title: "Citizen Empowerment",
                description: "Transform emotional complaints into professional documents that command respect and attention"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Transparency & Trust",
                description: "Blockchain verification ensures authenticity and prevents tampering with citizen complaints"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: "Collective Impact",
                description: "Bundle popular complaints into petitions and track government response to citizen issues"
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-white/90 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={() => user ? window.location.href = '/dashboard' : openAuthModal('signup')}
              className="bg-white text-emerald hover:bg-gray-100 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Make Your Voice Heard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-onyx to-jungle text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">Swaranusa</h3>
              <p className="text-gray-300 leading-relaxed">
                Empowering citizens to transform complaints into professional documents with AI and blockchain technology. 
                Making democracy more accessible, transparent, and effective for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">Blockchain Verification</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">Document Templates</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">API Access</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-emerald transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Swaranusa. All rights reserved. | Empowering Democratic Participation</p>
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
