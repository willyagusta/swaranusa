'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RoleGuard({ children, allowedRoles, redirectTo = '/signin' }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
        return;
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Show unauthorized message and redirect
        const unauthorizedMessage = user.role === 'government' 
          ? 'You are not authorized to access this page. Government users should use the Government Dashboard.'
          : 'You are not authorized to access this page. This page is for government officials only.';
        
        alert(unauthorizedMessage);
        
        const redirectPath = user.role === 'government' ? '/government' : '/dashboard';
        router.push(redirectPath);
        return;
      }
    }
  }, [user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald/5 via-white to-sage/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald/30 border-t-emerald rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null;
  }

  return children;
}
