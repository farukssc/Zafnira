/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, BANGLA_LABELS } from '../types';
import { 
  CreditCard, Smartphone, CheckCircle, Truck, Info, 
  Lock, ArrowRight, ShieldCheck, Mail, User, Phone, MapPin 
} from 'lucide-react';

interface CheckoutScreenProps {
  onOrderSuccess: (order: Order) => void;
  onNavigateHome: () => void;
}

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ onOrderSuccess, onNavigateHome }) => {
  const { cart, userProfile, createOrder } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cod');
  const [isPlacing, setIsPlacing] = useState(false);

  // Simulated gateway configuration states
  const [walletNumber, setWalletNumber] = useState('');
  const [walletOtp, setWalletOtp] = useState('');
  const [walletPin, setWalletPin] = useState('');
  const [paymentGatewayStep, setPaymentGatewayStep] = useState<'details' | 'otp' | 'pin'>('details');

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const [paypalEmail, setPaypalEmail] = useState('');

  // Pre-populate values from userProfile if logged in
  useEffect(() => {
    if (userProfile) {
      setCustomerName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setAddress(userProfile.address || '');
    }
  }, [userProfile]);

  const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) {
      alert('দয়া করে শিপিং নাম, ফোন এবং সম্পূর্ণ ডেলিভারি ঠিকানা প্রদান করুন!');
      return;
    }

    if (cart.length === 0) {
      alert('আপনার শপিং কার্ট খালি!');
      return;
    }

    // Step verification for mobile payment options
    if (['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod) && paymentGatewayStep === 'details') {
      if (!walletNumber || walletNumber.length < 11) {
        alert('দয়া করে সঠিক মোবাইল ব্যাংকিং নম্বর প্রবেশ করান!');
        return;
      }
      setPaymentGatewayStep('otp');
      return;
    }

    if (['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod) && paymentGatewayStep === 'otp') {
      if (!walletOtp || walletOtp.length < 4) {
        alert('দয়া করে সঠিক ৪ ডিজিটের ওটিপি কোড যোগ করুন!');
        return;
      }
      setPaymentGatewayStep('pin');
      return;
    }

    if (['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod) && paymentGatewayStep === 'pin') {
      if (!walletPin || walletPin.length < 4) {
        alert('দয়া করে ৪ বা ৫ ডিজিটের গোপন পিন কোডটি লিখুন!');
        return;
      }
    }

    // Stripe card check
    if (paymentMethod === 'stripe') {
      if (cardNumber.length < 16 || !cardExpiry || !cardCvc) {
        alert('দয়া করে সঠিক সতেরো অঙ্কের ক্রেডিট বা ডেবিট কার্ডের তথ্য সাবমিট করুন!');
        return;
      }
    }

    // PayPal check
    if (paymentMethod === 'paypal') {
      if (!paypalEmail.includes('@')) {
        alert('দয়া করে পেপাল ইমেইল প্রবেশ করান!');
        return;
      }
    }

    // Process secure order creation
    setIsPlacing(true);
    try {
      const order = await createOrder({
        customerName,
        phone,
        address,
        paymentMethod
      });
      alert('অভিনন্দন! আপনার অর্ডারটি সফলভাবে গৃহিত হয়েছে।');
      onOrderSuccess(order);
    } catch (err) {
      alert('অর্ডার সাবমিট করতে ত্রুটি দেখা দিয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-gray-150 rounded-2xl text-center font-sans">
        <h3 className="text-xl font-bold text-gray-800">আপনার কার্টে কোনো পণ্য নেই!</h3>
        <p className="text-sm text-gray-500 mt-2">অর্ডার বুকিং করতে প্রথমে আমাদের শপ পেজ থেকে প্রিমিয়াম মসলা কার্টে যোগ করুন।</p>
        <button 
          onClick={onNavigateHome}
          className="mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition-all cursor-pointer"
        >
          কেনাকাটা করতে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 px-4 sm:px-6">
      
      {/* Visual Stepper */}
      <div className="flex justify-between items-center mb-8 max-w-lg mx-auto text-xs font-sans text-gray-400 select-none">
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center font-bold font-mono">১</span>
          <span className="text-gray-900 font-semibold">শপিং কার্ট</span>
        </div>
        <div className="flex-1 border-t border-gray-200 mx-2"></div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center font-bold font-mono">২</span>
          <span className="text-gray-900 font-bold">নিরাপদ চেকআউট</span>
        </div>
        <div className="flex-1 border-t border-gray-200 mx-2"></div>
        <div className="flex items-center space-x-1">
          <span className="w-5 h-5 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-bold font-mono">৩</span>
          <span>অর্ডার সফল</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Delivery / Shipping Fields Form (LHS) */}
        <form onSubmit={handleCheckoutSubmit} className="lg:col-span-7 space-y-6">
          
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm font-sans space-y-4">
            <h3 className="text-md font-bold text-gray-900 flex items-center border-b border-gray-100 pb-3 mb-1">
              <Truck className="w-5 h-5 mr-1.5 text-red-650" />
              ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="sm:col-span-2">
                <label className="block text-gray-600 font-semibold mb-1">ক্রেতা বা গ্রাহকের পূর্ণ নাম</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="মোহাম্মদ শফিক"
                    className="w-full bg-gray-50 border p-3 rounded-xl pl-9 focus:border-yellow-400 focus:bg-white"
                  />
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">মোবাইল ফোন নম্বর</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="017xxxxxxxx"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border p-3 rounded-xl pl-9 font-mono focus:border-yellow-400 focus:bg-white"
                  />
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">ইমেইল (বিকল্প)</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={userProfile?.email || 'shofiq@gmail.com'}
                    disabled
                    className="w-full bg-gray-100 border p-3 rounded-xl pl-9 font-mono text-gray-500 cursor-not-allowed"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-600 font-semibold mb-1">সম্পূর্ণ ডেলিভারি ঠিকানা</label>
                <div className="relative">
                  <textarea
                    required
                    rows={3}
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="বাড়ি নং ৩/বি, সড়ক ৫, মিরপুর-১২, ঢাকা"
                    className="w-full bg-gray-50 border p-3 rounded-xl pl-9 focus:border-yellow-400 focus:bg-white"
                  />
                  <MapPin className="absolute left-1.5 top-3 w-4 h-4 text-gray-400 m-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment gateways options */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm font-sans space-y-4">
            <h3 className="text-md font-bold text-gray-900 border-b border-gray-100 pb-3 mb-1 flex items-center">
              <CreditCard className="w-5 h-5 mr-1.5 text-green-600" />
              পেমেন্ট পদ্ধতি নির্বাচন করুন
            </h3>

            {/* Methods list */}
            <div className="grid grid-cols-2 gap-3">
              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'cod' ? 'border-yellow-400 bg-yellow-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => { setPaymentMethod('cod'); setPaymentGatewayStep('details'); }}
                  className="accent-red-650"
                />
                <span className="font-sans text-gray-800">ক্যাশ অন ডেলিভারি (COD)</span>
              </label>

              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'bkash' ? 'border-pink-400 bg-pink-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'bkash'} 
                  onChange={() => { setPaymentMethod('bkash'); setPaymentGatewayStep('details'); }}
                  className="accent-pink-600"
                />
                <span className="font-sans text-gray-800 flex items-center">
                  <span className="px-1 bg-pink-500 text-white rounded text-[10px] scale-90 mr-1.5 font-bold">bKash</span>
                  বিকাশ (bKash)
                </span>
              </label>

              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'nagad' ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'nagad'} 
                  onChange={() => { setPaymentMethod('nagad'); setPaymentGatewayStep('details'); }}
                  className="accent-amber-500"
                />
                <span className="font-sans text-gray-800">নগদ (Nagad)</span>
              </label>

              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'rocket' ? 'border-purple-400 bg-purple-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'rocket'} 
                  onChange={() => { setPaymentMethod('rocket'); setPaymentGatewayStep('details'); }}
                  className="accent-purple-600"
                />
                <span className="font-sans text-gray-800">রকেট (Rocket)</span>
              </label>

              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'stripe' ? 'border-sky-400 bg-sky-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'stripe'} 
                  onChange={() => { setPaymentMethod('stripe'); setPaymentGatewayStep('details'); }}
                  className="accent-sky-600"
                />
                <span className="font-sans text-gray-800 flex items-center">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500 mr-1.5 shrink-0" />
                  Stripe / কার্ড পেমেন্ট
                </span>
              </label>

              <label className={`border p-3 rounded-xl flex items-center space-x-2.5 cursor-pointer text-xs font-semibold ${paymentMethod === 'paypal' ? 'border-blue-400 bg-blue-50/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="pmethod" 
                  checked={paymentMethod === 'paypal'} 
                  onChange={() => { setPaymentMethod('paypal'); setPaymentGatewayStep('details'); }}
                  className="accent-blue-600"
                />
                <span className="font-sans text-gray-800">PayPal এক্সপ্রেস</span>
              </label>
            </div>

            {/* Mobile Banking simulated gateway portals */}
            {['bkash', 'nagad', 'rocket', 'upay'].includes(paymentMethod) && (
              <div className="bg-gradient-to-br from-pink-50/60 to-amber-55/60 p-4 rounded-xl border border-gray-200 font-sans mt-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-gray-800">মোবাইল ব্যাংকিং গেটওয়ে সিমুলেশন ({paymentMethod.toUpperCase()})</span>
                  <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.5 rounded">TEST PORTAL</span>
                </div>

                {paymentGatewayStep === 'details' && (
                  <div className="space-y-2">
                    <label className="block text-gray-500 text-[10px] font-semibold">আপনার ১১ ডিজিটের বিকাশ/নগদ/রকেট মোবাইল অ্যাকাউন্ট নম্বর</label>
                    <input 
                      type="tel" 
                      placeholder="017xxxxxxxx"
                      value={walletNumber}
                      onChange={e => setWalletNumber(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono focus:border-pink-400"
                    />
                    <p className="text-[10px] text-gray-400 italic">"নম্বর লিখার পর নিচে 'অর্ডার সম্পন্ন করুন' বাটনে ক্লিক করে ওটিপি জেনারেট করুন।"</p>
                  </div>
                )}

                {paymentGatewayStep === 'otp' && (
                  <div className="space-y-2">
                    <label className="block text-gray-500 text-[10px] font-semibold">আপনার গ্রিন নম্বরে প্রেরিত ওটিপি কোড (OTP Verification)</label>
                    <input 
                      type="text" 
                      placeholder="যেমন: ১২৩৪ (4-digit code)"
                      value={walletOtp}
                      onChange={e => setWalletOtp(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono text-center tracking-widest focus:border-pink-400"
                    />
                    <p className="text-[10px] text-gray-400 italic">"যেকোনো ৪ সংখ্যার ওটিপি প্রবেশ করিয়ে এগিয়ে যান।"</p>
                  </div>
                )}

                {paymentGatewayStep === 'pin' && (
                  <div className="space-y-2">
                    <label className="block text-gray-500 text-[10px] font-semibold">অ্যাকাউন্টের পিন কোড প্রদান (গোপন পিন গেটওয়ে)</label>
                    <input 
                      type="password" 
                      placeholder="••••"
                      value={walletPin}
                      onChange={e => setWalletPin(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono text-center tracking-widest focus:border-pink-400"
                    />
                    <p className="text-[10px] text-gray-500 font-bold text-red-650">⚠️ পিন গেটওয়েটি সুরক্ষিত এবং সম্পূর্ণ সিমুলেটেড। কোনো ক্ষতিকর কোড সংরক্ষণ করা হয় না।</p>
                  </div>
                )}
              </div>
            )}

            {/* Credit Card Stripe simulated forms */}
            {paymentMethod === 'stripe' && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-205 font-sans mt-3 space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-gray-800">ক্রেডিট বা ডেবিট কার্ড ফর্ম (Stripe Gateway)</span>
                  <span className="text-[10px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.5 rounded">TEST LINK</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-400 font-semibold uppercase">কার্ড নম্বর (১৬ ডিজিট)</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono text-center"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-semibold uppercase">মেয়াদ শেষ (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-semibold uppercase">সিভিসি (CVC)</label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      className="w-full bg-white border p-2.5 rounded-lg font-mono text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PayPal simulated option */}
            {paymentMethod === 'paypal' && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 font-sans mt-3 space-y-2">
                <span className="text-xs font-bold text-gray-800 block">PayPal এক্সপ্রেস গ্লোবাল চেকআউট</span>
                <input
                  type="email"
                  placeholder="paypal-buyer@example.com"
                  value={paypalEmail}
                  onChange={e => setPaypalEmail(e.target.value)}
                  className="w-full bg-white border p-2.5 rounded-lg text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Place Order CTA Button */}
          <button
            type="submit"
            disabled={isPlacing}
            className="w-full bg-red-650 hover:bg-red-700 text-white font-bold p-3.5 rounded-2xl text-sm shadow-md transition-all font-sans flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPlacing ? (
              <span>অর্ডার প্রসেসিং হচ্ছে, তথ্য সংরক্ষণ করা হচ্ছে...</span>
            ) : (
              <>
                <span>ডেলিভারি বুকিং ও অর্ডার সম্পন্ন করুন</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Cart items list summary (RHS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm font-sans space-y-3">
            <h4 className="font-bold text-gray-900 text-sm border-b pb-2">অর্ডার সারাংশ (Order Summary)</h4>
            
            {/* items grid */}
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex-1 pr-4">
                    <span className="font-bold text-gray-800 block leading-tight">{item.product.name}</span>
                    <span className="text-[10px] text-gray-450 block font-mono">
                      {item.product.weightGrams ? `${item.product.weightGrams}g • ` : ''}৳{item.product.price} x {item.quantity} প্যাক
                    </span>
                  </div>
                  <span className="font-mono font-bold text-gray-950 text-right">
                    ৳{item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* billing totals */}
            <div className="border-t pt-3 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>পণ্যের মোট মূল্য:</span>
                <span className="font-mono text-gray-900">৳{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>ডেলিভারি কস্ট:</span>
                <span className="text-green-600 font-sans font-semibold">৳০ (ফ্রি প্রমোশন)</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2.5 text-sm font-bold">
                <span className="text-gray-950">সর্বমোট মূল্য:</span>
                <span className="font-mono text-red-650 text-base font-bold">৳{totalAmount}</span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-green-50/50 border border-green-100 p-3 rounded-lg flex items-start space-x-2 text-[10px] text-green-800 leading-relaxed font-sans">
              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <strong>এসএসএল সিকিউর ট্রানজেকশন (Zero Trust SSL)</strong>
                <p className="text-gray-500 mt-0.5">আপনার প্রতিটি পেমেন্ট এবং অর্ডার ট্রানজেকশন ফায়ারবেস ডেডিকেটেড নিয়মাবলী দ্বারা সুরক্ষিতভাবে প্রসেস করা হয়ে থাকে।</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
