'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_USER', payload: data.user });
      } else {
        dispatch({ type: 'SET_USER', payload: null });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const signUp = async (userData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        dispatch({ type: 'SET_USER', payload: data.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const signIn = async (credentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        dispatch({ type: 'SET_USER', payload: data.user });
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.error });
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Signout error:', error);
    }
    
    dispatch({ type: 'LOGOUT' });
  };

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signOut,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
