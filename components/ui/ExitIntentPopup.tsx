"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { FiX, FiGift, FiArrowRight } from 'react-icons/fi';

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export const ExitIntentPopup: React.FC<ExitIntentPopupProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem('exitPopupShown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse moves to top of page (leaving)
      if (e.clientY <= 5 && !hasShown && !isVisible) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Add delay before enabling exit intent detection
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown, isVisible]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-ink-400 hover:text-ink-600 transition-colors z-10"
          aria-label="Close popup"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-ink-950 to-ink-800 px-8 pt-10 pb-8 text-center">
          <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiGift className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-display text-3xl text-white mb-2">
            Wait! Don&apos;t leave yet
          </h2>
          <p className="text-ink-300">
            We have a special offer just for you
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 rounded-full mb-4">
              <span className="font-display text-2xl text-gold-600">20% OFF</span>
            </div>
            <h3 className="font-display text-xl text-ink-900 mb-2">
              Your first premium subscription
            </h3>
            <p className="text-ink-600 text-sm">
              Get unlimited watermark-free downloads, save templates, and access all premium features.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {[
              'Watermark-free exports',
              'Save & reuse templates',
              'Unlimited downloads',
              'Priority support',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-ink-700">{feature}</span>
              </div>
            ))}
          </div>

          <a
            href="/pricing"
            className="w-full bg-ink-950 text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-ink-800 transition-colors group"
          >
            Claim Your 20% Discount
            <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <button
            onClick={handleClose}
            className="w-full mt-3 text-ink-500 text-sm hover:text-ink-700 transition-colors py-2"
          >
            No thanks, I&apos;ll pay full price
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
