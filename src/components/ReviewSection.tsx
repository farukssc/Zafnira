/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BANGLA_LABELS } from '../types';
import { Star, MessageCircle, Send, CheckCircle } from 'lucide-react';

interface ReviewSectionProps {
  productId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
  const { reviews, currentUser, submitReview } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter approved reviews for this product
  const approvedReviews = reviews.filter(
    rev => rev.productId === productId && rev.status === 'approved'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('দয়া করে আপনার মন্তব্যটি লিখুন!');
      return;
    }
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await submitReview(productId, rating, comment);
      setComment('');
      setRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (e) {
      alert('রিভিউ জমা দেওয়া সম্ভব হয়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 font-sans">
      <h3 className="text-md font-bold text-gray-950 flex items-center border-b pb-2">
        <MessageCircle className="w-5 h-5 mr-1.5 text-red-605" />
        গ্রাহকদের মতামত ও রিভিউ সমূহ ({approvedReviews.length})
      </h3>

      {/* Review list */}
      <div className="space-y-4">
        {approvedReviews.length === 0 ? (
          <p className="text-xs text-gray-400 italic">এই প্রিমিয়াম মসলার ওপর এখনো কোনো অনুমোদিত রিভিউ জমা পড়েনি। প্রথম রিভিউটি লিখুন!</p>
        ) : (
          approvedReviews.map(rev => (
            <div key={rev.id} className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 flex items-start space-x-3 text-xs leading-relaxed font-sans">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold shrink-0">
                {rev.userName[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">{rev.userName}</span>
                  <div className="flex text-amber-500 items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-250'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-750 mt-1">{rev.comment}</p>
                <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submit review form */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-6">
        <h4 className="font-bold text-xs text-gray-800 mb-3">আপনিও মতামত শেয়ার করুন</h4>
        
        {submitSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 text-xs mb-3 flex items-center">
            <CheckCircle className="w-4 h-4 mr-1.5" />
            ধন্যবাদ! আপনার রিভিউটি সফলভাবে জমা নেয়া হয়েছে এবং সম্মানিত অ্যাডমিনের অনুমোদনের অপেক্ষা করছে।
          </div>
        )}

        {currentUser ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Rating selector stars */}
            <div>
              <label className="block text-gray-500 font-semibold mb-1">আপনার রেটিং নির্বাচন করুন:</label>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-current' : 'text-gray-250'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-gray-500 font-semibold mb-1">আপনার সুচিন্তিত মন্তব্য লিখুন:</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="মসলার সুবাস ও খাঁটি গন্ধ কেমন ছিলো?"
                className="w-full bg-gray-50 border p-3 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-650 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center transition-all shadow cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              {isSubmitting ? 'প্রসেস করা হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
            </button>
          </form>
        ) : (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg border border-yellow-100 text-[10px]">
            🔑 রিভিউ সাবমিট করতে বা মতামত প্রদান করতে দয়া করে প্রথমে আপনার ক্রেতা অ্যাকাউন্ট দিয়ে <strong>লগইন</strong> করুন।
          </div>
        )}
      </div>
    </div>
  );
};
