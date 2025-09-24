import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && (
        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">BoxCraft</h3>
              <p className="text-gray-300 text-sm">
                © 2024 BoxCraft. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;