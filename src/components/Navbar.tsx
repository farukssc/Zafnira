/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BANGLA_LABELS } from '../types';
import { Search, ShoppingBag, Heart, User, LogOut, Menu, X, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onNavigate: (tab: string) => void;
  activeTab: string;
  onSearch: (query: string) => void;
  searchQuery: string;
  onToggleCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  activeTab, 
  onSearch, 
  searchQuery, 
  onToggleCart 
}) => {
  const { currentUser, userProfile, cart, wishlist, isAdmin, logout } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-yellow-100 shadow-sm">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-red-600 via-amber-500 to-green-600 text-white text-center text-xs py-1.5 px-4 font-sans font-medium tracking-wide flex justify-between items-center">
        <span className="mx-auto">🎉 দারুণ খাঁটি মসলা নিয়ে এলো ১০% ছাড়! প্রোমো কোড: <strong className="bg-yellow-400 text-gray-900 px-1.5 py-0.5 rounded text-[10px] ml-1">DARUN10</strong></span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleNavClick('home')}>
            <span className="text-3xl font-bold tracking-tight bg-gradient-to-r from-red-600 via-yellow-500 to-green-600 bg-clip-text text-transparent mr-2 font-sans">
              {BANGLA_LABELS.brandName}
            </span>
            <div className="hidden sm:block">
              <span className="text-xs text-gray-400 block font-sans tracking-wide">দারুণ জাবাব নেই!</span>
              <span className="text-[10px] text-green-600 bg-green-50 px-1 py-0.5 rounded font-mono">খাঁটি মসলা</span>
            </div>
          </div>

          {/* Search Box (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 items-center">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={BANGLA_LABELS.searchPlaceholder}
                className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-full text-sm font-sans focus:outline-none focus:border-yellow-400 focus:bg-white transition-all shadow-inner"
              />
              <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>

          {/* Nav Items (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavClick('home')}
              className={`font-sans text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-red-600 border-b-2 border-red-500 pb-1' : 'text-gray-600 hover:text-red-500'}`}
            >
              {BANGLA_LABELS.home}
            </button>
            <button 
              onClick={() => handleNavClick('shop')}
              className={`font-sans text-sm font-medium transition-colors ${activeTab === 'shop' ? 'text-red-600 border-b-2 border-red-500 pb-1' : 'text-gray-600 hover:text-red-500'}`}
            >
              {BANGLA_LABELS.shop}
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`font-sans text-sm font-medium transition-colors ${activeTab === 'about' ? 'text-red-600 border-b-2 border-red-500 pb-1' : 'text-gray-600 hover:text-red-500'}`}
            >
              {BANGLA_LABELS.about}
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className={`font-sans text-sm font-medium transition-colors ${activeTab === 'contact' ? 'text-red-600 border-b-2 border-red-500 pb-1' : 'text-gray-600 hover:text-red-500'}`}
            >
              {BANGLA_LABELS.contact}
            </button>
            {isAdmin && (
              <button 
                onClick={() => handleNavClick('admin')}
                className="font-sans text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg px-2.5 py-1.5 flex items-center shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 mr-1 text-amber-500" />
                {BANGLA_LABELS.adminPanel}
              </button>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist Icon */}
            <button 
              onClick={() => handleNavClick('wishlist')}
              className="relative p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title={BANGLA_LABELS.wishlist}
            >
              <Heart className="w-5.5 h-5.5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-sans font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-bounce">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Trigger */}
            <button 
              onClick={onToggleCart}
              className="relative p-2.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
              title={BANGLA_LABELS.cart}
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {totalCartItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-green-500 text-white text-[10px] font-sans font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Profile Hook */}
            <div className="relative">
              {currentUser ? (
                <div>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-1.5 relative focus:outline-none p-1.5 hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-sans font-bold border border-yellow-500 shadow-sm cursor-pointer">
                      {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : <User className="w-4.5 h-4.5" />}
                    </div>
                    <span className="hidden lg:block text-xs font-sans text-gray-700 max-w-24 truncate">
                      {currentUser.displayName || 'ব্যবহারকারী'}
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-2">
                      <div className="px-4 py-2 border-b border-gray-50 text-xs">
                        <span className="block font-sans text-gray-400">লগইন অ্যাকাউন্ট:</span>
                        <span className="block font-sans font-bold text-gray-800 break-all">{currentUser.email}</span>
                        {isAdmin && <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-600 font-sans px-1.5 rounded-full font-bold">অ্যাডমিন</span>}
                      </div>
                      <button 
                        onClick={() => { handleNavClick('profile'); setIsProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-sans"
                      >
                        <User className="w-4 h-4 mr-2" />
                        আমার প্রোফাইল
                      </button>
                      <button 
                        onClick={() => { handleNavClick('orders'); setIsProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center font-sans"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        অর্ডার ইতিহাস
                      </button>
                      <div className="border-t border-gray-50 my-1"></div>
                      <button 
                        onClick={() => { logout(); setIsProfileDropdownOpen(false); handleNavClick('home'); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center font-sans font-medium"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        প্রস্থান (লগআউট)
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => handleNavClick('login')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-full text-sm font-sans font-bold flex items-center transition-all shadow-sm"
                >
                  <User className="w-4 h-4 mr-1.5" />
                  {BANGLA_LABELS.login}
                </button>
              )}
            </div>

            {/* Mobile Hamburger menu */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-3 shadow-lg">
          {/* Mobile Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={BANGLA_LABELS.searchPlaceholder}
              className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm font-sans focus:outline-none"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex flex-col space-y-2">
            <button 
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm font-medium ${activeTab === 'home' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {BANGLA_LABELS.home}
            </button>
            <button 
              onClick={() => handleNavClick('shop')}
              className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm font-medium ${activeTab === 'shop' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {BANGLA_LABELS.shop}
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm font-medium ${activeTab === 'about' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {BANGLA_LABELS.about}
            </button>
            <button 
              onClick={() => handleNavClick('contact')}
              className={`w-full text-left px-3 py-2 rounded-lg font-sans text-sm font-medium ${activeTab === 'contact' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {BANGLA_LABELS.contact}
            </button>
            {isAdmin && (
              <button 
                onClick={() => handleNavClick('admin')}
                className="w-full text-left px-3 py-2 rounded-lg font-sans text-sm font-medium text-amber-600 bg-amber-50"
              >
                {BANGLA_LABELS.adminPanel} (অ্যাডমিন)
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
