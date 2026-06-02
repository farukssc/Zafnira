/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Order, Review, WebsiteConfig } from '../types';
import { 
  BarChart, Sparkles, ClipboardList, ShieldAlert, PlusCircle, CheckCircle, 
  Trash2, Edit, Save, RefreshCw, Printer, AlertTriangle, Eye, CreditCard, 
  Settings, HeartPulse, UserCheck, Shield
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { 
    products, orders, reviews, websiteConfig, 
    addProduct, updateProduct, deleteProduct, 
    updateOrderStatus, updateOrderPaymentStatus, 
    approveReview, deleteReview, saveWebsiteConfig 
  } = useApp();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'dashboard' | 'products' | 'orders' | 'reviews' | 'configs' | 'reports'>('dashboard');
  
  // Product state helper
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newProd, setNewProd] = useState<Omit<Product, 'createdAt' | 'updatedAt'>>({
    id: '',
    name: '',
    nameEn: '',
    desc: '',
    price: 0,
    stock: 0,
    image: '',
    category: 'powder',
    rating: 5,
    reviewsCount: 0,
    weightGrams: 250
  });

  // Printing Invoice state
  const [selectedInvoice, setSelectedInvoice] = useState<Order | null>(null);

  // Dynamic banner configurations state
  const [sliderConfigs, setSliderConfigs] = useState<WebsiteConfig['banners']>(websiteConfig?.banners || []);
  const [contactConfig, setContactConfig] = useState<WebsiteConfig['contacts']>(websiteConfig?.contacts || {
    phone: '', whatsapp: '', email: '', address: '', facebook: ''
  });

  const [hasUnsavedConfigs, setHasUnsavedConfigs] = useState(false);

  // Synchronize banner state from global configs
  React.useEffect(() => {
    if (websiteConfig) {
      setSliderConfigs(websiteConfig.banners);
      setContactConfig(websiteConfig.contacts);
    }
  }, [websiteConfig]);

  // Calculations for dashboard
  const totalSalesOfSpice = orders
    .filter(o => o.orderStatus === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedOrdersCount = orders.filter(o => o.orderStatus === 'completed').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending').length;
  const activeProcessingOrdersCount = orders.filter(o => o.orderStatus === 'processing').length;
  const cancelledOrdersCount = orders.filter(o => o.orderStatus === 'cancelled').length;

  const uniqueCustomersCount = new Set(orders.map(o => o.userId)).size;

  // Invoice Printer
  const triggerPrintInvoice = (order: Order) => {
    setSelectedInvoice(order);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Product actions handlers
  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.id || !newProd.name || !newProd.price || !newProd.image) {
      alert('দয়া করে আইডি, নাম, মূল্য এবং ছবির লিংক নিশ্চিত করুন!');
      return;
    }
    try {
      await addProduct(newProd);
      setIsAddingNew(false);
      setNewProd({
        id: '', name: '', nameEn: '', desc: '', price: 0, stock: 0, 
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600', 
        category: 'powder', rating: 5, reviewsCount: 0, weightGrams: 250
      });
      alert('নতুন মসলা পণ্যটি সফলভাবে যুক্ত হয়েছে!');
    } catch (e) {
      alert('পণ্য যোগ করাতে ব্যর্থ হয়েছে!');
    }
  };

  const handleUpdateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      await updateProduct(editingProduct);
      setEditingProduct(null);
      alert('মসলা পণ্যের তথ্য সফলভাবে আপডেট হয়েছে!');
    } catch (err) {
      alert('আপডেট ব্যর্থ হয়েছে!');
    }
  };

  const handleDeleteProductClick = async (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই মসলা ক্যাটাগরি থেকে মুছে ফেলতে চান?')) {
      try {
        await deleteProduct(id);
        alert('পণ্যটি সফলভাবে ডিলিট হয়েছে!');
      } catch (e) {
        alert('ডিলিট করা যায়নি!');
      }
    }
  };

  // Website sliders modifier
  const handleBannerSave = async () => {
    try {
      await saveWebsiteConfig({
        banners: sliderConfigs,
        contacts: contactConfig,
        homepageContent: websiteConfig?.homepageContent || {
          promoText: '', deliveryText: '', returnText: ''
        }
      });
      setHasUnsavedConfigs(false);
      alert('ওয়েবসাইটের ব্যানার ও ডিরেক্টরি সফলভাবে আপডেট করা হয়েছে!');
    } catch (err) {
      alert('আপডেট করা সম্ভব হয়নি!');
    }
  };

  const handleAddSliderItem = () => {
    const freshSlider = [
      ...sliderConfigs,
      {
        image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=1200',
        title: 'নতুন সুস্বাদু মসলা প্যাক',
        subtitle: 'সবচেয়ে কম দামে খাঁটি মানের নিশ্চয়তা দারুণ ব্র্যান্ডে',
        link: '#shop'
      }
    ];
    setSliderConfigs(freshSlider);
    setHasUnsavedConfigs(true);
  };

  const handleRemoveSliderItem = (index: number) => {
    const updated = sliderConfigs.filter((_, i) => i !== index);
    setSliderConfigs(updated);
    setHasUnsavedConfigs(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12 print:bg-white print:pb-0">
      
      {/* Invoice Modal for Printing */}
      {selectedInvoice && (
        <div id="invoice-modal" className="print:block hidden fixed inset-0 bg-white z-50 p-8 text-black print:p-0 font-sans">
          <div className="max-w-3xl mx-auto border border-gray-200 p-8 rounded-lg print:border-none print:p-0">
            <div className="flex justify-between items-start border-b border-gray-200 pb-6">
              <div>
                <h1 className="text-3xl font-extrabold text-red-650 tracking-wide font-sans mb-1">দারুণ মসলা (Darun Spices)</h1>
                <p className="text-sm text-gray-500 font-sans">খাঁটি ও সুস্বাদু মসলার নির্ভরযোগ্য প্রতিষ্ঠান</p>
                <p className="text-xs text-gray-400 font-mono mt-1">ঠিকানা: ৫৮/এ, প্রগতি সরণী, কুড়িল, বাড্ডা, ঢাকা-১২১২</p>
              </div>
              <div className="text-right">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-3 print:border print:border-green-600 print:text-green-800">ক্যাশ ইনভয়েস</span>
                <p className="text-xs text-gray-500 font-sans">রসিদ নম্বর: <strong className="text-gray-900 font-mono">{selectedInvoice.trackingNumber}</strong></p>
                <p className="text-xs text-gray-500 font-sans">তারিখ: {new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 my-6 text-xs">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">ক্রেতার তথ্য:</h4>
                <p className="font-sans font-bold text-gray-950">{selectedInvoice.customerName}</p>
                <p className="font-mono mt-1">মোবাইল: {selectedInvoice.phone}</p>
                <p className="font-sans text-gray-600 mt-1">ইমেইল: {selectedInvoice.email}</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">ডেলিভারি ঠিকানা ও পেমেন্ট:</h4>
                <p className="text-gray-700">{selectedInvoice.address}</p>
                <p className="font-sans mt-2">পেমেন্ট মেথড: <strong className="uppercase font-mono text-red-600">{selectedInvoice.paymentMethod}</strong></p>
                <p className="font-sans">পেমেন্ট স্ট্যাটাস: <strong>{selectedInvoice.paymentStatus === 'completed' ? 'পরিশোধিত' : 'বকেয়া'}</strong></p>
              </div>
            </div>

            <table className="w-full text-xs text-left border-collapse my-6">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="py-2 px-3 font-sans font-bold">আইটেমের বিবরণ</th>
                  <th className="py-2 px-3 font-sans font-bold text-right">একক মূল্য</th>
                  <th className="py-2 px-3 font-sans font-bold text-center">পরিমাণ</th>
                  <th className="py-2 px-3 font-sans font-bold text-right text-black">মোট মূল্য</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.items.map((item, id) => (
                  <tr key={id} className="border-b border-gray-100">
                    <td className="py-2.5 px-3 font-sans">
                      <span className="font-bold text-gray-900">{item.name}</span>
                      {item.weightGrams ? <span className="text-[10px] text-gray-500 ml-1.5">({item.weightGrams} গ্রাম)</span> : null}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">৳{item.price}</td>
                    <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">৳{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-start mt-6 pt-4 border-t border-gray-100">
              <div className="text-center font-sans">
                <p className="text-[10px] text-gray-400 italic">"দারুণ মসলা বেছে নেয়ার জন্য আপনাকে ধন্যবাদ"</p>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="mt-3 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-[11px] print:hidden transition-all duration-150"
                >
                  ইনভয়েস বন্ধ করুন
                </button>
              </div>
              <div className="w-64 text-right">
                <div className="flex justify-between text-xs py-1">
                  <span className="text-gray-500 font-sans">হিসাব সাবটোটাল:</span>
                  <span className="font-mono">৳{selectedInvoice.totalAmount}</span>
                </div>
                <div className="flex justify-between text-xs py-1">
                  <span className="text-gray-500 font-sans">ডেলিভারি চার্জ:</span>
                  <span className="font-mono text-green-600">৳০ (বিনামূল্যে)</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 py-2 mt-1 text-sm font-bold">
                  <span className="font-sans text-gray-800 font-bold">সর্বমোট প্রদেয়:</span>
                  <span className="font-mono text-red-600 text-base">৳{selectedInvoice.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Screen Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 print:hidden">
        
        {/* Header Title */}
        <div className="bg-yellow-400 text-gray-900 rounded-2xl p-6 shadow-md mb-8 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold font-sans flex items-center">
              <Shield className="w-6.5 h-6.5 mr-2 text-red-600 shrink-0" />
              দারুণ মসলা - প্রশাসনিক কন্ট্রোল সেন্টার
            </h1>
            <p className="text-xs text-gray-700 font-sans mt-0.5">রিয়েল-টাইম বিক্রয় রেকর্ড ও ইনভেন্টরি ট্র্যাকিং সিস্টেম</p>
          </div>
          <div className="flex space-x-2">
            <span className="bg-red-600 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center">
              ● ADMIN ACCESS APPROVED
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap border-b border-gray-200 gap-1.5 mb-6">
          <button
            onClick={() => setActiveAdminSubTab('dashboard')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'dashboard' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            অ্যাডমিন ড্যাশবোর্ড
          </button>
          <button
            onClick={() => setActiveAdminSubTab('products')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'products' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            মসলা পণ্য তালিকা ({products.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('orders')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'orders' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            অর্ডারসমূহ ({orders.length})
          </button>
          <button
            onClick={() => setActiveAdminSubTab('reviews')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'reviews' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            রিভিউ অনুমোদন ({reviews.filter(r => r.status === 'pending').length} পেন্ডিং)
          </button>
          <button
            onClick={() => setActiveAdminSubTab('configs')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'configs' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            ওয়েবসাইট ব্যানার
          </button>
          <button
            onClick={() => setActiveAdminSubTab('reports')}
            className={`font-sans text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-t-lg transition-all ${activeAdminSubTab === 'reports' ? 'bg-white text-red-600 border-t-2 border-red-500 border-r border-l border-gray-100' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            বিক্রয় ও ইনভেন্টরি রিপোর্ট
          </button>
        </div>

        {/* Sub-tab 1: Dashboard View */}
        {activeAdminSubTab === 'dashboard' && (
          <div>
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-xs block font-sans">মোট বিক্রয় (BDT)</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-green-600 mt-1 block">৳{totalSalesOfSpice}</span>
                </div>
                <div className="bg-green-50 text-green-600 p-3 rounded-full">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-xs block font-sans">সফল ডেলিভারি</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-blue-600 mt-1 block">{completedOrdersCount}টি</span>
                </div>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-xs block font-sans">মোট গ্রাহক সংখ্যা</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-yellow-600 mt-1 block">{uniqueCustomersCount} জন</span>
                </div>
                <div className="bg-yellow-50 text-yellow-600 p-3 rounded-full">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-gray-400 text-xs block font-sans">পেন্ডিং অর্ডার</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-red-600 mt-1 block">{pendingOrdersCount}টি</span>
                </div>
                <div className="bg-red-50 text-red-600 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick action grid / alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Alert Zone for Stock Warnings */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-1">
                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center border-b border-gray-100 pb-2.5 font-sans">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-500 mr-1.5 shrink-0" />
                  স্টক শেষ প্রায় (রি-অর্ডার সতর্কতা)
                </h3>
                <div className="space-y-3.5 max-h-72 overflow-y-auto">
                  {products.filter(p => p.stock <= 5).length === 0 ? (
                    <p className="text-xs text-green-600 font-sans italic py-4">সব মসলার পর্যাপ্ত স্টক রয়েছে। কোনো সংকট নেই!</p>
                  ) : (
                    products.filter(p => p.stock <= 5).map(p => (
                      <div key={p.id} className="flex justify-between items-center bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                        <div>
                          <span className="text-xs font-bold text-gray-900 block font-sans">{p.name}</span>
                          <span className="text-[10px] text-gray-400 block font-mono">{p.nameEn}</span>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-100 text-red-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                            মাত্র {p.stock} প্যাক বাকি!
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-2">
                <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center border-b border-gray-100 pb-2.5 font-sans">
                  <ClipboardList className="w-4.5 h-4.5 text-red-500 mr-1.5" />
                  সাম্প্রতিক গুরুত্বপূর্ণ অর্ডার সমূহ
                </h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-gray-400 font-sans italic py-10 text-center">এখনো কোনো বিক্রয় বা অর্ডার রেকর্ড মেলেনি।</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-500">
                      <thead>
                        <tr className="border-b border-gray-100 pb-2">
                          <th className="py-2.5 text-gray-600 font-sans font-bold">অর্ডার নম্বর</th>
                          <th className="py-2.5 text-gray-600 font-sans font-bold">ক্রেতার নাম</th>
                          <th className="py-2.5 text-gray-600 font-sans font-bold">মোট মূ্ল্য</th>
                          <th className="py-2.5 text-gray-600 font-sans font-bold">পেমেন্ট</th>
                          <th className="py-2.5 text-gray-600 font-sans font-bold">অবস্থা</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map(order => (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="py-2.5 font-mono font-bold text-gray-900">{order.trackingNumber}</td>
                            <td className="py-2.5 font-sans text-gray-750">{order.customerName}</td>
                            <td className="py-2.5 font-mono font-bold text-red-650">৳{order.totalAmount}</td>
                            <td className="py-2.5 font-sans">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-semibold uppercase ${order.paymentStatus === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                {order.paymentMethod} • {order.paymentStatus === 'completed' ? 'পরিশোধিত' : 'বকেয়া'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                                order.orderStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'processing' ? 'bg-sky-100 text-sky-700' :
                                order.orderStatus === 'cancelled' ? 'bg-gray-150 text-gray-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {order.orderStatus === 'completed' ? 'ডেলিভার্ড' :
                                 order.orderStatus === 'processing' ? 'প্যাকেজিং' :
                                 order.orderStatus === 'cancelled' ? 'বাতিলকৃত' : 'পেন্ডিং'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Sub-tab 2: Spice Products Management */}
        {activeAdminSubTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-sans">সমস্ত মসলা স্টক পণ্যসমূহ</h2>
              <button
                onClick={() => { setIsAddingNew(!isAddingNew); setEditingProduct(null); }}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg font-sans flex items-center transition-all shadow"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                নতুন মসলা প্রোডাক্ট সংযুক্ত করুন
              </button>
            </div>

            {/* Insertion Form */}
            {isAddingNew && (
              <form onSubmit={handleAddNewProduct} className="bg-white border border-gray-200 shadow-lg p-6 rounded-2xl mb-8 font-sans">
                <h3 className="font-bold text-red-650 text-base mb-4 border-b pb-2">নতুন মসলার বিবরণ প্রবিষ্ট করুন</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">প্রোডাক্ট আইডি (যেমন: sp-cumin)</label>
                    <input
                      type="text"
                      required
                      value={newProd.id}
                      onChange={e => setNewProd({ ...newProd, id: e.target.value })}
                      placeholder="sp-turmeric"
                      className="w-full border p-2.5 rounded-lg font-mono focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পণ্য নাম (বাংলায়)</label>
                    <input
                      type="text"
                      required
                      value={newProd.name}
                      onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                      placeholder="দারুণ মরিচ গুঁড়ো"
                      className="w-full border p-2.5 rounded-lg focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পণ্য নাম (ইংরেজিতে)</label>
                    <input
                      type="text"
                      required
                      value={newProd.nameEn || ''}
                      onChange={e => setNewProd({ ...newProd, nameEn: e.target.value })}
                      placeholder="Premium Red Chili Powder"
                      className="w-full border p-2.5 rounded-lg focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">ক্যাটাগরি</label>
                    <select
                      value={newProd.category}
                      onChange={e => setNewProd({ ...newProd, category: e.target.value })}
                      className="w-full border p-2.5 rounded-lg focus:border-yellow-400"
                    >
                      <option value="powder">গুঁড়ো মসলা</option>
                      <option value="whole">আস্ত মসলা</option>
                      <option value="mix">মসলা মিক্স</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">মূল্য প্রদান (BDT)</label>
                    <input
                      type="number"
                      required
                      value={newProd.price || ''}
                      onChange={e => setNewProd({ ...newProd, price: parseFloat(e.target.value) || 0 })}
                      className="w-full border p-2.5 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">স্টক প্যাক সংখ্যা</label>
                    <input
                      type="number"
                      required
                      value={newProd.stock || ''}
                      onChange={e => setNewProd({ ...newProd, stock: parseInt(e.target.value) || 0 })}
                      className="w-full border p-2.5 rounded-lg font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-600 font-semibold mb-1">ছবির ওয়েব লিংক (Unsplash বা Data URL)</label>
                    <input
                      type="text"
                      required
                      value={newProd.image}
                      onChange={e => setNewProd({ ...newProd, image: e.target.value })}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full border p-2.5 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পরিমাণ ওজন (প্যাকেট প্রতি গ্রাম হিসেবে)</label>
                    <input
                      type="number"
                      value={newProd.weightGrams || ''}
                      onChange={e => setNewProd({ ...newProd, weightGrams: parseInt(e.target.value) || 250 })}
                      placeholder="250"
                      className="w-full border p-2.5 rounded-lg font-mono"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-gray-600 font-semibold mb-1">বিবরণ (বাংলায়)</label>
                    <textarea
                      value={newProd.desc || ''}
                      onChange={e => setNewProd({ ...newProd, desc: e.target.value })}
                      placeholder="ঐতিহ্যবাহী পদ্ধতিতে ধুয়ে শুকিয়ে রোদে দিয়ে গুঁড়ো মসলা তৈরি..."
                      rows={3}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="bg-red-650 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center shadow"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    নতুন মসলা সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            )}

            {/* Editing Product form */}
            {editingProduct && (
              <form onSubmit={handleUpdateProductSubmit} className="bg-white border border-gray-300 shadow-xl p-6 rounded-2xl mb-8 font-sans">
                <h3 className="font-bold text-amber-600 text-base mb-4 border-b pb-2">মসলার বিবরণ সংস্কার ও এডিট করুন</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পণ্য নাম (বাংলায়)</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পণ্য নাম (ইংরেজিতে)</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.nameEn || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">ক্যাটাগরি</label>
                    <select
                      value={editingProduct.category}
                      onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full border p-2.5 rounded-lg"
                    >
                      <option value="powder">গুঁড়ো মসলা</option>
                      <option value="whole">আস্ত মসলা</option>
                      <option value="mix">মসলা মিক্স</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">মূল্য প্রদান (BDT)</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.price}
                      onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">স্টক প্যাক সংখ্যা</label>
                    <input
                      type="number"
                      required
                      value={editingProduct.stock}
                      onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">পরিমাণ ওজন (প্যাকেট প্রতি গ্রাম হিসেবে)</label>
                    <input
                      type="number"
                      value={editingProduct.weightGrams || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, weightGrams: parseInt(e.target.value) || 250 })}
                      className="w-full border p-2.5 rounded-lg font-mono"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-gray-600 font-semibold mb-1">বিবরণ (বাংলায়)</label>
                    <textarea
                      value={editingProduct.desc || ''}
                      onChange={e => setEditingProduct({ ...editingProduct, desc: e.target.value })}
                      rows={3}
                      className="w-full border p-2.5 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-xs font-bold px-4 py-2 rounded-lg flex items-center shadow"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    পরিবর্তন সংরক্ষণ করুন
                  </button>
                </div>
              </form>
            )}

            {/* Products List Grid Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="border-b border-gray-250">
                    <th className="py-3 px-4 font-sans font-bold">ছবি</th>
                    <th className="py-3 px-4 font-sans font-bold">মসলার বিবরণ</th>
                    <th className="py-3 px-4 font-sans font-bold">ক্যাটাগরি</th>
                    <th className="py-3 px-4 font-sans font-bold text-right">প্যাক মূল্য</th>
                    <th className="py-3 px-4 font-sans font-bold text-center">স্টক পরিমাণ</th>
                    <th className="py-3 px-4 font-sans font-bold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/55">
                      <td className="py-3 px-4">
                        <img src={p.image} referrerPolicy="no-referrer" alt={p.name} className="w-12 h-12 object-cover rounded-lg border shadow-inner" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-950 text-sm block font-sans">{p.name}</span>
                        <span className="text-[10px] text-gray-400 block font-mono">{p.nameEn} • {p.weightGrams || 250}g</span>
                      </td>
                      <td className="py-3 px-4 uppercase font-mono text-gray-500 text-[10px]">{p.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-650 text-sm">৳{p.price}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${p.stock <= 5 ? 'bg-red-105 text-red-600' : 'bg-green-105 text-green-700'}`}>
                          {p.stock} প্যাক
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center space-x-1.5">
                          <button
                            onClick={() => { setEditingProduct(p); setIsAddingNew(false); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                            className="p-1 px-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-250 rounded-md transition-all font-sans text-[10px] font-bold flex items-center"
                          >
                            <Edit className="w-3.5 h-3.5 mr-0.5" />
                            সংস্কার
                          </button>
                          <button
                            onClick={() => handleDeleteProductClick(p.id)}
                            className="p-1 px-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-all font-sans text-[10px] font-bold flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-0.5" />
                            মুছুন
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-tab 3: Customer Orders List - Update status, print invoice */}
        {activeAdminSubTab === 'orders' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 font-sans mb-4">সকল ক্রেতার অর্ডার ট্রানজেকশন তালিকা ({orders.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {orders.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                  <p className="text-sm font-sans text-gray-400 italic">এখনো অব্দি কোনো অর্ডারের তথ্য ডেটাবেজে নিবন্ধিত নেই।</p>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-sm hover:shadow transition-all font-sans">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-3 mb-4">
                      <div>
                        <span className="text-[11px] text-gray-400 font-mono block">ক্রমিক নং - {order.id}</span>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <h4 className="font-bold text-gray-900 text-sm font-mono tracking-wide">রসিদ: {order.trackingNumber}</h4>
                          <span className="text-xs text-gray-400">• {new Date(order.createdAt).toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex flex-wrap gap-2">
                        {/* Print Invoice Button */}
                        <button
                          onClick={() => triggerPrintInvoice(order)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center cursor-pointer transition-all shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          ইনভয়েস প্রিন্ট
                        </button>
                        
                        {/* Order status indicators */}
                        <select
                          value={order.orderStatus}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['orderStatus'])}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                            order.orderStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            order.orderStatus === 'processing' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                            order.orderStatus === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                            'bg-red-50 text-red-600 border-red-200 animate-pulse'
                          }`}
                        >
                          <option value="pending">পেন্ডিং (অপেক্ষমান)</option>
                          <option value="processing">প্রসেসিং (প্যাকেজিং)</option>
                          <option value="completed">ডেলিভারড (সম্পন্ন)</option>
                          <option value="cancelled">বাতিলকৃত (Cancelled)</option>
                        </select>

                        {/* Payment Status adjustment */}
                        <select
                          value={order.paymentStatus}
                          onChange={(e) => updateOrderPaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border ${
                            order.paymentStatus === 'completed' ? 'bg-green-100 text-green-750 border-green-200' : 'bg-amber-100 text-amber-850 border-amber-200'
                          }`}
                        >
                          <option value="pending">পেমেন্ট: বকেয়া</option>
                          <option value="completed">পেমেন্ট: পরিশোধিত</option>
                        </select>
                      </div>
                    </div>

                    {/* Order contents & shipping details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-gray-650">
                      <div>
                        <h5 className="font-bold text-gray-800 text-xs mb-1.5 uppercase tracking-wide">১. ক্রেতার ঠিকানা তথ্য</h5>
                        <p className="font-semibold text-gray-900">{order.customerName}</p>
                        <p className="font-mono mt-0.5">মোবাইল: {order.phone}</p>
                        <p className="font-mono truncate">{order.email}</p>
                        <p className="mt-1 text-gray-500 leading-relaxed font-sans">{order.address}</p>
                      </div>
                      <div className="lg:col-span-2 bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                        <h5 className="font-bold text-gray-800 text-xs mb-2">২. অর্ডারকৃত মসলাস সমূহ</h5>
                        <ul className="space-y-2">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-800">
                                {item.name} {item.weightGrams ? <span className="text-[10px] text-gray-400 font-normal">({item.weightGrams}g)</span> : null}
                                <span className="text-[10px] ml-1 text-red-600 bg-red-50 px-1 py-0.5 rounded font-mono font-bold">x {item.quantity} প্যাক</span>
                              </span>
                              <span className="font-mono text-gray-700 text-right">৳{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-gray-200 mt-3 pt-2 text-right">
                          <span className="text-[11px] text-gray-400 mr-2 uppercase font-mono tracking-wide">পেমেন্ট ধরণ: <span className="text-gray-700 font-bold">{order.paymentMethod}</span></span>
                          <span className="font-sans font-bold text-gray-800">সর্বমোট প্রদেয় মূল্য: <span className="font-mono text-base text-red-650 ml-1">৳{order.totalAmount}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sub-tab 4: Customers Feedback Reviews Approval */}
        {activeAdminSubTab === 'reviews' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 font-sans mb-4">পেনন্ডিং রিভিউ অনুমোদন পোর্টাল</h2>
            
            <div className="grid grid-cols-1 gap-4">
              {reviews.filter(rev => rev.status === 'pending').length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                  <p className="text-sm font-sans text-gray-400 italic">অনুমোদনের অপেক্ষা করছে এমন কোনো রিভিউ এই মুহূর্তে বিদ্যমান নেই।</p>
                </div>
              ) : (
                reviews.filter(rev => rev.status === 'pending').map(rev => (
                  <div key={rev.id} className="bg-white border border-yellow-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center font-sans">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded font-sans">পেন্ডিং রিভিউ</span>
                        <span className="text-xs text-gray-400 font-mono">পণ্য আইডি: {rev.productId}</span>
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm mt-1.5 flex items-center font-sans">
                        {rev.userName}
                        <span className="text-xs font-mono font-bold text-red-500 bg-red-50 px-1 rounded ml-2">★ {rev.rating} স্টার</span>
                      </h4>
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic leading-relaxed font-sans font-medium">"{rev.comment}"</p>
                      <span className="text-[10px] text-gray-450 block font-mono mt-1.5">জমাদানের সময়: {new Date(rev.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 md:mt-0 flex space-x-2 justify-end w-full md:w-auto">
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="bg-red-50 hover:bg-red-105 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-all border border-red-100 cursor-pointer"
                      >
                        প্রত্যাখ্যান করুন
                      </button>
                      <button
                        onClick={() => approveReview(rev.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all shadow flex items-center cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        অনুমোদন করুন
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Approved reviews review */}
            <h3 className="text-base font-bold text-gray-800 font-sans mt-8 mb-4">অনুমোদিত রিভিউর ইতিহাস ({reviews.filter(r => r.status === 'approved').length})</h3>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto text-xs">
              <table className="w-full text-left text-gray-500">
                <thead className="bg-gray-50 text-gray-700">
                  <tr className="border-b">
                    <th className="py-2.5 px-4 font-sans font-bold">গ্রাহক</th>
                    <th className="py-2.5 px-4 font-sans font-bold">পণ্য</th>
                    <th className="py-2.5 px-4 font-sans font-bold">রেটিং</th>
                    <th className="py-2.5 px-4 font-sans font-bold">মন্তব্য</th>
                    <th className="py-2.5 px-4 font-sans font-bold">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.filter(r => r.status === 'approved').map(r => (
                    <tr key={r.id} className="border-b border-gray-100">
                      <td className="py-2 px-4 font-bold text-gray-900 font-sans">{r.userName}</td>
                      <td className="py-2 px-4 font-mono uppercase text-[10px]">{r.productId.replace('sp-', '')}</td>
                      <td className="py-2 px-4 font-mono font-bold text-yellow-600">★ {r.rating}</td>
                      <td className="py-2 px-4 italic max-w-xs truncate font-sans">{r.comment}</td>
                      <td className="py-2 px-4">
                        <button onClick={() => deleteReview(r.id)} className="text-red-600 hover:text-red-700 font-bold font-sans">ডিলিট</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Sub-tab 5: Web Contents Banner / Sliders Config */}
        {activeAdminSubTab === 'configs' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm font-sans">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-800 font-sans">ওয়েবসাইট ব্যানার স্লাইড ও কন্টাক্ট ইনফরমেশন মডিফায়ার</h2>
              {hasUnsavedConfigs && (
                <button
                  onClick={handleBannerSave}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center shadow-lg animate-pulse"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  কনফিগারেশন সেভ করুন
                </button>
              )}
            </div>

            {/* Slider Configs */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-800 text-sm">হোম ব্যানার স্লাইডার কনফিগারেশন ({sliderConfigs.length} স্লাইড)</h4>
                <button
                  onClick={handleAddSliderItem}
                  className="text-xs text-red-600 hover:text-red-700 font-bold border border-red-200 bg-red-50 hover:bg-red-100 rounded px-2 py-1 transition-all"
                >
                  + স্লাইড যোগ করুন
                </button>
              </div>

              <div className="space-y-4">
                {sliderConfigs.map((slider, idx) => (
                  <div key={idx} className="bg-gray-50/50 border border-gray-200 rounded-xl p-4 text-xs font-sans relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveSliderItem(idx)}
                      className="absolute top-4 right-4 text-red-600 hover:text-red-700 font-bold p-1 bg-white border border-red-100 rounded shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-500 font-semibold mb-1">স্লাইড প্রধান শিরোনাম (বাংলায়)</label>
                        <input
                          type="text"
                          value={slider.title}
                          onChange={e => {
                            const updated = [...sliderConfigs];
                            updated[idx].title = e.target.value;
                            setSliderConfigs(updated);
                            setHasUnsavedConfigs(true);
                          }}
                          className="w-full border bg-white p-2 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-500 font-semibold mb-1">স্লাইড উপশিরোনাম (বাংলায়)</label>
                        <input
                          type="text"
                          value={slider.subtitle}
                          onChange={e => {
                            const updated = [...sliderConfigs];
                            updated[idx].subtitle = e.target.value;
                            setSliderConfigs(updated);
                            setHasUnsavedConfigs(true);
                          }}
                          className="w-full border bg-white p-2 rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-500 font-semibold mb-1">স্লাইডার ইমেজ লিংক URL</label>
                        <input
                          type="text"
                          value={slider.image}
                          onChange={e => {
                            const updated = [...sliderConfigs];
                            updated[idx].image = e.target.value;
                            setSliderConfigs(updated);
                            setHasUnsavedConfigs(true);
                          }}
                          className="w-full border bg-white p-2 rounded-lg font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spices Shop Directory information */}
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-3">শপ যোগাযোগ ও হোয়াটসঅ্যাপ ডিটেইলস</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">যোগাযোগ কন্টাক্ট নম্বর</label>
                  <input
                    type="text"
                    value={contactConfig.phone}
                    onChange={e => {
                      setContactConfig({ ...contactConfig, phone: e.target.value });
                      setHasUnsavedConfigs(true);
                    }}
                    className="w-full border p-2 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">হোয়াটসঅ্যাপ অর্ডার সেল নম্বর (যেমন: 018...)</label>
                  <input
                    type="text"
                    value={contactConfig.whatsapp}
                    onChange={e => {
                      setContactConfig({ ...contactConfig, whatsapp: e.target.value });
                      setHasUnsavedConfigs(true);
                    }}
                    className="w-full border p-2 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">অফিসিয়াল কাস্টমার সাপোর্ট ইমেইল</label>
                  <input
                    type="text"
                    value={contactConfig.email}
                    onChange={e => {
                      setContactConfig({ ...contactConfig, email: e.target.value });
                      setHasUnsavedConfigs(true);
                    }}
                    className="w-full border p-2 rounded-lg font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-500 font-semibold mb-1">হেড অফিস ফিজিক্যাল ঠিকানা</label>
                  <input
                    type="text"
                    value={contactConfig.address}
                    onChange={e => {
                      setContactConfig({ ...contactConfig, address: e.target.value });
                      setHasUnsavedConfigs(true);
                    }}
                    className="w-full border p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">ফেসবুক পেজ লিংক</label>
                  <input
                    type="text"
                    value={contactConfig.facebook}
                    onChange={e => {
                      setContactConfig({ ...contactConfig, facebook: e.target.value });
                      setHasUnsavedConfigs(true);
                    }}
                    className="w-full border p-2 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab 6: Reports Tab - Sales distribution reports, category counts */}
        {activeAdminSubTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Sales Distribution Summary Visual Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm font-sans">
              <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center">
                <BarChart className="w-5 h-5 mr-1.5 text-red-650" />
                মসলা পণ্য বিক্রয় রিপোর্ট ক্যাটাগরি ভিত্তিক
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Segment bars */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100/90 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">গুঁড়ো মসলা বিক্রয় পরিমাণ (BDT)</span>
                    <span className="text-xl font-bold font-mono text-gray-800 mt-1 block">
                      ৳{orders
                        .filter(o => o.orderStatus === 'completed')
                        .flatMap(o => o.items)
                        .reduce((sum, item) => {
                          const prod = products.find(p => p.id === item.productId);
                          const isPowder = prod?.category === 'powder' || item.productId.includes('turmeric') || item.productId.includes('chili') || item.productId.includes('cumin') || item.productId.includes('coriander');
                          return isPowder ? sum + (item.price * item.quantity) : sum;
                        }, 0)
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100/90 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">মসলা মিক্স বিক্রয় পরিমাণ (BDT)</span>
                    <span className="text-xl font-bold font-mono text-gray-800 mt-1 block">
                      ৳{orders
                        .filter(o => o.orderStatus === 'completed')
                        .flatMap(o => o.items)
                        .reduce((sum, item) => {
                          const prod = products.find(p => p.id === item.productId);
                          const isMix = prod?.category === 'mix' || item.productId.includes('masala');
                          return isMix ? sum + (item.price * item.quantity) : sum;
                        }, 0)
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-xl border border-gray-100/90 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-gray-400 block">আস্ত মসলা বিক্রয় পরিমাণ (BDT)</span>
                    <span className="text-xl font-bold font-mono text-gray-800 mt-1 block">
                      ৳{orders
                        .filter(o => o.orderStatus === 'completed')
                        .flatMap(o => o.items)
                        .reduce((sum, item) => {
                          const prod = products.find(p => p.id === item.productId);
                          const isWhole = prod?.category === 'whole' || (!item.productId.includes('turmeric') && !item.productId.includes('chili') && !item.productId.includes('cumin') && !item.productId.includes('coriander') && !item.productId.includes('masala'));
                          return isWhole ? sum + (item.price * item.quantity) : sum;
                        }, 0)
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Current Inventory stock count reports */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm font-sans text-xs">
              <h3 className="text-base font-bold text-gray-800 mb-4">পণ্য সামগ্রিক ইনভেন্টরি ও আর্থিক স্টক ব্যালেন্স</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-550 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="py-2 px-3 font-sans font-bold">পণ্য আইডি</th>
                      <th className="py-2 px-3 font-sans font-bold">মসলা নাম</th>
                      <th className="py-2 px-3 font-sans font-bold text-right">ইউনিট মূল্য</th>
                      <th className="py-2 px-3 font-sans font-bold text-center">বর্তমান স্টক প্যাক</th>
                      <th className="py-2 px-3 font-sans font-bold text-right text-gray-800">মোট স্টক আর্থিক মূল্য (BDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-[11px] font-bold text-gray-400">{p.id}</td>
                        <td className="py-2 px-3 font-bold text-gray-850 font-sans">{p.name}</td>
                        <td className="py-2 px-3 text-right font-mono">৳{p.price}</td>
                        <td className="py-2 px-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${p.stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                            {p.stock} প্যাক
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900">৳{p.price * p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <style dangerouslySetInnerHTML={{__html: `
                      @media print {
                        body { background: white; color: black; }
                        .print\\:hidden { display: none !important; }
                        .print\\:block { display: block !important; }
                      }
                    `}} />
                    <tr className="border-t-2 border-gray-200 font-bold bg-yellow-50/50">
                      <td colSpan={3} className="py-3 px-3 text-right font-sans text-gray-800 font-bold">ইনভেন্টরি আর্থিক স্টক পরিমাণ :</td>
                      <td className="py-3 px-3 text-center font-mono text-gray-900 font-bold">{products.reduce((acc, p) => acc + p.stock, 0)} প্যাক</td>
                      <td className="py-3 px-3 text-right font-mono text-red-650 text-base font-bold">৳{products.reduce((acc, p) => acc + (p.price * p.stock), 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
