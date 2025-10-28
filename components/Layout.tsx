import React from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiLogOut } from 'react-icons/fi';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signIn, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-navy-50">
      <nav className="bg-white shadow-sm border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-navy-900 tracking-tight">
                ReceiptGen
              </Link>
              <Link href="/templates" className="text-navy-600 hover:text-accent-500 font-medium transition-colors">
                Templates
              </Link>
              {user && (
                <Link href="/admin" className="text-navy-600 hover:text-accent-500 font-medium transition-colors">
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-navy-700 flex items-center font-medium">
                    <FiUser className="mr-2" />
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="flex items-center text-navy-600 hover:text-error-500 font-medium transition-colors"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-accent-500 text-white px-6 py-2 rounded-lg hover:bg-accent-600 font-semibold transition-all hover:shadow-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default Layout;
