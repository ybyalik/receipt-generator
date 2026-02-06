import Link from 'next/link';
import { FiX, FiCheck, FiDownload, FiStar } from 'react-icons/fi';

interface PremiumUpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumUpsellModal({ isOpen, onClose }: PremiumUpsellModalProps) {
  if (!isOpen) return null;

  const features = [
    'Download without watermarks',
    'Export as PNG & PDF',
    'Save & re-use templates',
    'Access to all templates',
    'Unlimited downloads',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 mb-4">
            <FiStar className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Your receipt is ready!
          </h2>
          <p className="text-teal-100 text-sm">
            Upgrade to download clean receipts without watermarks
          </p>
        </div>

        {/* Features */}
        <div className="px-8 py-6">
          <ul className="space-y-3 mb-6">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdfa' }}>
                  <FiCheck className="w-3 h-3" style={{ color: '#0d9488' }} />
                </div>
                <span className="text-gray-700 text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Pricing highlight */}
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1' }}>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-bold" style={{ color: '#0d9488' }}>$9.99</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <p className="text-center text-xs text-gray-500 mt-1">
              or $44.99/year (save 62%)
            </p>
          </div>

          {/* CTA buttons */}
          <Link
            href="/pricing"
            className="block w-full text-center px-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg mb-3"
            style={{ backgroundColor: '#0d9488' }}
            onClick={onClose}
          >
            <FiDownload className="inline mr-2 -mt-0.5" />
            View Plans & Upgrade
          </Link>
          <button
            onClick={onClose}
            className="w-full text-center px-6 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
