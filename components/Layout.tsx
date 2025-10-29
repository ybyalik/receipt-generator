import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut, FiChevronDown, FiSettings, FiHeart, FiUsers } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signIn, signOut, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-navy-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Receipt Generator" 
                  width={150} 
                  height={50} 
                  style={{ width: 'auto', height: '40px' }}
                  priority
                />
              </Link>
              <Link href="/templates" className="text-navy-600 hover:text-accent-500 font-medium transition-colors">
                Templates
              </Link>
              <Link href="/blog" className="text-navy-600 hover:text-accent-500 font-medium transition-colors">
                Blog
              </Link>
              <Link href="/contact" className="text-navy-600 hover:text-accent-500 font-medium transition-colors">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
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
                  onClick={signIn}
                  className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 font-semibold transition-all hover:shadow-md cursor-pointer"
                >
                  Register/Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">{children}</main>
      <footer className="bg-black text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex justify-center">
              <Image 
                src="/logo-footer.png" 
                alt="Receipt Generator" 
                width={200} 
                height={60} 
                style={{ width: 'auto', height: '60px' }}
              />
            </div>
            
            <div className="flex items-center space-x-8">
              <Link href="/blog" className="text-white hover:text-gray-300 transition-colors font-medium">
                Blog
              </Link>
              <Link href="/contact" className="text-white hover:text-gray-300 transition-colors font-medium">
                Contact
              </Link>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-300">
                Copyright &copy; ReceiptGenerator.net. All Rights Reserved.
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <span>|</span>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms and Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
