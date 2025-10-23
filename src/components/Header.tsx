import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md shadow-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-sweet-dark hover:text-sweet-green transition-colors duration-200 group"
          >
            {loading ? (
              <div className="w-12 h-12 bg-sweet-green-light rounded-full animate-pulse" />
            ) : (
              <div className="relative">
                <img 
                  src={siteSettings?.site_logo || "/logo.jpg"} 
                  alt={siteSettings?.site_name || "Sweet Quest"}
                  className="w-12 h-12 rounded-full object-cover shadow-lg group-hover:scale-110 transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.jpg";
                  }}
                />
              </div>
            )}
            <div className="text-left">
              <h1 className="text-3xl font-sweet font-bold text-sweet-dark group-hover:text-sweet-green transition-colors duration-300">
                {loading ? (
                  <div className="w-32 h-8 bg-sweet-green-light rounded animate-pulse" />
                ) : (
                  "Sweet Quest"
                )}
              </h1>
            </div>
          </button>

          <div className="flex items-center space-x-3">
            <button 
              onClick={onCartClick}
              className="relative p-3 text-sweet-dark hover:text-sweet-green hover:bg-sweet-green-light rounded-full transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="h-7 w-7" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-sweet-green text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce-gentle shadow-lg">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;