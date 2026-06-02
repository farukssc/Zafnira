/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Product, 
  CartItem, 
  Order, 
  Review, 
  UserProfile, 
  WebsiteConfig, 
  INITIAL_SPICE_PRODUCTS 
} from '../types';

interface AppContextProps {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  products: Product[];
  orders: Order[];
  reviews: Review[];
  cart: CartItem[];
  wishlist: string[];
  websiteConfig: WebsiteConfig;
  isLoading: boolean;
  isAdmin: boolean;
  
  // Auth Functions
  signInWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, phone: string, address: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserContact: (phone: string, address: string) => Promise<void>;
  
  // Cart Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  
  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  
  // Product Actions (Admin only)
  addProduct: (productArgs: Omit<Product, 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Order Actions
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: Order['paymentMethod'];
  }) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['orderStatus']) => Promise<void>;
  updateOrderPaymentStatus: (orderId: string, status: Order['paymentStatus']) => Promise<void>;
  
  // Review Actions
  submitReview: (productId: string, rating: number, comment: string) => Promise<void>;
  approveReview: (reviewId: string) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  
  // Config Actions (Admin)
  saveWebsiteConfig: (config: WebsiteConfig) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const defaultBanners = [
  {
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1200',
    title: 'দারুণ খাঁটি মসলার উৎসব',
    titleEn: 'Darun Spice Celebration',
    subtitle: '১০০% প্রাকৃতিক গুণসম্পন্ন বাছাইকৃত মসলা ঘরোয়া রান্নায় আনবে আভিজাত্য।',
    link: '#shop',
  },
  {
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&q=80&w=1200',
    title: 'ঐতিহ্যবাহী স্বাদের নতুন ছোঁয়া',
    titleEn: 'Traditional Flavor Refined',
    subtitle: 'হলুদ, মরিচ, ধনিয়া ও শাহী সুগন্ধ সমৃদ্ধ শাহী জিরার অসাধারণ প্রিমিয়াম গুঁড়ো।',
    link: '#shop',
  }
];

const defaultContacts = {
  phone: '01811-000000',
  whatsapp: '01811-000000',
  email: 'info@darunspices.com',
  address: '৫৮/এ, প্রগতি সরণী, কুড়িল বাড্ডা, ঢাকা-১২১২, বাংলাদেশ',
  facebook: 'https://facebook.com/darun.spices',
};

