import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiX, FiMail, FiLock, FiUser } from 'react-icons/fi';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signInWithEmail, signUpWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState<'choice' | 'login' | 'signup' | 'forgot'>('choice');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    await signIn();
    onClose();
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signInWithEmail(email, password);
      onClose();
      resetForm();
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      await signUpWithEmail(email, password, displayName);
      onClose();
      resetForm();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccess('');
    setMode('choice');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-6 h-6" />
        </button>

        {mode === 'choice' && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Welcome!
            </h2>
            
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all mb-4"
            >
              <Image src="/google-icon.svg" alt="Google" width={24} height={24} />
              Continue with Google
            </button>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <button
              onClick={() => setMode('login')}
              className="w-full px-6 py-3 rounded-xl font-semibold transition-all mb-3"
              style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
            >
              Sign In with Email
            </button>

            <button
              onClick={() => setMode('signup')}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Create Account
            </button>
          </>
        )}

        {mode === 'login' && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Sign In
            </h2>
            
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiLock className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <button
                type="button"
                onClick={() => { setError(''); setMode('forgot'); }}
                className="w-full text-sm hover:underline"
                style={{ color: '#0d9488' }}
              >
                Forgot your password?
              </button>

              <button
                type="button"
                onClick={() => { resetForm(); setMode('choice'); }}
                className="w-full text-gray-600 text-sm hover:text-gray-800"
              >
                ← Back to options
              </button>
            </form>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Reset Password
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Enter your email and we'll send you a reset link
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={() => { setError(''); setSuccess(''); setMode('login'); }}
                className="w-full text-gray-600 text-sm hover:text-gray-800"
              >
                ← Back to sign in
              </button>
            </form>
          </>
        )}

        {mode === 'signup' && (
          <>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Create Account
            </h2>
            
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiUser className="inline mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiMail className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  <FiLock className="inline mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <button
                type="button"
                onClick={() => { resetForm(); setMode('choice'); }}
                className="w-full text-gray-600 text-sm hover:text-gray-800"
              >
                ← Back to options
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
