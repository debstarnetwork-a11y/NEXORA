import React, { useState } from 'react';
import { useAppStore } from '../store';
import { Mail, Lock, User, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Auth() {
  const { login } = useAppStore();
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || (!isLogin && !name.trim())) {
      setError('Please fill out all fields.');
      return;
    }

    if (isLogin) {
      // Mock login check
      const savedDeviceEmail = localStorage.getItem('nexora_device_marker');
      if (savedDeviceEmail && savedDeviceEmail === email) {
        login({ email, name: email.split('@')[0] });
      } else if (savedDeviceEmail) {
         // Allow login if it's not the device creator, but generally just let them login with their email
         login({ email, name: email.split('@')[0] });
      } else {
        setError('Account not found on this device. Please create one.');
      }
    } else {
      // Sign Up with device fingerprinting
      const existingAccount = localStorage.getItem('nexora_device_marker');
      
      if (existingAccount) {
        setError('Device Restriction: An account has already been created on this device. To prevent abuse, each device is limited to one account unless uninstalled/cleared.');
        return;
      }
      
      // Store the device marker
      localStorage.setItem('nexora_device_marker', email);
      login({ email, name });
    }
  };

  const handleGoogleAuth = () => {
    setError(null);
    const mockGoogleEmail = prompt('Simulating Google OAuth. Please enter your Google email:', 'debstarnetwork@gmail.com');
    
    if (!mockGoogleEmail) return;

    const savedDeviceEmail = localStorage.getItem('nexora_device_marker');

    if (isLogin) {
      if (savedDeviceEmail && savedDeviceEmail === mockGoogleEmail) {
        login({ email: mockGoogleEmail, name: mockGoogleEmail.split('@')[0] });
      } else if (savedDeviceEmail) {
        login({ email: mockGoogleEmail, name: mockGoogleEmail.split('@')[0] });
      } else {
        setError('Account not found on this device. Please create one.');
      }
    } else {
      if (savedDeviceEmail) {
        setError('Device Restriction: An account has already been created on this device. To prevent abuse, each device is limited to one account unless uninstalled/cleared.');
        return;
      }
      
      localStorage.setItem('nexora_device_marker', mockGoogleEmail);
      login({ email: mockGoogleEmail, name: mockGoogleEmail.split('@')[0] });
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="w-16 h-16 bg-purple-900 dark:bg-purple-800 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/20 mb-4">
            <div className="w-8 h-8 border-4 border-amber-400 dark:border-amber-300 rounded-sm rotate-45"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-900 dark:text-purple-300">NEXORA</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Next-Generation AI Creative Studio</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl transition-colors">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                !isLogin 
                  ? 'border-purple-900 dark:border-purple-400 text-purple-900 dark:text-purple-300' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${
                isLogin 
                  ? 'border-purple-900 dark:border-purple-400 text-purple-900 dark:text-purple-300' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Log In
            </button>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl flex gap-3 text-red-600 dark:text-red-400 text-sm font-medium"
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900/20 focus:border-purple-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-900 dark:bg-purple-700 hover:bg-purple-950 dark:hover:bg-purple-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isLogin ? 'Sign In to Studio' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
          </div>

          <button
            onClick={handleGoogleAuth}
            type="button"
            className="mt-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {!isLogin && (
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                By creating an account, you agree to our Terms of Service. Note: To prevent abuse, NEXORA enforces a strict one-account-per-device policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
