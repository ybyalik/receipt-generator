import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiChevronDown, FiSettings, FiHeart, FiUsers, FiCreditCard, FiMenu, FiX } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';

const AuthModal = dynamic(() => import('./AuthModal'), {
  ssr: false,
  loading: () => null,
});

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { href: '/templates', label: 'Templates' },
    { href: '/ai', label: 'AI Generator' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-navy-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Receipt Generator" 
                width={150} 
                height={50} 
                style={{ width: 'auto', height: '40px' }}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-navy-600 hover:text-accent-500 font-semibold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-navy-700 font-medium hover:text-accent-500 transition-colors cursor-pointer"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="max-w-[150px] truncate">{user.displayName || user.email}</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {isAdmin() && (
                        <>
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-navy-50 transition-colors cursor-pointer"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiSettings className="mr-3 w-4 h-4" />
                            Admin Panel
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-navy-50 transition-colors cursor-pointer"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <FiUsers className="mr-3 w-4 h-4" />
                            Users
                          </Link>
                        </>
                      )}
                      
                      <Link
                        href="/my-templates"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-navy-50 transition-colors cursor-pointer"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FiHeart className="mr-3 w-4 h-4" />
                        My Templates
                      </Link>

                      {user.stripeCustomerId && (
                        <button
                          onClick={async () => {
                            setIsDropdownOpen(false);
                            try {
                              const response = await fetch('/api/create-portal-session', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ firebaseUid: user.uid }),
                              });
                              const data = await response.json();
                              
                              if (!response.ok) {
                                console.error('Portal session error:', data);
                                alert(data.error || 'Unable to open subscription management. Please try again.');
                                return;
                              }
                              
                              if (data.url) {
                                window.location.href = data.url;
                              } else {
                                console.error('No URL in response:', data);
                                alert('Unable to open subscription management. Please try again.');
                              }
                            } catch (error) {
                              console.error('Error opening billing portal:', error);
                              alert('An error occurred. Please try again.');
                            }
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-navy-50 transition-colors cursor-pointer"
                        >
                          <FiCreditCard className="mr-3 w-4 h-4" />
                          Manage Subscription
                        </button>
                      )}
                      
                      <div className="border-t border-gray-200 my-2"></div>
                      
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-error-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <FiLogOut className="mr-3 w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 font-semibold transition-all hover:shadow-md cursor-pointer"
                >
                  Register/Login
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-navy-600 hover:bg-navy-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div
              className="fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-16 left-0 right-0 bottom-0 bg-white z-50 md:hidden overflow-y-auto">
              <div className="px-4 py-6 space-y-4">
                {/* Mobile Nav Links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 text-lg font-semibold text-navy-700 hover:text-accent-500 transition-colors border-b border-navy-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile User Section */}
                {user ? (
                  <div className="pt-4 border-t border-navy-200">
                    <div className="mb-4 pb-4 border-b border-navy-100">
                      <p className="font-semibold text-navy-900">{user.displayName || 'User'}</p>
                      <p className="text-sm text-navy-600">{user.email}</p>
                    </div>

                    {isAdmin() && (
                      <>
                        <Link
                          href="/admin"
                          className="flex items-center py-3 text-navy-700 hover:text-accent-500 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <FiSettings className="mr-3 w-5 h-5" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="flex items-center py-3 text-navy-700 hover:text-accent-500 transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <FiUsers className="mr-3 w-5 h-5" />
                          <span className="font-medium">Users</span>
                        </Link>
                      </>
                    )}

                    <Link
                      href="/my-templates"
                      className="flex items-center py-3 text-navy-700 hover:text-accent-500 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <FiHeart className="mr-3 w-5 h-5" />
                      <span className="font-medium">My Templates</span>
                    </Link>

                    {user.stripeCustomerId && (
                      <button
                        onClick={async () => {
                          setIsMobileMenuOpen(false);
                          try {
                            const response = await fetch('/api/create-portal-session', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ firebaseUid: user.uid }),
                            });
                            const data = await response.json();
                            
                            if (!response.ok) {
                              console.error('Portal session error:', data);
                              alert(data.error || 'Unable to open subscription management. Please try again.');
                              return;
                            }
                            
                            if (data.url) {
                              window.location.href = data.url;
                            } else {
                              console.error('No URL in response:', data);
                              alert('Unable to open subscription management. Please try again.');
                            }
                          } catch (error) {
                            console.error('Error opening billing portal:', error);
                            alert('An error occurred. Please try again.');
                          }
                        }}
                        className="w-full flex items-center py-3 text-navy-700 hover:text-accent-500 transition-colors"
                      >
                        <FiCreditCard className="mr-3 w-5 h-5" />
                        <span className="font-medium">Manage Subscription</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center py-3 text-error-600 hover:text-error-700 transition-colors mt-2 pt-4 border-t border-navy-100"
                    >
                      <FiLogOut className="mr-3 w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full bg-accent-500 text-white px-6 py-3 rounded-lg hover:bg-accent-600 font-semibold transition-all"
                    >
                      Register/Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-black text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Image 
                src="/logo-footer.png" 
                alt="Receipt Generator" 
                width={180} 
                height={60} 
                priority
                style={{ width: 'auto', height: '50px' }}
              />
              <a
                href="https://www.linkedin.com/company/receipt-generator/"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-white hover:text-accent-400 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-accent-400 transition-colors cursor-pointer">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-accent-400 transition-colors cursor-pointer">
                Terms of Service
              </Link>
              <Link href="/contact" className="hover:text-accent-400 transition-colors cursor-pointer">
                Contact Us
              </Link>
            </div>
            <p className="text-gray-400 text-sm text-center">
              © 2025 ReceiptGen. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
};

export default Layout;
