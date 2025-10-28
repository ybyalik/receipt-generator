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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                ReceiptGen
              </Link>
              <Link href="/templates" className="text-gray-700 hover:text-blue-600">
                Templates
              </Link>
              {user && (
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700 flex items-center">
                    <FiUser className="mr-2" />
                    {user.displayName || user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="flex items-center text-gray-700 hover:text-red-600"
                  >
                    <FiLogOut className="mr-2" />
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={signIn}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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
