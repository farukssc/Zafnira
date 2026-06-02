/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product, BANGLA_LABELS } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingCart, Info, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const isWishlisted = wishlist.includes(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock <= 0) return;
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
    >
      {/* Product Image Zone */}
      <div className="relative pt-[85%] overflow-hidden bg-gray-50 uppercase">
        <img 
          src={product.image} 
          referrerPolicy="no-referrer"
          alt={product.name} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ease-out"
        />
        
        {/* Wishlist Heart overlay */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full cursor-pointer transition-all shadow ${
            isWishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white text-gray-400 hover:text-red-500'
          }`}
          title={BANGLA_LABELS.wishlist}
        >
          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Spice Weight indicator badge */}
        {product.weightGrams ? (
          <span className="absolute bottom-3 left-3 bg-gray-900/80 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
            {product.weightGrams} {BANGLA_LABELS.grams}
          </span>
        ) : null}

        {/* Stock Status overlays */}
        {product.stock <= 0 ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-650 text-white font-sans text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {BANGLA_LABELS.outOfStock}
            </span>
          </div>
        ) : product.stock <= 5 ? (
          <span className="absolute top-3 left-3 bg-amber-500 text-gray-900 font-sans text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-sm">
            মাত্র {product.stock}প্যাক বাকি!
          </span>
        ) : null}
      </div>

      {/* product Details zone */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category title */}
          <span className="text-[10px] text-gray-400 font-sans tracking-wider uppercase block select-none">
            {product.category === 'powder' ? BANGLA_LABELS.brandName + ' গুঁড়ো মসলা' : product.category === 'mix' ? 'স্পেশাল রেসিপি মিক্স' : 'শাহী আস্ত মসলা'}
          </span>
          
          {/* Bangla Title */}
          <h3 className="font-sans font-bold text-gray-900 text-sm mt-1 group-hover:text-red-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* English sub-title */}
          <span className="text-[11px] text-gray-450 block font-mono font-medium truncate mt-0.5">
            {product.nameEn}
          </span>

          {/* Rating Stars preview */}
          <div className="flex items-center space-x-1 mt-2">
            <div className="flex text-amber-500 items-center">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11px] font-mono font-bold text-gray-700 ml-1">{product.rating}</span>
            </div>
            <span className="text-[10px] text-gray-400">({product.reviewsCount} রিভিউস)</span>
          </div>
        </div>

        {/* Price and Cart Insert buttons */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4">
          <div>
            <span className="text-[10px] text-gray-400 block font-sans">প্যাক মূল্য</span>
            <span className="font-mono text-lg font-bold text-red-650 flex items-baseline">
              <span className="text-sm mr-0.5">{BANGLA_LABELS.bdt}</span>
              {product.price}
            </span>
          </div>

          <div className="flex space-x-1.5">
            {/* Direct details view */}
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(product); }}
              className="p-2 bg-gray-55 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-xl transition-all"
              title={BANGLA_LABELS.viewDetails}
            >
              <Info className="w-4 h-4" />
            </button>

            {/* Direct Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`p-2 rounded-xl flex items-center shadow-xs transition-all ${
                product.stock <= 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900 active:scale-95 cursor-pointer font-bold'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