const defaultHomepageContent = {
  promoText: '১০% ছাড় সব ধরণের ফার্স্ট-অর্ডার ক্রয়ে! কোড ব্যবহার করুন: "DARUN10"',
  deliveryText: 'ঢাকা সিটির ভেতরে ৪৮ ঘণ্টার মধ্যে ক্যাশ অন হোম ডেলিভারি মাত্র ৬০ টাকা। ঢাকার বাইরে ১২০ টাকা।',
  returnText: 'আমাদের পণ্যের মানে কোনো ক্রুটি থাকলে ৭ দিনের মধ্যে ১০০% ক্যাশব্যাক সুবিধা রয়েছে।',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [websiteConfig, setWebsiteConfig] = useState<WebsiteConfig>({
    banners: defaultBanners,
    contacts: defaultContacts,
    homepageContent: defaultHomepageContent
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email === 'farukbangla53@gmail.com';

  // Load Cart & Wishlist from LocalStorage on Mount
  useEffect(() => {
    const savedCart = localStorage.getItem('darun_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error(e);
      }
    }
    const savedWish = localStorage.getItem('darun_wishlist');
    if (savedWish) {
      try {
        setWishlist(JSON.parse(savedWish));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save Cart & Wishlist
  const saveCartToStorage = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem('darun_cart', JSON.stringify(updatedCart));
  };

  const saveWishlistToStorage = (updatedWish: string[]) => {
    setWishlist(updatedWish);
    localStorage.setItem('darun_wishlist', JSON.stringify(updatedWish));
  };

  // 1. Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch User Profile of UID
        const userRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data() as UserProfile);
          } else {
            // Document doesn't exist yet (created via register or Google login)
            // Save initial User Profile doc in Firestore
            const initialProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || 'সম্মানিত ক্রেতা',
              role: user.email === 'farukbangla53@gmail.com' ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Database listeners for Products, Reviews, Configs
  useEffect(() => {
    // Sync Products
    const prodRef = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(prodRef, (snapshot) => {
      const prodList: Product[] = [];
      snapshot.forEach((doc) => {
        prodList.push(doc.data() as Product);
      });
      setProducts(prodList);

      // Auto Seed initial product catalog if empty
      if (prodList.length === 0) {
        seedInitialSpices();
      }
    }, (error) => {
      console.error('Syncing products failed', error);
    });

    // Sync Reviews
    const revRef = collection(db, 'reviews');
    const unsubscribeReviews = onSnapshot(revRef, (snapshot) => {
      const revList: Review[] = [];
      snapshot.forEach((doc) => {
        revList.push(doc.data() as Review);
      });
      setReviews(revList);
    }, (error) => {
      console.error('Syncing reviews failed', error);
    });

    // Sync Website Configurations
    const configRef = doc(db, 'configs', 'homepage');
    const unsubscribeConfig = onSnapshot(configRef, (snapshot) => {
      if (snapshot.exists()) {
        setWebsiteConfig(snapshot.data() as WebsiteConfig);
      } else {
        // Create initial config doc if not found in db
        const initialConfig: WebsiteConfig = {
          banners: defaultBanners,
          contacts: defaultContacts,
          homepageContent: defaultHomepageContent
        };
        setDoc(configRef, initialConfig).catch(e => console.error(e));
      }
    });

    return () => {
      unsubscribeProducts();
      unsubscribeReviews();
      unsubscribeConfig();
    };
  }, []);

  // 3. Real-time synchronization of Orders (Depends on User role and uid)
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    let orderQuery;
    if (isAdmin) {
      // Admins see all orders sorted by date
      orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      // Standard customers see only their orders
      orderQuery = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
    }

    const unsubscribeOrders = onSnapshot(orderQuery, (snapshot) => {
      const orderList: Order[] = [];
      snapshot.forEach((doc) => {
        orderList.push(doc.data() as Order);
      });
      setOrders(orderList);
    }, (error) => {
      console.error('Syncing orders failed', error);
    });

    return () => unsubscribeOrders();
  }, [currentUser, isAdmin]);

  // Seed Helper
  const seedInitialSpices = async () => {
    console.log('Seeding initial spice catalog...');
    for (const spice of INITIAL_SPICE_PRODUCTS) {
      try {
        await setDoc(doc(db, 'products', spice.id), spice);
      } catch (err) {
        console.error('Failed to seed spice: ', spice.id, err);
      }
    }
  };

  // Auth Action Methods
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string, phone: string, address: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      
      const role = email === 'farukbangla53@gmail.com' ? 'admin' : 'customer';
      const initialProfile: UserProfile = {
        uid: user.uid,
        email,
        name,
        role,
        phone,
        address,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', user.uid), initialProfile);
      setUserProfile(initialProfile);
    } catch (err) {
      console.error('Register error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('SignIn error:', err);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      console.error('Password reset error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
      throw err;
    }
  };

  const updateUserContact = async (phone: string, address: string) => {
    if (!currentUser) return;
    const path = `users/${currentUser.uid}`;
    try {
      const updated = {
        ...(userProfile as any),
        phone,
        address
      };
      await setDoc(doc(db, 'users', currentUser.uid), updated);
      setUserProfile(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  // Cart Methods
  const addToCart = (product: Product, quantity: number) => {
    const existingIdx = cart.findIndex(item => item.product.id === product.id);
    let updated: CartItem[];
    if (existingIdx > -1) {
      updated = [...cart];
      updated[existingIdx].quantity += quantity;
    } else {
      updated = [...cart, { product, quantity }];
    }
    saveCartToStorage(updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter(item => item.product.id !== productId);
    saveCartToStorage(updated);
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map(item => {
      if (item.product.id === productId) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCartToStorage(updated);
  };

  const clearCart = () => {
    saveCartToStorage([]);
  };

  // Wishlist Methods
  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter(id => id !== productId);
    } else {
      updated = [...wishlist, productId];
    }
    saveWishlistToStorage(updated);
  };

  // Product Actions (Admin only)
  const addProduct = async (productArgs: Omit<Product, 'createdAt' | 'updatedAt'>) => {
    const path = `products/${productArgs.id}`;
    try {
      const newProduct: Product = {
        ...productArgs,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'products', productArgs.id), newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateProduct = async (product: Product) => {
    const path = `products/${product.id}`;
    try {
      const updatedProduct: Product = {
        ...product,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'products', product.id), updatedProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteProduct = async (productId: string) => {
    const path = `products/${productId}`;
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Order Actions
  const createOrder = async (orderData: {
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: Order['paymentMethod'];
  }) => {
    const orderId = 'order_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const path = `orders/${orderId}`;
    try {
      const totalAmount = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
      const trackingNumber = 'DRN-' + Math.floor(100000 + Math.random() * 900000);
      
      const newOrder: Order = {
        id: orderId,
        userId: currentUser?.uid || 'guest',
        customerName: orderData.customerName,
        email: currentUser?.email || 'guest@darunspices.com',
        phone: orderData.phone,
        address: orderData.address,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          weightGrams: item.product.weightGrams
        })),
        totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'completed', // online pre-approved in mockup
        orderStatus: 'pending',
        trackingNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'orders', orderId), newOrder);
      
      // Update inventory stock counts for each product item (Admin reduction)
      for (const item of cart) {
        const prodRef = doc(db, 'products', item.product.id);
        const newStock = Math.max(0, item.product.stock - item.quantity);
        await updateDoc(prodRef, { stock: newStock });
      }

      clearCart();
      return newOrder;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        orderStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const updateOrderPaymentStatus = async (orderId: string, status: Order['paymentStatus']) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { 
        paymentStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  // Review Actions
  const submitReview = async (productId: string, rating: number, comment: string) => {
    const reviewId = 'rev_' + Math.random().toString(36).substr(2, 9);
    const path = `reviews/${reviewId}`;
    try {
      const newReview: Review = {
        id: reviewId,
        productId,
        userId: currentUser?.uid || 'anonymous',
        userName: currentUser?.displayName || userProfile?.name || 'শুভাকাঙ্ক্ষী',
        rating,
        comment,
        status: 'pending', // Admins approve reviews
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'reviews', reviewId), newReview);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  };

  const approveReview = async (reviewId: string) => {
    const path = `reviews/${reviewId}`;
    try {
      // 1. Mark review as approved
      const revRef = doc(db, 'reviews', reviewId);
      await updateDoc(revRef, { status: 'approved' });
      
      // 2. Fetch the review to get product id
      const snap = await getDoc(revRef);
      if (snap.exists()) {
        const rev = snap.data() as Review;
        // 3. Recalculate and update the product ratings
        const allRevsSnap = await getDocs(collection(db, 'reviews'));
        const pRevs: Review[] = [];
        allRevsSnap.forEach(d => {
          const r = d.data() as Review;
          if (r.productId === rev.productId && (r.status === 'approved' || r.id === reviewId)) {
            pRevs.push(r);
          }
        });
        
        const sum = pRevs.reduce((acc, r) => acc + r.rating, 0);
        const avg = pRevs.length > 0 ? parseFloat((sum / pRevs.length).toFixed(1)) : 5;
        
        await updateDoc(doc(db, 'products', rev.productId), {
          rating: avg,
          reviewsCount: pRevs.length
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const deleteReview = async (reviewId: string) => {
    const path = `reviews/${reviewId}`;
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  };

  // Config Actions (Admin)
  const saveWebsiteConfig = async (config: WebsiteConfig) => {
    const path = `configs/homepage`;
    try {
      await setDoc(doc(db, 'configs', 'homepage'), config);
      setWebsiteConfig(config);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      userProfile,
      products,
      orders,
      reviews,
      cart,
      wishlist,
      websiteConfig,
      isLoading,
      isAdmin,
      
      signInWithGoogle,
      registerWithEmail,
      signInWithEmail,
      resetPassword,
      logout,
      updateUserContact,
      
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      
      toggleWishlist,
      
      addProduct,
      updateProduct,
      deleteProduct,
      
      createOrder,
      updateOrderStatus,
      updateOrderPaymentStatus,
      
      submitReview,
      approveReview,
      deleteReview,
      
      saveWebsiteConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
