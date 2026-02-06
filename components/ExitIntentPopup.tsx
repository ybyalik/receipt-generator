import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiX, FiTag } from 'react-icons/fi';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem('exit-intent-dismissed')) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        // Only trigger once
        document.removeEventListener('mouseout', handleMouseLeave);
      }
    };

    // Delay registering the listener so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener('mouseout', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('exit-intent-dismissed', '1');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: '#0d9488' }}>
            <FiTag className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wait! Here&apos;s 20% off
          </h2>
          <p className="text-gray-300 text-sm">
            Use code <span className="font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded">STAY20</span> at checkout
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 text-center">
          <p className="text-gray-600 text-sm mb-6">
            Get watermark-free receipts, PDF export, and unlimited downloads starting at just <strong style={{ color: '#0d9488' }}>$7.99/mo</strong>.
          </p>

          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg mb-3"
            style={{ backgroundColor: '#0d9488' }}
            onClick={dismiss}
          >
            Claim 20% Off
          </Link>
          <button
            onClick={dismiss}
            className="w-full text-center px-6 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            No thanks, I&apos;ll pay full price later
          </button>
        </div>
      </div>
    </div>
  );
}
