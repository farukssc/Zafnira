/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;      // Bangla Name
  nameEn: string;    // English Name
  desc: string;      // Bangla Description
  price: number;     // Price per package (e.g., BDT per 100g / 250g / 500g)
  stock: number;     // Current stock count
  image: string;     // URL or base64 data string
  category: string;  // Categories e.g., 'powder' (গুঁড়ো মসলা), 'whole' (আস্ত মসলা), 'mix' (স্পেশাল মিক্স)
  rating: number;
  reviewsCount: number;
  weightGrams?: number; // Package size weight e.g., 200g
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    weightGrams?: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'stripe' | 'paypal';
  paymentStatus: 'pending' | 'completed';
  orderStatus: 'pending' | 'processing' | 'completed' | 'cancelled';
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

export interface WebsiteConfig {
  banners: {
    image: string;
    title: string;
    titleEn?: string;
    subtitle: string;
    link: string;
  }[];
  contacts: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    facebook: string;
  };
  homepageContent: {
    promoText: string;
    deliveryText: string;
    returnText: string;
  };
}

// Global dictionaries in complete Bangla
export const BANGLA_LABELS = {
  brandName: 'দারুণ',
  brandSubtitle: 'খাঁটি ও সুস্বাদু মসলার নির্ভরযোগ্য প্রতিষ্ঠান',
  home: 'হোম',
  shop: 'শপ',
  about: 'আমাদের সম্পর্কে',
  contact: 'যোগাযোগ',
  searchPlaceholder: 'সুস্বাদু মসলা খুঁজুন...',
  categories: 'ক্যাটাগরি সমূহ',
  featuredProducts: 'আমাদের সেরা মসলা',
  addToCart: 'কার্টে যোগ করুন',
  addedToCart: 'কার্টে যুক্ত হয়েছে!',
  wishlist: 'উইশলিস্ট',
  cart: 'শপিং কার্ট',
  checkout: 'চেকআউট',
  orderTracking: 'অর্ডার ট্র্যাকিং',
  reviews: 'গ্রাহক রিভিউ',
  paymentMethod: 'পেমেন্ট পদ্ধতি',
  orderStatus: 'অর্ডারের বর্তমান অবস্থা',
  cod: 'ক্যাশ অন ডেলিভারি (COD)',
  whatsappOrder: 'হোয়াটসঅ্যাপে অর্ডার করুন',
  adminPanel: 'অ্যাডমিন প্যানেল',
  login: 'লগইন',
  register: 'নিবন্ধন',
  logout: 'লগআউট',
  profile: 'আমার প্রোফাইল',
  orders: 'আমার অর্ডার সমূহ',
  total: 'মোট',
  price: 'মূল্য',
  stock: 'স্টক',
  bdt: '৳',
  outOfStock: 'স্টক শেষ',
  grams: 'গ্রাম',
  viewDetails: 'বিস্তারিত দেখুন',
  rating: 'রেটিং',
  all: 'সব',
  aboutUsTitle: 'দারুণ মসলা সম্পর্কে',
  privacyPolicy: 'গোপনীয়তা নীতি',
  termsConditions: 'শর্তাবলী',
};

export const SPICE_CATEGORIES = [
  { id: 'all', name: 'সকল মসলা' },
  { id: 'powder', name: 'গুঁড়ো মসলা' },
  { id: 'whole', name: 'আস্ত মসলা' },
  { id: 'mix', name: 'মসলা মিক্স' }
];

export const INITIAL_SPICE_PRODUCTS: Product[] = [
  {
    id: 'sp-turmeric',
    name: 'দারুণ হলুদ গুঁড়ো',
    nameEn: 'Premium Turmeric Powder',
    desc: 'শতভাগ খাঁটি ও বাছাইকৃত কাঁচা হলুদ রোদে শুকিয়ে স্বাস্থ্যসম্মত উপায়ে স্বয়ংক্রিয় মেশিনে প্রস্তুতকৃত। এতে রয়েছে প্রাকৃতিক গুণাবলী ও আসল হলুদের সুবাস ও উজ্জ্বল রঙ।',
    price: 180,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
    category: 'powder',
    rating: 4.8,
    reviewsCount: 15,
    weightGrams: 250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-redchili',
    name: 'দারুণ মরিচ গুঁড়ো',
    nameEn: 'Premium Red Chili Powder',
    desc: 'হালকা ঝাল আর আকর্ষণীয় লাল রঙের খাঁটি শুকনো মরিচের প্রিমিয়াম ডাস্ট। কোনো কৃত্রিম রঙ ও কেমিক্যাল মিশ্রিত নয়। রান্নায় এনে দেবে মনকাড়া স্বাদ ও রঙ।',
    price: 240,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=600',
    category: 'powder',
    rating: 4.9,
    reviewsCount: 22,
    weightGrams: 250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-coriander',
    name: 'দারুণ ধনিয়া গুঁড়ো',
    nameEn: 'Premium Coriander Powder',
    desc: 'উন্নত মানের ধনিয়া বীজ পরিষ্কার করে ধুয়ে রোদে শুকিয়ে গুঁড়ো করা হয়েছে। তরকারির গ্রেভি ঘন এবং সুস্বাদু করতে এটি অতুলনীয়।',
    price: 150,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600',
    category: 'powder',
    rating: 4.6,
    reviewsCount: 12,
    weightGrams: 250,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-cumin',
    name: 'দারুণ জিরা গুঁড়ো',
    nameEn: 'Premium Cumin Powder',
    desc: 'বাছাইকৃত সুগন্ধি জিরা টেলে নিয়ে প্রস্তুতকৃত জিরা গুঁড়ো। রান্নার স্বাদ বাড়িয়ে দ্বিগুণ করতে রান্নার শেষের দিকে ছড়িয়ে দিন অনন্য এই মসলা।',
    price: 320,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=600',
    category: 'powder',
    rating: 4.7,
    reviewsCount: 19,
    weightGrams: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sp-garammasala',
    name: 'দারুণ শাহী গরম মসলা',
    nameEn: 'Premium Garam Masala',
    desc: 'দারুচিনি, এলাচ, লবঙ্গ, জয়ফল, জয়ত্রীসহ ১০টিরও বেশি রাজকীয় আস্ত সুগন্ধি মসলার সমৃদ্ধ অনুপাতে মিশ্রিত শাহী গরম মসলা গুঁড়ো। মাংস ও বিরিয়ানির সেরা পছন্দ।',
    price: 450,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=600',
    category: 'mix',
    rating: 5.0,
    reviewsCount: 31,
    weightGrams: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
