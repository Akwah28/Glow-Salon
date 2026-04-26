import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin/dashboard');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Login Error:", error);
      }
      
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-in was cancelled. This often happens in preview frames; try opening the app in a new tab.', { duration: 6000, id: 'popup-closed' });
      } else if (error.code === 'auth/popup-blocked' || error.message?.toLowerCase().includes('popup')) {
        toast.error('The sign-in popup was blocked by your browser. Please open the app in a new tab to sign in.', { duration: 6000 });
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized for OAuth operations. Please ensure it is added to Firebase Auth Authorized Domains.', { duration: 6000 });
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const isIframe = window.self !== window.top;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-sm text-center border border-slate-200">
        <div className="w-12 h-12 bg-indigo-600 text-white rounded-lg flex items-center justify-center mb-6 shadow-sm mx-auto">
          <span className="font-bold text-2xl">S</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Salon Admin</h1>
        <p className="text-slate-500 mb-6 text-sm font-medium">Sign in to manage appointments, staff, and services.</p>
        
        {isIframe && (
          <div className="bg-amber-50 text-amber-800 text-xs text-left p-3 rounded-lg mb-6 border border-amber-200">
            <strong>Note:</strong> Browsers often block popups inside preview frames. If sign in fails, try opening this app in a <strong>New Tab</strong> using the icon in the top right.
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded-lg py-3 font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? 'Please wait...' : 'Sign in with Google'}
        </button>

        <button 
          onClick={() => navigate('/')}
          className="mt-6 text-[10px] text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          Return to Booking Page
        </button>
      </div>
    </div>
  );
}
