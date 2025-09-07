'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const { signIn, signUp, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    if (mode === 'signin') {
      const result = await signIn({
        email: formData.email,
        password: formData.password,
      });
      
      if (result.success) {
        router.push('/dashboard');
      }
    } else {
      const result = await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      
      if (result.success) {
        router.push('/dashboard');
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    clearError();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-emerald/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-sage/30 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-1.5 h-1.5 bg-emerald/25 rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-copper/20 rounded-full"></div>
        <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-sage/20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-emerald/30 rounded-full"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold text-onyx">PublishPro™</h1>
          </Link>
          <h2 className="text-4xl font-bold text-onyx mb-4">
            {mode === 'signin' ? 'Welcome Back' : 'Join PublishPro™'}
          </h2>
          <p className="text-gray-600 text-lg">
            {mode === 'signin' 
              ? 'Sign in to your account to continue' 
              : 'Create your account to get started'
            }
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all bg-white/50"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all bg-white/50"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all bg-white/50"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all bg-white/50"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald focus:border-transparent transition-all bg-white/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald hover:bg-sage text-white py-4 px-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-emerald hover:text-sage font-medium transition-colors"
              >
                {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link 
              href="/" 
              className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
