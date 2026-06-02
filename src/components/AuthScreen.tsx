/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, LogIn, Lock, HelpCircle, UserPlus, Mail, Phone, MapPin } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, registerWithEmail, resetPassword } = useApp();
  
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'গুগল সাইন-ইন সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        await signInWithEmail(email, password);
        onSuccess();
      } else if (authMode === 'register') {
        if (!name || !phone || !address) {
          setErrorMsg('দয়া করে আপনার নাম, মোবাইল এবং ঠিকানা প্রবিষ্ট করুন।');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, name, phone, address);
        setSuccessMsg('আপনার অ্যাকাউন্টটি সফলভাবে গঠিত হয়েছে!');
        onSuccess();
      } else if (authMode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('পাসওয়ার্ড রিস্টোরেশনের লিংকটি সফলভাবে ইমেইলে প্রেরণ করা হয়েছে। আপনার ইনবক্স চেক করুন!');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('auth/invalid-login-credentials') || err.message?.includes('auth/wrong-password')) {
        setErrorMsg('প্রদত্ত ইমেইল আইডি অথবা পাসওয়ার্ড সঠিক নয়!');
      } else if (err.message?.includes('auth/email-already-in-use')) {
        setErrorMsg('এই ইমেইলটি ইতিপূর্বে নিবন্ধিত করা হয়েছে! অনুগ্রহ করে লগইন করুন।');
      } else if (err.message?.includes('auth/weak-password')) {
        setErrorMsg('পাসওয়ার্ড অত্যন্ত দুর্বল! অন্ততপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।');
      } else {
        setErrorMsg('কার্যক্রমটি সম্পন্ন করা যায়নি। ফায়ারবেস কনসোলে Email/Password Auth চালু করা রয়েছে তা নিশ্চিত হোন।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 sm:px-6">
      
      {/* Container Card */}
      <div className="bg-white border border-gray-150 rounded-3xl shadow-xl overflow-hidden font-sans">
        
        {/* Banner header top */}
        <div className="bg-yellow-400 p-8 text-center bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 text-gray-900 border-b border-yellow-200">
          <h2 className="text-3xl font-extrabold tracking-tight font-sans text-gray-950">দারুণ মসলা</h2>
          <p className="text-xs text-gray-800 font-sans mt-1">খাঁটি মসলার স্বাদে আভিজাত্যের নিশ্চয়তা</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Instructions check for Firebase setup */}
          <div className="bg-amber-50 border border-amber-200 text-[11px] text-amber-800 p-3 rounded-xl leading-relaxed">
            📢 <strong>সহজ নির্দেশনা:</strong> ইমেইল/পাসওয়ার্ড ব্যবহার করার পূর্বে দয়া করে আপনার ফায়ারবেস কনসোলে Email/Password সাইন-ইন মিডিয়া সচল রাখুন। অথবা কোনো কনফিগারেশন ছাড়াই সরাসরি <strong>গুগল লগইন (Google Login)</strong> ব্যবহার করুন।
          </div>

          {/* Messages block */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-650 text-xs p-3 rounded-lg font-medium text-center leading-relaxed">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-250 text-green-700 text-xs p-3 rounded-lg font-medium text-center leading-relaxed">
              ✅ {successMsg}
            </div>
          )}

          {/* Email Password Form */}
          <form onSubmit={handleEmailAction} className="space-y-4 text-xs font-sans">
            
            {/* Name, Phone, Address displayed ONLY in Register Mode */}
            {authMode === 'register' && (
              <div className="space-y-3 animate-fade-in">
                <div>
                  <label className="block text-gray-600 font-semibold mb-1">পূর্ণ নাম (বাংলা অথবা ইংরেজিতে)</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="আহমেদ কবির"
                      className="w-full bg-gray-50 border p-3 rounded-xl pl-9 focus:border-yellow-400"
                    />
                    <LogIn className="w-4 h-4 text-gray-450 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">মোবাইল নম্বর</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="01712xxxxxx"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border p-3 rounded-xl pl-9 font-mono focus:border-yellow-400"
                    />
                    <Phone className="w-4 h-4 text-gray-450 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-600 font-semibold mb-1">ডেলিভারি ঠিকানা (জেলা সহ বিস্তারিত)</label>
                  <div className="relative">
                    <textarea
                      required
                      placeholder="বাড়ি নং ১২, সড়ক ৪, ধানমন্ডি, ঢাকা"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      rows={2}
                      className="w-full bg-gray-50 border p-3 rounded-xl pl-9 focus:border-yellow-400"
                    />
                    <MapPin className="w-4 h-4 text-gray-450 absolute left-3 top-3.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Email Field (Always displayed) */}
            <div>
              <label className="block text-gray-600 font-semibold mb-1">আপনার ইমেইল ঠিকানা</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 border p-3 rounded-xl pl-9 font-mono focus:border-yellow-400"
                />
                <Mail className="w-4 h-4 text-gray-450 absolute left-3 top-3.5" />
              </div>
            </div>

            {/* Password Field (Hidden in Forgot Password screen) */}
            {authMode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-gray-600 font-semibold">গোপন পাসওয়ার্ড</label>
                  {authMode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('forgot')}
                      className="text-red-600 hover:underline font-medium text-[10px]"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border p-3 rounded-xl pl-9 font-mono focus:border-yellow-400"
                  />
                  <Lock className="w-4 h-4 text-gray-450 absolute left-3 top-3.5" />
                </div>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center cursor-pointer"
            >
              {isSubmitting ? (
                <span>প্রসেসিং হচ্ছে, অপেক্ষা করুন...</span>
              ) : authMode === 'login' ? (
                <>
                  <LogIn className="w-4.5 h-4.5 mr-1.5" />
                  লগইন করুন
                </>
              ) : authMode === 'register' ? (
                <>
                  <UserPlus className="w-4.5 h-4.5 mr-1.5" />
                  নতুন অ্যাকাউন্ট নিবন্ধন করুন
                </>
              ) : (
                'পাসওয়ার্ড পুনরুদ্ধারের ইমেইল পাঠান'
              )}
            </button>
          </form>

          {/* Social Google Login Portal (The main recommended route) */}
          {authMode !== 'forgot' && (
            <div className="space-y-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-450 text-[10px] font-medium font-sans uppercase">অথবা সাইন-ইন মিডিয়া</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-sans font-bold p-3 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
              >
                <img 
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                  alt="Google" 
                  className="w-4 h-4 shrink-0"
                />
                <span>গুগল অ্যাকাউন্ট দিয়ে সরাসরি লগইন করুন</span>
              </button>
            </div>
          )}

          {/* Alternate Navigation */}
          <div className="text-center text-[11px] text-gray-500 font-sans border-t border-gray-100 pt-4">
            {authMode === 'login' ? (
              <p>
                নতুন ক্রেতা?{' '}
                <button onClick={() => { setAuthMode('register'); setErrorMsg(''); }} className="text-red-650 hover:underline font-bold">
                  এখানে অ্যাকাউন্ট তৈরি করুন
                </button>
              </p>
            ) : (
              <p>
                ইতিমধ্যেই অ্যাকাউন্ট রয়েছে?{' '}
                <button onClick={() => { setAuthMode('login'); setErrorMsg(''); }} className="text-red-650 hover:underline font-bold">
                  লগইন করুন
                </button>
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
