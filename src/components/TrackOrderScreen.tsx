/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { Search, MapPin, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const TrackOrderScreen: React.FC = () => {
  const { orders } = useApp();
  const [trackIdInput, setTrackIdInput] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const cleaned = trackIdInput.trim().toUpperCase();
    
    // Find matching order in active order hook
    const found = orders.find(
      o => o.trackingNumber.toUpperCase() === cleaned || o.id.toUpperCase() === cleaned
    );
    setMatchedOrder(found || null);
  };

  return (
    <div className="max-w-xl mx-auto my-12 px-4 sm:px-6">
      <div className="bg-white border border-gray-150 rounded-3xl shadow-lg p-6 sm:p-8 font-sans">
        <h2 className="text-xl font-bold text-gray-950 text-center mb-1 font-sans">আপনার অর্ডারের খোঁজ নিন</h2>
        <p className="text-xs text-gray-400 text-center mb-6 font-sans">অর্ডার নিশ্চিতকরণের পর প্রাপ্ত ইনভয়েস নম্বরটি (যেমন: DRN-XXXXXX) লিখুন</p>

        {/* Tracking Input Bar */}
        <form onSubmit={handleTrackSubmit} className="relative mb-8 text-xs font-sans">
          <input
            type="text"
            required
            value={trackIdInput}
            onChange={e => setTrackIdInput(e.target.value)}
            placeholder="DRN-123456 অথবা order_xxxx"
            className="w-full bg-gray-50 border border-gray-255 p-3.5 pl-4 pr-24 rounded-2xl tracking-wide uppercase font-mono focus:outline-none focus:border-red-500 focus:bg-white text-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 bg-red-650 hover:bg-red-700 text-white font-bold px-4 rounded-xl shadow-md transition-all flex items-center cursor-pointer text-xs"
          >
            <Search className="w-4 h-4 mr-0.5" />
            অনুসন্ধান
          </button>
        </form>

        {/* Not Found Screen */}
        {hasSearched && !matchedOrder && (
          <div className="bg-red-50 text-red-650 p-4 rounded-2xl border border-red-100 flex items-start space-x-2 text-xs leading-relaxed animate-fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <strong>দুঃখিত! অনুসন্ধানকৃত রসিদ নম্বরটি পাওয়া যায়নি।</strong>
              <p className="text-gray-500 mt-1">দয়া করে ইনভয়েস নম্বরটি চেক করুন। অথবা অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন, আমাদের সার্ভারে অর্ডার ডাটা আপডেট হচ্ছে।</p>
            </div>
          </div>
        )}

        {/* Found Order detailed Stepper */}
        {matchedOrder && (
          <div className="space-y-6 animate-fade-in text-xs font-sans">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-105">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">অর্ডার নম্বর:</span>
                <span className="font-mono font-bold text-gray-900">{matchedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">ক্রেতার নাম:</span>
                <span className="font-sans font-bold text-gray-800">{matchedOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">পেমেন্ট মেথড:</span>
                <span className="uppercase font-mono text-red-600 font-bold">{matchedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">সর্বমোট মূল্য:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">৳{matchedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Simulated Stepper tracking statuses */}
            <div>
              <h4 className="font-bold text-xs text-gray-800 mb-4 font-sans">ডেলিভারির বর্তমান অবস্থা:</h4>
              <div className="relative pl-6 space-y-6 border-l-2 border-yellow-250 ml-3">
                
                {/* Status 1: Pending */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                    ['pending', 'processing', 'completed'].includes(matchedOrder.orderStatus)
                      ? 'bg-yellow-400 border-yellow-500 text-gray-900' : 'bg-gray-100 border-gray-250 text-gray-400'
                  }`}>
                    <Clock className="w-2.5 h-2.5" />
                  </span>
                  <div>
                    <h5 className="font-sans font-bold text-gray-900">অর্ডার বুকিং সম্পন্ন</h5>
                    <p className="text-gray-400 mt-0.5">আমরা আপনার অডারের রিকোয়েস্ট পেয়েছি। আমাদের মসলা বিশেষজ্ঞরা শীঘ্রই প্যাকেজিং শুরু করবেন।</p>
                  </div>
                </div>

                {/* Status 2: Processing */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                    ['processing', 'completed'].includes(matchedOrder.orderStatus)
                      ? 'bg-amber-500 border-amber-600 text-white' : 'bg-gray-100 border-gray-250 text-gray-400'
                  }`}>
                    <Truck className="w-2.5 h-2.5" />
                  </span>
                  <div>
                    <h5 className="font-sans font-bold text-gray-900">প্যাকেজিং ও মানের যাচাইকরণ হচ্ছে</h5>
                    <p className="text-gray-400 mt-0.5">আপনার নির্বাচিত শাহী মসলা শতভাগ স্বাস্থ্যসম্মতভাবে প্যাক করা হচ্ছে এবং শিপিংয়ের জন্য রেডি করা হচ্ছে।</p>
                  </div>
                </div>

                {/* Status 3: Completed */}
                <div className="relative">
                  <span className={`absolute -left-[30px] top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 ${
                    matchedOrder.orderStatus === 'completed'
                      ? 'bg-green-500 border-green-600 text-white animate-bounce' : 'bg-gray-100 border-gray-250 text-gray-400'
                  }`}>
                    <CheckCircle2 className="w-2.5 h-2.5" />
                  </span>
                  <div>
                    <h5 className="font-sans font-bold text-gray-900">ডেলিভারি সম্পন্ন (সম্পন্ন)</h5>
                    <p className="text-gray-400 mt-0.5">দারুণ প্রিমিয়াম মসলা আপনার নির্দিষ্ট ঠিকানায় সফলভাবে পৌঁছে দেওয়া হয়েছে। স্বাদ উপভোগ করুন!</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Cancel Status indicators */}
            {matchedOrder.orderStatus === 'cancelled' && (
              <div className="bg-gray-100 p-4 rounded-xl border border-gray-200 text-gray-600 text-center">
                🔴 এই অর্ডারটি গ্রাহক অথবা অ্যাডমিন দ্বারা বাতিল (Cancelled) করা হয়েছে।
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
