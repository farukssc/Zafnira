/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BANGLA_LABELS, SPICE_CATEGORIES, Product, Order } from './types';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { AdminPanel } from './components/AdminPanel';
import { AuthScreen } from './components/AuthScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { TrackOrderScreen } from './components/TrackOrderScreen';
import { ReviewSection } from './components/ReviewSection';
import { 
  Heart, ShoppingBag, Truck, CheckCircle, Info, Trash2, Plus, Minus, 
  MessageCircle, PhoneCall, Facebook, Mail, MapPin, ChevronLeft, ChevronRight, 
  Star, ClipboardList, Shield, ShieldCheck, ArrowRight, Store, FileText
} from 'lucide-react';

function AppContent() {
  const { 
    products, cart, wishlist, websiteConfig, currentUser, userProfile, orders,
    updateCartQuantity, removeFromCart, clearCart, toggleWishlist, updateUserContact 
  } = useApp();

  // Navigation states
  const [activeTab, setActiveTab] = useState('home'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  
  // Cart drawer open/close
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Active details quantity
  const [detailsQty, setDetailsQty] = useState(1);

  // Success Order state references
  const [latestSubmittedOrder, setLatestSubmittedOrder] = useState<Order | null>(null);

  // Edit user profile states
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || '');
  const [profileAddress, setProfileAddress] = useState(userProfile?.address || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  React.useEffect(() => {
    if (userProfile) {
      setProfilePhone(userProfile.phone || '');
      setProfileAddress(userProfile.address || '');
    }
  }, [userProfile]);

  // Filter products based on search & tab filters
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const featuredProducts = products.slice(0, 4);

  // Banner slide controls
  const handlePrevSlide = () => {
    if (!websiteConfig?.banners) return;
    setActiveSlideIdx(prev => prev === 0 ? websiteConfig.banners.length - 1 : prev - 1);
  };

  const handleNextSlide = () => {
    if (!websiteConfig?.banners) return;
    setActiveSlideIdx(prev => prev === websiteConfig.banners.length - 1 ? 0 : prev + 1);
  };

  const totalCartBDT = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  // WhatsApp Pre-filled link generation
  const handleWhatsAppOrder = (product: Product, quantity: number) => {
    const defaultWhatsApp = '01811-000000';
    const waPhone = websiteConfig?.contacts?.whatsapp ? websiteConfig.contacts.whatsapp : defaultWhatsApp;
    const cleanPhone = waPhone.replace(/[^0-9]/g, ''); // Extract numeric phone
    
    const messageText = `আসসালামু আলাইকুম! আমি দারুণ মসলা (Darun Spices) ওয়েবসাইট থেকে অর্ডার করতে চাই:\n\n` +
                        `• পণ্যের নাম: ${product.name} (${product.nameEn})\n` +
                        `• পরিমাণ: ${quantity}টি প্যাক\n` +
                        `• ওজন: ${product.weightGrams || 250} গ্রাম\n` +
                        `• মোট মূল্য: ৳${product.price * quantity}\n\n` +
                        `অনগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।`;
    
    const encoded = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/88${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleProfileUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await updateUserContact(profilePhone, profileAddress);
      alert('আপনার যোগাযোগের বিবরণী সফলভাবে ডাটাবেজে আপডেট হয়েছে!');
    } catch(err) {
      alert('আপডেট সম্ভব হয়নি!');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-between text-gray-800">
      
      {/* Navigation section */}
      <Navbar 
        onNavigate={(tab) => { setActiveTab(tab); setLatestSubmittedOrder(null); }}
        activeTab={activeTab}
        onSearch={(query) => { setSearchQuery(query); setActiveTab('shop'); }}
        searchQuery={searchQuery}
        onToggleCart={() => setIsCartDrawerOpen(!isCartDrawerOpen)}
      />

      {/* Cart side Drawer */}
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsCartDrawerOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-md font-extrabold text-gray-950 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-red-650" />
                আপনার কার্ট ({cart.reduce((x, i) => x + i.quantity, 0)} প্যাক)
              </h3>
              <button 
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-1 px-2.5 bg-gray-200 hover:bg-gray-300 rounded-lg text-xs font-bold transition-all text-gray-800"
              >
                বন্ধ করুন
              </button>
            </div>

            {/* Cart content stream list */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-5xl block mb-3">🛒</span>
                  <p className="text-xs text-gray-400 font-sans">আপনার চেকআউট কার্ট বর্তমানে খালি রয়েছে।</p>
                  <button
                    onClick={() => { setIsCartDrawerOpen(false); setActiveTab('shop'); }}
                    className="mt-4 text-xs font-bold text-red-650 hover:underline"
                  >
                    প্রিমিয়াম মসলা ব্রাউজ করুন →
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <img 
                      src={item.product.image} 
                      referrerPolicy="no-referrer"
                      alt={item.product.name} 
                      className="w-12 h-12 object-cover rounded-lg border shadow-inner mr-3 shrink-0" 
                    />
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="font-bold text-gray-950 truncate text-xs font-sans">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">৳{item.product.price} ({item.product.weightGrams || 250}g)</p>
                      
                      {/* Qty controller buttons inside Drawer */}
                      <div className="flex items-center space-x-1.5 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-mono font-bold text-gray-900 w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-red-650 block">৳{item.product.price * item.quantity}</span>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-gray-400 hover:text-red-500 mt-2 p-1 rounded hover:bg-red-50"
                        title="রিমুভ করুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* billing totals at bottom */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-gray-600">উপ-মোট মূল্য:</span>
                  <span className="font-mono text-sm text-red-650">৳{totalCartBDT}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { clearCart(); }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold p-2.5 rounded-xl text-xs font-sans transition-all"
                  >
                    কার্ট মুছুন
                  </button>
                  <button
                    onClick={() => { setIsCartDrawerOpen(false); setActiveTab(currentUser ? 'checkout' : 'login'); }}
                    className="w-full bg-red-650 hover:bg-red-700 text-white font-bold p-2.5 rounded-xl text-xs font-sans transition-all shadow-md flex items-center justify-center cursor-pointer"
                  >
                    চেকআউট করুন
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Pages router block */}
      <main className="flex-1">
        
        {/* VIEW 1: Home page (ব্যানার, অফার, ক্যাটাগরি, প্রোডাক্টস) */}
        {activeTab === 'home' && (
          <div className="space-y-12 pb-12 animate-fade-in">
            
            {/* Visual Slider banner */}
            {websiteConfig?.banners && websiteConfig.banners.length > 0 && (
              <div className="relative h-96 sm:h-[420px] bg-gray-900 overflow-hidden">
                <img 
                  src={websiteConfig.banners[activeSlideIdx].image} 
                  referrerPolicy="no-referrer"
                  alt="Slide Banner" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 transition-all duration-700"
                />
                
                {/* Overlay card content */}
                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-white z-10">
                  <div className="max-w-xl space-y-4">
                    <span className="bg-yellow-400 text-gray-950 font-bold text-[10px] uppercase font-sans tracking-widest px-2.5 py-1 rounded-full inline-block backdrop-blur-xs">
                      ১০০% প্রিমিয়াম ও অর্গানিক
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold font-sans leading-tight">
                      {websiteConfig.banners[activeSlideIdx].title}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-200 max-w-md leading-relaxed font-sans">
                      {websiteConfig.banners[activeSlideIdx].subtitle}
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => setActiveTab('shop')}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg transition-all transform hover:translate-x-1 cursor-pointer flex items-center"
                      >
                        কেনাকাটা শুরু করুন
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Left/Right Controllers */}
                <button 
                  onClick={handlePrevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white z-20 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleNextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white z-20 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Static Content Alerts / Promos */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans text-gray-600">
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-105 flex items-start space-x-3.5">
                  <span className="text-2xl mt-0.5">🌶️</span>
                  <div>
                    <strong className="text-gray-900 block font-bold mb-0.5">প্রাকৃতিক সতেজতা</strong>
                    <p className="text-[11px] leading-relaxed">কোনো কৃত্রিম রং বা কেমিক্যালের ছোঁয়া ছাড়াই সেরা কাঁচামাল ধুয়ে ও শুকিয়ে সংগৃহীত।</p>
                  </div>
                </div>

                <div className="bg-red-50/35 p-4 rounded-xl border border-red-105 flex items-start space-x-3.5">
                  <span className="text-2xl mt-0.5">📦</span>
                  <div>
                    <strong className="text-gray-900 block font-bold mb-0.5">দ্রুত হোম ডেলিভারি</strong>
                    <p className="text-[11px] leading-relaxed">ঢাকা সিটির ভেতরে মাত্র ৪৮ ঘণ্টার মধ্যে আপনার টেবিলে পৌঁছানো হবে।</p>
                  </div>
                </div>

                <div className="bg-green-50/35 p-4 rounded-xl border border-green-105 flex items-start space-x-3.5">
                  <span className="text-2xl mt-0.5">🛡️</span>
                  <div>
                    <strong className="text-gray-900 block font-bold mb-0.5">শতভাগ ফেরত গ্যারান্টি</strong>
                    <p className="text-[11px] leading-relaxed">পণ্যের মানে কোনো ক্রুটি প্রমাণিত হলে আমরা দিচ্ছি ৭ দিনের পূর্ণ রিফান্ড সুবিধা।</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Highlighted Categories Selection */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-xs text-red-650 font-bold tracking-widest uppercase font-mono block">আমাদের সংগ্রহ</span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 font-sans">{BANGLA_LABELS.categories}</h2>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                {SPICE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setActiveTab('shop'); }}
                    className="p-3.5 px-6 font-sans text-xs font-bold border rounded-2xl cursor-pointer hover:border-yellow-400 bg-white shadow-xs hover:bg-yellow-50/25 transition-all text-gray-700"
                  >
                    🌿 {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Spice Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900 font-sans">{BANGLA_LABELS.featuredProducts}</h3>
                <button 
                  onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }} 
                  className="text-xs font-bold text-red-660 hover:underline"
                >
                  সবগুলো মসলা দেখুন →
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredProducts.map(prod => (
                  <ProductCard 
                    key={prod.id} 
                    product={prod} 
                    onViewDetails={(p) => { setSelectedProductDetails(p); setDetailsQty(1); }} 
                  />
                ))}
              </div>
            </div>

            {/* Testimonials highlight bar */}
            <div className="bg-gray-50/80 py-10 border-t border-b border-gray-100">
              <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
                <span className="text-2xl block text-amber-500">★★★★★</span>
                <p className="text-sm max-w-xl mx-auto italic leading-relaxed text-gray-650 font-sans">
                  "দারুণ ব্যান্ডের শাহী গরম মসলা আর হলুদ গুঁড়ো আমার রান্নার স্টাইল পাল্টে দিয়েছে। আসল গন্ধ এবং চোখ জুড়ানো রঙের স্বাদে আমি শতভাগ সন্তুষ্ট!"
                </p>
                <div className="text-xs">
                  <strong className="block font-bold text-gray-900">রাবেয়া বেগম</strong>
                  <span className="text-gray-400 block mt-0.5">গৃহিণী, উত্তরা, ঢাকা</span>
                </div>
              </div>
            </div>

            {/* Tracking Order banner info */}
            <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
              <h3 className="text-lg font-bold text-gray-900 font-sans">১-ক্লিকে শিপমেন্ট স্থিতি ও ট্র্যাকিং করুন</h3>
              <p className="text-xs text-gray-400 font-sans">আমাদের কুড়িয়ার ডেলিভারি পার্টনার নেটওয়ার্কে অর্ডারের অবস্থান জানতে ট্র্যাক বাটন ব্যবহার করুন।</p>
              <button
                onClick={() => setActiveTab('tracking')}
                className="bg-gray-900 hover:bg-gray-800 text-white font-sans text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all duration-150"
              >
                অনলাইন অর্ডার ট্র্যাক করুন
              </button>
            </div>

          </div>
        )}

        {/* VIEW 2: Complete Spice Shop Catalog */}
        {activeTab === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold font-sans text-gray-900">দারুণ মসলা স্টোর</h1>
                <p className="text-xs text-gray-400 font-sans mt-0.5">সকল রাসায়নিকমুক্ত খাঁটি সুস্বাদু মসলা প্যাক</p>
              </div>

              {/* Spice Category selectors */}
              <div className="flex flex-wrap gap-1.5">
                {SPICE_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat.id ? 'bg-red-600 text-white shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-650'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results counts */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-2">🌿</span>
                <p className="text-xs text-gray-400">খুঁজে নেওয়া মসলা ক্যাটাগরিতে কোনো ইনফরমেশন পাওয়া যায়নি।</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredProducts.map(prod => (
                  <ProductCard 
                    key={prod.id} 
                    product={prod} 
                    onViewDetails={(p) => { setSelectedProductDetails(p); setDetailsQty(1); }} 
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Checkout Gate screen */}
        {activeTab === 'checkout' && (
          <CheckoutScreen 
            onOrderSuccess={(order) => {
              setLatestSubmittedOrder(order);
              setActiveTab('order-success');
            }}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {/* VIEW 4: Order Placement successfully completed */}
        {activeTab === 'order-success' && latestSubmittedOrder && (
          <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-gray-150 rounded-3xl shadow-xl text-center font-sans space-y-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mx-auto border shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="bg-green-100 text-green-800 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">অর্ডার বুকিং সম্পন্ন হয়েছে</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">আপনার অর্ডারের জন্য সুস্বাগতম!</h2>
              <p className="text-xs text-gray-500">আপনার অর্ডারটি অত্যন্ত সফলভাবে ডাটাবেজে রেকর্ড করা হয়েছে। আমাদের মসলা প্যাক শিপিং স্থিতি ট্র্যাক করতে নিচের ট্র্যাকিং নম্বরটি ব্যবহার করুন:</p>
            </div>

            {/* tracking ID numbers card block */}
            <div className="bg-yellow-400/25 border border-yellow-250 p-4 rounded-2xl max-w-sm mx-auto">
              <span className="text-[10px] text-gray-500 block">ইনভয়েস ট্র্যাকিং নম্বর (Invoice Tracking ID)</span>
              <strong className="text-xl font-mono text-red-650 block tracking-widest mt-1 select-all">{latestSubmittedOrder.trackingNumber}</strong>
            </div>

            <p className="text-[11px] text-gray-400 italic leading-relaxed">ডেলিভারি সংক্রান্ত কল বা নোটিফিকেশন পেতে দয়া করে আপনার মোবাইল ফোনটি সচল রাখুন। অথবা ইনভয়েস প্রিন্ট করতে প্রোফাইল অর্ডার ইতিহাসে ক্লিক করুন।</p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <button 
                onClick={() => setActiveTab('home')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-3 rounded-xl text-xs transition-all cursor-pointer"
              >
                হোম পৃষ্ঠায় ফিরে যান
              </button>
              <button 
                onClick={() => { setActiveTab('tracking'); }}
                className="w-full bg-red-650 hover:bg-red-700 text-white font-bold p-3 rounded-xl text-xs transition-all shadow cursor-pointer"
              >
                শিপমেন্ট ক্রনিকল ট্র্যাক করুন
              </button>
            </div>
          </div>
        )}

        {/* VIEW 5: Order Shipments Tracker */}
        {activeTab === 'tracking' && (
          <TrackOrderScreen />
        )}

        {/* VIEW 6: Profile & contacts panel */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto my-12 px-4 font-sans">
            <div className="bg-white border border-gray-150 rounded-3xl shadow-lg p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-bold font-sans text-gray-900 border-b pb-3 mb-1">আমার দারুণ অ্যাকাউন্ট প্রোফাইল</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-gray-500">
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">প্রোফাইল নাম:</span>
                  <span className="block font-bold mt-0.5 text-gray-900 text-sm">{currentUser?.displayName || 'সম্মানিত ক্রেতা'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">নিবন্ধিত ইমেইল:</span>
                  <span className="block font-sans font-medium mt-0.5 text-gray-700">{currentUser?.email}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-semibold text-gray-400">অ্যাকাউন্ট রোল:</span>
                  <span className="inline-block mt-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {userProfile?.role === 'admin' ? 'সিস্টেম এডমিনিস্ট্রেটর' : 'নিবন্ধিত সাধারণ ক্রেতা'}
                  </span>
                </div>
              </div>

              {/* Delivery info update form */}
              <form onSubmit={handleProfileUpdateSubmit} className="space-y-4 pt-4 border-t border-gray-100 text-xs">
                <h4 className="font-bold text-gray-800 font-sans text-xs">ডেলিভারি ও যোগাযোগের স্থায়ী ডিটেইলস</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">মোবাইল ফোন নম্বর</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={e => setProfilePhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none focus:border-red-55"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 font-semibold">স্থায়ী ডেলিভারি ঠিকানা</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={e => setProfileAddress(e.target.value)}
                      placeholder="জেলা সহ সম্পূর্ণ ঠিকানা লিখুন"
                      className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none focus:border-red-55"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-red-650 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'সংরক্ষণ করা হচ্ছে...' : 'প্রোফাইল সেভ করুন'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 7: Register or Logins screen */}
        {activeTab === 'login' && (
          <AuthScreen onSuccess={() => setActiveTab('home')} />
        )}

        {/* VIEW 8: Wishlist items lists */}
        {activeTab === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
            <h2 className="text-xl font-bold font-sans text-gray-900 mb-6 flex items-center">
              <Heart className="w-5.5 h-5.5 text-red-500 mr-2 fill-current" />
              আমার প্রিয় উইশলিস্ট তালিকা ({wishlist.length})
            </h2>

            {wishlist.length === 0 ? (
              <div className="bg-gray-50 p-12 text-center rounded-2xl border border-gray-200">
                <span className="text-4xl block mb-2">🌸</span>
                <p className="text-xs text-gray-400 font-sans">আপনার উইশলিস্ট তালিকায় কোনো পণ্য যুক্ত নেই।</p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-4 text-xs font-bold text-red-650"
                >
                  শপ থেকে মসলা উইশলিস্টে নিন →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {products
                  .filter(p => wishlist.includes(p.id))
                  .map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onViewDetails={(prod) => { setSelectedProductDetails(prod); setDetailsQty(1); }} 
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 9: Orders logs list history */}
        {activeTab === 'orders' && (
          <div className="max-w-3xl mx-auto my-12 px-4 font-sans text-xs">
            <h2 className="text-xl font-bold font-sans text-gray-900 mb-6 flex items-center">
              <ClipboardList className="w-5.5 h-5.5 text-amber-500 mr-2" />
              আমার সমস্ত অর্ডার রেকর্ড ইতিহাস ({orders.length})
            </h2>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-gray-50 border p-12 text-center rounded-2xl">
                  <p className="text-xs text-gray-400">আপনি দারুণ স্টোর থেকে এখনো কোনো মসলা পণ্য অর্ডার করেননি।</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white border rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center border-b pb-2.5 mb-3">
                      <div>
                        <strong className="text-gray-950 font-mono">আইডি: {order.trackingNumber}</strong>
                        <span className="text-[10px] text-gray-400 block font-mono">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] capitalize ${
                        order.orderStatus === 'completed' ? 'bg-green-150 text-green-700' :
                        order.orderStatus === 'processing' ? 'bg-sky-105 text-sky-700' :
                        order.orderStatus === 'cancelled' ? 'bg-gray-200 text-gray-650' :
                        'bg-red-50 text-red-600 animate-pulse'
                      }`}>
                        {order.orderStatus === 'completed' ? 'ডেলিভার্ড' :
                         order.orderStatus === 'processing' ? 'প্যাকেজিং' :
                         order.orderStatus === 'cancelled' ? 'বাতিল' : 'পেন্ডিং'}
                      </span>
                    </div>
                    {/* Items loops */}
                    <div className="space-y-1 text-[11px] text-gray-600">
                      {order.items.map((item, id) => (
                        <div key={id} className="flex justify-between">
                          <span>{item.name} x {item.quantity} প্যাক</span>
                          <span className="font-mono text-gray-800">৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-2 text-right">
                      <span className="font-sans font-bold text-gray-900">সর্বমোট: ৳{order.totalAmount}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 10: Admin panel Tab */}
        {activeTab === 'admin' && (
          <AdminPanel />
        )}

        {/* VIEW 11: About Us info tab */}
        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 font-sans text-xs sm:text-sm leading-relaxed text-gray-650 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 font-sans text-center border-b pb-4 mb-2">আমাদের কথা: অনন্য স্বাদের দারুণ মসলা</h1>
            <p><strong>দারুণ (Darun)</strong> বাংলাদেশের মসলা জগতের একটি স্বনামধন্য বিশ্বস্ত প্রিমিয়াম ব্র্যান্ড। শতভাগ খাঁটি, রাসায়নিকমুক্ত, এবং তাজা মসলার সুবাস প্রতিটি ঘরে ঘরে পৌঁছে দেওয়ার উদ্দেশ্যেই আমাদের পথচলা শুরু হয়।</p>
            <p>আমাদের প্রতিটি হলুদ, মরিচ, ধনিয়া ও কাস্টম গরম মসলা প্যাক দেশের সেরা খামারসমূহ থেকে সরাসরি রোদে শুকিয়ে স্বাস্থ্যসম্মত নিয়মে সংগ্রহ ও স্বয়ংক্রিয় মেশিনে গুঁড়ো করে বৈজ্ঞানিক উপায়ে মোরকজাত করা হয়। এতে মসলার প্রাকৃতিক ঔষধি গুণাগুণ ও দারুণ ঝাঁজ বা রঙ অটুট থাকে কোনো প্রিজারভেটিভ বা কেমিক্যাল ছাড়াই।</p>
            
            <h3 className="text-base font-bold text-gray-950 font-sans mt-8 mb-2">আমাদের বিশেষত্ব:</h3>
            <ul className="list-disc pl-5 space-y-2.5">
              <li><strong>১০০% পিউরিটি নিশ্চয়তা:</strong> কোনো ভেজাল, কাঠ বা ইটের গুঁড়ো বা ক্ষতিকর কৃত্রিম হলুদ বা শুকনো মরিচের রঙের মিক্সিং সম্পন্ন নিষিদ্ধ।</li>
              <li><strong>রোদে শুকানো কাঁচামাল:</strong> আমাদের মসলা প্রাকৃতিকভাবে রোদে শুকিয়ে তৈরি করা হয় যা আসল স্বাদ ও গন্ধকে স্থায়ী করে।</li>
              <li><strong>গ্রাহক বান্ধব সেবা:</strong> ঢাকা ও ঢাকার বাইরে ক্যাশ অন ডেলিভারি, হোয়াটসঅ্যাপ অর্ডারিং এবং ৭ দিনের ফুল মানিব্যাক সুবিধা।</li>
            </ul>
          </div>
        )}

        {/* VIEW 12: Contact Screen */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 font-sans">
            <h1 className="text-2xl font-bold font-sans text-gray-950 text-center border-b pb-4 mb-8">আমাদের সাথে যোগাযোগ করুন</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm leading-relaxed">
              <div className="space-y-4">
                <h3 className="text-base font-bold text-gray-900 font-sans">হেড অফিস ও শোরুম</h3>
                <div className="flex items-start space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                  <p>{websiteConfig?.contacts?.address || '৫৮/এ, প্রগতি সরণী, কুড়িল বাড্ডা, ঢাকা-১২১২, বাংলাদেশ'}</p>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <PhoneCall className="w-5 h-5 text-green-650 shrink-0" />
                  <p>হটলাইন: {websiteConfig?.contacts?.phone || '01811-000000'}</p>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5 text-red-500 shrink-0" />
                  <p>ইমেইল: {websiteConfig?.contacts?.email || 'info@darunspices.com'}</p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <a href={websiteConfig?.contacts?.facebook || '#'} target="_blank" rel="noreferrer" className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href={`https://wa.me/${websiteConfig?.contacts?.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition-all">
                    <MessageCircle className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Feedbacks message form */}
              <form onSubmit={(e) => { e.preventDefault(); alert('ধন্যবাদ! আপনার বার্তাটি সফলভাবে সেন্ড হয়েছে।'); }} className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-4 text-xs font-sans shadow-inner">
                <h3 className="text-base font-bold text-gray-900 font-sans">সরাসরি বার্তা পাঠান</h3>
                
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">আপনার নাম:</label>
                  <input type="text" required className="w-full bg-white border p-3 rounded-xl focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">আপনার মোবাইল ফোন নম্বর:</label>
                  <input type="tel" required className="w-full bg-white border p-3 rounded-xl font-mono focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1 font-semibold">আপনার অনুসন্ধান বার্তা:</label>
                  <textarea required rows={3} className="w-full bg-white border p-3 rounded-xl focus:border-red-500" />
                </div>

                <button 
                  type="submit" 
                  className="bg-red-650 hover:bg-red-700 text-white font-bold p-3 rounded-xl w-full text-xs shadow cursor-pointer transition-all"
                >
                  বার্তা পাঠান (Send Message)
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 13: Privacy policy */}
        {activeTab === 'privacy' && (
          <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 font-sans text-xs leading-relaxed text-gray-650 space-y-4">
            <h1 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">গোপনীয়তা নীতি (Privacy Policy)</h1>
            <p>আমাদের দারুণ মসলা অ্যাপে সংগৃহীত আপনার শিপিং ঠিকানা, মোবাইল নম্বর এবং ইমেইলসমূহ সম্পূর্ণ সুরক্ষিত অবস্থায় ফায়ারবেস ডেটাবেসে রাখা হচ্ছে। কোনো অবস্থাতেই আমরা গ্রাহকদের ডাটা কোনো তৃতীয় পক্ষ বা অ্যাফিলিয়েটেড বিপণন সাইটে বিক্রি বা লিক করব না। আপনার গোপনীয়তা আমাদের প্রধানতম প্রায়োরিটি।</p>
          </div>
        )}

        {/* VIEW 14: Terms and Conditions */}
        {activeTab === 'terms' && (
          <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 font-sans text-xs leading-relaxed text-gray-650 space-y-4">
            <h1 className="text-xl font-bold text-gray-900 border-b pb-3 mb-4">শর্তাবলী (Terms & Conditions)</h1>
            <p>আমাদের ওয়েবসাইট ব্যবহার করে অর্ডার বুকিং করার পর অবশ্যই আমাদের প্রতিনিধি নিশ্চিতকরণের জন্য কল করতে পারেন। কাস্টমার ক্যাশ অন হোম ডেলিভারি পণ্য বাসায় বুঝে পাওয়ার পর মূল্য পরিশোধ করবেন। ডেলিভারি সংক্রান্ত যেকোনো জটিলতায় কিংবা স্বাদের কোনো ক্রুটি প্রমাণিত হলে ৭ দিনের মধ্যে শর্তহীন রিফান্ড দাবি করা যাবে।</p>
          </div>
        )}

      </main>

      {/* Product Details overlay detailed modal */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white border rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative p-6 space-y-6">
            <button 
              onClick={() => setSelectedProductDetails(null)}
              className="absolute top-4 right-4 p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all"
            >
              বন্ধ করুন
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 text-xs">
              <img 
                src={selectedProductDetails.image} 
                referrerPolicy="no-referrer"
                alt={selectedProductDetails.name} 
                className="w-full h-56 object-cover rounded-2xl border" 
              />
              
              <div className="space-y-3 font-sans">
                <span className="bg-yellow-105 text-yellow-805 font-bold text-[9px] px-2 py-0.5 rounded-full uppercase font-mono tracking-wide">
                  {selectedProductDetails.category}
                </span>
                <h2 className="text-base font-bold text-gray-950 font-sans leading-snug">{selectedProductDetails.name}</h2>
                <span className="text-xs text-gray-400 block font-mono">{selectedProductDetails.nameEn} • {selectedProductDetails.weightGrams || 250}গ্রাম</span>
                <p className="text-xs text-gray-500 leading-relaxed font-sans mt-2">{selectedProductDetails.desc}</p>
                
                <div className="flex items-center space-x-1 mt-2 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold text-xs font-mono">{selectedProductDetails.rating} ({selectedProductDetails.reviewsCount} রিভিউস)</span>
                </div>

                <div className="pt-3 border-t">
                  <span className="text-[10px] text-gray-400 block font-sans">প্যাকেট মূল্য:</span>
                  <span className="font-mono text-xl font-bold text-red-650">৳{selectedProductDetails.price}</span>
                </div>

                {/* Details qty controller */}
                <div className="flex items-center space-x-2 pt-2">
                  <span className="text-gray-450 font-sans">প্যাকেট সংখ্যা:</span>
                  <div className="flex items-center space-x-1.5 border rounded-lg p-1 bg-gray-50">
                    <button 
                      onClick={() => setDetailsQty(prev => Math.max(1, prev - 1))}
                      className="p-1 bg-white hover:bg-gray-100 rounded text-gray-600"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono font-bold text-gray-900 text-xs">{detailsQty}</span>
                    <button 
                      onClick={() => setDetailsQty(prev => prev + 1)}
                      className="p-1 bg-white hover:bg-gray-100 rounded text-gray-600"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Multi actions: Add to Cart OR Order via Whatsapp */}
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <button
                    onClick={() => { useApp().addToCart(selectedProductDetails, detailsQty); setSelectedProductDetails(null); }}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold p-3 rounded-xl inline-flex justify-center items-center cursor-pointer shadow-xs active:scale-95 transition-all text-xs"
                  >
                    শপিং কার্টে যোগ করুন
                  </button>
                  <button
                    onClick={() => handleWhatsAppOrder(selectedProductDetails, detailsQty)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl inline-flex justify-center items-center cursor-pointer shadow-md active:scale-95 transition-all text-xs"
                    title="হোয়াটসঅ্যাপে অর্ডার করুন"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5 fill-current" />
                    হোয়াটসঅ্যাপ অর্ডার
                  </button>
                </div>
              </div>
            </div>

            {/* Injected reviews sections */}
            <div className="border-t border-gray-105 pt-6 mt-4">
              <ReviewSection productId={selectedProductDetails.id} />
            </div>
          </div>
        </div>
      )}

      {/* Modern bottom footer */}
      <footer className="bg-gray-900 text-gray-400 text-xs py-10 font-sans border-t border-gray-850 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3.5">
              <h4 className="text-white text-base font-bold font-sans tracking-wide">দারুণ মসলা (Darun Spices)</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed font-sans">{BANGLA_LABELS.brandSubtitle}</p>
              <div className="flex space-x-2 text-gray-400 pt-2">
                <a href={websiteConfig?.contacts?.facebook || '#'} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-full transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={`https://wa.me/${websiteConfig?.contacts?.whatsapp?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="p-2 bg-gray-800 hover:bg-gray-700 hover:text-white rounded-full transition-all">
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-white font-bold font-sans">গুরুত্বপূর্ণ লিংক সমূহ</h5>
              <ul className="space-y-1.5 text-gray-500">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">হোম পেজ</button></li>
                <li><button onClick={() => setActiveTab('shop')} className="hover:text-white transition-colors">প্রিমিয়াম মসলা কালেকশন</button></li>
                <li><button onClick={() => setActiveTab('about')} className="hover:text-white transition-colors">আমাদের কথা</button></li>
                <li><button onClick={() => setActiveTab('contact')} className="hover:text-white transition-colors">যোগাযোগ করুন</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-white font-bold font-sans">আইনি তথ্য</h5>
              <ul className="space-y-1.5 text-gray-500">
                <li><button onClick={() => setActiveTab('privacy')} className="hover:text-white transition-colors">গোপনীয়তা নীতি</button></li>
                <li><button onClick={() => setActiveTab('terms')} className="hover:text-white transition-colors">শর্তাবলী</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h5 className="text-white font-bold font-sans">যোগাযোগ বিবরণী</h5>
              <p className="text-[11px] leading-relaxed text-gray-500">{websiteConfig?.contacts?.address || '৫৮/এ, প্রগতি সরণী, কুড়িল বাড্ডা, ঢাকা-১২১২, বাংলাদেশ'}</p>
              <span className="block text-gray-500 text-[11px]">হোয়াটসঅ্যাপ: {websiteConfig?.contacts?.whatsapp || '01811-000000'}</span>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-550 flex flex-col sm:flex-row justify-between items-center bg-gray-900 max-w-7xl mx-auto text-[11px]">
            <span className="font-sans">© ২০২৬ দারুণ মসলা লিমিটেড। সর্বস্বত্ব সংরক্ষিত। খাঁটি স্বাদের রাজকীয় উৎসব।</span>
            <span className="text-[10px] text-gray-600 font-mono mt-2 sm:mt-0 bg-gray-850 px-2 py-0.5 rounded flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-green-500" /> SECURE SSL ENCRYPTION ENFORCED
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
