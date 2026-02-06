import { useState } from 'react';
import { FiX, FiDownload, FiMail } from 'react-icons/fi';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function EmailCaptureModal({ isOpen, onClose, onSubmit }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'download' }),
      });
      onSubmit(email);
      setEmail('');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
        >
          <FiX className="w-5 h-5" style={{ color: '#6b7280' }} />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: '#f0fdfa' }}
          >
            <FiMail className="w-6 h-6" style={{ color: '#0d9488' }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>
            Download your receipt
          </h3>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Enter your email to download. We&apos;ll also send you tips to get the most out of ReceiptGenerator.net.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 pb-8">
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all text-sm"
              style={{ color: '#111827' }}
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-xs mt-1.5">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#0d9488', color: '#ffffff' }}
          >
            <FiDownload className="w-4 h-4" />
            {loading ? 'Processing...' : 'Download Receipt'}
          </button>
          <p className="text-xs text-center mt-3" style={{ color: '#9ca3af' }}>
            No spam, unsubscribe anytime.
          </p>
        </form>
      </div>
    </div>
  );
}
